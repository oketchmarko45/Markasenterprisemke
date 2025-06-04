import smtplib
import os
from email.mime.text import MIMEText
from email.utils import formatdate

def handler(event, context):
    try:
        # Parse form data from Netlify
        body = event["body"]
        data = dict(pair.split("=") for pair in body.split("&"))
        
        # URL decode and prepare email content
        from urllib.parse import unquote
        name = unquote(data.get("name", ""))
        email = unquote(data.get("email", ""))
        service = unquote(data.get("service", ""))
        message = unquote(data.get("message", ""))
        
        # Email configuration
        sender = "your-bot-email@gmail.com"  # Replace with your Gmail
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
        return {
            "statusCode": 500,
            "body": f"Error: {str(e)}"
        }
