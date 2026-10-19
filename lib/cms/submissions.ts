import "server-only";
import { lt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/** Removes contact-form submissions older than the configured retention period. */
export async function pruneOldSubmissions(days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  await getDb().delete(schema.submissions).where(lt(schema.submissions.createdAt, cutoff));
}
