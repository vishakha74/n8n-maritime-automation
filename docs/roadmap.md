# Roadmap

Roughly in the order I plan to do them.

- [ ] Look up the Maersk vessel code from the extracted vessel name
- [ ] Derive the schedule date range from the requested UTM date
- [ ] Insert the form session row from workflow 02 (Data Table insert)
- [ ] Pass `project_id` in the form URL instead of reading the latest session
- [ ] Origin city → airport resolution from OurAirports instead of a fixed map
- [ ] Flight leg: origin airport → destination airport timing
- [ ] Use the joining preference in ranking
- [ ] Reply to the enquiry email with the Top 3 plans
- [ ] Visa rules per nationality instead of free text
- [ ] Self-hosted OSRM and Nominatim for volume
- [ ] WhatsApp: store by `messageID`, daily HR summary, TeamOffice reconciliation
- [ ] Unit tests for the scoring functions (pulled out of Code nodes into `src/`)
