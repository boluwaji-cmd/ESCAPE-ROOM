# Documentazione Tecnica
## Escape Room Outdoor -- Perugia

**Documento:** TECH-001 | **Versione:** 3.0 | **Data:** 4 Giugno 2026 | **Committente:** AS GAIA

---

### 1. Panoramica

Piattaforma mobile-first di escape room urbana a Perugia. Giocatori in squadre con partenze casuali, domande a tempo (10s), gara a cronometro, classifica effimera.

---

### 2. Architettura

```
Mobile (PWA) <--> Vercel (Next.js) <--> Supabase (PostgreSQL + Realtime + Edge Functions)
                                          |
                              Groq API (generazione domande)
                              Pollinations.ai (verifica foto)
                              OpenStreetMap (tile mappe)
```

**Stack:** Next.js 16, React 19, Tailwind 4, DaisyUI 5, Leaflet.js, Zustand 5, Supabase, Deno/TS

---

### 3. Edge Functions (7)

| Funzione | Ruolo | Meccanica Chiave |
|----------|-------|-----------------|
| **start-game** | Inizializza partita | POI casuali diversi per squadra; 5 domande per POI via Promise.all |
| **generate-enigma** | Genera domande | Prompt Groq con question_theme (cultura_generale / perugia_italia) |
| **check-answer** | Valida risposta + timer | Countdown 10s; errore = +10s + nuova domanda; corretto = -1s bonus (max -5s) |
| **cast-blind-vote** | Bivio Mistico | UNIQUE vincolo; conteggio voti; maggioranza >50%; spareggio |
| **verify-photo** | Verifica foto | Pollinations.ai (visione) + Groq (testuale/OCR) |
| **generate-audio** | Audio-guida | Supabase Storage audio-guides; URL firmato 1h |
| **validate-location** | Anti-cheat GPS | Haversine; soglia 50 m/s; evento suspicious_gps |

---

### 4. Meccaniche di Gioco (v3.0)

| Meccanica | Dettaglio |
|-----------|-----------|
| **Timer di Partita** | Parte quando l'operatore avvia; stop a completamento o stop manuale |
| **Timeout Domanda** | 10 secondi; countdown client, verifica timestamp server |
| **Risposta Sbagliata** | +10s penalita + **nuova domanda diversa** |
| **Bonus Tappe** | -1s dal tempo totale per tappa (max -5s cumulativi) |
| **Classifica** | Ordinamento: total_penalty_seconds - location_bonus ASC; effimera |
| **Partenza** | Random, diversa per ogni squadra (esclusione POI gia assegnati) |
| **Tema Domande** | Scelta operatore: cultura_generale / perugia_italia |
| **Pannello Operatore** | Per la persona che gestisce l'evento; gestione tecnica via Supabase Dashboard |
| **GPS Recovery** | Se distanza > raggio * 2, indicazione direzionale per rientro |

---

### 5. Schema Database (9 tabelle)

games, points_of_interest, game_points, teams, enigma_pool, enigma_sessions, game_events, blind_choice_votes, enigma_ratings

Campi chiave per le nuove meccaniche:
- games.question_theme: cultura_generale | perugia_italia
- teams.total_penalty_seconds: secondi di penalita accumulati
- teams.location_bonus: bonus tappe (0-5)

Vedi supabase/migrations/001_initial_schema.sql per lo schema completo.

---

### 6. Prompt Design

Il prompt di generate-enigma accetta question_theme:

- **cultura_generale**: domande su storia, scienza, arte, geografia mondiale
- **perugia_italia**: domande su storia locale, monumenti, tradizioni umbre

Output JSON: question, type (true_false | multiple_choice), options[], correctAnswer, hint.

---

### 7. Flusso di Gioco

```
1. Operatore crea POI, sceglie tema, crea squadre
2. Squadre fanno login con access_code
3. Operatore avvia partita: start-game assegna POI casuali diversi
4. Cronometro parte
5. Squadra raggiunge POI: geofence sblocca domanda
6. 10s countdown, risposta
   - Corretta: -1s bonus, prossima tappa
   - Sbagliata/Timeout: +10s, nuova domanda diversa
7. Bivio? Bivio Mistico (votazione)
8. Tutte le squadre completano (o operatore stoppa): classifica finale
9. Dati azzerati
```

---

### 8. Documentazione API

La documentazione interattiva di tutte le 7 Edge Functions è disponibile come pagina web:

**URL:** `/api-docs`

Include per ogni funzione: metodo HTTP, parametri (nome, tipo, descrizione), formato risposta JSON, codici di errore, descrizione della meccanica di gioco.

---

### 9. Comandi Rapidi

```bash
npm install                    # Dipendenze
npm run dev                    # Sviluppo locale
npx supabase functions deploy --no-verify-jwt  # Deploy Edge Functions
```

---

*Documento redatto dal Team Escape Room Perugia -- 4 Giugno 2026*
