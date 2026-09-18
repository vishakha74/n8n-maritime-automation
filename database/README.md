# Workflow state

State between workflow 02 (enquiry) and workflow 03 (form) is kept in an n8n Data Table named **UTM Form Sessions**.

In n8n the `joining_options` and `members` columns are strings holding JSON; the code nodes parse them. `schema.sql` shows the same structure as a PostgreSQL table.

| Column | Set by | Example |
|---|---|---|
| project_id | 02 | `UTM-MV-DEMO-TRADER-2026-10-14` |
| vessel_name | 02 | `MV DEMO TRADER` |
| utm_date_requested | 02 | `2026-10-14` |
| form_status | 02 → 03 | `READY_FOR_UTM_MEMBER_DETAILS` → `CURRENT_LOCATION_DETAILS_RECEIVED` |
| joining_options | 02 | JSON array |
| members | 03 | JSON array |
| joining_preference | 03 | `Prefer earliest joining` |
| route_mode | 02 → 03 | `DEFAULT_MUMBAI` → `CURRENT_LOCATION` |
| created_at | 02 | ISO timestamp |
