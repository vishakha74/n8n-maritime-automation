# Architecture

Three workflows, split by trigger rather than by feature. Each one can be switched off, tested or rewritten without touching the others.

```
                ┌───────────────────────────────┐
 Gmail ────────▶│ 02  Vessel schedule & routes   │──▶ Top 3 plans + rejected plans
                │                               │──▶ UTM form link
                │   ┌───────────────────────┐   │
 03 Form ──────▶│   │ Route engine (shared) │   │
 (sub-workflow) │   └───────────────────────┘   │
                └───────────────────────────────┘

 WhatsApp ─▶ wacli ─▶ 01  Attendance classifier ─▶ structured JSON
```

## Design decisions

**AI at the edges, rules in the middle.** The LLM reads free text (emails, chat messages). Everything after that is deterministic so a planner can see exactly why a plan was chosen or rejected.

**One route engine, two entry points.** Workflow 02 has a Gmail entry and an Execute Workflow entry. Both land on `Prepare Travel Route Queries`. Workflow 03 only collects input and calls 02; it has no routing code of its own.

**Local model.** Enquiries and staff messages stay on the office machine. Llama 3.2 3B is small enough to run without a GPU and accurate enough for two-field extraction and 9-way classification.

**Fail loudly.** Code nodes throw with a specific message when a required field is missing (no vessel name, no joining options, no routable airport) instead of passing empty data downstream.

**Reason codes over silent ranking.** Every evaluated plan comes out with `plan_feasible`, `recommendation_status` and `rejection_reason`.

## Data flow in 02

| Stage | Nodes | Output per item |
|---|---|---|
| Intake | Gmail Enquiry Trigger → Get Enquiry Email → Filter Enquiry Sender → Normalise Email | email from/to/subject/date/body |
| Extraction | Extract Vessel and Date (Ollama) → Parse LLM Extraction | `vessel_name`, `utm_date_requested` |
| Schedule | Maersk Vessel Schedule API → Normalise Port Calls | one item per port call with arrival, departure, stay hours, voyage, service |
| Candidates | Generate UTM Joining Options | up to 10 scored port calls in a ±7 day window |
| Members | Prepare Default Mumbai Members (or sub-workflow entry) | members × joining options |
| Port location | Prepare Port Geocoding → Geocode Vessel Port → Select Correct Vessel Port | port lat/lon, harbour-first |
| Airports | Prepare Airport Search → Read Airport Database → Extract From File → Airport Database Adapter → Rank Nearby Airports → Filter Practical Airports | up to 5 practical airports per port |
| Road leg | Prepare OSRM Routes → OSRM Route → Calculate Ground Travel → Select Best Practical Airport | chosen airport + 2 alternatives, road km/min |
| Feasibility | Merge Member Route Data → Calculate Joining Timing | latest safe port arrival, latest airport departure, timing status |
| Output | Rank & Recommend UTM Plans | Top 3 feasible + all evaluated plans |
| Form hand-off | Prepare UTM Form Context → Build Form Session Row → Attach UTM Form URL | `project_id`, session row, form URL |

`project_id` format: `VSL-<VESSEL-NAME>-<YYYY-MM-DD>`.

Diagrams: [`architecture/`](../architecture).
