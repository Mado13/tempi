// src/lib/services/database.service.ts
import {
  CapacitorSQLite,
  type DBSQLiteValues,
  SQLiteConnection,
  type SQLiteDBConnection,
} from '@capacitor-community/sqlite'

import { allMigrations } from '$lib/database/migrations'

type JsonSerializable = Record<string, any> | Array<any>

type ActionBase<T extends string, P extends JsonSerializable | { id: string | number }> = {
  id?: number
  type: T
  resource: string
  payload: P
  tempId?: string
  status?: 'pending' | 'failed'
  attempts?: number
  timestamp?: string
  lastAttempt?: string
}

export type OutboxAction =
  | ActionBase<'create', JsonSerializable>
  | ActionBase<'update', JsonSerializable & { id: string | number }>
  | ActionBase<'delete', { id: string | number }>
  | ActionBase<'patch', JsonSerializable>

class DatabaseService {
  private initPromise: Promise<void> | null = null
  private isInitialized = false
  db: SQLiteDBConnection | null = null

  initialize(): Promise<void> {
    // If already successfully initialized, return immediately.
    if (this.isInitialized) {
      return Promise.resolve()
    }

    // If initialization is already in progress, return the existing promise.
    if (this.initPromise) {
      return this.initPromise
    }

    // Start a new initialization process.
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        const sqlite = new SQLiteConnection(CapacitorSQLite)
        const dbName = 'tempi-db'
        await sqlite.checkConnectionsConsistency()

        const latestVersion =
          allMigrations.length > 0 ? allMigrations[allMigrations.length - 1].version : 1

        this.db = await sqlite.createConnection(
          dbName,
          false,
          'no-encryption',
          latestVersion,
          false,
        )
        await this.db.open()
        await this.runMigrations()

        console.log('Database connection established and schema verified.')
        this.isInitialized = true
        resolve()
      } catch (e) {
        console.error('Database initialization failed', e)
        this.initPromise = null
        reject(e)
      }
    })

    return this.initPromise
  }

  private async runMigrations() {
    try {
      const { version: currentVersion } = await this.db!.getVersion()
      const pendingMigrations = allMigrations.filter((m) => m.version > currentVersion)

      if (pendingMigrations.length === 0) {
        return
      }

      for (const migration of pendingMigrations) {
        console.log(`Applying migration version ${migration.version}...`)
        await this.db!.executeTransaction(
          migration.statements.map((stmt) => ({ statement: stmt, values: [] })),
        )
      }

      const latestVersion = allMigrations[allMigrations.length - 1].version
      await this.db!.execute(`PRAGMA user_version = ${latestVersion}`)
      console.log(`Database migrated to version ${latestVersion}.`)
    } catch (err) {
      console.error('Migration process failed:', err)
      throw err
    }
  }

  async addToActionQueue(
    action: Omit<OutboxAction, 'id' | 'status' | 'attempts' | 'timestamp' | 'lastAttempt'>,
  ): Promise<void> {
    await this.initialize()
    const statement = `
      INSERT INTO outbox (type, resource, payload, tempId)
      VALUES (?, ?, ?, ?);
    `
    const values = [action.type, action.resource, JSON.stringify(action.payload), action.tempId]
    await this.db?.run(statement, values)
  }

  async getQueuedActions(): Promise<OutboxAction[]> {
    await this.initialize()
    const statement = `
      SELECT * FROM outbox 
      WHERE 
        status = 'pending' AND attempts < 5
        AND (
          lastAttempt IS NULL OR 
          strftime('%s', 'now') - strftime('%s', lastAttempt) > (1 << (attempts - 1)) * 5
        )
      ORDER BY timestamp ASC;
    `
    const result = await this.db?.query(statement)
    const actions: OutboxAction[] = []
    if (!result?.values) return actions

    for (const v of result.values) {
      try {
        actions.push({ ...v, payload: JSON.parse(v.payload) })
      } catch (e) {
        console.error(
          `Failed to parse malformed payload for outbox action id ${v.id}. Marking as failed.`,
          e,
        )
        await this.db?.run(`UPDATE outbox SET status = 'failed' WHERE id = ?`, [v.id])
      }
    }
    return actions
  }

  async reconcileCreatedItem(
    tableName: string,
    tempId: string,
    permanentItem: any & { id: string },
  ) {
    await this.initialize()
    const statements = [
      { statement: `DELETE FROM ${tableName} WHERE id = ?;`, values: [tempId] },
      {
        statement: `INSERT INTO ${tableName} (id, data) VALUES (?, ?);`,
        values: [permanentItem.id, JSON.stringify(permanentItem)],
      },
    ]
    await this.db!.executeTransaction(statements)
  }

  async updateActionOnFailure(id: number): Promise<void> {
    await this.initialize()
    const statement = `
      UPDATE outbox
      SET 
        attempts = attempts + 1,
        lastAttempt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?;
    `
    await this.db?.run(statement, [id])
  }

  async removeActionFromQueue(id: number): Promise<void> {
    await this.initialize()
    const statement = `DELETE FROM outbox WHERE id = ?;`
    await this.db?.run(statement, [id])
  }

  async getAll<T>(tableName: string): Promise<T[]> {
    await this.initialize()
    const statement = `SELECT data FROM ${tableName};`
    const result = await this.db?.query(statement)
    return result?.values?.map((v) => JSON.parse(v.data)) ?? []
  }

  async save<T extends { id: string }>(tableName: string, item: T) {
    await this.initialize()
    const data = JSON.stringify(item)
    const statement = `
      INSERT INTO ${tableName} (id, data) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET data = excluded.data;
    `
    await this.db?.run(statement, [item.id, data])
  }

  async bulkSave<T extends { id: string }>(tableName: string, items: T[]): Promise<void> {
    await this.initialize()
    if (!items || items.length === 0) return

    const set: DBSQLiteValues[] = items.map((item) => ({
      statement: `
        INSERT INTO ${tableName} (id, data) VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data;
      `,
      values: [item.id, JSON.stringify(item)],
    }))
    await this.db?.executeSet(set)
  }

  async deleteById(tableName: string, id: string | number) {
    await this.initialize()
    const statement = `DELETE FROM ${tableName} WHERE id = ?;`
    await this.db?.run(statement, [id])
  }

  async debug_checkSchema() {
    console.log('--- Checking Live Database Schema ---')
    await this.initialize()
    try {
      const result = await this.db?.query('PRAGMA table_info(outbox);')
      console.table(result?.values)
      console.log('------------------------------------')
    } catch (e) {
      console.error('Could not check schema', e)
    }
  }
}

export const dbService = new DatabaseService()
