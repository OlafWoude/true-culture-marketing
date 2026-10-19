"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";
import type { FormsConfig } from "@/lib/cms/documents";
import { ArrowRightIcon } from "@/lib/icons";

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

type FieldProps = {
  id: "name" | "companyName" | "email" | "message";
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
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

export default function ContactForm({ config, formStyle = "filled" }: { config: FormsConfig; formStyle?: string }) {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const errors = state.fieldErrors ?? {};
  const { labels, messages } = config;
  const inputClasses = `w-full rounded-control border px-4 py-3.5 text-[15px] text-ink placeholder:text-ink/35 outline-none transition-colors aria-[invalid=true]:border-red-500 ${
    formStyle === "outlined"
      ? "border-ink/20 bg-white focus:border-ink/60"
      : "border-transparent bg-mist focus:border-ink/30 focus:bg-white"
  }`;

  if (state.status === "success") {
    return (
      <div role="status" className="py-10 text-center">
        <p className="display text-5xl text-ink">{messages.successTitle}</p>
        <p className="mx-auto mt-4 max-w-sm text-ink/65">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="relative space-y-5">
      {/* Honeypot: hidden from people, filled in by naive bots. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label={labels.name} error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            placeholder={labels.namePlaceholder}
            className={inputClasses}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </Field>
        <Field id="companyName" label={labels.company} error={errors.companyName}>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            maxLength={160}
            placeholder={labels.companyPlaceholder}
            className={inputClasses}
            aria-invalid={Boolean(errors.companyName)}
            aria-describedby={errors.companyName ? "companyName-error" : undefined}
          />
        </Field>
      </div>

      <Field id="email" label={labels.email} error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
          placeholder={labels.emailPlaceholder}
          className={inputClasses}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      </Field>

      <Field id="message" label={labels.message} error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          maxLength={5000}
          placeholder={labels.messagePlaceholder}
          className={`${inputClasses} resize-none`}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
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
