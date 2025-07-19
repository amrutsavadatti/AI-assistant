from mailjet_rest import Client
import os
import random
import redis
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

# Mailjet configuration
MJ_APIKEY_PUBLIC = os.getenv("MJ_APIKEY_PUBLIC")
MJ_APIKEY_PRIVATE = os.getenv("MJ_APIKEY_PRIVATE")

if not MJ_APIKEY_PUBLIC or not MJ_APIKEY_PRIVATE:
    logger.warning("Mailjet API keys not found. Email verification will not work.")
    mailjet = None
else:
    mailjet = Client(auth=(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE), version='v3.1')

# Redis configuration for OTP storage
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)

OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 6

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def store_otp(email: str, otp: str):
    """Store OTP in Redis with 5-minute expiry"""
    key = f"otp:{email}"
    expiry_seconds = OTP_EXPIRY_MINUTES * 60
    r.setex(key, expiry_seconds, otp)
    logger.info(f"OTP stored for {email}: {otp} (expires in {OTP_EXPIRY_MINUTES} minutes)")

def verify_otp(email: str, provided_otp: str):
    """Verify if the provided OTP matches the stored one"""
    key = f"otp:{email}"
    stored_otp = r.get(key)
    
    if not stored_otp:
        return False, "OTP expired or not found"
    
    if stored_otp != provided_otp:
        return False, "Invalid OTP"
    
    # OTP is valid, delete it from Redis
    r.delete(key)
    logger.info(f"OTP verified successfully for {email}")
    return True, "OTP verified successfully"

def send_otp_email(email: str, name: str, otp: str):
    """Send OTP verification email using Mailjet"""
    
    if not mailjet:
        logger.error("Mailjet not configured. Cannot send email.")
        return False, "Email service not configured"
    
    try:
        # Email content
        subject = "Your Clarity Verification Code - OTP"
        text_part = f"""
Hello {name or 'there'},

Thank you for registering to chat with Amrut's AI assistant, Clarity.

Your one-time verification code is: {otp}
It will expire in {OTP_EXPIRY_MINUTES} minutes.

If you didn’t request this, you can safely ignore this message.

—
Clarity by Amrut
27 Irving St, Worcester, MA, USA
This is a one-time transactional message. You are not subscribed to any mailing list.

        """
        
        html_part = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; color: #333;">
    <h2 style="color: #6C63FF;">Clarity Verification Code</h2>

    <p>Hello <strong>{name or 'there'}</strong>,</p>

    <p>Thank you for registering to chat with Amrut’s AI assistant, <strong>Clarity</strong>.</p>

    <div style="background-color: #f1f1f1; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; color: #6C63FF;">Your One-Time Code</h3>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 10px 0;">{otp}</p>
        <p style="color: #555; margin: 0;">Expires in {OTP_EXPIRY_MINUTES} minutes</p>
    </div>

    <p>Use this code to continue chatting with Clarity.</p>

    <p style="font-size: 14px; color: #777; margin-top: 30px;">
        If you didn’t request this verification, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 30px 0;">

    <p style="font-size: 12px; color: #aaa; text-align: center;">
        Clarity by Amrut<br>
        27 Irving St, Worcester, MA, USA<br>
        This is a one-time transactional email. You are not subscribed to any list.
    </p>
</div>

        """
        
        # Mailjet API data
        data = {
            'Messages': [
                {
                    "From": {
                        "Email": "clarity@amrutsavadatti.com",
                        "Name": "Amrut's AI Assistant"
                    },
                    "To": [
                        {
                            "Email": email,
                            "Name": name or "User"
                        }
                    ],
                    "Subject": subject,
                    "TextPart": text_part,
                    "HTMLPart": html_part
                }
            ]
        }
        
        # Send email
        result = mailjet.send.create(data=data)
        
        if result.status_code == 200:
            logger.info(f"OTP email sent successfully to {email}")
            return True, "OTP email sent successfully"
        else:
            logger.error(f"Failed to send email: {result.status_code} - {result.json()}")
            return False, f"Failed to send email: {result.status_code}"
            
    except Exception as e:
        logger.error(f"Error sending OTP email: {str(e)}")
        return False, f"Error sending email: {str(e)}"

def get_otp_status(email: str):
    """Check if there's an active OTP for this email"""
    key = f"otp:{email}"
    ttl = r.ttl(key)
    
    if ttl > 0:
        minutes_left = ttl // 60
        seconds_left = ttl % 60
        return True, f"OTP active. Expires in {minutes_left}m {seconds_left}s"
    else:
        return False, "No active OTP found" 