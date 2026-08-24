import os
import json
import threading
import urllib.parse
import urllib.request
from typing import List, Dict, Any, Optional

from logger import app_logger

AT_SMS_URL = 'https://api.africastalking.com/version1/messaging'

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


def _send_http(to_list: List[str], message: str) -> Dict[str, Any]:
    username = os.environ.get('AFRICASTALKING_USERNAME', '').strip()
    api_key = os.environ.get('AFRICASTALKING_API_KEY', '').strip()
    sender_id = os.environ.get('AFRICASTALKING_SENDER_ID', '').strip()

    if not username or not api_key:
        raise RuntimeError("Africa's Talking credentials not configured")

    payload: Dict[str, str] = {
        'username': username,
        'to': ','.join(to_list),
        'message': message,
    }
    if sender_id:
        payload['from'] = sender_id

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
    _ensure_initialized()

    try:
        if not phone_list:
            return {'success': False, 'reason': 'No phone numbers provided', 'sent': 0, 'total': 0}

        normalized: List[str] = []
        failed_normalizations = []
        for p in phone_list:
            p2 = _normalize_phone(p)
            if p2 and _is_valid_phone(p2):
                normalized.append(p2)
            else:
                failed_normalizations.append({'original': p, 'normalized': p2, 'valid': _is_valid_phone(p2) if p2 else False})

        normalized = list(dict.fromkeys(normalized))

        if failed_normalizations:
            app_logger.warning(
                "Phone number normalization failures",
                extra={'failed_count': len(failed_normalizations), 'samples': failed_normalizations[:5]}
            )

        total = len(normalized)
        if total == 0:
            return {'success': False, 'reason': f'No valid phone numbers after normalization ({len(phone_list)} input numbers)', 'sent': 0, 'total': 0}

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
                provider_failures = []
                accepted_statuses = {'success', 'sent', 'queued'}
                if isinstance(recipients, list):
                    for recipient in recipients:
                        if not isinstance(recipient, dict):
                            continue
                        status = str(recipient.get('status', '')).strip().lower()
                        if status in accepted_statuses:
                            batch_sent += 1
                        else:
                            provider_failures.append({
                                'number': recipient.get('number'),
                                'status': recipient.get('status'),
                                'message': recipient.get('message'),
                            })

                sent_total += batch_sent

                app_logger.info(
                    "Africa's Talking SMS batch result",
                    extra={
                        'batch_index': (i // batch_size) + 1,
                        'sent': batch_sent,
                        'total_in_batch': len(batch),
                        'provider_failures': provider_failures[:5],
                    },
                )

            except Exception as e:
                failed_any = True
                first_error = first_error or str(e)
                app_logger.error(
                    "Africa's Talking SMS batch failed",
                    extra={'batch_index': (i // batch_size) + 1, 'total_in_batch': len(batch)},
                    exc_info=True,
                )

        if sent_total == 0:
            return {
                'success': False,
                'reason': first_error or 'Africa\'s Talking accepted no recipients',
                'sent': 0,
                'total': total,
            }

        return {'success': True, 'sent': sent_total, 'total': total}

    except Exception as e:
        app_logger.error(f"Bulk SMS send failed: {str(e)}", exc_info=True)
        return {'success': False, 'reason': str(e), 'sent': 0, 'total': len(phone_list)}


def send_sms(phone: str, message: str) -> Dict[str, Any]:
    _ensure_initialized()

    try:
        normalized = _normalize_phone(phone)
        if not normalized or not _is_valid_phone(normalized):
            app_logger.warning("SMS not sent: invalid phone number", extra={'phone': phone, 'normalized': normalized})
            return {'success': False, 'reason': 'Invalid phone number', 'sent': 0, 'total': 1}

        result = send_bulk_sms([normalized], message)
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
    try:
        from datetime import datetime
        d = datetime.strptime(date, '%Y-%m-%d')
        day_name = d.strftime('%A')
        date_fmt = d.strftime('%-d %B %Y')
    except Exception:
        day_name = ''
        date_fmt = date
    try:
        from datetime import datetime as dt
        t = dt.strptime(time, '%H:%M')
        time_fmt = t.strftime('%I:%M %p').lstrip('0')
    except Exception:
        time_fmt = time
    return (
        'MBOGO FOUNDATION MEETING ALERT\n'
        f'Dear Member, you are invited to:\n\n'
        f'Meeting: {title}\n'
        f'Date: {day_name}, {date_fmt}\n'
        f'Time: {time_fmt}\n'
        f'Venue: {venue_clean}\n\n'
        'Please make an effort to attend.\n'
        'Mbogo Welfare Empowerment Foundation'
    )


def send_member_approval_sms(member_name: str, phone: str) -> Dict[str, Any]:
    message = (
        f"Welcome to Mbogo Welfare Empowerment Foundation! Dear {member_name.strip() or 'Member'}, "
        "your membership has been approved. We are grateful to have you join us in empowering communities. "
        "Warm regards, Mbogo Welfare Empowerment Foundation."
    )
    result = send_sms(phone, message)
    if result.get('success'):
        app_logger.info('Member approval welcome SMS sent', extra={'name': member_name, 'phone': phone})
    else:
        app_logger.warning('Member approval welcome SMS failed', extra={'name': member_name, 'phone': phone, 'result': result})
    return result


def send_admin_welcome_sms(admin_name: str, phone: str) -> Dict[str, Any]:
    message = (
        f"Welcome to the Mbogo Welfare Empowerment Foundation team! Dear {admin_name.strip() or 'Admin'}, "
        "your admin account is now active. We are excited to have you join us in serving our community. "
        "Warm regards, Mbogo Welfare Empowerment Foundation."
    )
    result = send_sms(phone, message)
    if result.get('success'):
        app_logger.info('Admin welcome SMS sent', extra={'name': admin_name, 'phone': phone})
    else:
        app_logger.warning('Admin welcome SMS failed', extra={'name': admin_name, 'phone': phone, 'result': result})
    return result


def send_meeting_invitation_sms(phone: str, name: str, title: str, date: str, time: str, venue: str, details: str) -> Dict[str, Any]:
    venue_text = venue or 'TBD'
    details_text = details.strip() if details else 'Please join us for this important gathering.'
    message = (
        f"Mbogo Foundation Meeting: {title}. Date: {date}, Time: {time}, Venue: {venue_text}. "
        f"Dear {name.strip() or 'Member'}, {details_text} We look forward to seeing you there. Warm regards, Mbogo Welfare Empowerment Foundation."
    )
    result = send_sms(phone, message)
    if result.get('success'):
        app_logger.info('Meeting invitation SMS sent', extra={'name': name, 'phone': phone, 'title': title})
    else:
        app_logger.warning('Meeting invitation SMS failed', extra={'name': name, 'phone': phone, 'title': title, 'result': result})
    return result

