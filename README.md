# Escape Room Outdoor -- Perugia

> **Committente:** [AS GAIA](https://www.asgaia.it/)  
> **Corso:** Laboratorio di Ingegneria del Software -- Universita degli Studi di Perugia  
> **Docente:** Prof. Gabriele Rosati  
> **Team:** Escape Room Perugia  
> **Metodologia:** Agile (Scrum)

---

## Descrizione

Piattaforma **mobile-first** di escape room urbana che trasforma il centro storico di **Perugia** in un'esperienza di gioco interattiva a squadre. I giocatori, organizzati in squadre con punti di partenza casuali, navigano tramite GPS, sbloccano domande generate dinamicamente quando entrano nel raggio di monumenti e luoghi storici, e competono **simultaneamente** in una gara a tempo.

### Dinamica di Gioco

- **Gara a cronometro:** il timer parte quando l'operatore avvia la partita e si ferma quando tutte le squadre completano il percorso (o l'operatore ferma manualmente)
- **10 secondi per rispondere:** ogni domanda in stile Kahoot ha un limite di 10 secondi
- **Risposta sbagliata = +10s di penalita + nuova domanda** (finche non si risponde correttamente)
- **Classifica a tempo:** vince chi completa con il minor tempo totale; **-1s di bonus per ogni tappa** (max -5s)
- **Recupero GPS:** se un giocatore si allontana, il GPS lo guida verso l'area corretta
- **Nessun dato salvato:** la classifica esiste solo durante la partita

### Admin Panel (per l'operatore della giornata)

Il pannello di amministrazione e progettato per la **persona che gestisce l'escape room il giorno dell'evento** -- tipicamente un operatore di AS GAIA, non necessariamente tecnico. L'interfaccia e pensata per essere semplice e immediata:

- Posizionare punti di interesse sulla mappa con un click
- Scegliere il tema delle domande: **cultura generale** oppure **Perugia e Italia**
- Creare le squadre e assegnare i codici di accesso
- Avviare la partita quando tutte le squadre sono pronte
- Monitorare l'andamento in tempo reale (log eventi, classifica)
- Fermare manualmente la partita se necessario

La gestione tecnica (database, deploy, configurazione Edge Functions) avviene tramite **Supabase Dashboard**, accessibile solo al team di sviluppo.

### Generazione Domande

L'operatore sceglie il tema e il sistema genera automaticamente domande in italiano:
- **Cultura generale:** domande su storia, scienza, arte, geografia mondiale
- **Perugia e Italia:** domande su storia locale, monumenti, tradizioni umbre, geografia italiana

Le domande sono **tutte diverse per ogni squadra**.

---

## Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, DaisyUI 5 |
| **Mappe** | Leaflet.js + React-Leaflet + OpenStreetMap |
| **Stato** | Zustand 5 |
| **PWA** | Serwist (Service Worker, cache offline) |
| **Backend** | Supabase (PostgreSQL, Realtime WebSocket, Storage) |
| **Serverless** | 7 Edge Functions (Deno/TypeScript) |
| **Generazione Contenuti** | Groq API (Llama 3.3 70B) |
| **Verifica Immagini** | Pollinations.ai |
| **Hosting** | Vercel (frontend) + Supabase Cloud (backend) |

---

## Quick Start (per collaboratori)

```bash
# 1. Clona il repository
git clone <repo-url>
cd escape-room-perugia

# 2. Installa le dipendenze
npm install

# 3. Configura le variabili d'ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase

# 4. Avvia il server di sviluppo
npm run dev

# 5. Esegui i test
npm test

# 6. Deploya le Edge Functions (richiede Supabase CLI e login)
npx supabase login
npx supabase functions deploy --no-verify-jwt
```

**Prerequisiti:**
- Node.js >= 18
- Account Supabase con accesso al progetto
- Supabase CLI (`npm install -g supabase`)

---

## Struttura del Progetto

```
escape-room-perugia/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Redirect a /login
│   │   ├── layout.tsx                   # Root layout
│   │   ├── login/page.tsx               # Login atmosferico (US30)
│   │   ├── game/
│   │   │   ├── map/page.tsx             # Mappa GPS + geofence (US1, US2)
│   │   │   ├── enigma/[id]/page.tsx     # Interfaccia domanda (US3)
│   │   │   └── leaderboard/page.tsx     # Classifica a tempo (US4, US14)
│   │   └── admin/
│   │       ├── points/page.tsx          # Pannello operatore: POI su mappa (US5)
│   │       └── game/create/page.tsx     # Pannello operatore: partita (US5)
│   └── lib/
│       ├── supabase.ts                  # Client Supabase
│       └── gameStore.ts                 # Zustand store
├── supabase/
│   ├── functions/                       # 7 Edge Functions
│   │   ├── start-game/index.ts          # Inizializzazione partita
│   │   ├── generate-enigma/index.ts     # Generazione domande
│   │   ├── check-answer/index.ts        # Validazione risposte + timer
│   │   ├── cast-blind-vote/index.ts     # Bivio Mistico
│   │   ├── verify-photo/index.ts        # Verifica fotografica
│   │   ├── generate-audio/index.ts      # Audio-guida
│   │   └── validate-location/index.ts   # Anti-cheat GPS
│   └── migrations/
│       └── 001_initial_schema.sql       # Schema database
├── .github/workflows/ci.yml             # CI/CD pipeline
├── .env.example                         # Template variabili d'ambiente
├── SRS.md                               # Specifica dei Requisiti (IEEE 830)
├── RTM.md                               # Matrice di Tracciabilita
├── UML.md                               # Documento UML
├── USERSTORY.md                         # 33 User Stories con note tecniche
├── SPECIFICA_CLIENTE.md                 # Specifica del Committente
├── DOCUMENTAZIONE_TECNICA.md            # Documentazione Tecnica
├── PIANO_SVILUPPO.md                    # Piano di Sviluppo
└── BRIEF_PROGETTO.md                    # Brief del Laboratorio
```

---

## Documentazione

| Documento | Descrizione |
|-----------|-------------|
| [SRS.md](SRS.md) | Specifica dei Requisiti Software (IEEE 830) -- 33 user stories, requisiti non funzionali, modello del dominio |
| [RTM.md](RTM.md) | Matrice di Tracciabilita -- requisito, implementazione, test |
| [UML.md](UML.md) | Progettazione UML -- Use Case, Classi, Activity, Sequence, State Machine, Component, Deployment |
| [USERSTORY.md](USERSTORY.md) | 33 User Stories con checklist e note del progettista |
| [SPECIFICA_CLIENTE.md](SPECIFICA_CLIENTE.md) | Requisiti dal punto di vista del committente AS GAIA |
| [DOCUMENTAZIONE_TECNICA.md](DOCUMENTAZIONE_TECNICA.md) | Architettura, Edge Functions, schema DB, prompt design |
| [AGILE_GUIDE.md](AGILE_GUIDE.md) | Guida Agile/Scrum: workflow completo, cerimonie, ruoli, esempio pratico di una settimana |

---

## Gruppo di Lavoro

| Membro | Ruolo | Responsabilita |
|--------|-------|---------------|
| **Giacomo Alfano** | Curatore Contenuti / Ricercatore di Zona -- Gestore Progetto | Coordinamento Scrum, Trello board, ricerca storica su Perugia, contenuti testuali e audio, demo video |
| **Valentin Racovita** | Sviluppatore Frontend | PWA giocatore: mappa GPS, interfaccia domande, classifica, login, design responsive |
| **Vitaly Didyk** | Sviluppatore Pannello di Amministrazione | Pannello operatore: creazione POI, gestione partita, log eventi, UI desktop |
| **Boluwaji Oluwaseyi Adepoju** | Sviluppatore Backend -- Ingegneria dei Prompt | Supabase, 7 Edge Functions, database design, RLS, real-time, anti-cheat GPS, progettazione prompt generazione domande, verifica foto |

---

## Come Collaboriamo

### GitHub

Il progetto e ospitato su GitHub. Ogni membro clona il repository e lavora sul proprio branch:

```bash
# 1. Clona il repository
git clone <repo-url>
cd escape-room-perugia

# 2. Crea un branch per la tua feature
git checkout -b feature/nome-feature

# 3. Dopo aver fatto modifiche, fai commit e push
git add .
git commit -m "Descrizione chiara di cosa hai fatto"
git push origin feature/nome-feature

# 4. Apri una Pull Request su GitHub
#    Il Gestore Progetto (Giacomo) la revisiona e approva il merge
```

**Branch protetti:** `main` e `develop` richiedono Pull Request obbligatoria. Nessuno fa push diretto su `main`.

**CI/CD:** GitHub Actions esegue automaticamente build, lint e test a ogni push. Se la build o i test falliscono, la Pull Request non puo essere mergiata.

### Testing

Il progetto include test automatici con **Vitest**:

```bash
npm test          # Esegue tutti i test una volta
npm run test:watch  # Esegue i test in modalita watch (sviluppo)
```

**26 unit test** coprono la logica di gioco (validazione risposte, timer 10s, bonus tappe, penalita, ranking). Vedi `src/__tests__/gameLogic.test.ts`.

I test sono tracciabili ai requisiti nella [RTM](RTM.md).

### Metodologia Agile (Scrum)

Lavoriamo in **sprint settimanali** con ruoli chiari e cerimonie Scrum:

| Cerimonia | Frequenza | Durata | Partecipanti |
|-----------|-----------|--------|-------------|
| **Stand-up** | Ogni giorno (anche su chat) | 5-10 min | Tutto il team |
| **Sprint Planning** | Inizio settimana | 20-30 min | Tutto il team |
| **Review** | Fine settimana | 15-20 min | Tutto il team |
| **Retrospective** | Fine sprint | 10-15 min | Tutto il team |

**Board Trello** con colonne:
- **Backlog** -- tutte le user stories ancora da fare
- **Sprint Backlog** -- storie selezionate per lo sprint corrente
- **In Progress** -- storie su cui qualcuno sta lavorando attivamente
- **Review** -- storie completate, in attesa di verifica
- **Done** -- storie completate e verificate

**Regole:**
- Ogni membro sceglie una storia dalla colonna Sprint Backlog e la sposta in In Progress
- Quando completata, la sposta in Review e apre una Pull Request
- Il Gestore Progetto revisiona il codice e, se tutto e corretto, approva il merge e sposta la storia in Done
- A fine sprint, il team fa la retrospective: cosa ha funzionato, cosa no, cosa migliorare

---

## Limitazioni

- **Groq:** tier gratuito con rate limit ~30 richieste/min
- **GPS:** precisione ridotta nel centro storico di Perugia (effetto canyon)
- **Nessun test di carico:** comportamento con oltre 50 giocatori non verificato

---

*Progetto sviluppato per il Laboratorio di Ingegneria del Software -- Universita degli Studi di Perugia.*
