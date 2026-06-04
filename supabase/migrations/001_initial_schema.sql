-- ============================================================
-- Escape Room Outdoor — Schema Database Iniziale
-- Supabase PostgreSQL + RLS Policies
-- ============================================================

CREATE TABLE IF NOT EXISTS points_of_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, zone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL,
  activation_radius_meters INTEGER DEFAULT 40,
  description TEXT DEFAULT '', accessibility_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, company_info TEXT DEFAULT '',
  question_theme TEXT DEFAULT 'perugia_italia',
  status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  point_of_interest_id UUID NOT NULL REFERENCES points_of_interest(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL, is_branch BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES game_points(id) ON DELETE SET NULL,
  branch_symbol TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL, color TEXT DEFAULT '#3b82f6',
  access_code TEXT NOT NULL UNIQUE, difficulty INTEGER DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 4),
  score INTEGER DEFAULT 0, time_penalty_seconds INTEGER DEFAULT 0,
  total_penalty_seconds INTEGER DEFAULT 0, location_bonus INTEGER DEFAULT 0,
  current_game_point_id UUID REFERENCES game_points(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enigma_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  point_of_interest_id UUID NOT NULL REFERENCES points_of_interest(id) ON DELETE CASCADE,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 4),
  question TEXT NOT NULL, options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL, hint TEXT DEFAULT '', explanation TEXT DEFAULT '',
  type TEXT DEFAULT 'multiple_choice' CHECK (type IN ('true_false', 'multiple_choice')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enigma_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  enigma_pool_id UUID NOT NULL REFERENCES enigma_pool(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unlocked' CHECK (status IN ('unlocked', 'answered', 'solved', 'failed')),
  attempts INTEGER DEFAULT 0, failed_enigma_ids TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blind_choice_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  branch_point_id UUID NOT NULL REFERENCES game_points(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, team_id, branch_point_id)
);

CREATE TABLE IF NOT EXISTS enigma_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enigma_pool_id UUID NOT NULL REFERENCES enigma_pool(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE enigma_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE enigma_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blind_choice_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enigma_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON points_of_interest FOR SELECT USING (true);
CREATE POLICY "Public read" ON games FOR SELECT USING (true);
CREATE POLICY "Public read" ON game_points FOR SELECT USING (true);
CREATE POLICY "Public read" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read" ON enigma_pool FOR SELECT USING (true);
CREATE POLICY "Public read" ON enigma_sessions FOR SELECT USING (true);
CREATE POLICY "Public read" ON game_events FOR SELECT USING (true);

-- Stored Procedures
CREATE OR REPLACE FUNCTION increment_penalty_seconds(p_team_id UUID, p_seconds INTEGER)
RETURNS void AS $$ BEGIN UPDATE teams SET total_penalty_seconds = total_penalty_seconds + p_seconds WHERE id = p_team_id; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_location_bonus(p_team_id UUID)
RETURNS void AS $$ BEGIN UPDATE teams SET location_bonus = LEAST(location_bonus + 1, 5) WHERE id = p_team_id; END; $$ LANGUAGE plpgsql;
