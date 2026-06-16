import os
import json
import threading
import urllib.parse
import urllib.request
from typing import List, Dict, Any, Optional

from logger import app_logger

AT_SMS_URL = 'https://api.africastalking.com/version1/messaging'

AT_SMS_SENDER_ID = os.environ.get('AFRICASTALKING_SENDER_ID', '').strip()

_init_lock = threading.Lock()
_initialized = False


def _ensure_initialized() -> None:
    global _initialized
    if _initialized:
        return
    with _init_lock:
        if _initialized:
            return
        _initialized = True
        app_logger.info("Africa's Talking SMS service initialized")


def _normalize_phone(phone: str) -> str:
    p = (phone or '').strip().replace(' ', '').replace('-', '')
    if not p:
        return ''

    if p.startswith('+'):
        p = p[1:]

    if p.startswith('07') or p.startswith('01'):
        return '254' + p[1:]
    if p.startswith('7') or p.startswith('1'):
        return '254' + p

    return p


def _is_valid_phone(p: str) -> bool:
    return p.isdigit() and 9 <= len(p) <= 15


def _get_credentials() -> Dict[str, str]:
    username = os.environ.get('AFRICASTALKING_USERNAME', '').strip()
    api_key = os.environ.get('AFRICASTALKING_API_KEY', '').strip()
    return {'username': username, 'api_key': api_key}


def _send_http(to_list: List[str], message: str) -> Dict[str, Any]:
    creds = _get_credentials()
    username = creds['username']
    api_key = creds['api_key']

    if not username or not api_key:
        raise RuntimeError("Africa's Talking credentials not configured")

    payload: Dict[str, str] = {
        'username': username,
        'to': ','.join(to_list),
        'message': message,
    }
    if AT_SMS_SENDER_ID:
        payload['from'] = AT_SMS_SENDER_ID

    data = urllib.parse.urlencode(payload).encode('utf-8')
    req = urllib.request.Request(
        AT_SMS_URL,
        data=data,
        headers={
            'Accept': 'application/json',
            'apiKey': api_key,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method='POST',
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        raw = resp.read().decode('utf-8')
        return json.loads(raw)


def send_bulk_sms(phone_list: List[str], message: str) -> Dict[str, Any]:
    """Send SMS to multiple recipients.

    Safe fallback: never raises; returns dict {success, sent, total, reason}.
    """
    _ensure_initialized()

    try:
        if not phone_list:
            return {'success': True, 'sent': 0, 'total': 0}

        normalized: List[str] = []
        for p in phone_list:
            p2 = _normalize_phone(p)
            if p2 and _is_valid_phone(p2):
                normalized.append(p2)

        # de-duplicate while preserving order
        normalized = list(dict.fromkeys(normalized))

        total = len(normalized)
        if total == 0:
            return {'success': False, 'reason': 'No valid phone numbers', 'sent': 0, 'total': 0}

        batch_size = 1000
        sent_total = 0
        failed_any = False
        first_error: Optional[str] = None

        for i in range(0, total, batch_size):
            batch = normalized[i:i + batch_size]
            try:
                response = _send_http(batch, message)

                sms_data = response.get('SMSMessageData', {}) if isinstance(response, dict) else {}
                recipients = sms_data.get('Recipients', []) if isinstance(sms_data, dict) else []

                batch_sent = 0
                if isinstance(recipients, list):
                    for r in recipients:
                        if isinstance(r, dict) and r.get('status') == 'Success':
                            batch_sent += 1

                sent_total += batch_sent

                app_logger.info(
                    "Africa's Talking SMS batch result",
                    extra={'batch_index': (i // batch_size) + 1, 'sent': batch_sent, 'total_in_batch': len(batch)},
                )

            except Exception as e:
                failed_any = True
                first_error = first_error or str(e)
                app_logger.error(
                    "Africa's Talking SMS batch failed",
                    extra={'batch_index': (i // batch_size) + 1, 'total_in_batch': len(batch)},
                    exc_info=True,
                )

        if failed_any and sent_total == 0:
            return {'success': False, 'reason': first_error or 'SMS sending failed', 'sent': 0, 'total': total}

        return {'success': True, 'sent': sent_total, 'total': total}

    except Exception as e:
        app_logger.error(f"Bulk SMS send failed: {str(e)}", exc_info=True)
        return {'success': False, 'reason': str(e), 'sent': 0, 'total': len(phone_list)}


def send_sms(phone: str, message: str) -> Dict[str, Any]:
    """Send SMS to a single recipient.

    Safe fallback: never raises; returns dict.
    """
    _ensure_initialized()

    try:
        normalized = _normalize_phone(phone)
        if not normalized or not _is_valid_phone(normalized):
            app_logger.warning("SMS not sent: invalid phone number", extra={'phone': phone, 'normalized': normalized})
            return {'success': False, 'reason': 'Invalid phone number', 'sent': 0, 'total': 1}

        result = send_bulk_sms([normalized], message)
        # Ensure shape consistent for callers
        return {
            'success': bool(result.get('success')),
            'reason': result.get('reason'),
            'sent': result.get('sent', 0),
            'total': 1,
        }

    except Exception as e:
        app_logger.error(f"SMS send failed: {str(e)}", exc_info=True)
        return {'success': False, 'reason': str(e), 'sent': 0, 'total': 1}


def build_meeting_alert_message(title: str, date: str, time: str, venue: str) -> str:
    venue_clean = venue if venue else 'TBD'
    return (
        'FOUNDATION ALERT\n'
        f'Title: {title}\n'
        f'Date: {date}\n'
        f'Time: {time}\n'
        f'Venue: {venue_clean}\n'
    )

