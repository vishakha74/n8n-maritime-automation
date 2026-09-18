# Security and sanitisation

These workflows came from a working n8n instance. Before publishing, the following were changed.

## What was removed or replaced

| Item | In the original export | In this repo |
|---|---|---|
| Maersk Consumer-Key | plain text in HTTP header | `{{ $env.MAERSK_CONSUMER_KEY }}` |
| Maersk vessel code | fixed value | `{{ $env.MAERSK_VESSEL_CODE }}` |
| Enquiry sender filter | real address | `enquiries@example.com` |
| WhatsApp group JID | real group ID | `{{ $env.WHATSAPP_GROUP_JID }}` |
| Local file path | Windows path | `{{ $env.AIRPORTS_CSV_PATH }}` |
| Form URL | localhost + real form ID | `N8N_BASE_URL` + new form ID |
| Webhook paths / IDs | instance values | new values |
| Credential IDs | instance IDs | `REPLACE_WITH_LOCAL_CREDENTIAL_ID` |
| Data Table / project IDs | instance IDs | placeholders |
| Workflow IDs, version IDs, `meta.instanceId` | instance values | neutral values / removed |
| `active` | true | false |
| Pinned data | none present | kept empty |

Credential *secrets* are never part of an n8n export (only the credential name and ID), but header values typed directly into an HTTP Request node are. That is how the API key ended up in the export.

## Never commit

- `.env` or any real keys and tokens
- the `.n8n` folder or an `n8n-data` directory (contains the encryption key and database)
- WhatsApp / wacli session files
- database dumps
- real enquiry emails, vessel plans for clients, staff names, phone numbers or chat logs

## Checks

- `.gitignore` covers the files above.
- `scripts/scan-secrets.mjs` looks for key-like strings, emails, WhatsApp JIDs, phone numbers, Windows paths and known header names.
- GitHub Actions runs the scan and the workflow validator on every push.
- Turn on **Secret scanning** and **Push protection** under the repository's *Settings → Code security*.

## If a key was ever exposed

Rotate it at the provider first, then clean history. Removing it in a new commit is not enough.
