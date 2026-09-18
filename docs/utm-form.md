# UTM current-location form

Workflow 03. Used when the team is not starting from Mumbai.

## Fields (13)

| Member 1 | Member 2 |
|---|---|
| Name (required) | Name |
| Current location | Current location |
| Country | Country |
| Available from (date) | Available from (date) |
| Available until (date) | Available until (date) |
| Visa permissions (comma separated) | Visa permissions |

Plus **Joining Preference**: Any feasible route, Prefer earliest joining, Prefer shortest travel, Prefer longest port stay.

A member is only included if name, location and country are all filled. At least one member is required.

## Steps

1. `Prepare Submitted UTM Members` – builds a `members[]` array, splits visa permissions into a list.
2. `Get Active UTM Form Session` – reads the latest row from the `UTM Form Sessions` Data Table.
3. `Build Current Location Project Context` – parses `joining_options` (stored as JSON text) and attaches the members.
4. `Update Form Session` – writes members, preference and `route_mode = CURRENT_LOCATION` back to the row.
5. `Prepare Route Calculation Input` – validates vessel, date, members and joining options.
6. `Run Current Location Route Calculation` – calls workflow 02 through its sub-workflow entry.

## Notes

- The joining preference is captured and stored. Ranking does not use it yet.
- One active session at a time (see roadmap).

Sample submission: [`data/demo/sample-utm-form-submission.json`](../data/demo/sample-utm-form-submission.json).
