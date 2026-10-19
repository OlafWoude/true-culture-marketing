"use server";

import { Resend } from "resend";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "email" | "companyName" | "message", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: real users never fill this hidden field in.
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot !== "") {
    return { status: "success", message: "Bedankt voor je bericht. We nemen snel contact op." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: ContactFormState["fieldErrors"] = {};

  if (name.length < 2) {
    fieldErrors.name = "Vul je volledige naam in.";
  }
  if (!EMAIL_RE.test(email)) {
    fieldErrors.email = "Vul een geldig e-mailadres in.";
  }
  if (companyName.length < 2) {
    fieldErrors.companyName = "Vul je bedrijfsnaam in.";
  }
  if (message.length < 10) {
    fieldErrors.message = "Vertel iets meer, minimaal 10 tekens.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Controleer de gemarkeerde velden.",
      fieldErrors,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return {
      status: "error",
      message:
        "Het contactformulier is nog niet volledig geconfigureerd (ontbrekende e-mailinstellingen). Neem voorlopig rechtstreeks contact op.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "True Culture Marketing <contact@trueculture.nl>",
      to: toEmail,
      replyTo: email,
      subject: `Nieuw contactformulier: ${name} (${companyName})`,
      text: `Naam: ${name}\nBedrijf: ${companyName}\nE-mail: ${email}\n\nBericht:\n${message}`,
    });

    if (error) {
      return {
        status: "error",
        message: "Er ging iets mis bij het versturen. Probeer het later opnieuw.",
      };
    }
  } catch {
    return {
      status: "error",
      message: "Er ging iets mis bij het versturen. Probeer het later opnieuw.",
    };
  }

  return {
    status: "success",
    message: "We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.",
  };
}
