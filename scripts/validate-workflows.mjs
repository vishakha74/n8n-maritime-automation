// Checks every n8n export in workflows/:
//  - valid JSON with nodes + connections
//  - every connection points at an existing node
//  - every $('Node Name') reference in Code nodes exists
//  - workflow is exported inactive and without pinned data
// Usage: node scripts/validate-workflows.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'workflows';
let errors = 0;
const fail = (f, msg) => { errors++; console.log(`✗ ${f}: ${msg}`); };

for (const file of readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
  let wf;
  try { wf = JSON.parse(readFileSync(join(dir, file), 'utf8')); }
  catch (e) { fail(file, `invalid JSON (${e.message})`); continue; }

  if (!Array.isArray(wf.nodes) || typeof wf.connections !== 'object') { fail(file, 'missing nodes/connections'); continue; }

  const names = new Set(wf.nodes.map(n => n.name));
  const functional = wf.nodes.filter(n => n.type !== 'n8n-nodes-base.stickyNote');
  const codeNodes = functional.filter(n => n.type === 'n8n-nodes-base.code');

  for (const [src, outputs] of Object.entries(wf.connections)) {
    if (!names.has(src)) fail(file, `connection from unknown node "${src}"`);
    for (const branches of Object.values(outputs))
      for (const branch of branches)
        for (const t of branch) if (!names.has(t.node)) fail(file, `connection to unknown node "${t.node}"`);
  }

  for (const n of codeNodes) {
    for (const m of (n.parameters.jsCode || '').matchAll(/\$\('([^']+)'\)/g))
      if (!names.has(m[1])) fail(file, `"${n.name}" references missing node "${m[1]}"`);
  }

  if (wf.active) fail(file, 'exported as active');
  if (wf.pinData && Object.keys(wf.pinData).length) fail(file, 'contains pinned data');
  if (wf.meta?.instanceId) fail(file, 'contains meta.instanceId');

  const lines = codeNodes.reduce((s, n) => s + n.parameters.jsCode.split('\n').length, 0);
  console.log(`✓ ${file}  ${functional.length} nodes, ${codeNodes.length} Code nodes, ${lines} JS lines`);
}

if (errors) { console.error(`\n${errors} problem(s) found.`); process.exit(1); }
