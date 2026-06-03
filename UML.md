# UML Design Document

## Escape Room Outdoor -- Perugia

---

**Documento:** UML-001
**Versione:** 2.0
**Data:** 20 Maggio 2026
**Committente:** AS GAIA
**Riferimento SRS:** SRS-001 v2.0

---

### Indice

1. [Diagrammi Use Case](#1-diagrammi-use-case)
2. [Diagramma delle Classi (Modello del Dominio)](#2-diagramma-delle-classi)
3. [Activity Diagram](#3-activity-diagram)
4. [Sequence Diagram](#4-sequence-diagram)
5. [State Machine Diagram](#5-state-machine-diagram)
6. [Component Diagram](#6-component-diagram)
7. [Deployment Diagram](#7-deployment-diagram)

---

### 1. Diagrammi Use Case

#### 1.1 Use Case – Giocatore

Il giocatore interagisce con il sistema di gioco durante una partita. Le operazioni disponibili coprono l'intero flusso: dall'accesso alla conclusione.

```mermaid
graph TD
    Giocatore((Giocatore))

    subgraph "Sistema di Gioco"
        UC1[UC1: Visualizza mappa GPS]
        UC2[UC2: Sblocca enigma via geofence]
        UC3[UC3: Risponde all'enigma]
        UC4[UC4: Visualizza classifica]
        UC5[UC5: Invia messaggio chat]
        UC6[UC6: Vota al Bivio Mistico]
        UC7[UC7: Richiede suggerimento]
        UC8[UC8: Scatta foto verifica]
        UC9[UC9: Ascolta audio-guida]
    end

    Giocatore --> UC1
    Giocatore --> UC2
    Giocatore --> UC3
    Giocatore --> UC4
    Giocatore --> UC5
    Giocatore --> UC6
    Giocatore --> UC7
    Giocatore --> UC8
    Giocatore --> UC9

    UC2 -.->|include| UC1
    UC3 -.->|include| UC2
    UC6 -.->|extend| UC3
    UC7 -.->|extend| UC3
    UC8 -.->|extend| UC3
```

**Relazioni chiave:**
- **Include:** Lo sblocco dell'enigma (UC2) richiede la mappa GPS (UC1). La risposta (UC3) richiede lo sblocco (UC2).
- **Extend:** Voto (UC6), suggerimento (UC7) e foto (UC8) estendono opzionalmente la risposta all'enigma (UC3).

#### 1.2 Use Case -- Operatore

L'operatore (la persona che gestisce l'escape room il giorno dell'evento) configura l'esperienza di gioco tramite pannello desktop.

```mermaid
graph TD
    Operatore((Operatore))

    subgraph "Pannello Operatore"
        AD1[AD1: Crea punto di interesse su mappa]
        AD2[AD2: Crea nuovo gioco]
        AD3[AD3: Seleziona punti e avvia partita]
        AD4[AD4: Monitora log eventi in tempo reale]
        AD5[AD5: Gestisce squadre e difficoltà]
        AD6[AD6: Genera enigmi]
    end

    Operatore --> AD1
    Operatore --> AD2
    Operatore --> AD3
    Operatore --> AD4
    Operatore --> AD5
    Operatore --> AD6

    AD3 -.->|include| AD2
    AD3 -.->|include| AD1
    AD6 -.->|include| AD3
```

#### 1.3 Use Case – Sistema (Backend Automatico)

Il backend esegue operazioni automatiche senza intervento umano, garantendo il funzionamento del gioco e la conformità normativa.

```mermaid
graph TD
    Sistema((Sistema))

    subgraph "Backend Automatico"
        S1[S1: Genera enigmi]
        S2[S2: Valida risposte e calcola punteggio]
        S3[S3: Controllo anti-cheat GPS]
        S4[S4: Pulizia dati GDPR]
        S5[S5: Verifica foto]
        S6[S6: Sincronizzazione real-time]
        S7[S7: Risoluzione Bivio Mistico]
    end

    Sistema --> S1
    Sistema --> S2
    Sistema --> S3
    Sistema --> S4
    Sistema --> S5
    Sistema --> S6
    Sistema --> S7

    S2 -.->|include| S6
    S7 -.->|include| S6
    S4 -.->|trigger| S4
```

---

### 2. Diagramma delle Classi (Modello del Dominio)

Il diagramma rappresenta le entità principali del sistema e le loro relazioni, mappate direttamente sulle tabelle del database PostgreSQL.

```mermaid
erDiagram
    GAMES ||--o{ GAME_POINTS : "1:N – composto da"
    GAMES ||--o{ TEAMS : "1:N – partecipano"
    GAMES ||--o{ GAME_EVENTS : "1:N – traccia eventi"
    GAMES ||--o{ ENIGMA_POOL : "1:N – contiene"
    POINTS_OF_INTEREST ||--o{ GAME_POINTS : "1:N – referenziato da"
    POINTS_OF_INTEREST ||--o{ ENIGMA_POOL : "1:N – genera enigmi per"
    GAME_POINTS ||--o{ BLIND_CHOICE_VOTES : "1:N – votato in"
    GAME_POINTS ||--o| TEAMS : "1:1 – posizione corrente"
    TEAMS ||--o{ ENIGMA_SESSIONS : "1:N – tenta risoluzione"
    TEAMS ||--o{ BLIND_CHOICE_VOTES : "1:N – esprime voto"
    TEAMS ||--o{ GAME_EVENTS : "1:N – genera eventi"
    ENIGMA_POOL ||--o{ ENIGMA_SESSIONS : "1:N – risposte ricevute"
    ENIGMA_POOL ||--o{ ENIGMA_RATINGS : "1:N – valutato da"

    GAMES {
        uuid id PK "Identificativo univoco"
        string name "Nome della partita"
        string company_info "Info azienda per personalizzazione"
        string status "lobby | active | completed | cancelled"
        timestamp started_at "Data/ora inizio"
        timestamp completed_at "Data/ora fine"
        timestamp created_at "Data/ora creazione"
    }

    POINTS_OF_INTEREST {
        uuid id PK "Identificativo univoco"
        string name "Nome del luogo"
        string zone "Zona di Perugia"
        float latitude "Latitudine GPS"
        float longitude "Longitudine GPS"
        int activation_radius_meters "Raggio geofence (default 40m)"
        string description "Descrizione storico-culturale"
        string accessibility_notes "Note accessibilità"
    }

    TEAMS {
        uuid id PK "Identificativo univoco"
        uuid game_id FK "Riferimento al gioco"
        string name "Nome squadra"
        string color "Colore (es. #3b82f6)"
        string access_code UK "Codice accesso univoco"
        int difficulty "Livello difficoltà (1-4)"
        int score "Punteggio accumulato"
        int time_penalty_seconds "Secondi di penalità"
        uuid current_game_point_id FK "Punto corrente"
        timestamp completed_at "Data/ora completamento"
    }

    ENIGMA_POOL {
        uuid id PK "Identificativo univoco"
        uuid game_id FK "Riferimento al gioco"
        uuid point_of_interest_id FK "POI associato"
        int difficulty_level "Difficoltà (1-4)"
        string question "Domanda in italiano"
        jsonb options "Array opzioni risposta"
        string correct_answer "Risposta corretta"
        string hint "Indizio (non rivela risposta)"
        string explanation "Spiegazione culturale"
        string type "true_false | multiple_choice"
    }

    ENIGMA_SESSIONS {
        uuid id PK "Identificativo univoco"
        uuid team_id FK "Squadra"
        uuid enigma_pool_id FK "Enigma tentato"
        string status "unlocked | answered | solved | failed"
        int attempts "Numero tentativi"
        timestamp started_at "Inizio tentativo"
        timestamp completed_at "Fine tentativo"
    }

    GAME_EVENTS {
        uuid id PK "Identificativo univoco"
        uuid game_id FK "Gioco"
        uuid team_id FK "Squadra"
        string event_type "Tipo evento"
        jsonb payload "Dati evento"
        timestamp created_at "Timestamp"
    }

    BLIND_CHOICE_VOTES {
        uuid id PK "Identificativo univoco"
        uuid game_id FK "Gioco"
        uuid team_id FK "Squadra votante"
        uuid branch_point_id FK "Punto di bivio"
        string symbol "Simbolo scelto"
        timestamp created_at "Timestamp voto"
    }

    ENIGMA_RATINGS {
        uuid id PK "Identificativo univoco"
        uuid enigma_pool_id FK "Enigma valutato"
        uuid team_id FK "Squadra"
        int rating "Valutazione (1-5)"
        string comment "Commento opzionale"
        timestamp created_at "Timestamp"
    }
```

---

### 3. Activity Diagram

#### 3.1 Flusso Principale: Risposta all'Enigma (US3)

Questo diagramma modella il flusso completo dalla navigazione GPS all'avanzamento nel gioco, includendo i percorsi alternativi (risposta errata, bivio, completamento).

```mermaid
graph TD
    Start([Giocatore avvia la partita])
    Nav[Navigazione GPS su mappa]
    Geofence{Entro raggio<br/>di attivazione?}
    Unlock[Sblocca enigma<br/>Broadcast a tutta la squadra]
    Show[Mostra domanda e opzioni]
    Hint{Richiesto<br/>suggerimento?}
    GiveHint[Mostra indizio<br/>Max 2-3 per enigma]
    Answer[Giocatore invia risposta]
    Validate{Corretta?}
    Success[+10 punti<br/>-10s penalità]
    Fail[Risposta sbagliata<br/>+10s penalità]
    Branch{Rilevato<br/>bivio?}
    BlindVote[Votazione Bivio Mistico<br/>Maggioranza determina percorso]
    Advance[Avanza al prossimo punto]
    LastPoint{Ultimo<br/>punto?}
    Complete[Gioco completato<br/>Classifica finale]

    Start --> Nav
    Nav --> Geofence
    Geofence -->|No| Nav
    Geofence -->|Sì| Unlock
    Unlock --> Show
    Show --> Hint
    Hint -->|Sì| GiveHint
    GiveHint --> Show
    Hint -->|No| Answer
    Answer --> Validate
    Validate -->|Sì| Success
    Validate -->|No| Fail
    Fail --> Answer
    Success --> Branch
    Branch -->|Sì| BlindVote
    Branch -->|No| Advance
    BlindVote --> Advance
    Advance --> LastPoint
    LastPoint -->|No| Nav
    LastPoint -->|Sì| Complete
```

#### 3.2 Flusso Operatore: Creazione Gioco (US5)

```mermaid
graph TD
    A1([Operatore accede al pannello])
    A2[Clicca sulla mappa per<br/>posizionare POI]
    A3[Compila form: nome, zona,<br/>raggio, descrizione]
    A4[Salva POI su Supabase]
    A5{Creare altri<br/>POI?}
    A6[Crea nuovo gioco:<br/>nome, info azienda]
    A7[Seleziona POI per il gioco]
    A8[Avvia gioco:<br/>chiama start-game]
    A9{start-game<br/>OK?}
    A10[Gioco attivo!<br/>Mostra team e log]
    A11[Mostra errore]

    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 -->|Sì| A2
    A5 -->|No| A6
    A6 --> A7
    A7 --> A8
    A8 --> A9
    A9 -->|Sì| A10
    A9 -->|No| A11
```

---

### 4. Sequence Diagram

#### 4.1 Sequenza: Risposta Enigma (US3)

Il diagramma mostra l'interazione temporale tra i componenti di sistema quando un giocatore risponde a un enigma.

```mermaid
sequenceDiagram
    actor G as Giocatore
    participant FE as Frontend<br/>(Next.js PWA)
    participant EF as check-answer<br/>(Edge Function)
    participant DB as Supabase<br/>(PostgreSQL)
    participant RT as Supabase<br/>(Realtime)
    participant TM as Altri Membri<br/>Squadra

    Note over G,TM: Fase 1 – Sblocco Enigma

    G->>FE: Entra nel raggio geofence
    FE->>FE: turf.distance() < activation_radius
    FE->>RT: broadcast "enigma_unlocked"
    RT-->>TM: Notifica sblocco
    FE->>DB: INSERT game_events (enigma_unlocked)
    FE->>G: Mostra enigma

    Note over G,TM: Fase 2 – Risposta

    G->>FE: Seleziona risposta
    FE->>EF: POST {enigma_id, answer, team_id}
    EF->>DB: SELECT enigma_pool WHERE id = enigma_id
    DB-->>EF: {question, correct_answer, type, options}

    alt Risposta Corretta
        EF->>DB: RPC increment_score(team_id, 10)
        EF->>DB: RPC decrement_time_penalty(team_id, 10)
        EF->>DB: INSERT enigma_sessions (status: solved)
        EF->>DB: SELECT next game_point
        DB-->>EF: nextPoint (o null se ultimo)

        alt Punto Successivo è Branch
            EF-->>FE: {correct: true, blind_choice: true}
        else Punto Normale
            EF->>DB: UPDATE teams SET current_game_point_id
            EF-->>FE: {correct: true, next_point_id}
        else Ultimo Punto
            EF->>DB: UPDATE teams SET completed_at
            EF-->>FE: {correct: true, game_completed: true}
        end

        EF->>RT: broadcast "enigma_solved"
        RT-->>TM: Notifica completamento

    else Risposta Sbagliata
        EF->>DB: RPC increment_time_penalty(team_id, 10)
        EF-->>FE: {correct: false, message: "Risposta sbagliata, +10 secondi"}
    end

    FE->>G: Mostra risultato
```

#### 4.2 Sequenza: Bivio Mistico (US33)

```mermaid
sequenceDiagram
    actor G1 as Giocatore 1
    actor G2 as Giocatore 2
    participant FE as Frontend
    participant CV as cast-blind-vote<br/>(Edge Function)
    participant DB as Supabase

    Note over G1,DB: Il bivio viene rilevato da check-answer

    FE->>G1: Mostra simboli misteriosi
    FE->>G2: Mostra simboli misteriosi

    G1->>FE: Vota simbolo "Luna"
    FE->>CV: POST {game_id, team_id, branch_point_id, symbol: "Luna"}
    CV->>DB: INSERT blind_choice_votes
    CV->>DB: SELECT COUNT votes per symbol
    DB-->>CV: {Luna: 1, Sole: 0, Stella: 0}
    CV-->>FE: {waiting: true, message: "In attesa..."}

    G2->>FE: Vota simbolo "Luna"
    FE->>CV: POST {game_id, team_id, branch_point_id, symbol: "Luna"}
    CV->>DB: INSERT blind_choice_votes (UNIQUE check OK)
    CV->>DB: SELECT COUNT votes per symbol
    DB-->>CV: {Luna: 2, Sole: 0, Stella: 0}
    Note over CV: Luna ha 2/2 = 100% > 50% → RISOLTO
    CV->>DB: UPDATE teams SET current_game_point_id
    CV-->>FE: {resolved: true, symbol: "Luna", next_zone: "..."}
```

---

### 5. State Machine Diagram

#### 5.1 Stati di una Sessione Enigma (`enigma_sessions`)

```mermaid
stateDiagram-v2
    [*] --> Locked: Gioco in corso, enigma non ancora raggiunto

    state Locked {
        [*] --> WaitingGPS
        WaitingGPS --> GeofenceCheck: Aggiornamento posizione GPS
    }

    Locked --> Unlocked: Squadra entra nel geofence

    state Unlocked {
        [*] --> DisplayingQuestion
        DisplayingQuestion --> HintRequested: Giocatore clicca "Aiuto"
        HintRequested --> DisplayingQuestion: Mostra indizio
        DisplayingQuestion --> AnswerSubmitted: Giocatore invia risposta
    }

    Unlocked --> Answered: Risposta inviata

    state Answered {
        [*] --> Validating
        Validating --> Correct: check-answer: risposta giusta
        Validating --> Wrong: check-answer: risposta sbagliata
    }

    Answered --> Solved: Corretta
    Answered --> Failed: Sbagliata (nuovo tentativo possibile)

    Failed --> Answered: Nuovo tentativo

    Solved --> [*]: Passa al punto successivo

    note right of Solved
        Stato finale per questo enigma.
        La squadra avanza al prossimo
        game_point o completa il gioco.
    end note
```

#### 5.2 Stati di una Partita (`games`)

```mermaid
stateDiagram-v2
    [*] --> Lobby: Operatore crea gioco
    Lobby --> Active: Operatore avvia (start-game)
    Active --> Completed: Tutte le squadre completano
    Active --> Cancelled: Operatore annulla
    Completed --> Cleaned: Cron job GDPR (dopo 1h)
    Cancelled --> Cleaned: Cron job GDPR (dopo 1h)
    Cleaned --> [*]
```

---

### 6. Component Diagram

Il diagramma mostra l'architettura a componenti del sistema, evidenziando le dipendenze tra moduli frontend, backend e servizi esterni.

```mermaid
graph TD
    subgraph "Frontend – Next.js 15 PWA"
        direction TB
        MAP[Map Page<br/>Leaflet.js + GPS]
        ENIGMA[Enigma Page<br/>Quiz UI]
        LEADERBOARD[Leaderboard Page<br/>Classifica real-time]
        LOGIN[Login Page<br/>Accesso squadra]
        ADMIN_POI[Admin POI Page<br/>Mappa + form]
        ADMIN_GAME[Admin Game Page<br/>Creazione gioco]
        STORE[Zustand Store<br/>gameStore.ts]
        SUPABASE_CLIENT[Supabase Client<br/>supabase.ts]
    end

    subgraph "Backend – Supabase"
        direction TB
        EF_START[start-game]
        EF_ENIGMA[generate-enigma]
        EF_CHECK[check-answer]
        EF_VOTE[cast-blind-vote]
        EF_PHOTO[verify-photo]
        EF_AUDIO[generate-audio]
        EF_GPS[validate-location]
        DB[(PostgreSQL<br/>+ RLS)]
        REALTIME[Supabase Realtime<br/>WebSocket]
        STORAGE[Supabase Storage<br/>audio-guides bucket]
    end

    subgraph "Servizi Esterni"
        GROQ[Groq API<br/>Llama 3.3 70B]
        POLLINATIONS[Pollinations.ai<br/>Vision API]
        OSM[OpenStreetMap<br/>Tile Server]
    end

    MAP --> SUPABASE_CLIENT
    ENIGMA --> SUPABASE_CLIENT
    LEADERBOARD --> SUPABASE_CLIENT
    LOGIN --> SUPABASE_CLIENT
    ADMIN_POI --> SUPABASE_CLIENT
    ADMIN_GAME --> SUPABASE_CLIENT
    SUPABASE_CLIENT --> STORE

    SUPABASE_CLIENT --> DB
    SUPABASE_CLIENT --> REALTIME
    SUPABASE_CLIENT --> EF_START
    SUPABASE_CLIENT --> EF_CHECK
    SUPABASE_CLIENT --> EF_VOTE

    EF_START --> EF_ENIGMA
    EF_ENIGMA --> GROQ
    EF_CHECK --> DB
    EF_CHECK --> REALTIME
    EF_VOTE --> DB
    EF_PHOTO --> GROQ
    EF_PHOTO --> POLLINATIONS
    EF_AUDIO --> STORAGE
    EF_GPS --> DB
    MAP --> OSM
```

---

### 7. Deployment Diagram

Il diagramma mostra la distribuzione fisica dei componenti sui nodi di hosting.

```mermaid
graph TD
    subgraph "Dispositivo Giocatore"
        BROWSER[Browser Mobile<br/>Chrome/Safari/Firefox]
        SW[Service Worker<br/>Serwist PWA]
        GPS[GPS Hardware]
    end

    subgraph "Vercel Cloud"
        NEXT[Next.js 15<br/>Server + Static Assets]
    end

    subgraph "Supabase Cloud"
        PG[(PostgreSQL 15<br/>Database)]
        RT[Realtime Server<br/>WebSocket]
        ST[Storage Server<br/>File Audio]
        EF[Edge Functions<br/>Deno Runtime]
    end

    subgraph "API Esterne"
        GROQ_API[Groq API<br/>api.groq.com]
        POLL_API[Pollinations.ai<br/>gen.pollinations.ai]
        OSM_API[OpenStreetMap<br/>tile.openstreetmap.org]
    end

    BROWSER <-->|HTTPS| NEXT
    BROWSER <-->|WSS| RT
    BROWSER -->|HTTPS| OSM_API
    SW -->|Cache| BROWSER
    GPS -->|Geolocation API| BROWSER

    NEXT <-->|Data API| PG
    NEXT <-->|WebSocket| RT

    EF <-->|Service Role| PG
    EF <-->|API Key| GROQ_API
    EF -->|HTTP| POLL_API
    EF <-->|Storage API| ST
```

---

### Note di Implementazione

- Tutti i diagrammi sono realizzati in **Mermaid.js**, renderizzabili nativamente su GitHub, GitLab e qualsiasi visualizzatore Markdown compatibile.
- I diagrammi UML seguono le specifiche **UML 2.5**, adattate al contesto del progetto.
- Il caso d'uso principale scelto per Activity e Sequence Diagram è **"Risposta all'Enigma" (US3)**, in quanto rappresenta il flusso centrale dell'intera applicazione.
- L'oggetto scelto per lo State Machine Diagram è **`enigma_sessions`**, che traccia lo stato di ogni enigma per ogni squadra (dalla lobby alla risoluzione).
- Il Component Diagram evidenzia l'architettura a **microservizi** (7 Edge Function indipendenti) orchestrati dal frontend.
- Il Deployment Diagram riflette l'infrastruttura reale: **Vercel + Supabase + API esterne**.

---

*Documento redatto dal Gruppo di Lavoro Escape Room Perugia per AS GAIA.*
*Ultimo aggiornamento: 20 Maggio 2026*
