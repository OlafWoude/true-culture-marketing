"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";
import { applicationChecks, type CheckedField } from "@/lib/application-checks";
import type { FormsConfig } from "@/lib/cms/documents";
import { ArrowRightIcon, WhatsAppIcon } from "@/lib/icons";
import { readVisitSource } from "@/lib/visit-source";

const initialState: ContactFormState = { status: "idle", message: "" };

function SubmitButton({ label, sending }: { label: string; sending: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-text group inline-flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-7 py-4 font-semibold text-on-accent transition-[background-color,scale] hover:bg-accent-hover active:bg-accent-hover motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? sending : label}
      {!pending && <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </button>
  );
}

type FieldId = "name" | "phone" | "email" | "city" | "availability" | "message";

function Field({ id, label, error, children }: { id: FieldId; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// Enter moves on to the next field (the phone keyboard labels the key "next") instead of sending a
// half-filled form; the button sends it.
function focusNextField(e: KeyboardEvent<HTMLFormElement>) {
  const field = e.target;
  if (e.key !== "Enter" || e.nativeEvent.isComposing || !(field instanceof HTMLInputElement) || field.type === "radio") return;
  const fields = Array.from(e.currentTarget.elements).filter(
    (el): el is HTMLElement =>
      (el instanceof HTMLInputElement && el.type !== "hidden" && el.tabIndex >= 0) || el instanceof HTMLTextAreaElement,
  );
  const next = fields[fields.indexOf(field) + 1];
  if (!next) return;
  e.preventDefault();
  next.focus();
}

type ContactFormProps = {
  config: FormsConfig;
  formStyle?: string;
  whatsapp?: { href: string; label: string } | null;
};

export default function ContactForm({ config, formStyle = "filled", whatsapp = null }: ContactFormProps) {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const sourceRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Fields fixed since the last submit lose their error message right away (and get it back if they break again).
  const [fixed, setFixed] = useState<{ after: ContactFormState; fields: string[] }>({ after: state, fields: [] });
  const fixedFields = fixed.after === state ? fixed.fields : [];
  const errors: NonNullable<ContactFormState["fieldErrors"]> = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter(([id]) => !fixedFields.includes(id)),
  );
  const v = state.values;
  const { labels, messages } = config;
  const options = config.availabilityOptions.filter(Boolean);
  const inputClasses = `w-full rounded-control border px-4 py-3.5 text-base text-ink placeholder:text-ink/60 outline-none transition-colors aria-[invalid=true]:border-red-500 ${
    formStyle === "outlined"
      ? "border-ink/20 bg-white focus:border-ink/60"
      : "border-transparent bg-mist focus:border-ink/30 focus:bg-white"
  }`;
  const choiceClasses = `flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 py-3 text-[15px] leading-snug text-ink transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink ${
    errors.availability
      ? "border-red-500 bg-white"
      : formStyle === "outlined"
        ? "border-ink/20 bg-white has-checked:border-ink"
        : "border-transparent bg-mist has-checked:border-ink has-checked:bg-white"
  }`;
  const invalid = (id: FieldId) => ({
    "aria-invalid": Boolean(errors[id as keyof typeof errors]),
    "aria-describedby": errors[id as keyof typeof errors] ? `${id}-error` : undefined,
  });

  const recheck = (e: FormEvent<HTMLFormElement>) => {
    const field = e.target as HTMLInputElement;
    const id = field.name;
    const shownErrors: Record<string, string | undefined> = state.fieldErrors ?? {};
    if (!shownErrors[id]) return;
    // Picking any availability option is enough; the other fields follow the same rules as the server.
    const ok = id in applicationChecks ? applicationChecks[id as CheckedField](field.value) : field.value !== "";
    setFixed((f) => {
      const fields = f.after === state ? f.fields.filter((x) => x !== id) : [];
      return { after: state, fields: ok ? [...fields, id] : fields };
    });
  };

  // Where the visitor came from (campaign or referring site), so applications can be traced back to a channel.
  useEffect(() => {
    if (sourceRef.current) sourceRef.current.value = readVisitSource();
  });

  // After a rejected submit, take the visitor to the first field that needs attention.
  useEffect(() => {
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid] input")?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className="py-10 text-center">
        <p className="display text-5xl text-ink">{messages.successTitle}</p>
        <p className="mx-auto mt-4 max-w-sm text-ink/65">{state.message}</p>
        {whatsapp && (
          <a
            href={whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-btn border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {whatsapp.label}
          </a>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} key={JSON.stringify(v ?? {})} action={formAction} onKeyDown={focusNextField} onChange={recheck} noValidate className="relative space-y-5">
      {/* Honeypot: hidden from people, filled in by naive bots. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={sourceRef} type="hidden" name="source" defaultValue="" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label={labels.name} error={errors.name}>
          <input
            id="name"
            name="name"
            defaultValue={v?.name}
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            required
            maxLength={120}
            placeholder={labels.namePlaceholder}
            className={inputClasses}
            {...invalid("name")}
          />
        </Field>
        <Field id="phone" label={labels.phone} error={errors.phone}>
          <input
            id="phone"
            name="phone"
            defaultValue={v?.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            required
            maxLength={20}
            placeholder={labels.phonePlaceholder}
            className={inputClasses}
            {...invalid("phone")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label={labels.email} error={errors.email}>
          <input
            id="email"
            name="email"
            defaultValue={v?.email}
            type="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            required
            maxLength={200}
            placeholder={labels.emailPlaceholder}
            className={inputClasses}
            {...invalid("email")}
          />
        </Field>
        <Field id="city" label={labels.city} error={errors.city}>
          <input
            id="city"
            name="city"
            defaultValue={v?.city}
            type="text"
            autoComplete="address-level2"
            autoCapitalize="words"
            enterKeyHint="next"
            required
            maxLength={80}
            placeholder={labels.cityPlaceholder}
            className={inputClasses}
            {...invalid("city")}
          />
        </Field>
      </div>

      {options.length > 0 && (
        // Radio buttons instead of a drop-down: with a handful of options one tap is enough, also on a phone.
        <fieldset className="min-w-0" data-invalid={errors.availability ? true : undefined} aria-describedby={errors.availability ? "availability-error" : undefined}>
          <legend className="mb-2 block text-sm font-semibold text-ink">{labels.availability}</legend>
          {labels.availabilityPlaceholder && <p className="-mt-1 mb-3 text-sm text-ink/60">{labels.availabilityPlaceholder}</p>}
          <div className="grid gap-2.5 sm:grid-cols-2">
            {options.map((o) => (
              <label key={o} className={choiceClasses}>
                <input type="radio" name="availability" value={o} defaultChecked={v?.availability === o} required className="peer sr-only" />
                <span aria-hidden="true" className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-ink/35 bg-white transition-[border] duration-150 peer-checked:border-[6px] peer-checked:border-ink" />
                {o}
              </label>
            ))}
          </div>
          {errors.availability && (
            <p id="availability-error" className="mt-1.5 text-sm text-red-600">
              {errors.availability}
            </p>
          )}
        </fieldset>
      )}

      <Field id="message" label={labels.message}>
        <textarea
          id="message"
          name="message"
          defaultValue={v?.message}
          rows={3}
          maxLength={2000}
          placeholder={labels.messagePlaceholder}
          className={`${inputClasses} resize-none`}
        />
      </Field>

      <SubmitButton label={labels.submit} sending={labels.sending} />

      {config.privacyNote && (
        <div
          className="rich text-center text-xs leading-relaxed text-ink/60"
          // Sanitised on save in the CMS; only basic formatting and safe links are possible.
          dangerouslySetInnerHTML={{ __html: config.privacyNote }}
        />
      )}

      {state.status === "error" && (
        <p role="alert" className="text-center text-sm text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
