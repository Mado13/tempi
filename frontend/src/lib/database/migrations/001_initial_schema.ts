export const migration_001 = {
  version: 1,
  statements: [
    `CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      resource TEXT NOT NULL,
      payload TEXT NOT NULL,
      tempId TEXT,
      timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );`,
  ],
}
