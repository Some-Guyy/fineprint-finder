from builder import EmailBuilder
from sender import EmailSender

def send_multiple_emails():
    """Example: Send multiple emails efficiently"""
    # Build multiple emails
    email_addresses = ["owen.tan.2022@scis.smu.edu.sg"]
    emails_to_send = []
    
    for i in range(len(email_addresses)):
        builder = (
            EmailBuilder()
            .sender("youremail@gmail.com")
            .to(email_addresses[i])
            .subject(f"Notification {i}")
            .text(f"This is notification number {i}")
        )
        emails_to_send.append((builder.build(), builder.get_sender(), builder.get_recipients()))
    
    print(emails_to_send)
    
    # Send all at once
    sender = EmailSender()
    results = sender.send_multiple(emails_to_send)
    print(f"Success: {len(results['success'])}, Failed: {len(results['failed'])}")

send_multiple_emails()
