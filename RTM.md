# Requirements Traceability Matrix (RTM)
## Escape Room Outdoor -- Perugia

**Documento:** RTM-001 | **Versione:** 3.0 | **Data:** 3 Giugno 2026

---

### Legenda

**Priorità:** M = Must Have | S = Should Have | C = Could Have | W = Won't (presente iterazione)

**Stato:** [OK] Completato | [PARZ] Parziale | [BE] Backend operativo, frontend assente | [NO] Non implementato

---

### Matrice di Tracciamento

| ID | Descrizione | Fonte | Prio | Stato | Collegamento Design / Test |
|----|------------|-------|------|-------|---------------------------|
| RF_01 | Il giocatore vede la propria posizione GPS su mappa interattiva | Giocatori / AS GAIA | M | [OK] | Design: `src/app/game/map/page.tsx` -- Test: Chrome DevTools Sensors, simulazione coordinate |
| RF_02 | La squadra sblocca la domanda entrando nel geofence (30-50m) | Giocatori / AS GAIA | M | [OK] | Design: `LocationMarker` con `turf.distance` -- Test: GPS simulato, verifica entro 2s |
| RF_03 | Domanda a tempo (10s). Errore/Timeout = +10s + nuova domanda diversa. Corretto = -1s bonus (max -5s) | Giocatori / AS GAIA | M | [OK] | Design: Edge Function `check-answer` -- Test: 26 unit test (`gameLogic.test.ts`) + Dashboard Invoke |
| RF_04 | Classifica a tempo durante la partita; nessun dato salvato dopo | Giocatori / AS GAIA | M | [OK] | Design: `leaderboard/page.tsx` ordinamento per `(penalty - bonus) ASC` -- Test: Due browser simultanei |
| RF_05 | L'operatore posiziona POI, sceglie tema domande, crea squadre, avvia/ferma partita | Operatore / AS GAIA | M | [OK] | Design: `admin/points/page.tsx` + `admin/game/create/page.tsx` -- Test: Manuale end-to-end |
| RF_06 | Domande generate automaticamente, tutte diverse per ogni squadra | Operatore / AS GAIA | M | [OK] | Design: `generate-enigma` (Groq) + `start-game` con `Promise.all` -- Test: Dashboard Invoke, confronto output tra squadre |
| RF_07 | Se GPS assente: messaggio "Avvicinati a zona aperta". Se ti allontani: guida per rientrare | Giocatori | S | [OK] | Design: `map/page.tsx` handler `locationerror` + calcolo distanza -- Test: Chrome DevTools, simulazione allontanamento |
| RF_08 | Quando un membro risolve, tutti i dispositivi della squadra si aggiornano entro 2s | Giocatori | M | [OK] | Design: `check-answer` broadcast `enigma_solved` su canale `team-{id}` -- Test: Due browser stesso team |
| RF_09 | Pulsante suggerimento: mostra indizio senza rivelare la risposta (max 2-3 per tappa) | Giocatori | S | [PARZ] | Design: Campo `hint` pre-generato da `generate-enigma` -- Test: Prompt verification; UI non completamente implementata |
| RF_10 | L'operatore crea squadre con codice univoco e imposta difficolta (1-4) | Operatore / AS GAIA | M | [OK] | Design: Tabella `teams`, vincolo UNIQUE su `access_code` -- Test: SQL INSERT con verifica vincoli |
| RF_11 | L'app consuma poca batteria (polling GPS 10s, cache, luminosita adattiva) | Giocatori | C | [PARZ] | Design: `watchPosition` con `maximumAge: 10000`, PWA Serwist -- Test: Qualitativo su dispositivo mobile |
| RF_12 | Se l'app crasha, il giocatore recupera la sessione alla riapertura | Giocatori | S | [PARZ] | Design: `gameStore.ts` Zustand + resync Supabase -- Test: Parziale, store in memoria funzionante |
| RF_13 | L'operatore visualizza log eventi in tempo reale per monitorare la partita | Operatore / AS GAIA | S | [OK] | Design: Tabella `game_events` popolata da tutte le Edge Function -- Test: SQL query `SELECT * FROM game_events WHERE game_id = ...` |
| RF_14 | Classifica evidenzia la squadra corrente rispetto alle altre | Giocatori | M | [OK] | Design: `leaderboard/page.tsx` -- `bg-primary` per `team.id === teamId` -- Test: Manuale verifica highlight |
| RF_15 | La classifica si aggiorna via WebSocket senza refresh manuale | Giocatori | M | [OK] | Design: Supabase Realtime `postgres_changes` su UPDATE `teams` -- Test: Due browser, verifica entro 2s |
| RF_16 | Schermata esplicativa delle regole di punteggio | Giocatori | W | [NO] | Design: Documentato in SRS §3.1 -- Test: N/A, previsto per iterazioni future |
| RF_17 | Badge e titoli per le squadre vincitrici | Giocatori / AS GAIA | W | [NO] | Design: Logica backend in `cast-blind-vote` -- Test: UI non implementata |
| RF_18 | Schermata conclusiva con classifica finale e riepilogo | Giocatori | W | [NO] | Design: Stessa pagina leaderboard -- Test: Schermata dedicata non implementata |
| RF_19 | Anti-cheat GPS: rilevamento velocita >50 m/s (Haversine) | Operatore / AS GAIA | S | [OK] | Design: Edge Function `validate-location` -- Test: Dashboard Invoke (camminata valida, salto 5km in 2s = sospetto) |
| RF_20 | Percorsi accessibili senza barriere architettoniche | Giocatori / AS GAIA | W | [NO] | Design: Campo `accessibility_notes` predisposto -- Test: Richiede integrazione OSM accessibilita |
| RF_21 | Cache mappe offline, consumo dati < 5 MB/ora | Giocatori | C | [PARZ] | Design: PWA Serwist cache-first tile OSM -- Test: Qualitativo offline con tile precaricate |
| RF_22 | Classifica effimera: nessun dato salvato dopo la partita | AS GAIA (requisito GDPR) | M | [OK] | Design: Dati in `teams` azzerati a fine partita -- Test: Verifica `SELECT` vuoto dopo stop operatore |
| RF_23 | Domanda visibile offline dopo lo sblocco | Giocatori | C | [PARZ] | Design: PWA + IndexedDB -- Test: Qualitativo offline dopo sblocco |
| RF_24 | Votazione domande per miglioramento futuro | Operatore | W | [NO] | Design: Tabella `enigma_ratings` creata -- Test: Logica non implementata |
| RF_25 | Scatto foto al monumento per verifica automatica (risposta entro 3s) | Giocatori / AS GAIA | S | [OK] | Design: Edge Function `verify-photo` (Pollinations.ai + Groq) -- Test: Dashboard Invoke con base64 |
| RF_26 | Audio-guida automatica all'arrivo in tappa (max 60s) | Giocatori / AS GAIA | C | [OK] | Design: Edge Function `generate-audio`, Supabase Storage bucket `audio-guides` -- Test: Dashboard Invoke |
| RF_27 | Chat rapida di squadra per coordinarsi | Giocatori | C | [BE] | Design: Broadcast su `team-{id}` (stesso canale WebSocket) -- Test: Backend pronto, UI non implementata |
| RF_28 | Scelta percorso: due strade diverse dopo un bivio | Giocatori | M | [BE] | Design: `game_points` con `is_branch`, `parent_id` -- Test: SQL test struttura; UI non implementata |
| RF_29 | Bonus -1s per tappa completata (max -5s) | Giocatori | S | [OK] | Design: `check-answer` RPC `increment_location_bonus` con CHECK ≤5 -- Test: 4 unit test in `gameLogic.test.ts` + Dashboard Invoke |
| RF_30 | Login atmosferico: sfondo Perugia, form centrato, animazione porta | Giocatori / AS GAIA | M | [OK] | Design: `login/page.tsx` sfondo Unsplash, animazione CSS -- Test: Manuale |
| RF_31 | Setup squadra con partenza casuale diversa per ogni squadra | Giocatori | M | [OK] | Design: `start-game` assegna POI con esclusione dei gia assegnati -- Test: Verifica SQL: due squadre non condividono POI partenza |
| RF_32 | 5 domande per zona, generate automaticamente | Operatore / AS GAIA | M | [OK] | Design: `start-game` 5 chiamate `generate-enigma` per POI in `Promise.all` -- Test: Dashboard Invoke |
| RF_33 | Bivio Mistico: tre simboli, voto al buio, maggioranza decide, spareggio in parita | Giocatori / AS GAIA | M | [OK] | Design: Edge Function `cast-blind-vote`, UNIQUE vincolo `(game_id, team_id, branch_point_id)` -- Test: Dashboard Invoke (voto singolo, pareggio) |

---

### Riepilogo Copertura

| Stato | Conteggio | Percentuale |
|-------|-----------|-------------|
| [OK] Completamente implementati e testati | 20 | 60.6% |
| [PARZ] Implementati con test parziale | 5 | 15.2% |
| [BE] Backend pronto, frontend assente | 2 | 6.1% |
| [NO] Non implementati (futuri) | 6 | 18.2% |

### Riepilogo per Priorita

| Priorita | Conteggio |
|----------|-----------|
| M (Must Have) | 18 |
| S (Should Have) | 8 |
| C (Could Have) | 5 |
| W (Won't) | 2 |

---

### Metodologia di Test

| Livello | Metodo | Strumento | Copertura |
|---------|--------|-----------|-----------|
| **Unit Test – Logica** | 26 test automatici su funzioni pure | Vitest | `src/__tests__/gameLogic.test.ts` |
| **Unit Test – Edge Functions** | Test individuali con input controllati | Supabase Dashboard Invoke | 7/7 funzioni |
| **Integration Test – Frontend** | Test manuali con browser, GPS simulato | Chrome DevTools Sensors | Flussi principali |
| **Database Test** | Query SQL per vincoli, RLS, RPC | Supabase SQL Editor | Schema verificato |

### Tracciamento Test → Requisiti

| Test Suite | Requisiti Coperti |
|------------|-------------------|
| `gameLogic.test.ts` (26 test) | RF_03, RF_29 |
| Dashboard Invoke: `check-answer` | RF_03, RF_08, RF_28, RF_29, RF_32 |
| Dashboard Invoke: `start-game` | RF_06, RF_31, RF_32 |
| Dashboard Invoke: `cast-blind-vote` | RF_17, RF_33 |
| Dashboard Invoke: `validate-location` | RF_19 |
| Dashboard Invoke: `verify-photo` | RF_25 |
| Dashboard Invoke: `generate-audio` | RF_26 |
| Manuale: mappa GPS | RF_01, RF_02, RF_07 |
| Manuale: classifica | RF_04, RF_14, RF_15 |
| Manuale: login | RF_30 |

---

*Matrice redatta dal Gruppo di Lavoro Escape Room Perugia -- 3 Giugno 2026*
