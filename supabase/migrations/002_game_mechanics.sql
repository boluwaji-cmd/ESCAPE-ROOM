-- ============================================================
-- Escape Room Outdoor -- Game Mechanics v3.0
-- Timer-based scoring, location bonus, question themes
-- ============================================================

-- 1. Add question_theme to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_theme TEXT DEFAULT 'cultura_generale'
  CHECK (question_theme IN ('cultura_generale', 'perugia_italia'));

-- 2. Add location_bonus to teams (replaces points-based scoring)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS location_bonus INTEGER DEFAULT 0
  CHECK (location_bonus BETWEEN 0 AND 5);

-- 3. Rename score usage: score column becomes unused (kept for backward compat)
--    Ranking is now: ORDER BY (time_penalty_seconds - location_bonus) ASC

-- 4. Add question_started_at to enigma_sessions for timer validation
ALTER TABLE enigma_sessions ADD COLUMN IF NOT EXISTS question_started_at TIMESTAMPTZ;

-- 5. Add failed_enigma_ids to track which questions a team already failed
ALTER TABLE enigma_sessions ADD COLUMN IF NOT EXISTS failed_enigma_ids UUID[] DEFAULT '{}';

-- 6. RPC: increment location bonus (max 5)
CREATE OR REPLACE FUNCTION increment_location_bonus(p_team_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE teams SET location_bonus = LEAST(location_bonus + 1, 5)
  WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: increment penalty seconds
CREATE OR REPLACE FUNCTION increment_penalty_seconds(p_team_id UUID, p_seconds INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE teams SET time_penalty_seconds = time_penalty_seconds + p_seconds
  WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: get team ranking by time (lower is better)
CREATE OR REPLACE FUNCTION get_team_ranking(p_game_id UUID)
RETURNS TABLE(team_id UUID, team_name TEXT, total_seconds BIGINT, rank INT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name,
         (t.time_penalty_seconds - t.location_bonus)::BIGINT AS total_seconds,
         ROW_NUMBER() OVER (ORDER BY (t.time_penalty_seconds - t.location_bonus) ASC)::INT AS rank
  FROM teams t
  WHERE t.game_id = p_game_id
  ORDER BY (t.time_penalty_seconds - t.location_bonus) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
