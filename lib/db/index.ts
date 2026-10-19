import "server-only";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

export class DbNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set");
  }
}

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

const globalForDb = globalThis as unknown as { __tcDb?: Db };

export function getDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DbNotConfiguredError();
  if (!globalForDb.__tcDb) {
    // prepare: false keeps this compatible with pooled (pgbouncer) connection strings.
    const client = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
    globalForDb.__tcDb = drizzle(client, { schema });
  }
  return globalForDb.__tcDb;
}

export { schema };
