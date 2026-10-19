import { Notice } from "./ui";

export default function ConfigMissing() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Beheer nog niet geactiveerd</h1>
      <Notice tone="warning" title="De database is nog niet gekoppeld">
        Koppel in Vercel een Postgres-database (Neon) aan dit project zodat <code>DATABASE_URL</code> beschikbaar is, en
        deploy opnieuw. De website blijft intussen gewoon werken met de huidige inhoud.
      </Notice>
    </div>
  );
}
