from fastapi import FastAPI, HTTPException, Request, Path, Query, Response
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

# Constants
MAX_QUESTION_LENGTH = 300  # characters
LLM_TIMEOUT_SECONDS = 40   # seconds
CSV_LOG_FILE = "logs/user_registrations.csv"

# Thread lock for CSV writing
csv_lock = threading.Lock()

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
    
    # Log registration to CSV file
    log_registration_to_csv(email, company)
    
    # Get current usage count
    key = f"rate_limit:{email}"
    current_count = r.get(key) or 0
    remaining = max(0, MAX_REQUESTS_PER_DAY - int(current_count))
    
    return {
        "status": 200,
        "message": "Email registered successfully! You can now use the chat endpoints.",
        "email": email,
        "company": company,
        "questions_used": int(current_count),
        "remaining_questions": remaining,
        "daily_limit": MAX_REQUESTS_PER_DAY
    }

@app.get("/chat/{question}")
async def chat(
    question: str = Path(..., description="User question", min_length=3, max_length=MAX_QUESTION_LENGTH),
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