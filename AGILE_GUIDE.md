# Guida Agile/Scrum -- Escape Room Outdoor Perugia

**Documento:** AGILE-001 | **Versione:** 1.0 | **Data:** 3 Giugno 2026

---

## Indice

1. [Come ci connettiamo: GitHub + Trello + Supabase](#1-come-ci-connettiamo)
2. [Il flusso di lavoro giorno per giorno](#2-il-flusso-di-lavoro)
3. [Ruoli e responsabilita](#3-ruoli-e-responsabilita)
4. [Cerimonie Scrum](#4-cerimonie-scrum)
5. [Dalla User Story al codice deployato](#5-dalla-user-story-al-codice-deployato)
6. [Board Trello](#6-board-trello)
7. [Esempio pratico: una settimana tipo](#7-esempio-pratico)

---

## 1. Come ci connettiamo

Il progetto si appoggia su tre piattaforme collegate tra loro:

```
TRELLO                    GITHUB                     SUPABASE
(tracciamento task)  ←→  (codice + review)    ←→    (backend + database)

Cosa faccio?              Dov'e il codice?           Dove gira?
Quale storia?             Chi l'ha scritto?          Funziona?
A che punto sono?         I test passano?            I dati sono corretti?
```

**Il flusso e:**

1. Su **Trello** scegli una User Story dal Backlog e la sposti in "In Progress"
2. Su **GitHub** crei un branch `feature/RF_XX-nome`, scrivi il codice, fai push e apri una Pull Request
3. **GitHub Actions** esegue automaticamente build, lint e test. Se falliscono, la PR non puo essere mergiata
4. Il **Gestore Progetto** (Giacomo) revisiona la PR: approva, commenta o richiede modifiche
5. Dopo l'approvazione, la PR viene mergiata su `main`
6. Le **Edge Functions** vengono deployate manualmente su Supabase (`npx supabase functions deploy`)
7. Su **Trello** la storia passa da "In Progress" a "Review" a "Done"

---

## 2. Il flusso di lavoro giorno per giorno

### Ogni giorno (Stand-up, 5-10 minuti, anche su WhatsApp)

Ogni membro risponde a tre domande:

1. **Cosa ho fatto ieri?**
   - Esempio: "Ho completato il timer di 10 secondi sulla pagina enigma. Aperto PR #12."

2. **Cosa faro oggi?**
   - Esempio: "Lavoro su RF_07: GPS recovery quando il giocatore si allontana."

3. **Ho qualche blocco?**
   - Esempio: "Non riesco a testare il GPS senza uscire di casa. Qualcuno puo aiutarmi con coordinate simulate?"

### Inizio settimana (Sprint Planning, 20-30 minuti)

1. Tutti guardano la colonna **Backlog** su Trello
2. Il gruppo sceglie 3-5 storie da completare questa settimana
3. Le storie vengono spostate in **Sprint Backlog**
4. Ogni membro si assegna 1-2 storie in base al proprio ruolo:
   - Frontend (Valentin): storie con label `~"frontend"` o `~"mobile"`
   - Admin Panel (Vitaly): storie con label `~"admin"` o `~"operatore"`
   - Backend/Prompt (Boluwaji): storie con label `~"backend"` o `~"game-logic"`
   - Contenuti/Gestione (Giacomo): storie di contenuto, demo, documentazione

### Fine settimana (Review + Retrospective, 30 minuti totali)

**Review (15 min):**
- Ogni membro mostra cosa ha completato (demo veloce)
- "RF_03 completata: ecco il timer funzionante"
- Le storie completate e verificate vanno in "Done"

**Retrospective (15 min):**
- Cosa ha funzionato bene questa settimana?
- Cosa non ha funzionato?
- Cosa possiamo migliorare la prossima settimana?

---

## 3. Ruoli e responsabilita

| Membro | Ruolo Scrum | Cosa fa ogni giorno | Branch tipici |
|--------|-------------|---------------------|---------------|
| **Giacomo Alfano** | Product Owner / Gestore Progetto | Gestisce il backlog, assegna priorita, revisiona PR, organizza demo, scrive contenuti testuali e audio, ricerca storica su Perugia | `feature/contenuti-*`, `docs/*` |
| **Valentin Racovita** | Sviluppatore Frontend | Lavora su pagine PWA: mappa, domande, classifica, login. Testa su mobile con Chrome DevTools | `feature/frontend-*` |
| **Vitaly Didyk** | Sviluppatore Pannello Admin | Lavora sul pannello operatore: creazione POI, gestione partita, log eventi. Testa su desktop | `feature/admin-*` |
| **Boluwaji Adepoju** | Sviluppatore Backend / Ingegnere Prompt | Lavora su Edge Functions, database, RPC SQL, prompt Groq, test automatici. Deploya su Supabase | `feature/backend-*`, `feature/prompt-*` |

### Regole

- **Nessuno pusha direttamente su `main`.** Solo Pull Request dopo review.
- **Una storia alla volta** in "In Progress" per persona.
- **Il codice deve compilare** prima di aprire una PR (`npm run build`).
- **I test devono passare** prima di aprire una PR (`npm test`).
- **Scrivi messaggi di commit chiari:** `RF_03: implementato timer 10 secondi nelle domande`.

---

## 4. Cerimonie Scrum

| Cerimonia | Quando | Durata | Chi partecipa | Obiettivo |
|-----------|--------|--------|---------------|-----------|
| **Stand-up** | Ogni giorno (anche WhatsApp) | 5-10 min | Tutti | Sincronizzazione rapida |
| **Sprint Planning** | Lunedi | 20-30 min | Tutti | Scegliere le storie della settimana |
| **Sprint Review** | Venerdi | 15-20 min | Tutti | Mostrare cosa e stato completato |
| **Sprint Retrospective** | Venerdi | 10-15 min | Tutti | Migliorare il processo |

---

## 5. Dalla User Story al codice deployato

Ecco il percorso completo di una User Story, da idea a funzionalita funzionante:

```
Fase 1: BACKLOG (Trello)
  RF_03: "Domanda a tempo (10s). Errore = +10s + nuova domanda"
  Etichette: [backend] [frontend] [game-logic]
  Assegnata a: Boluwaji (backend) + Valentin (frontend timer)

Fase 2: SPRINT BACKLOG (Trello)
  La storia viene selezionata per lo sprint corrente

Fase 3: IN PROGRESS (Trello + GitHub)
  Boluwaji:
    git checkout -b feature/RF_03-timer-logic
    ... modifica check-answer/index.ts ...
    git commit -m "RF_03: timer 10s, nuova domanda dopo errore, bonus -1s"
    git push origin feature/RF_03-timer-logic
    ... apre PR #15 ...

  Valentin:
    git checkout -b feature/RF_03-timer-ui
    ... modifica enigma/[id]/page.tsx (countdown bar) ...
    git commit -m "RF_03: countdown visivo con barra colorata"
    git push origin feature/RF_03-timer-ui
    ... apre PR #16 ...

Fase 4: CI/CD (GitHub Actions, automatico)
  npm ci → npm run lint → npm test → npm run build
  Se fallisce: la PR viene bloccata finche non si corregge

Fase 5: CODE REVIEW (GitHub)
  Giacomo revisiona PR #15 e PR #16
  Se OK: approva e merge su main
  Se NO: commenta con richieste di modifica

Fase 6: DEPLOY (terminale)
  Boluwaji:
    npx supabase functions deploy check-answer --no-verify-jwt
  Valentin:
    npm run build (verifica che il frontend compili)

Fase 7: REVIEW (Trello)
  La storia viene spostata in "Review"
  Demo veloce: "Ecco il timer funzionante"

Fase 8: DONE (Trello)
  La storia viene spostata in "Done"
  La funzionalita e completa e funzionante

```

---

## 6. Board Trello

### Struttura delle colonne

```
BACKLOG          SPRINT BACKLOG    IN PROGRESS      REVIEW           DONE
───────          ─────────────     ───────────      ──────           ────
Tutte le         Storie scelte     Storie su cui    Storie           Storie
33 user          per questa        qualcuno sta     completate,      completate
stories          settimana         lavorando        in attesa di     e verificate
                                                    verifica
```

### Etichette (Labels)

| Colore | Nome | Per chi |
|--------|------|---------|
| Blu | `frontend` | Valentin |
| Verde | `backend` | Boluwaji |
| Arancione | `admin` | Vitaly |
| Viola | `contenuti` | Giacomo |
| Rosso | `game-logic` | Boluwaji/Valentin |
| Giallo | `bug` | Chi lo ripara |
| Grigio | `documentazione` | Giacomo/Boluwaji |

### Cosa scrivere su ogni card

```
Titolo: RF_03 - Domanda a tempo (10s)

Descrizione:
- Countdown di 10 secondi visibile
- Errore = +10s + nuova domanda diversa
- Corretto = -1s bonus (max -5s)

Checklist:
- [ ] Backend: timer validation in check-answer
- [ ] Frontend: countdown bar in enigma page
- [ ] Test: unit test per timer logic
- [ ] Deploy: check-answer su Supabase

Labels: backend, frontend, game-logic
Assignees: Boluwaji, Valentin
Priorita: Must Have
```

---

## 7. Esempio pratico: una settimana tipo

### Lunedi -- Sprint Planning

```
Giacomo: "Questa settimana completiamo RF_03 (timer), RF_05 (pannello operatore con tema domande), RF_29 (bonus -1s)"
Boluwaji: "Prendo RF_03 backend e RF_29"
Valentin: "Prendo RF_03 frontend (countdown bar)"
Vitaly: "Prendo RF_05 (aggiungo selector tema domande al pannello)"
Giacomo: "Io verifico i contenuti delle domande per Perugia e preparo lo script del demo"
```

### Martedi-Mercoledi -- Sviluppo

```
Boluwaji: Apre PR #15 (check-answer timer logic). GitHub Actions esegue i test: 26 passano.
Valentin: Lavora sul countdown bar. Chiede a Boluwaji: "Che formato ha il JSON di risposta?"
Vitaly: Apre PR #17 (selector tema domande nell'admin panel)
Giacomo: Ha bloccato Valentin: "Serve il tema 'Perugia e Italia' anche nel frontend?"
         Risposta: "No, solo nel pannello operatore"
```

### Giovedi -- Code Review

```
Giacomo: Revisiona PR #15 di Boluwaji. "Tutto OK, merge!"
         Revisiona PR #17 di Vitaly. "Manca il placeholder quando il tema e vuoto. Aggiungilo."
         Vitaly corregge e pusha di nuovo. Giacomo approva.
```

### Venerdi -- Review + Retro

```
Review:
  Boluwaji: Mostra check-answer funzionante con timer. Demo: risposta corretta in 3s = bonus.
  Valentin: Mostra countdown bar che passa da verde a giallo a rosso. Demo: timeout a 0s.
  Vitaly: Mostra pannello operatore con dropdown "Cultura Generale / Perugia e Italia".

Retro:
  Cosa ha funzionato: "I test automatici hanno beccato un bug prima del merge!"
  Cosa migliorare: "Dobbiamo sincronizzarci meglio su chi testa cosa"
  Azione: "Prossima settimana: chi scrive il backend scrive anche un test case per il frontend"
```

---

## Riepilogo: Come connettere tutto

```
1. TRELLO:     Scegli cosa fare (User Story dalla colonna Sprint Backlog)
2. GITHUB:     Scrivi il codice sul tuo branch → Push → Apri Pull Request
3. ACTIONS:    I test automatici verificano che funzioni tutto
4. REVIEW:     Giacomo revisiona → Approva → Merge
5. DEPLOY:     Boluwaji deploya le Edge Functions su Supabase
6. TRELLO:     Sposta la storia in Done
7. DEMO:       A fine sprint, tutti mostrano cosa hanno fatto
```

---

*Guida redatta dal Gruppo di Lavoro Escape Room Perugia -- 3 Giugno 2026*
