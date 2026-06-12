import os
import urllib.request
import urllib.parse
import json
from logger import app_logger

AT_SMS_URL = 'https://api.africastalking.com/version1/messaging'


def _normalize_phone(phone: str) -> str:
    p = phone.strip().replace(' ', '').replace('-', '')
    if p.startswith('+'):
        return p[1:]
    if p.startswith('07') or p.startswith('01'):
        return '254' + p[1:]
    if p.startswith('7') or p.startswith('1'):
        return '254' + p
    return p


def send_sms(recipients: list, message: str) -> dict:
    username = os.environ.get('AFRICASTALKING_USERNAME', '').strip()
    api_key  = os.environ.get('AFRICASTALKING_API_KEY', '').strip()
    sender   = os.environ.get('AFRICASTALKING_SENDER_ID', '').strip()

    if not username or not api_key:
        app_logger.warning('Africa\'s Talking credentials not set — SMS not sent')
        return {'success': False, 'reason': 'SMS credentials not configured', 'sent': 0, 'total': len(recipients)}

    if not recipients:
        return {'success': True, 'sent': 0, 'total': 0}

    normalized = [_normalize_phone(p) for p in recipients if p and p.strip()]
    normalized = [p for p in normalized if len(p) >= 9]

    if not normalized:
        return {'success': False, 'reason': 'No valid phone numbers', 'sent': 0, 'total': 0}

    BATCH = 1000
    total_sent = 0
    errors = []

    for i in range(0, len(normalized), BATCH):
        batch = normalized[i:i + BATCH]
        payload = {
            'username': username,
            'to':       ','.join(batch),
            'message':  message,
        }
        if sender:
            payload['from'] = sender

        data = urllib.parse.urlencode(payload).encode('utf-8')
        req  = urllib.request.Request(
            AT_SMS_URL,
            data=data,
            headers={
                'Accept':       'application/json',
                'apiKey':        api_key,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                result     = json.loads(resp.read().decode('utf-8'))
                sms_data   = result.get('SMSMessageData', {})
                recipients_list = sms_data.get('Recipients', [])
                batch_sent = sum(1 for r in recipients_list if r.get('status') == 'Success')
                total_sent += batch_sent
                app_logger.info(f'SMS batch {i//BATCH + 1}: sent {batch_sent}/{len(batch)}')
        except Exception as e:
            app_logger.error(f'SMS batch {i//BATCH + 1} failed: {str(e)}', exc_info=True)
            errors.append(str(e))

    if errors and total_sent == 0:
        return {'success': False, 'reason': errors[0], 'sent': 0, 'total': len(normalized)}

    return {'success': True, 'sent': total_sent, 'total': len(normalized)}


def send_meeting_sms(meeting: dict, phone_numbers: list) -> dict:
    message = (
        f"MBOGO FOUNDATION\n\n"
        f"New Meeting: {meeting['title']}\n"
        f"Date: {meeting['date']}\n"
        f"Time: {meeting['time']}\n"
        f"Venue: {meeting.get('venue') or 'TBD'}\n\n"
        f"Login to the portal for details."
    )
    return send_sms(phone_numbers, message)
