import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from logger import app_logger

SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASS = os.environ.get('SMTP_PASS', '')
SMTP_FROM = os.environ.get('SMTP_FROM', SMTP_USER)
APP_URL   = os.environ.get('APP_URL', 'https://foundation-drab-eta.vercel.app')


def _send(to: str, subject: str, html: str) -> bool:
    if not SMTP_USER or not SMTP_PASS:
        app_logger.warning('SMTP credentials not configured — email skipped')
        return False
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = f'Mbogo Foundation <{SMTP_FROM}>'
        msg['To']      = to
        msg.attach(MIMEText(html, 'html'))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.ehlo()
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_FROM, to, msg.as_string())
        app_logger.info(f'Email sent to {to}: {subject}')
        return True
    except Exception as e:
        app_logger.error(f'Email send failed to {to}: {str(e)}', exc_info=True)
        return False


def send_admin_welcome_email(full_name: str, email: str, username: str, password: str) -> bool:
    subject = 'Welcome to Mbogo Foundation — Admin Account Created'
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f4f6fb;">
      <div style="background:#0A2463;padding:24px;text-align:center;">
        <h1 style="color:#fff;font-size:20px;margin:0;">Mbogo Welfare Empowerment Foundation</h1>
      </div>
      <div style="background:#fff;padding:32px;border:2px solid #0A2463;">
        <h2 style="color:#0A2463;">Hello {full_name},</h2>
        <p style="color:#444;line-height:1.6;">
          You have been added as an Administrator for <strong>Mbogo Welfare Empowerment Foundation</strong>.
        </p>
        <div style="background:#f4f6fb;padding:16px;margin:24px 0;border-left:4px solid #0A2463;">
          <p style="margin:0 0 8px;"><strong>Username:</strong> {username}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> {email}</p>
          <p style="margin:0;"><strong>Temporary Password:</strong> {password}</p>
        </div>
        <p style="color:#444;line-height:1.6;">
          Please log in and change your password immediately.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="{APP_URL}" style="background:#0A2463;color:#fff;padding:14px 32px;text-decoration:none;font-weight:bold;display:inline-block;">
            Login to Admin Portal
          </a>
        </div>
        <p style="color:#999;font-size:12px;text-align:center;">
          If you did not expect this email, please contact the super admin.
        </p>
      </div>
    </div>
    """
    return _send(email, subject, html)


def send_verification_email(full_name: str, email: str, token: str) -> bool:
    verify_url = f'{APP_URL}/verify-email/{token}'
    subject = 'Verify your Mbogo Foundation account'
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f4f6fb;">
      <div style="background:#0A2463;padding:24px;text-align:center;">
        <h1 style="color:#fff;font-size:20px;margin:0;">Mbogo Welfare Empowerment Foundation</h1>
      </div>
      <div style="background:#fff;padding:32px;border:2px solid #0A2463;">
        <h2 style="color:#0A2463;">Hello {full_name},</h2>
        <p style="color:#444;line-height:1.6;">
          Please verify your email address to activate your admin account.
          This link expires in <strong>24 hours</strong>.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="{verify_url}" style="background:#0A2463;color:#fff;padding:14px 32px;text-decoration:none;font-weight:bold;display:inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color:#999;font-size:12px;text-align:center;">
          Or copy this link: {verify_url}
        </p>
      </div>
    </div>
    """
    return _send(email, subject, html)
