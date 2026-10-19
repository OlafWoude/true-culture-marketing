"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";
import { ArrowRightIcon } from "@/lib/icons";

const initialState: ContactFormState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 font-semibold text-ink transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Versturen…" : "Verstuur aanvraag"}
      {!pending && (
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  );
}

const inputClasses =
  "w-full rounded-xl border border-transparent bg-mist px-4 py-3.5 text-[15px] text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-ink/30 focus:bg-white aria-[invalid=true]:border-red-500";

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

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div role="status" className="py-10 text-center">
        <p className="display text-5xl text-ink">Bedankt!</p>
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
        <Field id="name" label="Naam" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Je volledige naam"
            className={inputClasses}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </Field>
        <Field id="companyName" label="Bedrijfsnaam" error={errors.companyName}>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            placeholder="Naam van je bedrijf"
            className={inputClasses}
            aria-invalid={Boolean(errors.companyName)}
            aria-describedby={errors.companyName ? "companyName-error" : undefined}
          />
        </Field>
      </div>

      <Field id="email" label="E-mailadres" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="naam@bedrijf.nl"
          className={inputClasses}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
      </Field>

      <Field id="message" label="Waar kunnen we je mee helpen?" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Vertel kort over je bedrijf, je doelgroep en wat je wilt bereiken."
          className={`${inputClasses} resize-none`}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
      </Field>

      <SubmitButton />

      {state.status === "error" && (
        <p role="alert" className="text-center text-sm text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}
