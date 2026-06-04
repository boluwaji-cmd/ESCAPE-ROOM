# Guida Admin Panel — Vitaly

## Setup

1. `git clone https://github.com/boluwaji-cmd/ESCAPE-ROOM.git`
2. `npm install`
3. `git checkout -b feature/admin-panel`
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

**Label da usare:** `admin` + priorità (`M — Must Have`, `S — Should Have`)

**Milestone:** Sprint 2 — Frontend & Admin (lavoro corrente)

## Come chiamare il backend

Tramite client Supabase (gia in `src/lib/supabase.ts`).
Per `start-game`: richiesta POST a `https://onenmczbncokymqishxh.supabase.co/functions/v1/start-game`
con header `Authorization: Bearer {ANON_KEY}`.
Per il database: usa le API Supabase direttamente sulle tabelle.

---

## Pagine da creare

### 1. Gestione POI (`/admin/points`)

L'operatore crea/modifica punti di interesse sulla mappa.

- Mappa interattiva grande (Leaflet, Google Maps o OpenStreetMap)
- Tutti i POI esistenti visibili come marker
- Click su punto vuoto della mappa → form laterale con:
  - Nome (testo, obbligatorio)
  - Zona (dropdown: Perugia Centro, Assisi, Orvieto, Gubbio, Spoleto, Spello, Bevagna, Todi, Terni, Norcia, Castiglione del Lago, Roma, Milano, Venezia, Firenze, Pisa, Torino, Napoli, Andria, Alberobello, Agrigento, Matera, Monterosso, Porto Cervo, Taormina, Pompei)
  - Raggio attivazione (numero, default 40m, range 20-100)
  - Descrizione (testo lungo)
- Click su marker esistente → modifica o elimina
- Coordinate prese automaticamente dal punto cliccato
- Salva su `points_of_interest`
- Nel database ci sono gia 39 POI — non cancellarli

---

### 2. Creazione Gioco (`/admin/game/create`)

Wizard in 4 step per configurare e avviare una partita.

**Step 1 — Dati partita:**
- Nome partita (testo)
- Tema domande (dropdown): "Cultura Generale" / "Perugia e Italia"

**Step 2 — Selezione POI:**
- Lista checkbox di tutti i POI raggruppati per zona
- Minimo 3, consigliati 5-7

**Step 3 — Squadre:**
- Bottone "Aggiungi squadra"
- Per ogni squadra: nome, colore (color picker), difficolta (1-4)
- Sistema genera `access_code` automatico (6 caratteri)
- Minimo 2 squadre

**Step 4 — Riepilogo e Avvio:**
- Mostra riepilogo: nome gioco, tema, N POI selezionati, N squadre create
- Bottone grande verde "AVVIA PARTITA"
- Al click, in ordine:
  1. INSERT in `games` (name, question_theme, status='lobby')
  2. Per ogni POI: INSERT in `game_points` (game_id, point_of_interest_id, order_index)
  3. Per ogni squadra: INSERT in `teams` (game_id, name, color, difficulty, access_code generato)
  4. POST a Edge Function `start-game` con body JSON: `{ "gameName": "...", "questionTheme": "cultura_generale"|"perugia_italia", "pois": ["uuid1",...], "teams": [{"name":"...","color":"#...","difficulty":2},...] }`
- `start-game` assegna punti partenza casuali diversi e genera 5 domande per POI per ogni squadra
- Mostra i codici di accesso generati (es. "Squadra Leoni: ABC123") — l'operatore li comunica a voce
- Bottone "Vai al monitoraggio" → `/admin/monitor`

---

### 3. Monitoraggio (`/admin/monitor`)

Dashboard in tempo reale dopo l'avvio.

- Classifica live: carica `teams` per `game_id`, ordina per `(time_penalty_seconds - location_bonus)` ASC
- Sottoscrizione WebSocket (Supabase Realtime) a `teams` (UPDATE) e `game_events` (INSERT)
- Log eventi in italiano:
  - `enigma_answered`: "Squadra [nome] ha risposto correttamente/erroneamente"
  - `enigma_solved`: "Squadra [nome] ha completato [nome POI]"
  - `bonus_location`: "Squadra [nome]: -1s bonus (totale: X)"
  - `penalty_added`: "Squadra [nome]: +10s penalita"
  - `blind_vote_cast`: "Squadra [nome] ha votato [simbolo]"
  - `game_completed`: "Partita terminata!"
- Bottone rosso "FERMA PARTITA" (in alto a destra, sempre visibile):
  - Chiede conferma: "Sei sicuro di voler fermare la partita?"
  - Al si: UPDATE `games` SET `status = 'completed'`, `completed_at = now()`
  - Mostra classifica finale

---

## Regole interfaccia

1. Tutto in italiano
2. Pulsanti grandi, pochi passaggi (operatore non tecnico)
3. Desktop, non mobile
4. Feedback chiaro: successo (verde) / errore (rosso)
5. Usa DaisyUI (gia installato)

---

## Tabelle

| Tabella | Operazioni |
|---------|-----------|
| `points_of_interest` | SELECT, INSERT, UPDATE, DELETE |
| `games` | INSERT, UPDATE |
| `game_points` | INSERT |
| `teams` | INSERT, SELECT |
| `game_events` | SELECT (real-time) |

## Edge Functions

| Funzione | Quando |
|----------|--------|
| `start-game` | Avvio partita |

---

## Da non fare

- Non creare tabelle nuove (schema completo)
- Non modificare le Edge Functions esistenti
- Non toccare `gameLogic.ts` o `gameStore.ts`
- Non implementare sistema di login/autenticazione admin
- Non cancellare i 39 POI esistenti

## Riferimenti

- `FRONTEND_GUIDE.md` — dettagli input/output di tutte le Edge Functions
- `src/app/admin/points/page.tsx` — base gestione POI (120 righe)
- `src/app/admin/game/create/page.tsx` — base creazione gioco (151 righe)
- `src/lib/supabase.ts` — client Supabase configurato
