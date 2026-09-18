# Route engine

The part of workflow 02 that turns a list of port calls into ranked joining plans.

## 1. Joining window

Requested date `D` is treated as the whole day (00:00–23:59:59). A port call is kept if any part of its stay overlaps `D − 7 days` to `D + 7 days`.

Each call gets a `date_relation`:

- `VESSEL_IN_PORT_ON_REQUESTED_DATE`
- `VESSEL_DEPARTS_BEFORE_REQUESTED_DATE`
- `VESSEL_ARRIVES_AFTER_REQUESTED_DATE`

Preliminary score:

| Rule | Points |
|---|---:|
| In port on requested date | +100 |
| Each day away from requested date | −10 |
| Stay ≥ 48 h / ≥ 24 h / ≥ 12 h | +20 / +15 / +8 |
| Schedule `SCHEDULED` / `ESTIMATED` | +10 / +5 |

Duplicates (same UN/LOCODE + arrival + departure) are dropped. Sort order: in-port first, then score, then closeness, then longer stay. Top 10 kept.

## 2. Finding the actual port

Searching a port name in Nominatim often returns the city or an administrative boundary. `Select Correct Vessel Port` rejects boundary, city, town, district, state and similar types outright, then scores what is left:

| Signal | Points |
|---|---:|
| type = harbour | +200 |
| addresstype = harbour | +150 |
| type is port / marina / dock / pier / quay / terminal | +120 |
| addresstype is one of those | +100 |
| name contains port / harbour / harbor / terminal / marina | +50 |
| display name contains one of those | +30 |
| type = industrial | −50 |
| valid coordinates | +20 (missing = discarded) |

## 3. Airports

Source: OurAirports `airports.csv`, read locally (~12 MB, not committed). The adapter keeps large, medium and small airports that have an IATA code.

Suitability score per airport, measured to the nearest port with Haversine:

| Rule | Points |
|---|---:|
| Has IATA | +30 |
| Aerodrome | +10 |
| Name suggests military (6 keyword patterns) | −100 |
| ≤ 25 / ≤ 50 / ≤ 75 / ≤ 100 km | +40 / +30 / +20 / +10 |
| > 100 km | −10 |

Top 10 per port are ranked, then filtered to IATA, non-military, ≤ 100 km. At most 5 go to routing.

## 4. Road leg (OSRM)

Airport → port driving route from the public OSRM server. Coordinates are sent as `lon,lat`.

| Road time | Points | Road distance | Points |
|---|---:|---|---:|
| ≤ 30 min | +30 | ≤ 25 km | +15 |
| ≤ 60 min | +20 | ≤ 50 km | +10 |
| ≤ 120 min | +10 | ≤ 100 km | +5 |
| > 120 min | −10 | | |

The best airport per port is selected; the next 2 are kept as alternatives.

Port names from the schedule can be in Arabic (e.g. بيروت, بورسعيد) while the geocoder returns English. `Merge Member Route Data` normalises both sides (accent stripping, alias tokens, partial matches for names of 5+ characters) before joining routes back to airports.

## 5. Timing

```
latest_safe_port_arrival = vessel_departure − 12 h
latest_airport_departure = latest_safe_port_arrival − road travel time
```

| Condition | timing_status | route_status |
|---|---|---|
| arrival ≤ D < departure | `REQUESTED_DATE_WITHIN_VESSEL_PORT_STAY` | `TIMING_POTENTIALLY_FEASIBLE` |
| departure < D | `VESSEL_DEPARTS_BEFORE_REQUESTED_DATE` | `NOT_FEASIBLE_DATE_MISMATCH` |
| arrival > D | `VESSEL_ARRIVES_AFTER_REQUESTED_DATE` | `CHECK_ALTERNATIVE_JOINING_DATE` |

## 6. Final ranking

| Rule | Points |
|---|---:|
| Timing feasible | +1000 |
| Not feasible | −1000 |
| Vessel in port on requested date | +200 |
| Requested date within port stay | +200 |
| Final airport score | + as calculated |
| Road ≤ 30 / ≤ 60 / ≤ 120 / > 120 min | +50 / +30 / +10 / −20 |
| Schedule `SCHEDULED` / `ESTIMATED` | +30 / +10 |
| Visa not yet confirmed | −10 |

Status: `FEASIBLE`, `FEASIBLE_PENDING_VISA_CONFIRMATION` or `NOT_FEASIBLE` with one of:

- `VESSEL_DEPARTS_BEFORE_UTM_REQUESTED_DATE`
- `VESSEL_ARRIVES_AFTER_UTM_REQUESTED_DATE`
- `TIMING_OR_ROUTE_NOT_FEASIBLE`

Missing visa information lowers the score but does not reject a plan. That is a human decision.

## Test run

| Field | Value |
|---|---|
| Port | Beirut |
| Arrival → departure | 13 Oct 2026 21:00 → 15 Oct 2026 13:00 (UTC+3) |
| Port stay | 40 h |
| Airport | BEY – Beirut–Rafic Hariri International |
| Straight-line | 7.84 km |
| Road | 9.13 km, ~7.7 min |
| Result | Feasible with 12 h buffer |

Development figures, not production guarantees. A synthetic version of the output is in [`data/demo/sample-recommendation.json`](../data/demo/sample-recommendation.json).
