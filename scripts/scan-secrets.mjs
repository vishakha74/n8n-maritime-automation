// Scans the repo for things that should not be public.
// Usage: node scripts/scan-secrets.mjs   (exit code 1 if anything is found)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', 'scripts']);
const TEXT_EXT = new Set(['.json', '.md', '.js', '.mjs', '.ts', '.sql', '.yml', '.yaml', '.env', '.txt', '.csv', '.html', '']);
const ALLOWED_EMAIL_DOMAINS = ['example.com', 'example.org', 'users.noreply.github.com'];

const rules = [
  { name: 'Hard-coded Consumer-Key / API key header',
    re: /"name":\s*"(Consumer-Key|x-api-key|Authorization|apikey)",\s*"value":\s*"(?!=\{\{)[^"]+"/gi, whole: true },
  { name: 'Long random-looking token',
    re: /\b(?=[A-Za-z0-9]*[a-z])(?=[A-Za-z0-9]*[A-Z])(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{28,}\b/g },
  { name: 'Private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: 'Email address', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    allow: m => /@(g\.us|s\.whatsapp\.net)$/.test(m) || ALLOWED_EMAIL_DOMAINS.some(d => m.toLowerCase().endsWith('@' + d) || m.toLowerCase().endsWith('.' + d)) },
  { name: 'WhatsApp JID', re: /\b\d{10,}(-\d+)?@(g\.us|s\.whatsapp\.net)\b/g,
    allow: m => /^0+@/.test(m) || m.startsWith('1234567890@') },
  { name: 'Indian mobile number', re: /(\+91[\s-]?)?\b[6-9]\d{9}\b/g },
  { name: 'Local Windows path in workflow/data', re: /[A-Z]:\\\\[^"\s]+/g,
    onlyIn: p => p.startsWith('workflows') || p.startsWith('data') },
  { name: 'n8n instanceId', re: /"instanceId"\s*:/g },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(entry)) walk(full, out); }
    else if (TEXT_EXT.has(extname(entry)) && st.size < 5_000_000) out.push(full);
  }
  return out;
}

let findings = 0;
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  if (rel === '.env.example') continue;
  const text = readFileSync(file, 'utf8');
  for (const rule of rules.filter(r => r.whole)) {
    for (const m of text.matchAll(rule.re)) {
      findings++;
      const line = text.slice(0, m.index).split('\n').length;
      console.log(`${rel}:${line}  ${rule.name}  ->  ${m[0].replace(/\s+/g, ' ').slice(0, 60)}`);
    }
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const rule of rules.filter(r => !r.whole)) {
      if (rule.onlyIn && !rule.onlyIn(rel)) continue;
      for (const m of line.matchAll(rule.re)) {
        if (rule.allow && rule.allow(m[0])) continue;
        findings++;
        console.log(`${rel}:${i + 1}  ${rule.name}  ->  ${m[0].slice(0, 60)}`);
      }
    }
  });
}

if (findings) {
  console.error(`\n${findings} possible secret(s) or private value(s) found. Fix before committing.`);
  process.exit(1);
}
console.log('No secrets or private values found.');
