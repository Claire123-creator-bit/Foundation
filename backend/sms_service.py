import os
import urllib.request
import urllib.parse
import json
from logger import app_logger


AT_USERNAME = os.environ.get('AFRICASTALKING_USERNAME', '')
AT_API_KEY = os.environ.get('AFRICASTALKING_API_KEY', '')
AT_SENDER_ID = os.environ.get('AFRICASTALKING_SENDER_ID', '')
AT_SMS_URL = 'https://api.africastalking.com/version1/messaging'


def send_sms(recipients: list[str], message: str) -> dict:
    if not AT_USERNAME or not AT_API_KEY:
        app_logger.warning('Africa\'s Talking credentials not configured — SMS skipped')
        return {'success': False, 'reason': 'SMS not configured', 'recipients': 0}

    if not recipients:
        return {'success': True, 'recipients': 0}

    normalized = []
    for phone in recipients:
        p = phone.strip()
        if p.startswith('0'):
            p = '254' + p[1:]
        elif p.startswith('+'):
            p = p[1:]
        if p:
            normalized.append(p)

    if not normalized:
        return {'success': True, 'recipients': 0}

    payload = {
        'username': AT_USERNAME,
        'to': ','.join(normalized),
        'message': message,
    }
    if AT_SENDER_ID:
        payload['from'] = AT_SENDER_ID

    data = urllib.parse.urlencode(payload).encode('utf-8')
    req = urllib.request.Request(
        AT_SMS_URL,
        data=data,
        headers={
            'Accept': 'application/json',
            'apiKey': AT_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            sms_data = result.get('SMSMessageData', {})
            recipients_sent = len(sms_data.get('Recipients', []))
            app_logger.info(f'SMS sent to {recipients_sent}/{len(normalized)} recipients')
            return {'success': True, 'recipients': recipients_sent}
    except Exception as e:
        app_logger.error(f'Africa\'s Talking SMS error: {str(e)}', exc_info=True)
        return {'success': False, 'reason': str(e), 'recipients': 0}


def send_meeting_sms(meeting: dict, phone_numbers: list[str]) -> dict:
    message = (
        f"MBOGO FOUNDATION\n\n"
        f"New Meeting: {meeting['title']}\n"
        f"Date: {meeting['date']}\n"
        f"Time: {meeting['time']}\n"
        f"Venue: {meeting.get('venue') or 'TBD'}\n\n"
        f"Login to the portal for details."
    )
    return send_sms(phone_numbers, message)
