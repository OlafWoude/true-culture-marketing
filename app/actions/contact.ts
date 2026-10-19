"use server";

import { getDb, isDbConfigured, schema } from "@/lib/db";
import { clientIpKey, isRateLimited, recordHit } from "@/lib/auth/rate-limit";
import { getLiveBundle } from "@/lib/cms/repo";
import { isEmailConfigured, sendEmail } from "@/lib/email";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "companyName" | "message", string>>;
  values?: { name: string; email: string; companyName: string; message: string };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { forms } = await getLiveBundle();
  const m = forms.messages;

  // Honeypot: real visitors never fill this hidden field in.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", message: m.success };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const companyName = String(formData.get("companyName") ?? "").trim().slice(0, 160);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);

  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (name.length < 2) fieldErrors.name = m.nameError;
  if (!EMAIL_RE.test(email)) fieldErrors.email = m.emailError;
  if (companyName.length < 2) fieldErrors.companyName = m.companyError;
  if (message.length < 10) fieldErrors.message = m.messageError;
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: m.invalid, fieldErrors, values: { name, email, companyName, message } };
  }

  const db = isDbConfigured();
  if (db) {
    const key = `contact:${await clientIpKey()}`;
    if (await isRateLimited(key, 5, 10 * 60 * 1000)) {
      return { status: "error", message: m.rateLimited, values: { name, email, companyName, message } };
    }
    await recordHit(key);
  }

  const recipient = forms.recipientEmail || process.env.CONTACT_TO_EMAIL || "";
  let emailed = false;
  if (recipient && isEmailConfigured()) {
    const result = await sendEmail({
      to: recipient,
      replyTo: email,
      subject: `Nieuwe aanvraag via de website: ${name} (${companyName})`,
      text: `Naam: ${name}\nBedrijf: ${companyName}\nE-mail: ${email}\n\nBericht:\n${message}`,
    });
    emailed = result.ok;
  }

  let stored = false;
  if (db && forms.storeSubmissions) {
    try {
      await getDb()
        .insert(schema.submissions)
        .values({ form: "contact", data: { name, companyName, email, message }, emailed });
      stored = true;
    } catch (error) {
      console.error("[contact] Could not store submission:", error);
    }
  }

  if (emailed || stored) return { status: "success", message: m.success };
  const values = { name, email, companyName, message };
  if (!recipient || !isEmailConfigured()) return { status: "error", message: m.notConfigured, values };
  return { status: "error", message: m.failed, values };
}
