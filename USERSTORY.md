# User Stories — Escape Room Outdoor Perugia

**Documento:** US-001 | **Versione:** 3.0 | **Data:** 3 Giugno 2026 | **Committente:** AS GAIA | **Riferimento SRS:** SRS-001 v3.0

---

## 1. Visualizzazione della posizione GPS su mappa (US1)

**User Story:** Come giocatore, voglio vedere la mia posizione GPS su una mappa interattiva per orientarmi.

**Checklist:**
- [ ] Marker sulla posizione corrente con aggiornamento ogni 10 secondi
- [ ] Mappa centrata automaticamente sul giocatore
- [ ] Punti obiettivo visibili sulla mappa

**Nota del Progettista:** La precisione del GPS risulta degradata nel centro storico perugino a causa dell'effetto canyon urbano. Il raggio di tolleranza impostato a 30–50 m mitiga tale problematica. `watchPosition` è configurato con `maximumAge: 10000` per il risparmio energetico della batteria.

**Labels:** ~"frontend" ~"mobile"

---

## 2. Sblocco la domanda quando arrivo nel posto giusto (US2)

**User Story:** Quando la squadra entra nell'area di attivazione (30-50m), la domanda viene sbloccata per tutti i membri simultaneamente.

**Checklist:**
- [ ] Notifica "Sei arrivato!" all'ingresso nel geofence
- [ ] Domanda visibile su tutti i dispositivi della squadra
- [ ] Broadcast `enigma_unlocked` sul canale `team-{id}`

**Nota del Progettista:** Il calcolo della distanza è effettuato mediante `turf.distance` (formula di Haversine). Il raggio di attivazione è configurabile nella tabella `points_of_interest.activation_radius_meters`. Ciascun evento è registrato in `game_events`.

**Labels:** ~"backend" ~"geolocalizzazione" ~"mobile"

---

## 3. Rispondo alla domanda a tempo (US3) KEY

**User Story:** Ho 10 secondi per rispondere a una domanda in stile Kahoot. Se sbaglio: +10 secondi di penalità e una **nuova domanda diversa**. Se rispondo correttamente: passo alla tappa successiva e ottengo **-1 secondo di bonus** sul tempo totale (massimo -5 secondi cumulativi).

**Checklist:**
- [ ] Countdown di 10 secondi visibile per ogni domanda
- [ ] Risposta corretta: tappa completata, -1s bonus (max -5s), avanzamento
- [ ] Risposta sbagliata: +10s penalità, NUOVA domanda diversa
- [ ] Timeout (10s scaduti): +10s penalità, nuova domanda

**Nota del Progettista:** L'Edge Function `check-answer` gestisce l'intera logica di validazione. Il timer è implementato lato client con verifica del timestamp lato server. La nuova domanda, a seguito di un errore, è selezionata da `enigma_pool` escludendo quella già fallita. Il bonus tappe (`location_bonus`) costituisce un contatore nella tabella `teams` che si incrementa fino a un massimo di 5. La classifica è ordinata per `total_penalty_seconds - location_bonus`.

**Labels:** ~"backend" ~"game-logic" ~"timer"

---

## 4. Vedo la classifica a tempo (US4)

**User Story:** Voglio vedere la classifica in tempo reale basata sul tempo totale di gioco. La classifica esiste **solo durante la partita**; nessun dato viene salvato dopo.

**Checklist:**
- [ ] Classifica ordinata per tempo (crescente: meno tempo = primo posto)
- [ ] Bonus tappe (-1s ciascuna, max -5s) applicato al tempo
- [ ] Dati azzerati quando l'operatore ferma la partita

**Nota del Progettista:** L'ordinamento è definito come `ORDER BY (total_penalty_seconds - location_bonus) ASC`. Non è prevista alcuna persistenza: al termine della partita l'operatore attiva la procedura di pulizia. La sottoscrizione a Supabase Realtime garantisce gli aggiornamenti in tempo reale.

**Labels:** ~"frontend" ~"mobile" ~"real-time"

---

## 5. Operatore: creo gioco, scelgo tema domande (US5)

**User Story:** Come operatore che gestisce l'escape room il giorno dell'evento, posso posizionare i punti di interesse sulla mappa con un click, scegliere il tema delle domande (**cultura generale** oppure **Perugia e Italia**), creare le squadre con codici di accesso e avviare la partita quando tutti sono pronti. L'interfaccia deve essere semplice e utilizzabile da personale non tecnico.

**Checklist:**
- [ ] Click sulla mappa per posizionare un POI
- [ ] Selezione tema domande: "Cultura Generale" / "Perugia e Italia"
- [ ] Creazione squadre con codice di accesso automatico
- [ ] Pulsante per avviare e fermare la partita
- [ ] Monitoraggio eventi in tempo reale

**Nota del Progettista:** Il tema viene memorizzato nel campo `question_theme` della tabella `games` e inoltrato a `generate-enigma` come parametro. Il prompt si adatta dinamicamente: per il tema "perugia_italia" include il contesto geografico e storico locale; per "cultura_generale" omette i riferimenti geografici specifici. Il pannello operatore è progettato per un utilizzo da postazione desktop con interazione semplificata (clic sulla mappa, form laterali, pulsanti chiaramente identificabili). La gestione tecnica del sistema (database, Edge Functions) avviene tramite Supabase Dashboard, accessibile esclusivamente al team di sviluppo.

**Labels:** ~"frontend" ~"operatore" ~"backend"

---

## 6. Domande tutte diverse per ogni squadra (US6)

**User Story:** Le domande generate per una squadra devono essere **tutte diverse** da quelle delle altre squadre, anche per lo stesso POI.

**Checklist:**
- [ ] `start-game` chiama `generate-enigma` 5 volte per POI per ogni squadra
- [ ] Prompt include parametro `question_theme` (cultura_generale / perugia_italia)
- [ ] Nessuna domanda duplicata tra squadre

**Nota del Progettista:** Ciascuna chiamata a `generate-enigma` produce una domanda unica grazie al parametro `seed` (timestamp + team_id). Le domande sono inserite in `enigma_pool` con `team_id` per garantire l'isolamento tra le squadre. Il modello Groq (Llama 3.3 70B) con temperatura 0.8 assicura la varietà dei contenuti generati.

**Labels:** ~"backend"

---

## 7. Il GPS mi guida se mi perdo (US7)

**User Story:** Se il segnale GPS è assente, l'app mi avvisa. Se mi allontano dall'area obiettivo, il GPS mi fornisce **indicazioni per rientrare**.

**Checklist:**
- [ ] Messaggio "GPS non disponibile" se segnale assente
- [ ] Se distanza dal POI > raggio × 2: indicazione direzionale per rientrare
- [ ] Mappa sempre visibile anche senza GPS

**Nota del Progettista:** È implementato un gestore per l'evento `locationerror` in caso di assenza del segnale. Il calcolo della distanza corrente dal POI obiettivo determina il comportamento: qualora `distance > activation_radius * 2`, il frontend visualizza un indicatore direzionale (freccia orientata verso il POI) calcolato mediante `turf.bearing`.

**Labels:** ~"frontend" ~"mobile" ~"geolocalizzazione"

---

## 29. Bonus -1s per ogni tappa completata (US29)

**User Story:** Ogni tappa completata con successo riduce il mio tempo totale di **1 secondo**, fino a un massimo di **-5 secondi** totali.

**Checklist:**
- [ ] Dopo ogni risposta corretta: `location_bonus` incrementato di 1
- [ ] Il bonus non supera 5 (cap)
- [ ] La classifica riflette il bonus: `total_penalty_seconds - location_bonus`

**Nota del Progettista:** L'Edge Function `check-answer` invoca la RPC `increment_location_bonus(team_id)` la quale include il vincolo CHECK `location_bonus < 5`. La classifica ordina per `(total_penalty_seconds - location_bonus) ASC`. Tale bonus premia la costanza delle squadre senza sbilanciare il gioco (vantaggio massimo di 5 secondi).

**Labels:** ~"backend" ~"game-logic"

---

## 31. Setup squadra con partenza casuale diversa (US31)

**User Story:** Il caposquadra sceglie nome, colore e difficoltà. Il sistema assegna automaticamente un **punto di partenza casuale diverso per ogni squadra**.

**Checklist:**
- [ ] Scelta nome, colore, difficoltà (1-4)
- [ ] Assegnazione POI di partenza casuale con esclusione dei già assegnati
- [ ] Due squadre non partono mai dallo stesso POI

**Nota del Progettista:** L'Edge Function `start-game` seleziona casualmente da `game_points` applicando il filtro `WHERE id NOT IN (SELECT current_game_point_id FROM teams WHERE game_id = ...)`. Tale meccanismo garantisce partenze differenziate per ciascuna squadra e riduce la congestione iniziale.

**Labels:** ~"backend"

---

## 33. Bivio Mistico (US33)

**User Story:** Tre simboli misteriosi. La squadra vota al buio. Il simbolo con più voti determina il percorso successivo. In caso di pareggio: spareggio.

**Checklist:**
- [ ] Tre simboli mostrati al bivio
- [ ] Voto al buio (non si conosce la destinazione)
- [ ] Maggioranza >50%: percorso deciso
- [ ] Pareggio: spareggio automatico

**Nota del Progettista:** L'Edge Function `cast-blind-vote` implementa il vincolo UNIQUE su `(game_id, team_id, branch_point_id)`. A seguito di ciascun voto, si procede al conteggio `voteCounts[symbol]`. Qualora `voteCounts[sym] > totalVotes / 2`, il bivio si considera risolto. Nel caso in cui `totalVotes >= totalTeams` senza che sia stata raggiunta la maggioranza, si attiva la condizione `tie: true` e si procede allo spareggio.

**Labels:** ~"backend" ~"game-logic" ~"real-time"

---

*33 User Stories complete — vedi SRS.md §3.1 per l'elenco completo con priorità*
