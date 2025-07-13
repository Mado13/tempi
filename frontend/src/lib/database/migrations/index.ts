import { migration_001 } from './001_initial_schema'
import { migration_002 } from './002_add_outbox_columns'

// 📝 NOTE: The order of this array is critical for the migration process.
export const allMigrations = [migration_001, migration_002]
