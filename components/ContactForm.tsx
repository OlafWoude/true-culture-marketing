"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";
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
      className="btn-text group inline-flex w-full items-center justify-center gap-2 rounded-btn bg-accent px-7 py-4 font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
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

type ContactFormProps = {
  config: FormsConfig;
  formStyle?: string;
  whatsapp?: { href: string; label: string } | null;
};

export default function ContactForm({ config, formStyle = "filled", whatsapp = null }: ContactFormProps) {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const sourceRef = useRef<HTMLInputElement>(null);
  const errors = state.fieldErrors ?? {};
  const v = state.values;
  const { labels, messages } = config;
  const options = config.availabilityOptions.filter(Boolean);
  const inputClasses = `w-full rounded-control border px-4 py-3.5 text-[15px] text-ink placeholder:text-ink/35 outline-none transition-colors aria-[invalid=true]:border-red-500 ${
    formStyle === "outlined"
      ? "border-ink/20 bg-white focus:border-ink/60"
      : "border-transparent bg-mist focus:border-ink/30 focus:bg-white"
  }`;
  const invalid = (id: FieldId) => ({
    "aria-invalid": Boolean(errors[id as keyof typeof errors]),
    "aria-describedby": errors[id as keyof typeof errors] ? `${id}-error` : undefined,
  });

  // Where the visitor came from (campaign or referring site), so applications can be traced back to a channel.
  useEffect(() => {
    if (sourceRef.current) sourceRef.current.value = readVisitSource();
  });

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
    <form key={JSON.stringify(v ?? {})} action={formAction} noValidate className="relative space-y-5">
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
            required
            maxLength={80}
            placeholder={labels.cityPlaceholder}
            className={inputClasses}
            {...invalid("city")}
          />
        </Field>
      </div>

      {options.length > 0 && (
        <Field id="availability" label={labels.availability} error={errors.availability}>
          <div className="relative">
            <select
              id="availability"
              name="availability"
              defaultValue={v?.availability ?? ""}
              required
              className={`${inputClasses} appearance-none pr-11 invalid:text-ink/35 [&_option]:text-ink`}
              {...invalid("availability")}
            >
              <option value="" disabled>
                {labels.availabilityPlaceholder}
              </option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </Field>
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
          className="rich text-center text-xs leading-relaxed text-ink/50"
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
