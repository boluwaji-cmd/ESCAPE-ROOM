-- ============================================================
-- Admin Write Policies — consenti INSERT/UPDATE/DELETE per demo
-- Poiche il progetto non implementa autenticazione (come da specifica),
-- tutte le operazioni di scrittura sono permesse con la anon key.
-- In produzione queste andrebbero protette con autenticazione.
-- ============================================================

-- Points of Interest: admin puo creare/modificare/eliminare POI
CREATE POLICY "Admin insert POI" ON points_of_interest FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update POI" ON points_of_interest FOR UPDATE USING (true);
CREATE POLICY "Admin delete POI" ON points_of_interest FOR DELETE USING (true);

-- Games: admin puo creare/aggiornare partite (start-game Edge Function gia lo fa con service_role)
CREATE POLICY "Admin insert game" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update game" ON games FOR UPDATE USING (true);

-- Game Points: associati alle partite
CREATE POLICY "Admin insert game_points" ON game_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update game_points" ON game_points FOR UPDATE USING (true);

-- Teams: creati quando l'admin avvia la partita
CREATE POLICY "Admin insert team" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update team" ON teams FOR UPDATE USING (true);

-- Enigma Pool: popolato dalla start-game Edge Function
CREATE POLICY "Admin insert enigma" ON enigma_pool FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update enigma" ON enigma_pool FOR UPDATE USING (true);

-- Enigma Sessions
CREATE POLICY "Admin insert enigma_session" ON enigma_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update enigma_session" ON enigma_sessions FOR UPDATE USING (true);

-- Game Events: log eventi
CREATE POLICY "Admin insert game_event" ON game_events FOR INSERT WITH CHECK (true);

-- Blind Choice Votes
CREATE POLICY "Admin insert vote" ON blind_choice_votes FOR INSERT WITH CHECK (true);

-- Enigma Ratings
CREATE POLICY "Admin insert rating" ON enigma_ratings FOR INSERT WITH CHECK (true);
