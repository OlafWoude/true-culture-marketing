import "server-only";
import { Resend } from "resend";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function emailFrom() {
  return process.env.EMAIL_FROM || "True Culture Marketing <onboarding@resend.dev>";
}

export async function sendEmail(input: { to: string; subject: string; text: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false as const, error: "not-configured" };
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: emailFrom(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false as const, error: "send-failed" };
    }
    return { ok: true as const };
  } catch (error) {
    console.error("[email] Sending failed:", error);
    return { ok: false as const, error: "send-failed" };
  }
}

export function siteBaseUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
