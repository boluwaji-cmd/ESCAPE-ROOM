# Escape Room Outdoor — Perugia: Piano di Sviluppo Incrementale

**Documento:** PS-001 | **Versione:** 3.0 | **Data:** 3 Giugno 2026 | **Committente:** AS GAIA

---

## Fase 0 – Setup (Completato)
- [x] Schema database con policy RLS (11 tabelle, 20 policy, 7 stored procedure)
- [x] Migrazioni SQL eseguite su Supabase (001_initial_schema + 002_game_mechanics)
- [x] App Next.js con pagina mappa GPS
- [x] Client Supabase e variabili d'ambiente
- [x] Tutte le 7 Edge Functions deployate e attive su Supabase
- [x] Progettazione prompt per generazione enigmi (Groq — Llama 3.3 70B)

## Fase 1 – MVP Core (Completato)
- [x] US1  – Tracciamento mappa GPS
- [x] US2  – Sblocco enigma via geofence
- [x] US3  – Validazione risposte e punteggio (check-answer)
- [x] US4  – Classifica in tempo reale
- [x] US10 – Admin squadre e difficoltà
- [x] US30 – Login atmosferico
- [x] US31 – Setup squadra

## Fase 2 – Generazione Automatica e Funzionalità Avanzate (Completato)
- [x] US6  – Enigmi generati automaticamente (Groq – Llama 3.3 70B)
- [x] US9  – Sistema di indizi (integrato nel prompt di generazione)
- [x] US25 – Verifica fotografica (Edge Function deployata e testata con Groq)
- [x] US26 – Audio-guida (sistema cache + Microsoft Edge TTS)
- [x] US32 – 5 enigmi per zona (generazione automatica)
- [x] US33 – Bivio Mistico (cast‑blind‑vote con spareggio)

## Fase 3 – Pannello Admin (Completato)
- [x] US5  – L'admin crea un gioco sulla mappa
- [x] US13 – Log eventi di gioco (via Supabase dashboard / tabella realtime)

## Fase 4 – Rifinitura e Demo (In corso)
- [x] US19 – Anti‑cheat GPS (validate‑location Edge Function)
- [x] US22 – Pulizia dati GDPR (cron job)
- [x] Backend verificato al 100% (tutte le 7 Edge Functions testate)
- [x] 26 unit test superati (Vitest)
- [x] CI/CD pipeline configurata (GitHub Actions: lint + test)
- [x] Documentazione completa (10 documenti in formato professionale)
- [ ] **Registrazione video demo**
