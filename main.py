from fastapi import FastAPI, HTTPException, Request, Path, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from service import expansion_answer
from service.rate_limit import check_rate_limit, MAX_REQUESTS_PER_DAY
import openai
import logging
import asyncio
import redis
import csv
import os
from datetime import datetime
import threading

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI()

# CORS middleware configuration
# For development: allows all origins
# For production: set CORS_ORIGINS environment variable (comma-separated URLs)
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",") if os.getenv("CORS_ORIGINS") != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Constants
MAX_QUESTION_LENGTH = 300  # characters
LLM_TIMEOUT_SECONDS = 40   # seconds
CSV_LOG_FILE = "logs/user_registrations.csv"

# Thread lock for CSV writing
csv_lock = threading.Lock()

def check_previous_registration(email: str):
    """Check if email was registered in past 24 hours and return registration status"""
    
    registration_key = f"registration:{email}"
    rate_limit_key = f"rate_limit:{email}"
    
    # Check if email was registered in past 24 hours
    previous_registration = r.get(registration_key)
    current_question_count = int(r.get(rate_limit_key) or 0)
    
    if previous_registration:
        # Email was registered before in past 24 hours
        if current_question_count >= MAX_REQUESTS_PER_DAY:
            return {
                "is_returning": True,
                "is_exhausted": True,
                "message": f"Welcome back! You've already used all {MAX_REQUESTS_PER_DAY} questions for today. Your limit will reset in 24 hours from your first question."
            }
        else:
            remaining = MAX_REQUESTS_PER_DAY - current_question_count
            return {
                "is_returning": True,
                "is_exhausted": False,
                "message": f"Welcome back! You have {remaining} questions remaining for today."
            }
    else:
        # First time registration in past 24 hours
        return {
            "is_returning": False,
            "is_exhausted": False,
            "message": "Welcome! Email registered successfully! You can now use the chat endpoints."
        }

def track_registration_in_redis(email: str):
    """Track email registration in Redis with 24-hour TTL"""
    
    registration_key = f"registration:{email}"
    current_time = datetime.now().isoformat()
    
    # Store registration timestamp with 24-hour expiry
    r.setex(registration_key, 86400, current_time)  # 86400 seconds = 24 hours
    
    print(f"Tracked registration in Redis: {email} at {current_time}")

def log_registration_to_csv(email: str, company: str = None):
    """Log user registration to CSV file with timestamp and optional company"""
    
    with csv_lock:
        # Ensure logs directory exists
        os.makedirs(os.path.dirname(CSV_LOG_FILE), exist_ok=True)
        
        # Check if file exists, if not create with headers
        file_exists = os.path.isfile(CSV_LOG_FILE)
        
        with open(CSV_LOG_FILE, 'a', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['date', 'time', 'email', 'company']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header if file is new
            if not file_exists:
                writer.writeheader()
            
            # Get current date and time
            now = datetime.now()
            date_str = now.strftime("%Y-%m-%d")
            time_str = now.strftime("%H:%M:%S")
            
            # Write registration data
            writer.writerow({
                'date': date_str,
                'time': time_str,
                'email': email,
                'company': company or ""  # Empty string if no company provided
            })
            
        company_info = f" from {company}" if company else ""
        print(f"Logged registration: {date_str} {time_str} - {email}{company_info}")

from redis import Redis
import os
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
r = Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)

@app.get("/register")
async def register_email(
    email: str = Query(..., description="User email address (required for registration)"),
    company: str = Query(None, description="Company name (optional)"),
    response: Response = None
):
    """Register user email and set cookie for future chat requests"""
    
    # Set email as cookie for future requests
    response.set_cookie(
        key="user_email", 
        value=email, 
        max_age=86400,  # 24 hours
        httponly=True,
        secure=False  # Set to True in production with HTTPS
    )
    
    print(f"Registered user email: {email}" + (f" from company: {company}" if company else ""))
    
    # Check if email was registered in past 24 hours and their usage status
    registration_status = check_previous_registration(email)
    
    # Track current registration in Redis (even for returning users to refresh TTL)
    track_registration_in_redis(email)
    
    # Log registration to CSV file
    log_registration_to_csv(email, company)
    
    # Get current usage count
    key = f"rate_limit:{email}"
    current_count = r.get(key) or 0
    remaining = max(0, MAX_REQUESTS_PER_DAY - int(current_count))
    
    # Determine response status and message based on registration status
    if registration_status["is_exhausted"]:
        response_status = 429  # Too Many Requests
        response_message = registration_status["message"]
    else:
        response_status = 200
        response_message = registration_status["message"]
    
    return {
        "status": response_status,
        "message": response_message,
        "email": email,
        "company": company,
        "is_returning_user": registration_status["is_returning"],
        "questions_exhausted": registration_status["is_exhausted"],
        "questions_used": int(current_count),
        "remaining_questions": remaining,
        "daily_limit": MAX_REQUESTS_PER_DAY
    }

@app.get("/chat")
async def chat(
    question: str = Query(..., description="User question", min_length=1, max_length=MAX_QUESTION_LENGTH),
    request: Request = None
):
    """Chat endpoint using registered email cookie"""
    
    # Get email from cookie
    email = request.cookies.get("user_email")
    
    if not email:
        raise HTTPException(
            status_code=401, 
            detail="Email not registered. Please visit /register?email=your@email.com first to register your email."
        )
    
    print(f"User email from cookie: {email}")

    if not check_rate_limit(email):
        return {
            "status": 429,
            "response": "Sorry! You've reached the limit of 5 questions per day. To continue the conversation, please drop your email and we'll follow up with all the relevant details about Amrut.\n Looking forward to connecting!"
        }

    try:
        normalized_query = expansion_answer.normalize(question)

        async def generate_response():
            return expansion_answer.get_response(normalized_query)

        response = await asyncio.wait_for(generate_response(), timeout=LLM_TIMEOUT_SECONDS)

        key = f"history:{email}"
        r.rpush(key, f"Q: {question} | A: {response.content}")

        return {
            "status": 200,
            "response": response.content
        }

    except asyncio.TimeoutError:
        logger.warning(f"Timeout while processing query: {question}")
        raise HTTPException(504, "LLM took too long to respond.")

    except openai.OpenAIError as oe:
        logger.error(f"OpenAI API error: {oe}")
        raise HTTPException(502, f"OpenAI API error: {str(oe)}")

    except HTTPException as he:
        logger.warning(f"HTTPException: {he.detail}")
        raise he

    except Exception as e:
        logger.exception(f"Unhandled exception: {e}")
        raise HTTPException(500, "Internal Server Error.")

@app.get("/user-status")
async def get_user_status(request: Request = None):
    """Get current user's email and remaining questions from cookie"""
    
    email = request.cookies.get("user_email")
    
    if not email:
        return {
            "status": 400,
            "message": "No email registered. Please visit /register?email=your@email.com first to register your email.",
            "email": None,
            "remaining_questions": None
        }
    
    # Get current usage count
    key = f"rate_limit:{email}"
    current_count = r.get(key) or 0
    remaining = max(0, MAX_REQUESTS_PER_DAY - int(current_count))
    
    # Get TTL for reset time
    ttl_seconds = r.ttl(key)
    reset_time = None
    if ttl_seconds > 0:
        hours = ttl_seconds // 3600
        minutes = (ttl_seconds % 3600) // 60
        reset_time = f"{hours}h {minutes}m"
    
    return {
        "status": 200,
        "email": email,
        "questions_used": int(current_count),
        "remaining_questions": remaining,
        "reset_time": reset_time,
        "daily_limit": MAX_REQUESTS_PER_DAY
    }

@app.get("/all-history")
async def get_all_histories():
    data = []
    for key in r.scan_iter("history:*"):
        email = key.split(":")[1]
        history = r.lrange(key, 0, -1)
        tries = r.get(f"rate_limit:{email}") or 0
        data.append({
            "email": email,
            "tries": int(tries),
            "history": history
        })

    return {
        "total_users": len(data),
        "users": data
    }

@app.get("/registration-logs")
async def get_registration_logs():
    """Get all registration logs from CSV file"""
    
    if not os.path.isfile(CSV_LOG_FILE):
        return {
            "status": 404,
            "message": "No registration logs found.",
            "registrations": []
        }
    
    registrations = []
    
    with csv_lock:
        try:
            with open(CSV_LOG_FILE, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                registrations = list(reader)
        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")
            raise HTTPException(500, f"Error reading registration logs: {str(e)}")
    
    return {
        "status": 200,
        "total_registrations": len(registrations),
        "registrations": registrations
    }

@app.get("/redis-registrations")
async def get_redis_registrations():
    """Get all active email registrations from Redis (past 24 hours)"""
    
    active_registrations = []
    
    try:
        # Scan for all registration keys
        for key in r.scan_iter("registration:*"):
            email = key.split(":")[1]
            registration_time = r.get(key)
            ttl_seconds = r.ttl(key)
            
            # Get rate limit info
            rate_limit_key = f"rate_limit:{email}"
            questions_used = int(r.get(rate_limit_key) or 0)
            remaining = max(0, MAX_REQUESTS_PER_DAY - questions_used)
            
            # Calculate time remaining
            hours = ttl_seconds // 3600
            minutes = (ttl_seconds % 3600) // 60
            time_remaining = f"{hours}h {minutes}m" if ttl_seconds > 0 else "Expired"
            
            active_registrations.append({
                "email": email,
                "registration_time": registration_time,
                "questions_used": questions_used,
                "remaining_questions": remaining,
                "time_until_reset": time_remaining,
                "is_exhausted": questions_used >= MAX_REQUESTS_PER_DAY
            })
    
    except Exception as e:
        logger.error(f"Error reading Redis registrations: {e}")
        raise HTTPException(500, f"Error reading active registrations: {str(e)}")
    
    return {
        "status": 200,
        "total_active_users": len(active_registrations),
        "active_registrations": active_registrations
    }