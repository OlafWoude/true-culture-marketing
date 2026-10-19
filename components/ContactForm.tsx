"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = { status: "idle", message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition-colors duration-200 hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Versturen…" : "Verstuur bericht"}
    </button>
  );
}

const inputClasses =
  "w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-paper/35 outline-none transition-colors focus:border-accent";

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  return (
    <form action={formAction} noValidate className="relative space-y-5">
      {/* Honeypot field — hidden from real visitors via CSS, not display:none, to deter bots that skip hidden inputs. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-paper/80">
            Naam
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClasses}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          />
          {state.fieldErrors?.name && (
            <p id="name-error" className="mt-1.5 text-xs text-red-400">
              {state.fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-paper/80">
            Bedrijfsnaam
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            required
            className={inputClasses}
            aria-invalid={Boolean(state.fieldErrors?.companyName)}
            aria-describedby={state.fieldErrors?.companyName ? "companyName-error" : undefined}
          />
          {state.fieldErrors?.companyName && (
            <p id="companyName-error" className="mt-1.5 text-xs text-red-400">
              {state.fieldErrors.companyName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-paper/80">
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClasses}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-1.5 text-xs text-red-400">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-paper/80">
          Bericht
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${inputClasses} resize-none`}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="mt-1.5 text-xs text-red-400">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      <SubmitButton />

      {state.status !== "idle" && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${state.status === "success" ? "text-accent" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
