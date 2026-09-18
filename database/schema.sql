-- VSL UTM Form Sessions
-- Workflows 02 and 03 use an n8n Data Table with these columns.
-- This is the PostgreSQL equivalent, for anyone moving the state out of n8n.

CREATE TABLE IF NOT EXISTS vsl_utm_form_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    project_id          TEXT        NOT NULL UNIQUE,   -- VSL-<VESSEL>-<YYYY-MM-DD>
    vessel_name         TEXT        NOT NULL,
    utm_date_requested  DATE        NOT NULL,
    form_status         TEXT        NOT NULL,          -- READY_FOR_UTM_MEMBER_DETAILS | CURRENT_LOCATION_DETAILS_RECEIVED
    joining_options     JSONB       NOT NULL,          -- candidate port calls from Generate UTM Joining Options
    members             JSONB       NOT NULL DEFAULT '[]'::jsonb,
    joining_preference  TEXT        NOT NULL DEFAULT 'Any feasible route',
    route_mode          TEXT        NOT NULL,          -- DEFAULT_MUMBAI | CURRENT_LOCATION
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_utm_sessions_created_at
    ON vsl_utm_form_sessions (created_at DESC);
