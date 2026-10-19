import "server-only";
import { assertAdmin, UnauthorizedError } from "./session";

/** Route handlers are not covered by the Server Action origin check, so they verify it themselves. */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function guardAdminRequest(request: Request) {
  if (!isSameOrigin(request)) {
    return { error: Response.json({ error: "Verzoek geweigerd." }, { status: 403 }) };
  }
  try {
    return { user: await assertAdmin() };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { error: Response.json({ error: "Je sessie is verlopen. Log opnieuw in." }, { status: 401 }) };
    }
    throw error;
  }
}
