# Guida Frontend — Valentin

## Setup

1. `git clone https://github.com/boluwaji-cmd/ESCAPE-ROOM.git`
2. `npm install`
3. `git checkout -b feature/frontend`
4. `npm run dev`
5. Credenziali in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL=https://onenmczbncokymqishxh.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sZ9G9E-p_dnYn8RYuIVGsA_6FfToqJR`

## Flusso di lavoro Agile su GitHub

Il progetto usa metodologia Agile/Scrum. Ecco come lavorare ogni giorno:

1. Vai su https://github.com/boluwaji-cmd/ESCAPE-ROOM/issues — trova la tua issue
2. Assegnala a te stesso (click su "Assignees" a destra)
3. Spostala nella colonna "In Progress" del Project Board
4. Crea un branch: `git checkout -b feature/nome-feature`
5. Lavora sul codice. Fai commit piccoli e frequenti
6. Quando hai finito: `git push origin feature/nome-feature`
7. Apri una Pull Request su GitHub (usa il template PR)
8. Aspetta che i test CI passino (verde ✅)
9. Chiedi una review a un compagno
10. Dopo l'approvazione, fai merge nella PR
11. Chiudi la issue

**Label da usare:** `frontend` + priorità (`M — Must Have`, `S — Should Have`, `C — Could Have`)

**Milestone:** Sprint 2 — Frontend & Admin (lavoro corrente)

## Come chiamare il backend

Tramite client Supabase (gia in `src/lib/supabase.ts`).
Per le Edge Functions: richiesta POST all'URL della funzione con body JSON.
URL: `https://onenmczbncokymqishxh.supabase.co/functions/v1/nome-funzione`
Header: `Authorization: Bearer {ANON_KEY}`
Body: JSON con i parametri richiesti.

Per le query database: usa le API Supabase direttamente sulle tabelle.

## Store globale (Zustand)

Il file `src/lib/gameStore.ts` contiene `teamId` e `gameId`. Si popolano al login.
Leggili da li per ogni chiamata. Non hardcodare.

---

## Pagine da creare

### 1. Login (`/login`)

Il giocatore inserisce il codice squadra e accede.

- Campo input per il codice (es. "ABC123")
- Bottone "Entra"
- Cerca nella tabella `teams` il record con `access_code` uguale al codice
- Se trovato: salva `id` e `game_id` nello store globale, reindirizza a `/game/map`
- Se non trovato: messaggio "Codice non valido"
- Stile: sfondo Perugia, centrato, animazione, mobile-first

---

### 2. Mappa (`/game/map`)

Mostra posizione giocatore e cerchi dei punti da raggiungere.

- Carica i POI da `game_points` (JOIN con `points_of_interest`)
- Marker sulla posizione GPS (`watchPosition`)
- Cerchi intorno ai POI (raggio = `activation_radius_meters`)
- Se `distanza < raggio` → reindirizza a `/game/enigma/[point_id]`
- Se `distanza > raggio * 2` → mostra freccia direzionale
- Se GPS non disponibile: messaggio di avviso
- Leaflet NON funziona in SSR — usa dynamic import

---

### 3. Domanda (`/game/enigma/[id]`)

Domanda Kahoot con timer 10 secondi.

- Carica enigma da `enigma_pool`
- Fai parse di `options` (JSON → array)
- Timer countdown: barra verde → gialla → rossa
- A 0 secondi: auto-submit (timeout)
- Al clic su risposta: chiama Edge Function `check-answer`
  - Parametri: `enigma_id`, `answer`, `team_id`, `question_started_at`
- Se `correct: true` → "Corretto!" 2s → reindirizza a `/game/map`
- Se `correct: false` → sostituisci con `new_enigma`, resetta timer
- Bottone "Aiuto": mostra `hint` (max 2-3 volte)

---

### 4. Classifica (`/game/leaderboard`)

Classifica in tempo reale, aggiornamento automatico.

- Carica `teams` per `game_id`
- Ordina: `(time_penalty_seconds - location_bonus)` crescente
- Evidenzia la propria squadra
- Sottoscrizione WebSocket per aggiornamenti live (Supabase Realtime)
- Nessun dato salvato dopo la partita

---

### 5. Bivio Mistico (`/game/bivio/[branch_point_id]`)

Si attiva quando il POI ha `is_branch = true`.

- Mostra 3 simboli misteriosi (A, B, C) — il giocatore NON sa dove portano
- Il giocatore clicca un simbolo
- Chiama Edge Function `cast-blind-vote`
  - Parametri: `game_id`, `team_id`, `branch_point_id`, `symbol`
- Risposta:
  - `resolved: true` → "La squadra ha scelto [simbolo]!" → reindirizza a `/game/map`
  - `resolved: false` → "In attesa che tutti votino..."
  - `tie: true` → spareggio in corso (la Edge Function decide)
- Ogni giocatore puo votare UNA volta sola (UNIQUE nel DB)

---

### 6. Extra (opzionali)

**Verifica foto:** Apri fotocamera o input file → converti in base64 (RIMUOVI il prefisso `data:image/jpeg;base64,`) → chiama `verify-photo` con `imageBase64` e `expectedLandmark` (nome del monumento) → mostra `match` (true/false), `confidence` (0-100), `feedback` (messaggio in italiano)

**Audioguida:** Chiama `generate-audio` con `zoneName` (es. "Fontana Maggiore") e `description` (opzionale) → prima chiamata ~5s, successive istantanee (cache) → riproduci `audioUrl` con tag `<audio>` HTML5

---

## Tabelle database

| Tabella | Colonne utili |
|---------|-------------|
| `teams` | `id, game_id, name, color, access_code, time_penalty_seconds, location_bonus` |
| `game_points` | `id, game_id, point_of_interest_id, order_index, is_branch` |
| `points_of_interest` | `id, name, zone, latitude, longitude, activation_radius_meters` |
| `enigma_pool` | `id, question, type, options (JSON), correct_answer, hint` |

## Edge Functions da chiamare

| Funzione | Quando | Parametri |
|----------|--------|-----------|
| `check-answer` | Risposta data | `enigma_id, answer, team_id, question_started_at` |
| `cast-blind-vote` | Voto al bivio | `game_id, team_id, branch_point_id, symbol` |
| `verify-photo` | Foto scattata | `imageBase64, expectedLandmark` |
| `generate-audio` | Arrivo tappa | `zoneName` |

**Non chiamare:** `start-game` e `generate-enigma` (solo admin)

---

## Da non fare

- Non generare domande (le fa il backend con AI)
- Non calcolare punteggi o penalita (li calcola `check-answer`)
- Non modificare `gameLogic.ts` o `gameStore.ts`
- Non creare tabelle nuove nel database
- Non chiamare `start-game` o `generate-enigma` (solo admin panel)

## Riferimenti

- `FRONTEND_GUIDE.md` — input/output dettagliato di tutte le 7 Edge Functions
- `src/app/login/page.tsx` — base login
- `src/app/game/map/page.tsx` — base mappa con Leaflet
- `src/app/game/enigma/[id]/page.tsx` — base domanda con timer
- `src/app/game/leaderboard/page.tsx` — base classifica
- `src/lib/supabase.ts` — client Supabase configurato
- `src/lib/gameStore.ts` — store Zustand (teamId, gameId)
