// Resets the test database to an empty, migrated state, exactly like a fresh production install.
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { rm } from "node:fs/promises";

const url = process.env.DATABASE_URL;
if (!url || !/tcm_test|e2e|test/.test(url)) {
  console.error("Refusing to reset: DATABASE_URL does not look like a test database.");
  process.exit(1);
}
const sql = postgres(url, { max: 1, onnotice: () => {} });
await sql.unsafe("drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;");
await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
await sql.end();
await rm(".data/uploads", { recursive: true, force: true });
// Cached pages and CMS data from an earlier run would otherwise outlive the reset database.
await rm(".next/cache/fetch-cache", { recursive: true, force: true });
await rm(".next/server/route-cache", { recursive: true, force: true });
console.log("[e2e] Test database reset.");
