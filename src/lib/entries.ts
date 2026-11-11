import { getCollection } from 'astro:content';

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Pull one "## 一句话" style section out of a raw markdown body. */
export function sectionText(body: string, heading: string): string {
  const start = body.search(new RegExp(`^##\\s+${heading}\\s*$`, 'm'));
  if (start < 0) return '';
  const rest = body.slice(start).split('\n').slice(1).join('\n');
  const next = rest.search(/^##\s+/m);
  return (next < 0 ? rest : rest.slice(0, next))
    .replace(/^>\s?/gm, '')
    .trim();
}

export function formatDate(value: string | Date): string {
  const raw = value instanceof Date ? value.toISOString() : String(value);
  const [year, month] = raw.split('-');
  return month ? `${year}.${month}` : year;
}

/** The first quoted passage under "## 原话", used as the counterpoint on the index. */
export function firstQuote(body: string): string {
  const block = sectionText(body, '原话').split(/\n\s*\n/)[0] ?? '';
  return block.replace(/\s*\n\s*/g, ' ').trim();
}

export async function getEntries() {
  const entries = await getCollection('sources');
  return entries.sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));
}

export async function getEntrySummaries() {
  const entries = await getEntries();
  return entries.map((entry) => ({
    entry,
    summary: sectionText(entry.body ?? '', '一句话'),
  }));
}
