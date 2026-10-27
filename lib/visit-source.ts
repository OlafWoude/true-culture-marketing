// Remembers how a visitor arrived (campaign tags, ad click or referring site) for the rest of the browser tab,
// so an application can be traced back to the channel that brought the applicant in. Nothing leaves the
// browser unless the visitor submits the application form.
const KEY = "tc_visit_source";

const AD_CLICK_IDS: Record<string, string> = { fbclid: "meta", gclid: "google", ttclid: "tiktok", li_fat_id: "linkedin" };

export function rememberVisitSource() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const parts: string[] = [];
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
      const value = params.get(key);
      if (value) parts.push(`${key.slice(4)}=${value.slice(0, 60)}`);
    }
    for (const [param, network] of Object.entries(AD_CLICK_IDS)) {
      if (params.has(param)) parts.push(`advertentie=${network}`);
    }
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer && referrer.host !== window.location.host) parts.push(`via=${referrer.host}`);
    parts.push(`start=${window.location.pathname}`);
    sessionStorage.setItem(KEY, parts.join("; "));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); attribution is optional.
  }
}

export function readVisitSource() {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
