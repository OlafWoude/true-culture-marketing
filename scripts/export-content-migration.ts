// Writes a content migration: a fixed snapshot of the built-in content in lib/cms/seed.ts that
// scripts/migrate.mjs applies once to databases that were filled with an older version of it.
//
// Usage: NODE_OPTIONS=--conditions=react-server npx tsx scripts/export-content-migration.ts <name> "<backup note>"
//
// Pages and vacancies are replaced as a whole (the previous version stays restorable under Versies).
// For the shared settings only the keys listed below are changed, so contact details, the theme and
// uploaded images stay as the editor left them. Adjust that list for each new migration.
import { mkdirSync, writeFileSync } from "node:fs";
import { seedFooter, seedForms, seedNavigation, seedPages, seedServices, seedSettings } from "@/lib/cms/seed";

const [name, backupNote] = process.argv.slice(2);
if (!name || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(name) || !backupNote) {
  console.error('Usage: export-content-migration.ts <yyyy-mm-dd-name> "<backup note>"');
  process.exit(1);
}

const settings = seedSettings();
const footer = seedFooter();
const forms = seedForms();

const migration = {
  backupNote,
  pages: seedPages(),
  services: seedServices(),
  singletons: {
    settings: { set: { defaultDescription: settings.defaultDescription } },
    navigation: { replace: seedNavigation() },
    footer: { set: { text: footer.text, links: footer.links, legalLinks: footer.legalLinks } },
    forms: {
      set: {
        retentionDays: forms.retentionDays,
        labels: forms.labels,
        availabilityOptions: forms.availabilityOptions,
        messages: forms.messages,
        privacyNote: forms.privacyNote,
      },
    },
  },
};

mkdirSync("drizzle/content", { recursive: true });
const file = `drizzle/content/${name}.json`;
writeFileSync(file, `${JSON.stringify(migration, null, 2)}\n`);
console.log(`Wrote ${file}`);
