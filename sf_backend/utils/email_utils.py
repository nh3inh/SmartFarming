from django.core.mail import send_mail
from django.conf import settings

def send_verify_email(email, token):
    link = f"https://tlrice.space/pages/auth/signin?token={token}"
    subject = "Verify your email"
    message = f"Click the following link to verify your email:\n\n{link}"
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])

def send_reset_password_email(email, token):
    link = f"https://tlrice.space/pages/auth/resetpassword?token={token}"
    subject = "Reset your password"
    message = f"Click the following link to reset your password:\n\n{link}"
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])