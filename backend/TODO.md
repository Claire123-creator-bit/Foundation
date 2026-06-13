# TODO - Mpesa enterprise-level security hardening

- [x] Add DB models/table for processed payment callback events (processed_event_id + status + timestamp) and optionally fraud counters/flags.

- [ ] Centralize fraud logging with a single helper: log_fraud_event(type, payment_id, reason, ip).
- [ ] Update `POST /payments/mpesa/callback` to:
  - [ ] compute processed_event_id hash from (MerchantRequestID, CheckoutRequestID, ResultCode)
  - [ ] reject duplicates permanently using new table/fields
  - [ ] add optional HMAC validation using DARAJA_CALLBACK_SECRET if present
  - [ ] enforce strict state machine and lock on complete/failed
  - [ ] maintain replay protection window (already implemented)
  - [ ] implement minimal fraud escalation using fraud_count per IP/payment
- [ ] Update any tests impacted by callback/schema changes.
- [ ] Run backend/unit tests.

