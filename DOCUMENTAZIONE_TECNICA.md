# Documentazione Tecnica
## Escape Room Outdoor — Perugia

**Documento:** TECH-001 | **Versione:** 3.0 | **Data:** 3 Giugno 2026 | **Committente:** AS GAIA

---

### 1. Panoramica

Piattaforma mobile-first di escape room urbana a Perugia. Giocatori in squadre con partenze casuali, domande a tempo (10s), gara a cronometro, classifica effimera.

---

### 2. Architettura

```
Mobile (PWA) ←→ Vercel (Next.js) ←→ Supabase (PostgreSQL + Realtime + Edge Functions)
                                          ↓
                              Groq API (generazione domande)
                              Pollinations.ai (verifica foto)
                              OpenStreetMap (tile mappe)
```

**Stack:** Next.js 16, React 19, Tailwind 4, DaisyUI 5, Leaflet.js, Zustand 5, Supabase, Deno/TS

---

### 3. Edge Functions (7)

| Funzione | Ruolo | Meccanica Chiave |
|----------|-------|-----------------|
| **start-game** | Inizializza partita | Assegna POI casuali diversi a ogni squadra; chiama `generate-enigma` ×5 per POI in `Promise.all` |
| **generate-enigma** | Genera domande | Prompt Groq con `question_theme` (cultura_generale / perugia_italia); output JSON validato |
| **check-answer** | Valida risposta + timer | Countdown 10s; errore = +10s + nuova domanda; corretto = -1s bonus (max -5s) + avanzamento |
| **cast-blind-vote** | Bivio Mistico | UNIQUE vincolo; conteggio voti; maggioranza >50%; spareggio |
| **verify-photo** | Verifica foto | Pollinations.ai (visione) + Groq (testuale/OCR) |
| **generate-audio** | Audio-guida | Supabase Storage bucket `audio-guides`; URL firmato 1h |
| **validate-location** | Anti-cheat GPS | Formula Haversine; soglia 50 m/s; evento `suspicious_gps` |

---

### 4. Meccaniche di Gioco (v3.0)

| Meccanica | Dettaglio |
|-----------|-----------|
| **Timer di Partita** | Parte quando l'operatore avvia; si ferma quando tutte le squadre completano o l'operatore stoppa manualmente |
| **Timeout Domanda** | 10 secondi per rispondere; countdown lato client, verifica timestamp server |
| **Risposta Sbagliata** | +10s penalità + **nuova domanda diversa** (non la stessa) |
| **Bonus Tappe** | -1s dal tempo totale per tappa completata (max -5s cumulativi) |
| **Classifica** | Ordinamento: `total_penalty_seconds - location_bonus` ASC; effimera (nessun dato salvato dopo) |
| **Partenza** | Random, diversa per ogni squadra (esclusione dei POI già assegnati) |
| **Tema Domande** | Scelta operatore: `cultura_generale` o `perugia_italia`; passato a `generate-enigma` |
| **Pannello Operatore** | Interfaccia per la persona che gestisce l'evento: posiziona POI, sceglie tema, crea squadre, avvia/ferma partita. Gestione tecnica via Supabase Dashboard (solo team di sviluppo). |
| **GPS Recovery** | Se distanza > raggio × 2, indicazione direzionale per rientrare nell'area |

---

### 5. Schema Database (9 tabelle)

`games`, `points_of_interest`, `game_points`, `teams`, `enigma_pool`, `enigma_sessions`, `game_events`, `blind_choice_votes`, `enigma_ratings`

Campi chiave per le nuove meccaniche:
- `games.question_theme` — `cultura_generale` | `perugia_italia`
- `teams.total_penalty_seconds` — secondi di penalità accumulati
- `teams.location_bonus` — bonus tappe (0-5)

Vedi `supabase/migrations/001_initial_schema.sql` per lo schema completo.

---

### 6. Prompt Design

Il prompt di `generate-enigma` accetta `question_theme`:

- **`cultura_generale`**: domande su storia, scienza, arte, geografia mondiale — nessun riferimento a Perugia
- **`perugia_italia`**: domande su storia locale, monumenti, tradizioni umbre, geografia italiana

Entrambi generano output JSON con `question`, `type` (`true_false` | `multiple_choice`), `options[]`, `correctAnswer`, `hint`.

---

### 7. Flusso di Gioco

```
1. Operatore crea POI, sceglie tema, crea squadre
2. Squadre fanno login con access_code
3. Operatore avvia partita, start-game assegna POI casuali diversi
4. Cronometro parte
5. Squadra raggiunge POI → geofence sblocca domanda
6. 10s countdown → risposta
   - Corretta: -1s bonus, prossima tappa
   - Sbagliata/Timeout: +10s, nuova domanda diversa
7. Bivio? → Bivio Mistico (votazione)
8. Tutte le squadre completano (o l'operatore stoppa), classifica finale
9. Dati azzerati
```

---

### 8. Comandi Rapidi

```bash
npm install                    # Dipendenze
npm run dev                    # Sviluppo locale
npx supabase functions deploy --no-verify-jwt  # Deploy Edge Functions
```

---

*Documento redatto dal Gruppo di Lavoro Escape Room Perugia -- 3 Giugno 2026*
