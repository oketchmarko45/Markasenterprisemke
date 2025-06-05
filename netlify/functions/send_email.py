import smtplib
import os
from email.mime.text import MIMEText
from email.utils import formatdate
from urllib.parse import unquote
import re

def is_valid_email(email):
    # Simple regex for validating an email address
    return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None

def handler(event, context):
    try:
        # Parse form data from Netlify
        body = event["body"]
        data = dict(pair.split("=") for pair in body.split("&"))
        
        # URL decode and prepare email content
        name = unquote(data.get("name", ""))
        email = unquote(data.get("email", ""))
        service = unquote(data.get("service", ""))
        message = unquote(data.get("message", ""))
        
        # Validate email
        if not is_valid_email(email):
            return {
                "statusCode": 400,
                "body": "Error: Invalid email address."
            }
        
        # Email configuration
        sender = "markasenterprisemke@gmail.com"  # Replace with your Gmail
        receiver = "markasenterprisemke@gmail.com"
        subject = f"New Feedback: {service}"
        
        email_body = f"""
        New Feedback Submission:
        
        Name: {name}
        Email: {email}
        Service: {service}
        Message: {message}
        """

        # Create MIME message
        msg = MIMEText(email_body)
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = receiver
        msg['Date'] = formatdate(localtime=True)

        # Send via Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender, os.getenv("GMAIL_APP_PASSWORD"))
            smtp.sendmail(sender, receiver, msg.as_string())
        
        return {
            "statusCode": 200,
            "body": "Feedback submitted successfully!"
        }

    except Exception as e:
        # Log the error (consider using a logging library)
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "body": "Error: An unexpected error occurred."
        }
