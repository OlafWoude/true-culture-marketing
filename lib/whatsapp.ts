import type { Settings } from "@/lib/cms/documents";

/** Turns a Dutch or international phone number into a wa.me chat link, or null when it isn't usable. */
export function whatsappHref(number: string | null | undefined, text = "") {
  // "+31 (0)6 …" is a common way to write Dutch numbers; the (0) is not dialled from abroad.
  let digits = (number ?? "").replace(/\(0\)/g, "").replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `31${digits.slice(1)}`;
  if (!/^[0-9]{9,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** A chat with the company, with the standard message ready to send (naming the vacancy when there is one). */
export function whatsappChat(contact: Settings["contact"], vacancyTitle?: string | null) {
  const vacancyMessage = contact.whatsappVacancyMessage.trim();
  const message = vacancyTitle && vacancyMessage ? vacancyMessage.replaceAll("{vacature}", vacancyTitle) : contact.whatsappMessage;
  return whatsappHref(contact.whatsapp, message.trim());
}
