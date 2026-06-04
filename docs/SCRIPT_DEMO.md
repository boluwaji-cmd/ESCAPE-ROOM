# Script Demo — Presentazione Finale
## Escape Room Outdoor — Perugia

**Documento:** DEMO-001
**Versione:** 1.0
**Data:** 4 Giugno 2026
**Durata prevista:** 8-10 minuti
**Team:** Escape Room Perugia per AS GAIA

---

### Struttura della Presentazione

| # | Sezione | Durata | Speaker |
|---|---------|--------|---------|
| 1 | Introduzione e Visione | 1 min | Project Manager |
| 2 | Architettura del Sistema | 2 min | Backend Dev |
| 3 | AI e Generazione Contenuti | 1.5 min | AI/Prompt Engineer |
| 4 | Demo Live | 3 min | Frontend Dev |
| 5 | Testing, CI/CD, Qualità | 1 min | Backend Dev |
| 6 | Conclusioni e Q&A | 1 min | Project Manager |

---

### 1. Introduzione e Visione (1 min) — Project Manager

**Slide 1: Copertina**
- Titolo: "Escape Room Outdoor — Perugia"
- Sottotitolo: "Trasforma il centro storico in un gioco a squadre interattivo"
- Logo AS GAIA + Team

**Punti da coprire:**
- Committente: AS GAIA (www.asgaia.it) — team building e turismo esperienziale
- Problema: come rendere interattiva l'esplorazione di Perugia?
- Soluzione: PWA mobile-first con GPS, domande AI-generated, classifica in tempo reale
- Target: gruppi aziendali e turisti, 3-6 persone per squadra

---

### 2. Architettura del Sistema (2 min) — Backend Dev

**Slide 2: Diagramma Architettura**
```
[PWA Giocatore] ←→ [Supabase Edge Functions] ←→ [PostgreSQL + RLS]
[Pannello Operatore] ↗     ↓        ↓        ↓
                     [Groq API] [Pollinations.ai] [OpenStreetMap]
```

**Punti da coprire:**
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, DaisyUI 5, Leaflet.js, Zustand
- **Backend:** Supabase — PostgreSQL con Row Level Security, 7 Edge Functions Deno/TypeScript, Realtime WebSocket, Storage
- **AI:** Groq API (Llama 3.3 70B Versatile) per generazione domande, Pollinations.ai per verifica foto
- **Metodologia:** Agile (Scrum), 3 Sprint, Trello + GitHub Issues + Git Flow
- **Hosting:** Vercel (frontend) + Supabase Cloud (backend), CI/CD con GitHub Actions

**Slide 3: Database Schema**
- Mostrare ERD con 9 tabelle: games, teams, points_of_interest, game_points, question_pool, question_sessions, blind_votes, team_locations, photo_verifications
- RLS abilitato su tutte le tabelle
- Dati effimeri: cancellati a fine partita

---

### 3. AI e Generazione Contenuti (1.5 min) — AI/Prompt Engineer

**Slide 4: Pipeline AI**

**Punti da coprire:**
- **generate-enigma:** Prompt engineering con `question_theme` (cultura_generale / perugia_italia)
  - JSON output validato con schema: question, options[4], correct_answer, hint
  - Fallback automatico se Groq non risponde entro 5s
  - Tutte le domande generate sono diverse tra squadre
- **verify-photo:** Pollinations.ai (visione) + Groq (testo) in parallelo
  - Timeout 3s, max 3 tentativi, approvazione senza bonus al terzo tentativo
- **check-answer:** Timer 10s, penalità +10s, bonus -1s per tappa (max -5s), nuova domanda diversa

**Slide 5: Esempio Prompt**
- Mostrare il prompt template usato per generate-enigma
- Mostrare esempio di output JSON validato
- Sottolineare: prompt injection prevention, validazione struttura

---

### 4. Demo Live (3 min) — Frontend Dev

**Slide 6: Demo Flow**

**Percorso guidato (3 minuti):**

1. **Login Atmosferico (20s)**
   - Aprire l'app su dispositivo mobile
   - Mostrare sfondo Perugia + animazione porta
   - Inserire codice accesso squadra

2. **Mappa e Navigazione (30s)**
   - Mostrare mappa Leaflet con POI markers
   - Posizione GPS in tempo reale
   - Navigazione verso il primo POI

3. **Domanda a Tempo (40s)**
   - Entrare nel geofence: la domanda si sblocca
   - Mostrare countdown 10s
   - Rispondere correttamente: bonus -1s
   - (Opzionale) Mostrare errore: penalità +10s + nuova domanda

4. **Classifica in Tempo Reale (20s)**
   - Aprire schermata classifica
   - Mostrare aggiornamento WebSocket in tempo reale
   - Squadra corrente evidenziata

5. **Pannello Operatore (30s)**
   - Switch a vista desktop
   - Mostrare creazione gioco: posizionamento POI su mappa, scelta tema
   - Avvio partita: POI casuali assegnati, timer parte
   - Monitoraggio in tempo reale: log eventi

6. **Bivio Mistico (20s)**
   - Mostrare tre simboli
   - Votazione al buio (simulata con 3 dispositivi)
   - Risultato: maggioranza decide il percorso

7. **Fine Partita (10s)**
   - Classifica finale
   - Dati azzerati (effimeri)

---

### 5. Testing, CI/CD, Qualità (1 min) — Backend Dev

**Slide 7: Qualità del Codice**

**Punti da coprire:**
- **20 unit test** con Vitest su `gameLogic.ts` (timer, penalità, bonus, ranking)
- **ESLint** flat config — 0 errori, 0 warning
- **CI/CD** su GitHub Actions: lint + test ad ogni PR e push su develop
- **Git Flow:** 9 branch, 22+ PR, feature branches → develop → main
- **Code review:** ogni PR revisionata prima del merge
- **Documentazione:** SRS (IEEE 830), RTM, UML (7 diagrammi), User Stories (33), Documentazione Tecnica, Script Demo

**Slide 8: GitHub Project Metrics**
- Mostrare GitHub Projects/Issues board
- 3 Sprint milestone completati
- 40+ issue totali, 33 user stories tracciate

---

### 6. Conclusioni e Q&A (1 min) — Project Manager

**Slide 9: Riepilogo**

**Punti da coprire:**
- **MVP funzionante:** tutte le feature core implementate e deployate
- **Architettura pulita:** separazione frontend/backend, serverless, RLS
- **AI integrata:** generazione domande contestuali, verifica foto
- **Pronto per l'uso:** deployato su Vercel + Supabase Cloud
- **Metodologia Agile:** 3 sprint, backlog tracciato, CI/CD attivo

**Aprire a domande del professore:**
- "Qual è stata la sfida più grande?" → Prompt engineering per domande in italiano di qualità
- "Come gestite la sicurezza?" → RLS su ogni tabella + dati effimeri + codici accesso
- "Come garantite che il GPS non venga falsificato?" → Anti-cheat velocità >50 m/s
- "Cosa migliorereste?" → Test E2E con Playwright, PWA offline completo

---

### Checklist Preparazione Demo

- [ ] Dispositivo mobile con GPS per la demo live
- [ ] 2-3 dispositivi aggiuntivi per mostrare multi-squadra
- [ ] Connessione internet stabile (hotspot di backup)
- [ ] Proiettore/secondo schermo per slide
- [ ] Account Supabase attivo (onenmczbncokymqishxh)
- [ ] Groq API key funzionante
- [ ] POI preconfigurati sulla mappa di Perugia
- [ ] Almeno 2 squadre pre-create per la demo
- [ ] Domande placeholder pronte (fallback se Groq non risponde)

---

### Materiali Richiesti da Modulo 9

| Materiale | Stato |
|-----------|-------|
| Slide deck (PowerPoint/PDF) | Da creare |
| Demo video registrato (5-10 min) | Da registrare |
| Repository GitHub pubblico | [github.com/boluwaji-cmd/ESCAPE-ROOM](https://github.com/boluwaji-cmd/ESCAPE-ROOM) |
| SRS completo (IEEE 830) | `docs/SRS.md` v3.1 |
| RTM (Requirements Traceability Matrix) | `docs/RTM.md` v3.0 |
| UML (7 diagrammi) | `docs/UML.md` v3.0 |
| Documentazione tecnica | `docs/DOCUMENTAZIONE_TECNICA.md` v3.0 |
| API documentation | `src/app/api-docs/page.tsx` (pagina web) |
| Backlog ordinato (GitHub Issues) | 40+ issues, 3 sprint milestones |

---

*Documento preparato dal Team Escape Room Perugia per la presentazione finale — 4 Giugno 2026*
