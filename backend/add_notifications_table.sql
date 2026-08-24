-- Migration: add notifications table
-- Apply with: psql "<CONN_STRING>" -f backend/add_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL,
    recipient_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'email',
    event_type VARCHAR(100) NOT NULL,
    event_id INTEGER NOT NULL,
    template VARCHAR(100),
    payload TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    provider_message_id VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Unique constraint to prevent duplicate notifications for the same event+recipient
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_event_recipient ON notifications (event_type, event_id, recipient_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications (status);
CREATE INDEX IF NOT EXISTS idx_notifications_event ON notifications (event_type, event_id);
