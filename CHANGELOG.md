# Changelog

## 0.3.0 – 2026-09-16

Prepared the workflows for a public repository.

- Moved Maersk key, vessel code, airport CSV path, WhatsApp group and base URL to environment variables
- Replaced credential IDs, Data Table IDs, workflow IDs, webhook IDs and the enquiry sender address
- Renamed generic nodes (`Code in JavaScript`, `If1`, `HTTP Request`, …) to describe what they do, and updated `$('…')` references
- Removed an unused placeholder Code node from workflow 02
- Added sticky notes to each canvas
- Fixed: form dropdown was labelled `Dropdown` while the code read `Joining Preference`, so the preference always fell back to the default
- Fixed: `Member 2 Available Until` was a text field instead of a date
- Fixed: Structured Output Parser in workflow 01 was not connected to the LLM chain, and the prompt asked for the category name only
- Added secret scan, workflow validator and CI

## 0.2.0

- UTM current-location form (workflow 03) calling the route engine as a sub-workflow
- Final ranking with reason codes and Top 3 output
- 12 h safety buffer timing check

## 0.1.0

- Gmail intake, Ollama extraction, Maersk schedule, joining window
- Nominatim port geocoding, OurAirports screening, OSRM road leg
- WhatsApp attendance classifier (workflow 01)
