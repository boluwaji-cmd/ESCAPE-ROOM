-- ============================================================
-- Escape Room Outdoor – Schema Database Iniziale
-- Supabase PostgreSQL + RLS Policies
-- ============================================================

-- 1. TABLES --------------------------------------------------

-- Points of Interest (landmarks mapped by admin)
CREATE TABLE IF NOT EXISTS points_of_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  activation_radius_meters INTEGER DEFAULT 40,
  description TEXT DEFAULT '',
  accessibility_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Games (one per session)
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_info TEXT DEFAULT '',
  status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game Points (links a POI to a specific game, defines order and branching)
CREATE TABLE IF NOT EXISTS game_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  point_of_interest_id UUID NOT NULL REFERENCES points_of_interest(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_branch BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES game_points(id) ON DELETE SET NULL,
  branch_symbol TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  access_code TEXT NOT NULL UNIQUE,
  difficulty INTEGER DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 4),
  score INTEGER DEFAULT 0,
  time_penalty_seconds INTEGER DEFAULT 0,
  current_game_point_id UUID REFERENCES game_points(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enigma Pool (puzzles generati automaticamente per ogni partita)
CREATE TABLE IF NOT EXISTS enigma_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  point_of_interest_id UUID NOT NULL REFERENCES points_of_interest(id) ON DELETE CASCADE,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 4),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  hint TEXT DEFAULT '',
  explanation TEXT DEFAULT '',
  type TEXT DEFAULT 'multiple_choice' CHECK (type IN ('true_false', 'multiple_choice')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enigma Sessions (tracks each team's attempt at an enigma)
CREATE TABLE IF NOT EXISTS enigma_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  enigma_pool_id UUID NOT NULL REFERENCES enigma_pool(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'unlocked' CHECK (status IN ('unlocked', 'answered', 'solved', 'failed')),
  attempts INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game Events (audit log for admin)
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blind Choice Votes (US33 – Bivio Mistico)
CREATE TABLE IF NOT EXISTS blind_choice_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  branch_point_id UUID NOT NULL REFERENCES game_points(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, team_id, branch_point_id)
);

-- Enigma Ratings (US24 – feedback per miglioramento contenuti)
CREATE TABLE IF NOT EXISTS enigma_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enigma_pool_id UUID NOT NULL REFERENCES enigma_pool(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INDEXES --------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_game_points_game ON game_points(game_id);
CREATE INDEX IF NOT EXISTS idx_teams_game ON teams(game_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(access_code);
CREATE INDEX IF NOT EXISTS idx_enigma_pool_game ON enigma_pool(game_id);
CREATE INDEX IF NOT EXISTS idx_enigma_pool_poi ON enigma_pool(point_of_interest_id);
CREATE INDEX IF NOT EXISTS idx_enigma_sessions_team ON enigma_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_game_events_game ON game_events(game_id);
CREATE INDEX IF NOT EXISTS idx_game_events_team ON game_events(team_id);
CREATE INDEX IF NOT EXISTS idx_blind_choice_votes_branch ON blind_choice_votes(branch_point_id);

-- 3. RLS POLICIES --------------------------------------------

-- Enable RLS on all tables
ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE enigma_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE enigma_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blind_choice_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enigma_ratings ENABLE ROW LEVEL SECURITY;

-- Public read access (players need to read game data)
CREATE POLICY "Public read access" ON points_of_interest FOR SELECT USING (true);
CREATE POLICY "Public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Public read access" ON game_points FOR SELECT USING (true);
CREATE POLICY "Teams read own data" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read enigmas" ON enigma_pool FOR SELECT USING (true);
CREATE POLICY "Teams read own sessions" ON enigma_sessions FOR SELECT USING (true);
CREATE POLICY "Public read events" ON game_events FOR SELECT USING (true);
CREATE POLICY "Teams read own votes" ON blind_choice_votes FOR SELECT USING (true);

-- Insert policies (players create events and sessions via app)
CREATE POLICY "Authenticated insert events" ON game_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert sessions" ON enigma_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated insert votes" ON blind_choice_votes FOR INSERT WITH CHECK (true);

-- Update policies (teams update their own record)
CREATE POLICY "Teams update own record" ON teams FOR UPDATE USING (true) WITH CHECK (true);

-- 4. STORED PROCEDURES ---------------------------------------

-- Increment team score
CREATE OR REPLACE FUNCTION increment_score(team_id UUID, increment INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE teams SET score = score + increment WHERE id = team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement time penalty (bonus for fast answers)
CREATE OR REPLACE FUNCTION decrement_time_penalty(team_id UUID, seconds INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE teams SET time_penalty_seconds = GREATEST(0, time_penalty_seconds - seconds)
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment time penalty (penalty for wrong answers)
CREATE OR REPLACE FUNCTION increment_time_penalty(team_id UUID, seconds INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE teams SET time_penalty_seconds = time_penalty_seconds + seconds
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. GDPR CLEANUP (CRON JOB) ---------------------------------

CREATE OR REPLACE FUNCTION cleanup_old_games()
RETURNS void AS $$
BEGIN
  -- Delete all data for games completed more than 1 hour ago
  DELETE FROM game_events WHERE game_id IN (
    SELECT id FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour'
  );
  DELETE FROM enigma_sessions WHERE enigma_pool_id IN (
    SELECT id FROM enigma_pool WHERE game_id IN (
      SELECT id FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour'
    )
  );
  DELETE FROM enigma_pool WHERE game_id IN (
    SELECT id FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour'
  );
  DELETE FROM blind_choice_votes WHERE game_id IN (
    SELECT id FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour'
  );
  DELETE FROM teams WHERE game_id IN (
    SELECT id FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour'
  );
  DELETE FROM game_points WHERE game_id IN (
    SELECT id FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour'
  );
  DELETE FROM games WHERE status = 'completed' AND completed_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: run every 5 minutes (requires pg_cron extension enabled in Supabase)
-- SELECT cron.schedule('cleanup-old-games', '*/5 * * * *', 'SELECT cleanup_old_games();');
