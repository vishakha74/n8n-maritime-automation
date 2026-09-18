# Local setup

Tested on Windows 11 with Node 20+, n8n run through `npx`, and Ollama for Windows.

## 1. Prerequisites

- Node.js 20 or newer
- Ollama – https://ollama.com
- A Maersk developer account with access to the Vessel Schedules API
- Gmail account for the enquiry inbox (OAuth2 credential in n8n)
- wacli, only if you want workflow 01

## 2. Model

```bash
ollama pull llama3.2:3b
ollama list
```

Ollama listens on `http://127.0.0.1:11434`.

## 3. Airport data

Download `airports.csv` from https://ourairports.com/data/ and save it somewhere n8n can read, for example `C:\n8n-data\airports.csv`. It is not committed here.

## 4. Environment

Copy `.env.example` to `.env` and fill it in. On Windows CMD you can set them for the session instead:

```bat
set MAERSK_CONSUMER_KEY=your_key
set MAERSK_VESSEL_CODE=your_vessel_code
set AIRPORTS_CSV_PATH=C:\n8n-data\airports.csv
set WHATSAPP_GROUP_JID=1234567890@g.us
set N8N_BASE_URL=http://localhost:5678
set N8N_BLOCK_ENV_ACCESS_IN_NODE=false
npx n8n
```

`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` is needed because the workflows read `$env.*`. If you would rather not allow that, put the values into n8n credentials or Variables and change the expressions.

## 5. Import

In n8n: **Workflows → Import from File**, in this order:

1. `02-vessel-schedule-route-intelligence.json`
2. `03-utm-current-location-form.json`
3. `01-whatsapp-attendance-classifier.json`

Then:

- Reconnect the **Gmail** and **Ollama** credentials on the nodes that show a warning.
- In 02, change the sender in **Filter Enquiry Sender** from `enquiries@example.com`.
- Create a Data Table called **UTM Form Sessions** with the columns in [`database/schema.sql`](../database/schema.sql).
- In 03, select that table in both Data Table nodes, and select workflow 02 in **Run Current Location Route Calculation**.
- In 03, open the form trigger once and copy its production URL. If the ID differs from the one in **Attach UTM Form URL** (workflow 02), update it.
- Activate the workflows.

## 6. Try it

Send the email text from [`data/demo/sample-enquiry.json`](../data/demo/sample-enquiry.json) to the enquiry inbox, or pin that data on the Normalise Email node and run manually.

## 7. Before you push anything

```bash
node scripts/scan-secrets.mjs
node scripts/validate-workflows.mjs
```
