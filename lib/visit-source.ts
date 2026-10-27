// Remembers how a visitor arrived (campaign tags, ad click or referring site) for the rest of the browser tab,
// so an application can be traced back to the channel that brought the applicant in. Nothing leaves the
// browser unless the visitor submits the application form.
const KEY = "tc_visit_source";

// Self-contained on purpose (no references outside the function): it is written into the page as an inline
// script, see `visitSourceScript`.
export function rememberVisitSource(key: string) {
  try {
    if (sessionStorage.getItem(key)) return;
    const adClickIds: Record<string, string> = { fbclid: "meta", gclid: "google", ttclid: "tiktok", li_fat_id: "linkedin" };
    const params = new URLSearchParams(window.location.search);
    const parts: string[] = [];
    for (const name of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = params.get(name);
      if (value) parts.push(`${name.slice(4)}=${value.slice(0, 60)}`);
    }
    for (const [param, network] of Object.entries(adClickIds)) {
      if (params.has(param)) parts.push(`advertentie=${network}`);
    }
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer && referrer.host !== window.location.host) parts.push(`via=${referrer.host}`);
    parts.push(`start=${window.location.pathname}`);
    sessionStorage.setItem(key, parts.join("; "));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); attribution is optional.
  }
}

/**
 * Runs while the HTML is still loading instead of after React has started, so a visitor who taps through
 * within the first seconds (common on slow phones) still keeps the campaign that brought them in.
 */
export const visitSourceScript = `(${rememberVisitSource.toString()})(${JSON.stringify(KEY)})`;

export function readVisitSource() {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
