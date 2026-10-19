"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  loginAction,
  recoveryAction,
  requestResetAction,
  resetPasswordAction,
  setupAction,
  type AuthState,
} from "@/app/admin/auth-actions";
import { btnClass, FieldLabel, Input, Notice } from "./ui";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btnClass("primary", "w-full py-3 text-[15px]")}>
      {pending ? "Even geduld…" : children}
    </button>
  );
}

function Feedback({ state }: { state: AuthState }) {
  if (state?.error) return <Notice tone="error">{state.error}</Notice>;
  if (state?.message) return <Notice tone="success">{state.message}</Notice>;
  return null;
}

const PASSWORD_HELP = "Minimaal 12 tekens. Een zin van een paar woorden is sterk én makkelijk te onthouden.";

export function LoginForm({ next, notice }: { next: string; notice?: React.ReactNode }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Inloggen</h1>
        <p className="mt-1 text-sm text-zinc-600">Log in om je website te beheren.</p>
      </div>
      {notice}
      <Feedback state={state} />
      <input type="hidden" name="next" value={next} />
      <FieldLabel htmlFor="email" label="E-mailadres">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </FieldLabel>
      <FieldLabel htmlFor="password" label="Wachtwoord">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </FieldLabel>
      <Submit>Inloggen</Submit>
      <p className="text-center text-sm">
        <Link href="/admin/wachtwoord-vergeten" className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          Wachtwoord vergeten?
        </Link>
      </p>
    </form>
  );
}

export function SetupForm() {
  const [state, action] = useActionState(setupAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Eerste beheerder aanmaken</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Dit kan maar één keer. Daarna is deze pagina uitgeschakeld en log je in met je e-mailadres en wachtwoord.
        </p>
      </div>
      <Feedback state={state} />
      <FieldLabel htmlFor="token" label="Setup-sleutel" help="De waarde van ADMIN_SETUP_TOKEN uit de Vercel-instellingen.">
        <Input id="token" name="token" type="password" autoComplete="off" required />
      </FieldLabel>
      <FieldLabel htmlFor="name" label="Je naam">
        <Input id="name" name="name" autoComplete="name" required />
      </FieldLabel>
      <FieldLabel htmlFor="email" label="E-mailadres">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </FieldLabel>
      <FieldLabel htmlFor="password" label="Wachtwoord" help={PASSWORD_HELP}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      </FieldLabel>
      <FieldLabel htmlFor="confirm" label="Herhaal wachtwoord">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </FieldLabel>
      <Submit>Account aanmaken</Submit>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(requestResetAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Wachtwoord vergeten</h1>
        <p className="mt-1 text-sm text-zinc-600">Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen.</p>
      </div>
      <Feedback state={state} />
      <FieldLabel htmlFor="email" label="E-mailadres">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </FieldLabel>
      <Submit>Stuur herstellink</Submit>
      <p className="flex justify-between text-sm">
        <Link href="/admin/login" className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          Terug naar inloggen
        </Link>
        <Link href="/admin/noodherstel" className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          Noodprocedure
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Nieuw wachtwoord instellen</h1>
        <p className="mt-1 text-sm text-zinc-600">Na het opslaan word je op alle apparaten uitgelogd.</p>
      </div>
      <Feedback state={state} />
      <input type="hidden" name="token" value={token} />
      <FieldLabel htmlFor="password" label="Nieuw wachtwoord" help={PASSWORD_HELP}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      </FieldLabel>
      <FieldLabel htmlFor="confirm" label="Herhaal wachtwoord">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </FieldLabel>
      <Submit>Wachtwoord opslaan</Submit>
    </form>
  );
}

export function RecoveryForm() {
  const [state, action] = useActionState(recoveryAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Noodprocedure</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Gebruik dit alleen als e-mail niet werkt. Je hebt de setup-sleutel (ADMIN_SETUP_TOKEN) uit Vercel nodig.
        </p>
      </div>
      <Feedback state={state} />
      <FieldLabel htmlFor="token" label="Setup-sleutel">
        <Input id="token" name="token" type="password" autoComplete="off" required />
      </FieldLabel>
      <FieldLabel htmlFor="email" label="E-mailadres van het beheerdersaccount">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </FieldLabel>
      <FieldLabel htmlFor="password" label="Nieuw wachtwoord" help={PASSWORD_HELP}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      </FieldLabel>
      <FieldLabel htmlFor="confirm" label="Herhaal wachtwoord">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </FieldLabel>
      <Submit>Wachtwoord opslaan</Submit>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
          Terug naar inloggen
        </Link>
      </p>
    </form>
  );
}
