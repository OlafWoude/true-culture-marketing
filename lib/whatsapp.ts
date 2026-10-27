/** Turns a Dutch or international phone number into a wa.me chat link, or null when it isn't usable. */
export function whatsappHref(number: string | null | undefined, text = "") {
  let digits = (number ?? "").replace(/[^0-9+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `31${digits.slice(1)}`;
  if (!/^[0-9]{9,15}$/.test(digits)) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
