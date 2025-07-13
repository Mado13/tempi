export const migration_002 = {
  version: 2,
  statements: [
    `ALTER TABLE outbox ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';`,
    `ALTER TABLE outbox ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE outbox ADD COLUMN lastAttempt TEXT;`,
    `CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);`,
    `CREATE INDEX IF NOT EXISTS idx_outbox_timestamp ON outbox(timestamp);`,
    `CREATE INDEX IF NOT EXISTS idx_outbox_attempts ON outbox(attempts);`,
    `CREATE INDEX IF NOT EXISTS idx_outbox_lastAttempt ON outbox(lastAttempt);`,
  ],
}
