"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  changePasswordAction,
  deleteRedirectAction,
  deleteSubmissionAction,
  inviteUserAction,
  logoutEverywhereAction,
  markSubmissionAction,
  removeUserAction,
  saveRedirectAction,
} from "@/app/admin/cms-actions";
import type { ActionResult } from "@/lib/cms/types";
import { useConfirm, useToast } from "./feedback";
import { AdminButton, Card, FieldLabel, formatDate, Input, Notice, Select, StatusBadge } from "./ui";
import { whatsappHref } from "@/lib/whatsapp";

function useRun() {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionResult<unknown>>, after?: (res: ActionResult<unknown>) => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        if (res.message) toast("success", res.message);
        after?.(res);
        router.refresh();
      } else toast("error", res.error);
    });
  return { run, pending };
}

export function RedirectManager({ redirects }: { redirects: { id: string; fromPath: string; toPath: string; permanent: boolean; automatic: boolean; createdAt: string }[] }) {
  const { run, pending } = useRun();
  const confirm = useConfirm();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [permanent, setPermanent] = useState("true");
  return (
    <div className="space-y-4">
      <Card>
        <form
          className="grid gap-4 md:grid-cols-[1fr_1fr_12rem_auto] md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveRedirectAction({ from, to, permanent: permanent === "true" }), () => { setFrom(""); setTo(""); });
          }}
        >
          <FieldLabel htmlFor="rd-from" label="Van (oude URL)">
            <Input id="rd-from" placeholder="/oude-pagina" value={from} onChange={(e) => setFrom(e.target.value)} required />
          </FieldLabel>
          <FieldLabel htmlFor="rd-to" label="Naar">
            <Input id="rd-to" placeholder="/nieuwe-pagina of https://…" value={to} onChange={(e) => setTo(e.target.value)} required />
          </FieldLabel>
          <FieldLabel htmlFor="rd-type" label="Soort">
            <Select id="rd-type" value={permanent} onChange={(e) => setPermanent(e.target.value)}>
              <option value="true">Permanent (301)</option>
              <option value="false">Tijdelijk (302)</option>
            </Select>
          </FieldLabel>
          <button type="submit" disabled={pending} className="rounded-xl bg-[#050505] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            Toevoegen
          </button>
        </form>
      </Card>
      {redirects.length === 0 ? (
        <p className="text-sm text-zinc-500">Nog geen redirects. Wijzig je de URL van een pagina, dan wordt hier automatisch een redirect toegevoegd.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Van</th>
                <th className="px-4 py-3">Naar</th>
                <th className="px-4 py-3">Soort</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {redirects.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-xs">{r.fromPath}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.toPath}</td>
                  <td className="px-4 py-3">
                    {r.permanent ? "Permanent" : "Tijdelijk"}
                    {r.automatic && <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">automatisch</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminButton
                      variant="ghost"
                      disabled={pending}
                      onClick={async () => {
                        if (await confirm({ title: "Redirect verwijderen?", body: `Bezoekers van ${r.fromPath} krijgen daarna een ‘pagina niet gevonden’.`, confirmLabel: "Verwijderen", danger: true })) run(() => deleteRedirectAction(r.id));
                      }}
                    >
                      Verwijderen
                    </AdminButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type SubmissionData = {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  availability?: string;
  vacancy?: string;
  message?: string;
  source?: string;
  companyName?: string;
};

export function SubmissionsList({ items }: { items: { id: string; createdAt: string; read: boolean; emailed: boolean; data: SubmissionData }[] }) {
  const { run, pending } = useRun();
  const confirm = useConfirm();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {items.map((s) => {
        const isOpen = open === s.id;
        const d = s.data;
        const firstName = (d.name ?? "").split(" ")[0];
        const whatsapp = whatsappHref(d.phone, `Hoi ${firstName}, bedankt voor je sollicitatie bij True Culture Marketing! Wanneer kunnen we je even bellen?`);
        const details: [string, React.ReactNode][] = [
          ["Naam", d.name],
          ["Telefoon", d.phone && <a className="underline" href={`tel:${d.phone.replace(/[^0-9+]/g, "")}`}>{d.phone}</a>],
          ["E-mail", d.email && <a className="underline" href={`mailto:${d.email}`}>{d.email}</a>],
          ["Woonplaats", d.city],
          ["Vacature", d.vacancy],
          ["Beschikbaar", d.availability],
          ["Bedrijf", d.companyName],
          ["Herkomst", d.source],
        ];
        return (
          <li key={s.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => {
                setOpen(isOpen ? null : s.id);
                if (!s.read && !isOpen) run(() => markSubmissionAction(s.id, true));
              }}
              className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50"
            >
              <span className={`h-2 w-2 rounded-full ${s.read ? "bg-transparent" : "bg-[#fece00]"}`} aria-label={s.read ? "Bekeken" : "Nieuw"} />
              <span className="min-w-0 flex-1">
                <span className={`block truncate ${s.read ? "text-zinc-700" : "font-bold text-zinc-900"}`}>
                  {[d.name, d.city ?? d.companyName].filter(Boolean).join(" · ")}
                </span>
                <span className="block truncate text-xs text-zinc-500">{[d.vacancy, d.availability, d.phone].filter(Boolean).join(" · ") || d.message}</span>
              </span>
              <span className="text-xs text-zinc-500">{formatDate(s.createdAt)}</span>
              {!s.read && <StatusBadge status="new" />}
            </button>
            {isOpen && (
              <div className="space-y-4 border-t border-zinc-200 bg-zinc-50 px-4 py-4 text-sm">
                <dl className="grid gap-3 sm:grid-cols-3">
                  {details
                    .filter(([, value]) => Boolean(value))
                    .map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="font-semibold">{label}</dt>
                        <dd className="break-words">{value}</dd>
                      </div>
                    ))}
                </dl>
                {d.message && (
                  <div>
                    <p className="font-semibold">Bericht</p>
                    <p className="mt-1 whitespace-pre-wrap text-zinc-800">{d.message}</p>
                  </div>
                )}
                <p className="text-xs text-zinc-500">{s.emailed ? "Ook per e-mail doorgestuurd." : "Niet per e-mail doorgestuurd (e-mail niet ingesteld of mislukt)."}</p>
                <div className="flex flex-wrap gap-2">
                  {d.phone && (
                    <a className="rounded-xl bg-[#050505] px-4 py-2 text-sm font-semibold text-white" href={`tel:${d.phone.replace(/[^0-9+]/g, "")}`}>
                      Bellen
                    </a>
                  )}
                  {whatsapp && (
                    <a className="rounded-xl bg-[#25d366] px-4 py-2 text-sm font-semibold text-[#050505]" href={whatsapp} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  )}
                  {d.email && (
                    <a
                      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
                      href={`mailto:${d.email}?subject=${encodeURIComponent("Je sollicitatie bij True Culture Marketing")}`}
                    >
                      Mailen
                    </a>
                  )}
                  <AdminButton onClick={() => run(() => markSubmissionAction(s.id, false))} disabled={pending}>Markeer als nieuw</AdminButton>
                  <AdminButton
                    variant="danger"
                    disabled={pending}
                    onClick={async () => {
                      if (await confirm({ title: "Sollicitatie verwijderen?", body: "De persoonsgegevens in deze sollicitatie worden definitief verwijderd.", confirmLabel: "Verwijderen", danger: true })) run(() => deleteSubmissionAction(s.id));
                    }}
                  >
                    Verwijderen
                  </AdminButton>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function AccountPanel({ users, currentUserId }: { users: { id: string; name: string; email: string; lastLoginAt: string | null; pending: boolean }[]; currentUserId: string }) {
  const { run, pending } = useRun();
  const router = useRouter();
  const confirm = useConfirm();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [invite, setInvite] = useState({ name: "", email: "" });
  const [inviteLink, setInviteLink] = useState<{ link: string; emailed: boolean } | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Wachtwoord wijzigen</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => changePasswordAction(pw), () => setPw({ current: "", next: "", confirm: "" }));
          }}
        >
          <FieldLabel htmlFor="pw-current" label="Huidig wachtwoord">
            <Input id="pw-current" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          </FieldLabel>
          <FieldLabel htmlFor="pw-next" label="Nieuw wachtwoord" help="Minimaal 12 tekens.">
            <Input id="pw-next" type="password" autoComplete="new-password" minLength={12} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          </FieldLabel>
          <FieldLabel htmlFor="pw-confirm" label="Herhaal nieuw wachtwoord">
            <Input id="pw-confirm" type="password" autoComplete="new-password" minLength={12} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
          </FieldLabel>
          <button type="submit" disabled={pending} className="rounded-xl bg-[#050505] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            Wachtwoord opslaan
          </button>
        </form>
        <hr className="border-zinc-200" />
        <div>
          <p className="text-sm text-zinc-600">Ben je ergens ingelogd gebleven, bijvoorbeeld op een gedeelde computer?</p>
          <AdminButton className="mt-2" onClick={() => run(() => logoutEverywhereAction(), () => router.push("/admin/login"))} disabled={pending}>
            Overal uitloggen
          </AdminButton>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-bold">Beheerders</h2>
        <ul className="divide-y divide-zinc-200">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {u.name}
                  {u.id === currentUserId && <span className="ml-2 text-xs font-normal text-zinc-500">(jij)</span>}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {u.email} · {u.pending ? "uitnodiging nog niet geaccepteerd" : `laatst ingelogd ${formatDate(u.lastLoginAt)}`}
                </p>
              </div>
              {u.id !== currentUserId && (
                <AdminButton
                  variant="ghost"
                  disabled={pending}
                  onClick={async () => {
                    if (await confirm({ title: `${u.name} verwijderen?`, body: "Deze persoon heeft daarna geen toegang meer tot het beheer.", confirmLabel: "Verwijderen", danger: true })) run(() => removeUserAction(u.id));
                  }}
                >
                  Verwijderen
                </AdminButton>
              )}
            </li>
          ))}
        </ul>
        <form
          className="space-y-3 rounded-xl bg-zinc-50 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => inviteUserAction(invite), (res) => {
              const data = (res as { data?: { link: string; emailed: boolean } }).data;
              if (data) setInviteLink(data);
              setInvite({ name: "", email: "" });
            });
          }}
        >
          <p className="text-sm font-semibold">Beheerder uitnodigen</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input aria-label="Naam" placeholder="Naam" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} required />
            <Input aria-label="E-mailadres" type="email" placeholder="E-mailadres" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
          </div>
          <button type="submit" disabled={pending} className="rounded-xl bg-[#050505] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Uitnodiging maken
          </button>
        </form>
        {inviteLink && (
          <Notice tone={inviteLink.emailed ? "success" : "info"} title={inviteLink.emailed ? "Uitnodiging verstuurd" : "Deel deze link persoonlijk"}>
            {!inviteLink.emailed && <p className="mb-2">E-mail is niet ingesteld. Stuur deze link zelf door; hij is 72 uur geldig en werkt één keer.</p>}
            <code className="block break-all rounded bg-white/70 p-2 text-xs">{inviteLink.link}</code>
          </Notice>
        )}
      </Card>
    </div>
  );
}
