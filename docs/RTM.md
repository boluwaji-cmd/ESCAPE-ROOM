# Requirements Traceability Matrix (RTM)
## Escape Room Outdoor -- Perugia

**Documento:** RTM-001 | **Versione:** 3.1 | **Data:** 4 Giugno 2026

---

### Legenda Stato

| Simbolo | Significato |
|---------|-------------|
| [OK] | Completamente implementato e testato |
| [PARTIAL] | Implementato con test parziale |
| [BACKEND] | Backend pronto, frontend assente |
| [TODO] | Non implementato (futuro) |

---

### Matrice di Tracciamento

| ID | User Story | Implementazione | Verifica | Stato |
|----|------------|-----------------|----------|-------|
| **US1** | Vedo dove sono sulla mappa | `src/app/game/map/page.tsx` -- Leaflet + watchPosition GPS | Chrome DevTools Sensors | [OK] |
| **US2** | Sblocco domanda via geofence | LocationMarker con turf.distance, raggio 30-50m, broadcast team-{id} | GPS simulato | [OK] |
| **US3** | Domanda a tempo (10s), errore = +10s + nuova domanda | Edge Function check-answer: countdown 10s, penalita, nuova domanda diversa, bonus -1s/tappa (max -5s) | Dashboard Invoke | [OK] |
| **US4** | Classifica a tempo (effimera) | leaderboard/page.tsx -- ordinamento per tempo; nessun dato salvato dopo stop | Due browser simultanei | [OK] |
| **US5** | Operatore: POI, tema domande | admin/points + admin/game/create -- tema cultura generale / Perugia-Italia | Manuale | [OK] |
| **US6** | Domande tutte diverse per squadra | generate-enigma con question_theme; start-game set distinti per squadra | Dashboard Invoke | [OK] |
| **US7** | GPS recovery: guida se ti perdi | map/page.tsx -- locationerror + indicazioni rientro | Chrome DevTools | [OK] |
| **US8** | Schermata compagni si aggiorna | check-answer broadcast enigma_solved su team-{id} | Due browser stesso team | [OK] |
| **US9** | Suggerimento per domanda difficile | Campo hint pre-generato; pulsante Aiuto nel frontend | Prompt verification | [PARTIAL] |
| **US10** | Operatore: crea squadre e difficolta | Tabella teams: access_code UNIQUE, difficulty CHECK 1-4 | SQL INSERT | [OK] |
| **US11** | Batteria: polling 10s, cache | watchPosition con maximumAge 10000; PWA Serwist cache-first | Qualitativo | [PARTIAL] |
| **US12** | Riprendo dopo crash | gameStore.ts Zustand + resync Supabase | Parziale | [PARTIAL] |
| **US13** | Operatore: log eventi in tempo reale | Tabella game_events popolata da tutte le Edge Function | SQL query | [OK] |
| **US14** | Classifica: mia squadra evidenziata | leaderboard/page.tsx -- highlight team.id === teamId | Manuale | [OK] |
| **US15** | Classifica si aggiorna senza refresh | Supabase Realtime postgres_changes su UPDATE teams | Due browser | [OK] |
| **US16** | Spiegazione regole punteggio | Documentato in SRS.md | N/A | [TODO] |
| **US17** | Badge e titoli | Logica backend in cast-blind-vote; UI non implementata | Dashboard Invoke | [TODO] |
| **US18** | Classifica finale e riepilogo | Stessa pagina leaderboard; schermata dedicata non implementata | Manuale | [TODO] |
| **US19** | Anti-cheat GPS | validate-location: Haversine, soglia 50 m/s, suspicious_gps | Dashboard Invoke | [OK] |
| **US20** | Percorsi accessibili | Richiede tile OSM accessibilita; accessibility_notes predisposto | N/A | [TODO] |
| **US21** | Cache mappe, <5 MB/h | PWA Serwist cache-first tile OSM | Qualitativo | [PARTIAL] |
| **US22** | Dati effimeri: nessuna persistenza | Dati azzerati a fine partita; classifica solo durante gioco | Verifica post-partita | [OK] |
| **US23** | Domanda visibile offline | PWA + IndexedDB: domanda salvata localmente allo sblocco | Qualitativo | [PARTIAL] |
| **US24** | Voto domanda per miglioramento | Tabella enigma_ratings creata; logica non implementata | N/A | [TODO] |
| **US25** | Foto verifica monumento | verify-photo: Groq + Pollinations.ai | Dashboard Invoke | [OK] |
| **US26** | Audio-guida automatica | generate-audio: Supabase Storage audio-guides, URL firmato 1h | Dashboard Invoke | [OK] |
| **US27** | Chat rapida di squadra | Broadcast su team-{id}; pulsante Chat non funzionante | Backend pronto | [BACKEND] |
| **US28** | Scelta percorso: due strade | game_points con is_branch, parent_id; check-answer rileva branch | SQL test | [BACKEND] |
| **US29** | Bonus -1s per tappa (max -5s) | check-answer: RPC increment_location_bonus, cap a 5 | Dashboard Invoke | [OK] |
| **US30** | Login atmosferico | login/page.tsx: sfondo Perugia, animazione porta, redirect /game/map | Manuale | [OK] |
| **US31** | Setup squadra + partenza casuale diversa | start-game assegna POI unico a ogni squadra (random con esclusione) | SQL + Invoke | [OK] |
| **US32** | 5 domande per zona | start-game: 5 chiamate generate-enigma per POI in Promise.all | Dashboard Invoke | [OK] |
| **US33** | Bivio Mistico: voto al buio | cast-blind-vote: UNIQUE, conteggio, maggioranza >50%, spareggio | Dashboard Invoke | [OK] |

---

### Riepilogo Copertura

| Stato | Conteggio | Percentuale |
|-------|-----------|-------------|
| [OK] Completamente implementati | 20 | 60.6% |
| [PARTIAL] Test parziale | 5 | 15.2% |
| [BACKEND] Backend pronto | 2 | 6.1% |
| [TODO] Non implementati (futuri) | 6 | 18.2% |

### Metodologia di Test

| Livello | Metodo | Strumento |
|---------|--------|-----------|
| Unit Test -- Edge Functions | Test individuali con input controllati | Supabase Dashboard Invoke |
| Integration Test -- Frontend | Test manuali con browser, GPS simulato | Chrome DevTools Sensors |
| Database Test | Query SQL per vincoli, RLS, RPC | Supabase SQL Editor |

---

*Matrice redatta dal Team Escape Room Perugia -- 4 Giugno 2026*
