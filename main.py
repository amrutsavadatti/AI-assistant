from fastapi import FastAPI, HTTPException, Request, Path
from service import expansion_answer
from service.rate_limit import check_rate_limit
import openai
import logging
import asyncio
import redis

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI()

# Constants
MAX_QUESTION_LENGTH = 300  # characters
LLM_TIMEOUT_SECONDS = 40   # seconds



from redis import Redis
r = Redis(host="localhost", port=6379, decode_responses=True)

@app.get("/chat/{question}")
async def chat(
    question: str = Path(..., description="User question", min_length=3, max_length=MAX_QUESTION_LENGTH),
    request: Request = None
):
    client_ip = request.client.host
    print(client_ip)

    if not check_rate_limit(client_ip):
        return {
            "status": 429,
            "response": "Sorry! You've reached the limit of 5 questions per day. To continue the conversation, please drop your email and we'll follow up with all the relevant details about Amrut.\n Looking forward to connecting!"
        }

    try:
        normalized_query = expansion_answer.normalize(question)

        async def generate_response():
            return expansion_answer.get_response(normalized_query)

        response = await asyncio.wait_for(generate_response(), timeout=LLM_TIMEOUT_SECONDS)

        key = f"history:{client_ip}"
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

@app.get("/all-history")
async def get_all_histories():
    data = []
    for key in r.scan_iter("history:*"):
        ip = key.split(":")[1]
        history = r.lrange(key, 0, -1)
        tries = r.get(f"rate_limit:{ip}") or 0
        data.append({
            "ip": ip,
            "tries": int(tries),
            "history": history
        })

    return {
        "total_users": len(data),
        "users": data
    }