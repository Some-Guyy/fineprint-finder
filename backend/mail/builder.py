from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List


class EmailBuilder:
    """Builder class for constructing email messages"""
    
    def __init__(self):
        self.message = MIMEMultipart()
        self._sender = None
        self._recipients = []
        self._subject = None
        self._body_text = None
        self._body_html = None
        self._attachments = []
    
    def sender(self, email: str):
        """Set the sender email address"""
        self._sender = email
        self.message["From"] = email
        return self
    
    def to(self, email: str):
        """Add a recipient email address"""
        self._recipients.append(email)
        return self
    
    def recipients(self, emails: List[str]):
        """Add multiple recipient email addresses"""
        self._recipients.extend(emails)
        return self
    
    def subject(self, subject: str):
        """Set the email subject"""
        self._subject = subject
        self.message["Subject"] = subject
        return self
    
    def text(self, body: str):
        """Set plain text body"""
        self._body_text = body
        return self
    
    def html(self, body: str):
        """Set HTML body"""
        self._body_html = body
        return self
    
    def attachment(self, filename: str, filepath: str):
        """Add a file attachment"""
        self._attachments.append((filename, filepath))
        return self
    
    def build(self) -> MIMEMultipart:
        """Build and return the complete email message"""
        # Set To header
        if self._recipients:
            self.message["To"] = ", ".join(self._recipients)
        
        # Attach body content
        if self._body_text and self._body_html:
            # Both text and HTML versions
            alternative = MIMEMultipart("alternative")
            alternative.attach(MIMEText(self._body_text, "plain"))
            alternative.attach(MIMEText(self._body_html, "html"))
            self.message.attach(alternative)
        elif self._body_text:
            # Plain text only
            self.message.attach(MIMEText(self._body_text, "plain"))
        elif self._body_html:
            # HTML only
            self.message.attach(MIMEText(self._body_html, "html"))
        
        # Attach files
        for filename, filepath in self._attachments:
            try:
                with open(filepath, "rb") as f:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(f.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename={filename}"
                    )
                    self.message.attach(part)
            except FileNotFoundError:
                print(f"Warning: Attachment {filepath} not found, skipping.")
        
        return self.message
    
    def get_recipients(self) -> List[str]:
        """Get the list of recipient email addresses"""
        return self._recipients
    
    def get_sender(self) -> str:
        """Get the sender email address"""
        return self._sender
