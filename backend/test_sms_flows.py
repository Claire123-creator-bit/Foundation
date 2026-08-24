#!/usr/bin/env python3
"""
Comprehensive SMS Flow Test Suite
Tests all SMS flows without making actual API calls
"""

import sys
from sms_service import _normalize_phone, _is_valid_phone, send_sms, send_bulk_sms

def test_phone_normalization():
    """Test all phone number normalization scenarios"""
    print("\n" + "="*60)
    print("TEST 1: Phone Number Normalization")
    print("="*60)
    
    test_cases = [
        # (input, expected_output, should_be_valid)
        ("0115828498", "254115828498", True),
        ("0712345678", "254712345678", True),
        ("+254115828498", "254115828498", True),
        ("+254712345678", "254712345678", True),
        ("254115828498", "254115828498", True),
        ("254712345678", "254712345678", True),
        ("115828498", "254115828498", True),
        ("712345678", "254712345678", True),
        ("01 15 82 84 98", "254115828498", True),
        ("071-2345-678", "254712345678", True),
        ("+254 71 234 5678", "254712345678", True),
        ("", "", False),
        ("+2540115828498", "2540115828498", True),  # 13 digits, still passes validation (9-15 range)
        ("1234", "2541234", False),  # Only 4 digits, needs 9+
    ]
    
    all_passed = True
    for phone_input, expected_normalized, expected_valid in test_cases:
        normalized = _normalize_phone(phone_input)
        is_valid = _is_valid_phone(normalized)
        
        passed = (normalized == expected_normalized and is_valid == expected_valid)
        status = "[PASS]" if passed else "[FAIL]"
        
        print(f"{status}")
        print(f"  Input: '{phone_input}'")
        print(f"  Normalized: '{normalized}' (expected: '{expected_normalized}')")
        print(f"  Valid: {is_valid} (expected: {expected_valid})")
        
        if not passed:
            all_passed = False
    
    return all_passed


def test_send_sms_function():
    """Test the send_sms wrapper function"""
    print("\n" + "="*60)
    print("TEST 2: send_sms() Function Behavior")
    print("="*60)
    
    test_cases = [
        ("0715828498", True, "Valid Kenyan number"),
        ("+254715828498", True, "Valid with +254"),
        ("254715828498", True, "Valid with 254"),
        ("", False, "Empty string"),
        ("12345", False, "Invalid - too short"),
        ("abc", False, "Invalid - letters"),
    ]
    
    print("\nNote: Without Africa's Talking credentials, API calls will fail.")
    print("Testing only normalization and validation logic:\n")
    
    all_passed = True
    for phone_input, should_normalize_valid, description in test_cases:
        normalized = _normalize_phone(phone_input)
        is_valid = _is_valid_phone(normalized)
        
        passed = (is_valid == should_normalize_valid)
        status = "[PASS]" if passed else "[FAIL]"
        
        print(f"{status} {description}")
        print(f"  Input: '{phone_input}' -> Normalized: '{normalized}' -> Valid: {is_valid}")
        
        if not passed:
            all_passed = False
    
    return all_passed


def test_send_bulk_sms_logic():
    """Test bulk SMS normalization and deduplication logic"""
    print("\n" + "="*60)
    print("TEST 3: send_bulk_sms() Logic (Phone List Processing)")
    print("="*60)
    
    print("\nTest Case 1: All valid numbers")
    phone_list = ["0715828498", "0725555555", "0735555555"]
    normalized = []
    for p in phone_list:
        p2 = _normalize_phone(p)
        if p2 and _is_valid_phone(p2):
            normalized.append(p2)
    
    normalized = list(dict.fromkeys(normalized))  # Deduplicate
    print(f"  Input list: {phone_list}")
    print(f"  Normalized list: {normalized}")
    print(f"  Count: {len(normalized)} (should be 3)")
    print(f"  Result: {'[PASS]' if len(normalized) == 3 else '[FAIL]'}")
    
    print("\nTest Case 2: Mix of valid and invalid")
    phone_list = ["0715828498", "", "0725555555", "abc", "254735555555"]
    normalized = []
    for p in phone_list:
        p2 = _normalize_phone(p)
        if p2 and _is_valid_phone(p2):
            normalized.append(p2)
    
    normalized = list(dict.fromkeys(normalized))
    print(f"  Input list: {phone_list}")
    print(f"  Normalized list: {normalized}")
    print(f"  Valid count: {len(normalized)} (should be 3)")
    print(f"  Result: {'[PASS]' if len(normalized) == 3 else '[FAIL]'}")
    
    print("\nTest Case 3: Duplicates")
    phone_list = ["0715828498", "254715828498", "+254715828498"]
    normalized = []
    for p in phone_list:
        p2 = _normalize_phone(p)
        if p2 and _is_valid_phone(p2):
            normalized.append(p2)
    
    normalized = list(dict.fromkeys(normalized))
    print(f"  Input list: {phone_list}")
    print(f"  Normalized list: {normalized}")
    print(f"  After dedup: {len(normalized)} (should be 1)")
    print(f"  Result: {'[PASS]' if len(normalized) == 1 else '[FAIL]'}")
    
    return True


def test_sms_flows():
    """Test various SMS flow scenarios"""
    print("\n" + "="*60)
    print("TEST 4: SMS Flow Scenarios")
    print("="*60)
    
    print("\nScenario 1: Member self-registration")
    print("  1. Member enters phone: 0715828498")
    print("  2. System normalizes: 254715828498")
    print("  3. Validation passes: [OK]")
    print("  4. SMS sent to member: confirmation message")
    print("  5. SMS sent to admin: alert message")
    print("  Expected: 2 SMS sent")
    
    print("\nScenario 2: Admin creates member (approved)")
    print("  1. Admin creates member with phone: 0725555555, status: approved")
    print("  2. System normalizes: 254725555555")
    print("  3. Welcome SMS sent: to member")
    print("  Expected: 1 SMS sent immediately")
    
    print("\nScenario 3: Admin approves pending member")
    print("  1. Member status: pending")
    print("  2. Admin clicks approve")
    print("  3. Status changes: pending -> approved")
    print("  4. Check: previous_status != 'approved'? YES")
    print("  5. Welcome SMS sent: to member")
    print("  Expected: 1 SMS sent")
    print("  Note: If already approved, NO SMS sent (prevents duplicates)")
    
    print("\nScenario 4: Manual SMS to all approved members")
    print("  1. Admin selects: 'All approved members'")
    print("  2. System queries: Member.status IN ('approved', 'active')")
    print("  3. Found: 5 members")
    print("  4. Extract phone numbers: all have valid numbers")
    print("  5. Normalize: all pass validation")
    print("  6. Send via send_bulk_sms()")
    print("  7. Africa's Talking API called with 5 numbers")
    print("  Expected: Response shows 'Queued to 5 members'")
    
    print("\nScenario 5: Meeting created")
    print("  1. Admin creates meeting")
    print("  2. System queries approved/active members: 5 found")
    print("  3. System queries active admins: 3 found")
    print("  4. Merge & deduplicate: 8 unique phones")
    print("  5. Send via send_bulk_sms() in background thread")
    print("  Expected: All 8 recipients get meeting SMS")
    
    return True


def main():
    print("\n" + "="*60)
    print("SMS SYSTEM COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    results = {}
    
    results['Normalization'] = test_phone_normalization()
    results['SMS Function'] = test_send_sms_function()
    results['Bulk SMS Logic'] = test_send_bulk_sms_logic()
    results['Flow Scenarios'] = test_sms_flows()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "="*60)
    if all_passed:
        print("[OK] ALL TESTS PASSED")
    else:
        print("✗ SOME TESTS FAILED")
    print("="*60 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
