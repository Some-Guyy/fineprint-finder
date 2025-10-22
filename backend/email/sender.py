import smtplib
from email.mime.multipart import MIMEMultipart
from typing import List
import os
from dotenv import load_dotenv


class EmailSender:
    """Handle SMTP connection and email sending"""
    
    def __init__(self, smtp_server: str = None, smtp_port: int = None, 
                 username: str = None, password: str = None):
        """Initialize with SMTP credentials"""
        load_dotenv()
        
        self.smtp_server = smtp_server or os.getenv("SMTP_SERVER")
        self.smtp_port = smtp_port or int(os.getenv("SMTP_PORT", 587))
        self.username = username or os.getenv("SMTP_USER")
        self.password = password or os.getenv("SMTP_PASSWORD")
    
    def send(self, message: MIMEMultipart, sender: str, recipients: List[str]) -> bool:
        """
        Send the email message
        
        Args:
            message: The MIMEMultipart message to send
            sender: Sender email address
            recipients: List of recipient email addresses
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.sendmail(sender, recipients, message.as_string())
                print(f"Email sent successfully to {', '.join(recipients)}")
                return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_multiple(self, messages: List[tuple]) -> dict:
        """
        Send multiple emails in one session
        
        Args:
            messages: List of tuples (message, sender, recipients)
            
        Returns:
            dict: Results with 'success' and 'failed' lists
        """
        results = {"success": [], "failed": []}
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                
                for message, sender, recipients in messages:
                    try:
                        server.sendmail(sender, recipients, message.as_string())
                        results["success"].append(recipients)
                        print(f"Email sent to {', '.join(recipients)}")
                    except Exception as e:
                        results["failed"].append((recipients, str(e)))
                        print(f"Failed to send to {', '.join(recipients)}: {e}")
        except Exception as e:
            print(f"SMTP connection error: {e}")
            return {"success": [], "failed": messages}
        
        return results
