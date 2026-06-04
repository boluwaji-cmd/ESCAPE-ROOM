# UML Design Document
## Escape Room Outdoor -- Perugia

**Documento:** UML-001 | **Versione:** 3.1 | **Data:** 4 Giugno 2026

> **Riferimento incrociato:** I Casi d'Uso testuali completi (UC-1..UC-5) con precondizioni, flusso principale numerato e flussi alternativi sono documentati in `SRS.md` Sezione 3.4.

---

### 1. Use Case Diagrams

#### 1.1 Giocatore

```mermaid
graph TD
    Giocatore((Giocatore))
    subgraph "Sistema di Gioco"
        UC1[UC1: Visualizza mappa GPS]
        UC2[UC2: Sblocca domanda via geofence]
        UC3[UC3: Risponde a domanda a tempo]
        UC4[UC4: Visualizza classifica]
        UC6[UC6: Vota al Bivio Mistico]
        UC7[UC7: Richiede suggerimento]
        UC8[UC8: Scatta foto verifica]
        UC9[UC9: Ascolta audio-guida]
    end
    Giocatore --> UC1
    Giocatore --> UC3
    Giocatore --> UC4
    Giocatore --> UC6
    Giocatore --> UC7
    Giocatore --> UC8
    UC2 -.->|include| UC1
    UC3 -.->|include| UC2
    UC6 -.->|extend| UC3
    UC7 -.->|extend| UC3
```

#### 1.2 Operatore

```mermaid
graph TD
    Operatore((Operatore))
    subgraph "Pannello Operatore"
        AD1[AD1: Posiziona POI su mappa]
        AD2[AD2: Sceglie tema domande]
        AD3[AD3: Crea squadre]
        AD4[AD4: Avvia/Ferma partita]
        AD5[AD5: Monitora log eventi]
    end
    Operatore --> AD1
    Operatore --> AD2
    Operatore --> AD3
    Operatore --> AD4
    Operatore --> AD5
    AD4 -.->|include| AD3
```

#### 1.3 Sistema (Backend Automatico)

```mermaid
graph TD
    Sistema((Sistema))
    subgraph "Backend Automatico"
        S1[S1: Genera domande]
        S2[S2: Valida risposte + timer]
        S3[S3: Controllo anti-cheat GPS]
        S4[S4: Risoluzione Bivio Mistico]
        S5[S5: Verifica foto]
    end
    Sistema --> S1
    Sistema --> S2
    Sistema --> S3
    Sistema --> S4
    Sistema --> S5
```

---

### 2. Activity Diagram: Risposta a Domanda (US3)

```mermaid
graph TD
    Start([Giocatore arriva in area])
    Geofence{Entro raggio?}
    Unlock[Sblocca domanda - broadcast a squadra]
    Show[Mostra domanda e 4 opzioni]
    Countdown[Countdown 10 secondi]
    Answer[Giocatore seleziona risposta]
    Validate{Corretta?}
    Timeout{Tempo scaduto?}
    Success[-1s bonus - max -5s - prossima tappa]
    Fail[+10s penalita - NUOVA domanda diversa]
    Branch{Rilevato bivio?}
    BlindVote[Votazione Bivio Mistico]
    Advance[Avanza al prossimo punto]
    Complete[Gioco completato]

    Start --> Geofence
    Geofence -->|No| Start
    Geofence -->|Si| Unlock
    Unlock --> Show
    Show --> Countdown
    Countdown --> Answer
    Answer --> Timeout
    Timeout -->|Si| Fail
    Timeout -->|No| Validate
    Validate -->|No| Fail
    Validate -->|Si| Success
    Fail --> Show
    Success --> Branch
    Branch -->|Si| BlindVote
    Branch -->|No| Advance
    BlindVote --> Advance
    Advance --> Complete
```

---

### 3. Sequence Diagram: Risposta a Domanda (US3)

```mermaid
sequenceDiagram
    actor G as Giocatore
    participant FE as Frontend PWA
    participant EF as check-answer (Edge Function)
    participant DB as Supabase PostgreSQL
    participant RT as Supabase Realtime
    participant TM as Altri Membri Squadra

    G->>FE: Entra nel geofence
    FE->>RT: broadcast "enigma_unlocked"
    RT-->>TM: Notifica sblocco
    FE->>G: Mostra domanda + countdown 10s

    G->>FE: Seleziona risposta
    FE->>EF: POST {enigma_id, answer, team_id, question_started_at}
    EF->>DB: SELECT enigma_pool WHERE id = enigma_id
    DB-->>EF: {question, correct_answer, options}

    alt Risposta Corretta
        EF->>DB: RPC increment_location_bonus (max 5)
        EF->>DB: INSERT enigma_sessions (status: solved)
        EF->>DB: UPDATE teams SET current_game_point_id
        EF->>RT: broadcast "enigma_solved"
        RT-->>TM: Notifica completamento
        EF-->>FE: {correct: true, location_bonus, next_point_id}
    else Sbagliata o Timeout
        EF->>DB: RPC increment_penalty_seconds (+10s)
        EF->>DB: SELECT nuova domanda diversa
        DB-->>EF: new_enigma
        EF-->>FE: {correct: false, penalty: 10s, new_enigma}
    end
```

---

### 4. State Machine: Sessione Domanda (enigma_sessions)

```mermaid
stateDiagram-v2
    [*] --> Locked: Partita in corso
    Locked --> Unlocked: Squadra entra nel geofence
    Unlocked --> Active: Countdown 10s avviato
    Active --> Solved: Risposta corretta entro 10s
    Active --> Failed: Risposta sbagliata o timeout
    Failed --> Unlocked: Nuova domanda diversa
    Solved --> [*]: Avanza al prossimo punto
```

---

### 5. State Machine: Partita (games)

```mermaid
stateDiagram-v2
    [*] --> Lobby: Operatore crea gioco
    Lobby --> Active: Operatore avvia (start-game)
    Active --> Completed: Tutte le squadre completano
    Active --> Stopped: Operatore ferma manualmente
    Completed --> [*]: Dati azzerati
    Stopped --> [*]: Dati azzerati
```

---

### 6. Deployment Diagram

```mermaid
graph TD
    subgraph "Dispositivo Giocatore"
        BROWSER[Browser Mobile]
        SW[Service Worker Serwist]
        GPS_HW[GPS Hardware]
    end
    subgraph "Vercel Cloud"
        NEXT[Next.js 16 Server]
    end
    subgraph "Supabase Cloud"
        PG[(PostgreSQL 15)]
        RT[Realtime WebSocket]
        ST[Storage Audio]
        EF[Edge Functions Deno]
    end
    subgraph "API Esterne"
        GROQ[Groq API]
        POLL[Pollinations.ai]
        OSM[OpenStreetMap]
    end
    BROWSER <-->|HTTPS| NEXT
    BROWSER <-->|WSS| RT
    NEXT <-->|Data API| PG
    EF <-->|Service Role| PG
    EF <-->|API Key| GROQ
    EF -->|HTTP| POLL
    BROWSER -->|HTTPS| OSM
```

---

*Documento redatto dal Team Escape Room Perugia -- 4 Giugno 2026*
