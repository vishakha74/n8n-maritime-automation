# WhatsApp attendance classifier

Workflow 01.

## Flow

1. **wacli** is linked to a WhatsApp account and forwards new messages to the n8n webhook `POST /webhook/whatsapp-attendance`.
2. **Filter Attendance Group** only lets through messages whose `Chat` JID matches `WHATSAPP_GROUP_JID`.
3. **Normalise Message** maps the wacli payload to 8 fields: `group`, `sender`, `senderName`, `timestamp`, `message`, `fromMe`, `chatJID`, `messageID`.
4. **Classify Attendance Message** sends it to Llama 3.2 3B through Ollama.
5. **Structured Output Parser** enforces the JSON shape below.

## Categories

| Category | Typical message |
|---|---|
| `leave` | "Not coming today" |
| `half_day` | "Will come in second half" |
| `work_from_home` | "WFH today" |
| `late_arrival` | "Reaching office till 11am" |
| `early_leaving` | "Leaving at 4 today" |
| `birthday` | "Happy birthday Rahul!" |
| `celebration` | "Congrats on the release" |
| `general` | anything unrelated |
| `unclear` | genuinely ambiguous |

"Reaching office till 11am" is common phrasing locally and means *arriving at* 11. The prompt calls this out because the model kept reading it as leaving at 11.

## Output schema

| Field | Type |
|---|---|
| `category` | one of the 9 above |
| `confidence` | 0–1 |
| `reason` | short text |
| `employee` | display name |
| `date` | YYYY-MM-DD |
| `mentioned_time` | HH:MM or null |
| `leave_requested` | boolean |
| `leave_duration` | text or null |

## Guardrails in the prompt

- Do not calculate salary deductions.
- Do not assume leave is approved.
- Do not invent information.

## Next

- Store results in a table keyed by `messageID` so re-deliveries are ignored.
- Daily summary for HR.
- Reconcile declared status against TeamOffice punches and flag mismatches for a person to review.

Sample events: [`data/demo/sample-whatsapp-events.json`](../data/demo/sample-whatsapp-events.json).
