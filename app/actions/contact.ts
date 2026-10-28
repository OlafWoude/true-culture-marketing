"use server";

import { getDb, isDbConfigured, schema } from "@/lib/db";
import { clientIpKey, isRateLimited, recordHit } from "@/lib/auth/rate-limit";
import { getLiveBundle } from "@/lib/cms/repo";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { applicationChecks } from "@/lib/application-checks";
import { serviceSlug } from "@/lib/cms/render";

type Field = "name" | "phone" | "email" | "city" | "availability";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<Field, string>>;
  values?: { name: string; phone: string; email: string; city: string; availability: string; vacancy: string; message: string };
};

// Drops control characters (except tab and newlines) so stored applications and e-mails stay readable.
const clean = (value: FormDataEntryValue | null, max: number) =>
  Array.from(String(value ?? ""))
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return (code >= 32 && code !== 127) || ch === "\n" || ch === "\t";
    })
    .join("")
    .trim()
    .slice(0, max);

/** Handles the application form: validates, stores the application for the dashboard and notifies the recruiter. */
export async function submitContactForm(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const { forms, services } = await getLiveBundle();
  const m = forms.messages;

  // Honeypot: real visitors never fill this hidden field in.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", message: m.success };
  }

  const values = {
    name: clean(formData.get("name"), 120),
    phone: clean(formData.get("phone"), 20),
    email: clean(formData.get("email"), 200),
    city: clean(formData.get("city"), 80),
    availability: clean(formData.get("availability"), 80),
    vacancy: clean(formData.get("vacancy"), 80),
    message: clean(formData.get("message"), 2000),
  };
  const source = clean(formData.get("source"), 300);
  // Only a published vacancy counts; anything else is treated as "no preference".
  const vacancy = values.vacancy ? (services.find((s) => serviceSlug(s) === values.vacancy)?.title ?? "") : "";
  if (!vacancy) values.vacancy = "";
  const options = forms.availabilityOptions.filter(Boolean);

  const fieldErrors: ContactFormState["fieldErrors"] = {};
  if (!applicationChecks.name(values.name)) fieldErrors.name = m.nameError;
  if (!applicationChecks.phone(values.phone)) fieldErrors.phone = m.phoneError;
  if (!applicationChecks.email(values.email)) fieldErrors.email = m.emailError;
  if (!applicationChecks.city(values.city)) fieldErrors.city = m.cityError;
  if (options.length > 0 && !options.includes(values.availability)) fieldErrors.availability = m.availabilityError;
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: m.invalid, fieldErrors, values };
  }

  const db = isDbConfigured();
  if (db) {
    const key = `contact:${await clientIpKey()}`;
    if (await isRateLimited(key, 5, 10 * 60 * 1000)) {
      return { status: "error", message: m.rateLimited, values };
    }
    await recordHit(key);
  }

  const recipient = forms.recipientEmail || process.env.CONTACT_TO_EMAIL || "";
  let emailed = false;
  if (recipient && isEmailConfigured()) {
    const lines = [
      `Naam: ${values.name}`,
      `Telefoon: ${values.phone}`,
      `E-mail: ${values.email}`,
      `Woonplaats: ${values.city}`,
      vacancy && `Vacature: ${vacancy}`,
      values.availability && `Beschikbaar: ${values.availability}`,
      values.message && `\nBericht:\n${values.message}`,
      source && `\nHerkomst: ${source}`,
    ].filter(Boolean);
    const result = await sendEmail({
      to: recipient,
      replyTo: values.email,
      subject: `Nieuwe sollicitatie: ${values.name} (${values.city})${vacancy ? `, ${vacancy}` : ""}`,
      text: `Er is een nieuwe sollicitatie binnengekomen via de website. Bel binnen 24 uur terug.\n\n${lines.join("\n")}`,
    });
    emailed = result.ok;
  }

  let stored = false;
  if (db && forms.storeSubmissions) {
    try {
      await getDb()
        .insert(schema.submissions)
        .values({ form: "sollicitatie", data: { ...values, vacancy, source }, emailed });
      stored = true;
    } catch (error) {
      console.error("[contact] Could not store application:", error);
    }
  }

  if (emailed || stored) return { status: "success", message: m.success };
  if (!recipient || !isEmailConfigured()) return { status: "error", message: m.notConfigured, values };
  return { status: "error", message: m.failed, values };
}
