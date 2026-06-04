# Guida Content & PM — Giacomo

## Flusso di lavoro Agile su GitHub

Il progetto è già configurato con metodologia Agile/Scrum su GitHub:
- https://github.com/boluwaji-cmd/ESCAPE-ROOM/issues — 5 issue create
- Label: M/S/C/W + frontend/backend/admin/documentation
- Milestone: Sprint 1 (chiuso), Sprint 2 (in corso), Sprint 3 (futuro)
- PR template attivo

**Cosa fare ogni giorno da PM:**
1. Controlla lo stato delle issue aperte
2. Verifica che ognuno abbia le issue assegnate
3. Sposta le issue nelle colonne giuste del Project Board
4. Chiedi aggiornamenti se una issue è ferma
5. Quando una PR viene mergiata, chiudi la issue collegata

**Cosa dire ai compagni:**
- "Ogni giorno: prendi una issue, crea un branch, lavora, apri PR"
- "Prima di fare merge: i test CI devono passare"
- "Scrivi commit chiari in italiano"

---

## Ruolo 1: Curatore Contenuti

### POI nel database (39 totali)

**Perugia Centro (10):** Fontana Maggiore, Cattedrale San Lorenzo, Rocca Paolina, Pozzo Etrusco, Arco Etrusco, Via dei Priori, Porta Sole, Giardini Carducci, Parco della Pescaia, Scale Mobili della Rocca

**Umbria (12):** Assisi (Basilica San Francesco, Tempio Minerva), Orvieto (Duomo, Pozzo San Patrizio), Cascata delle Marmore, Castelluccio di Norcia, Lago Trasimeno, Gubbio, Spoleto, Spello, Todi, Bevagna

**Italia (17):** Roma (Colosseo, Fontana Trevi), Venezia, Milano (Duomo), Pisa, Firenze (Ponte Vecchio), Torino, Napoli, Castel del Monte, Alberobello, Valle dei Templi, Matera, Cinque Terre, Costa Smeralda, Taormina, Pompei

### Cosa fare

1. Scegli 5 posti a Perugia centro per la demo (consiglio: Fontana Maggiore, Pozzo Etrusco, Rocca Paolina, Arco Etrusco, Cattedrale San Lorenzo)
2. Verifica coordinate su Google Maps: cerca il posto e confronta lat/lng
3. Prepara 2 frasi per ogni posto (da dire durante la demo)
4. Le domande sono generate automaticamente dall'AI — NON devi scriverle tu
5. Per vedere il database: https://supabase.com/dashboard/project/onenmczbncokymqishxh (tabella `points_of_interest`)

### Come spiegare la generazione domande al prof

- Tema scelto dall'operatore: "Perugia e Italia" o "Cultura Generale"
- `start-game` chiama `generate-enigma` 5 volte per POI
- Groq (AI — Llama 3.3 70B) genera domande in italiano
- Difficolta 1-2: vero/falso. Difficolta 3-4: scelta multipla
- Ogni squadra riceve domande DIVERSE

---

## Ruolo 2: Project Manager

### Trello Board

Vai su https://trello.com, crea board **"Escape Room Outdoor Perugia"**

Colonne: `Backlog | Da Fare | In Corso | Revisione | Fatto`

33 card (da `USERSTORY.md`). Formato: `US1 - Mappa GPS - M - Valentin`

Assegnazioni:
- Valentin (16): US1, US2, US3, US4, US7, US8, US11, US12, US14, US15, US21, US23, US25, US26, US27, US30
- Vitaly (3): US5, US10, US13
- Boluwaji (14): US6, US9, US16, US17, US18, US19, US20, US22, US24, US28, US29, US31, US32, US33 → **tutte in Done**

### Coordinamento

1. Invia `GUIDA_VALENTIN_FRONTEND.md` a Valentin
2. Invia `GUIDA_VITALY_ADMIN.md` a Vitaly
3. Invia `FRONTEND_GUIDE.md` a entrambi (spiega i dettagli tecnici delle funzioni)
4. Repo GitHub: https://github.com/boluwaji-cmd/ESCAPE-ROOM
5. Ognuno crea un branch: `git checkout -b feature/frontend` e `git checkout -b feature/admin-panel`
6. Call di allineamento 15 minuti su WhatsApp/Zoom
7. Ogni 2 giorni: chiedi a che punto sono

### Demo Video (5 minuti)

1. Admin: crea gioco, aggiunge squadre, AVVIA
2. Login: giocatore inserisce codice, entra
3. Mappa: giocatore si muove, entra nel cerchio
4. Domanda: timer 10s, risposta
5. Classifica: aggiornamento in tempo reale

### Presentazione esame (10-15 min)

| Min | Cosa | Chi |
|-----|------|-----|
| 1 | Team e ruoli | Giacomo |
| 1 | Problema: AS GAIA vuole team building | Giacomo |
| 2 | Soluzione: escape room outdoor con AI | Giacomo |
| 5 | VIDEO DEMO | Tutti |
| 2 | Architettura e AI | Boluwaji |
| 1 | Metodologia Agile/Scrum | Giacomo |
| 1 | Test, CI/CD, qualita | Boluwaji |
| resto | Domande prof | Tutti |

### Punti chiave per il prof

- **IEEE 830** — SRS completo, 33 user story con priorita MoSCoW
- **UML** — 7 diagrammi: Use Case, Classi, Activity, Sequence, State Machine, Component, Deployment
- **RTM** — Matrice di tracciamento: ogni requisito collegato a design e test
- **CI/CD** — GitHub Actions esegue lint + test automatici su ogni Pull Request
- **26 test** — Tutti passati con Vitest (file `test-results.txt` come prova)
- **GDPR** — `cleanup_old_games()` cancella tutto automaticamente dopo 1 ora
- **€0 budget** — Groq (free), Pollinations.ai (free), Google TTS (free), Supabase (free tier)
- **AI Prompt Engineering** — Anti-allucinazione, JSON forzato, difficulty scaling 4 livelli
- **7 Edge Functions** — 671 righe di TypeScript/Deno, tutte deployate e attive
- **Backend 100%** — 11 tabelle, 20 RLS policy, 7 stored procedure

---

## Documenti

| Documento | Contenuto |
|-----------|--------------|
| `SRS.md` | Requisiti (IEEE 830, 33 user story) |
| `RTM.md` | Tracciamento requisiti → design → test |
| `UML.md` | 7 diagrammi UML |
| `USERSTORY.md` | 33 user story con checklist |
| `SPECIFICA_CLIENTE.md` | Richieste AS GAIA |
| `AGILE_GUIDE.md` | Metodologia Agile (B1) |
| `PIANO_SVILUPPO.md` | 5 fasi incrementali |
| `DOCUMENTAZIONE_TECNICA.md` | Architettura e stack |
| `README.md` | Panoramica GitHub |
| `FRONTEND_GUIDE.md` | Dettagli Edge Functions |
| `test-results.txt` | 26 test passati |

I documenti sono gia scritti. Devi conoscerli per presentarli.
Non modificarli senza dirmelo — sono allineati (v3.0, 3 Giugno 2026).

---

## Cosa dire se il prof fa domande

- **"Come generate le domande?"** → Groq API con modello Llama 3.3 70B. Prompt in italiano, output JSON validato. Anti-allucinazione: se il JSON non e valido, puliamo il markdown e riproviamo. Se ancora fallisce, enigma placeholder.
- **"Come gestite la sicurezza?"** → Row Level Security su PostgreSQL: ogni squadra vede solo i suoi dati. 20 policy RLS. Dati cancellati dopo 1 ora (GDPR).
- **"Come funziona la classifica in tempo reale?"** → Supabase Realtime (WebSocket). La tabella `teams` emette eventi UPDATE. Il frontend si sottoscrive e aggiorna senza refresh.
- **"Come avete testato?"** → 26 unit test con Vitest sulle funzioni pure di gameLogic (`isAnswerCorrect`, `isTimedOut`, `incrementLocationBonus`, `rankTeams`, ecc.). CI/CD su GitHub Actions.
- **"Quanto costa?"** → €0. Groq tier gratuito, Pollinations.ai gratuito, Google TTS non ufficiale, Supabase tier gratuito. Architettura pronta per scalare a API a pagamento (OpenAI, Google Cloud) se serve.
- **"Cosa fa l'anti-cheat GPS?"** → Formula Haversine: calcola velocita tra due punti GPS. Se >50 m/s (180 km/h) → movimento sospetto. Registrato in `game_events`.

---

## Ordine priorita

1. Trello board (30 min)
2. Invia guide a Valentin e Vitaly
3. Scegli 5 POI demo, verifica coordinate
4. Leggi SRS, RTM, UML
5. Call team
6. Video demo
7. Presentazione esame

## Da non fare

- Non scrivere domande (AI)
- Non toccare codice
- Non modificare documenti senza coordinarti
