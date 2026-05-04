CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    skin_type TEXT,
    cycle_length INT DEFAULT 28,
    lat FLOAT,
    lon FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    image_hash TEXT,
    acne_severity INT,
    oiliness INT,
    dryness INT,
    redness INT,
    dark_circles INT,
    texture_roughness INT,
    pigmentation INT,
    overall_skin_health INT,
    barrier_stress BOOLEAN,
    immediate_concern TEXT,
    zones_json JSONB,
    observations_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, image_hash)
);

CREATE TABLE IF NOT EXISTS lifestyle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    sleep_hours FLOAT,
    water_ml INT,
    stress_level INT,
    exercise_done BOOLEAN,
    diet_flags TEXT[],
    makeup_hours FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routine_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    am_routine JSONB,
    pm_routine JSONB,
    paused_actives TEXT[],
    skin_message TEXT,
    urgency TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    event_type TEXT,
    event_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    inci_name TEXT,
    category TEXT,
    benefits TEXT[],
    warnings TEXT[],
    content TEXT,
    embedding vector(384)
);

CREATE INDEX IF NOT EXISTS ingredients_embedding_idx
ON ingredients USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);