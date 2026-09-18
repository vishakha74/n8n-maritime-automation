# Workflows

| File | Nodes | Code nodes | JS lines |
|---|---:|---:|---:|
| `01-whatsapp-attendance-classifier.json` | 6 | 0 | – |
| `02-vessel-schedule-route-intelligence.json` | 32 | 21 | ~2,600 |
| `03-utm-current-location-form.json` | 7 | 3 | ~170 |

Import order: **02 → 03 → 01** (03 calls 02).

All three are exported **inactive**. After importing, reconnect credentials, create the Data Table and set the environment variables listed in [`../docs/setup.md`](../docs/setup.md).

Check before committing a new export:

```bash
node scripts/validate-workflows.mjs
node scripts/scan-secrets.mjs
```

When exporting again from n8n, remember that anything typed straight into a node (headers, filters, URLs, paths) is included in the file.
