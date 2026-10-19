"use client";

import { useState } from "react";
import { saveSingletonAction } from "@/app/admin/cms-actions";
import type { Theme } from "@/lib/cms/documents";
import type { FieldDef, Values } from "@/lib/cms/fields";
import { contrastRatio, themeToCss } from "@/lib/cms/theme-css";
import type { DocStatus } from "@/lib/cms/types";
import { FieldList } from "../fields/FieldEditor";
import { useConfirm } from "../feedback";
import { AdminButton, Card, Notice } from "../ui";
import SaveBar, { useUnsavedWarning } from "./SaveBar";

type Props = {
  docId: string;
  fields: FieldDef[];
  initial: Values;
  defaults: Values;
  status: DocStatus;
  serverHasChanges: boolean;
  previewHref?: string;
};

function warnings(theme: Theme) {
  const c = theme.colors;
  const list: string[] = [];
  const check = (a: string, b: string, label: string, min = 4.5) => {
    const ratio = contrastRatio(a, b);
    if (ratio < min) list.push(`${label}: contrast ${ratio.toFixed(1)}:1 (minimaal ${min}:1 aanbevolen).`);
  };
  check(c.onAccent, c.accent, "Tekst op knoppen in de accentkleur");
  check(c.paper, c.ink, "Witte tekst op de donkere achtergrond");
  check(c.ink, c.mist, "Donkere tekst op de lichtgrijze achtergrond");
  check(c.ink, c.paper, "Donkere tekst op wit");
  check(c.accent, c.ink, "Accentkleur op de donkere achtergrond", 3);
  return list;
}

export default function ThemeEditor({ docId, fields, initial, defaults, status, serverHasChanges, previewHref }: Props) {
  const confirm = useConfirm();
  const [values, setValues] = useState<Values>(initial);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);
  const theme = values as unknown as Theme;
  const css = themeToCss(theme).replace(":root", ".theme-sample");
  const issues = warnings(theme);

  const onSave = async () => {
    const res = await saveSingletonAction("theme", values);
    if (res.ok) setDirty(false);
    return res;
  };

  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <FieldList
            fields={fields}
            values={values}
            onChange={(v) => {
              setValues(v);
              setDirty(true);
            }}
          />
        </Card>
        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="space-y-3">
            <p className="text-sm font-semibold text-zinc-900">Direct voorbeeld</p>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="theme-sample overflow-hidden rounded-2xl border border-zinc-200">
              <div className="bg-ink p-5 text-paper">
                <p className="display text-4xl">
                  Meer afspraken <span className="text-accent">met beslissers</span>
                </p>
                <p className="mt-3 text-sm text-paper/65">Lopende tekst in het gekozen lettertype.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="btn-text inline-flex rounded-btn bg-accent px-4 py-2 text-sm font-semibold text-on-accent">Plan een gesprek</span>
                  <span className="btn-text inline-flex rounded-btn border border-white/20 px-4 py-2 text-sm font-semibold text-paper">Bekijk diensten</span>
                </div>
              </div>
              <div className="bg-mist p-5">
                <div className="rounded-card bg-white p-4">
                  <p className="display text-2xl text-ink">Kaart</p>
                  <p className="mt-1 text-sm text-ink/65">Afronding en kleuren van kaarten.</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500">Gebruik ‘Voorbeeld bekijken’ om de hele website met deze huisstijl te zien voordat je publiceert.</p>
          </Card>
          {issues.length > 0 && (
            <Notice tone="warning" title="Let op de leesbaarheid">
              <ul className="list-disc space-y-1 pl-4">
                {issues.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Notice>
          )}
          <Card className="space-y-2">
            <p className="text-sm font-semibold text-zinc-900">Standaardhuisstijl</p>
            <p className="text-sm text-zinc-600">Zet alle instellingen terug naar de originele True Culture-huisstijl.</p>
            <AdminButton
              className="w-full"
              onClick={async () => {
                if (await confirm({ title: "Standaardhuisstijl herstellen?", body: "Alle huisstijlinstellingen in dit scherm worden teruggezet. Er verandert pas iets op de website als je publiceert.", confirmLabel: "Herstellen" })) {
                  setValues(structuredClone(defaults));
                  setDirty(true);
                }
              }}
            >
              Standaard herstellen
            </AdminButton>
          </Card>
        </div>
      </div>
      <SaveBar docId={docId} status={status} serverHasChanges={serverHasChanges} dirty={dirty} onSave={onSave} previewHref={previewHref} canUnpublish={false} />
    </div>
  );
}
