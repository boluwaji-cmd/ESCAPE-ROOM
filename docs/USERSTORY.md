# User Stories — Escape Room Outdoor Perugia

**Documento:** US-001 | **Versione:** 1.0 | **Data:** 4 Giugno 2026

---

## 1. Vedo dove sono sulla mappa (US1)

**User Story:** Come giocatore, voglio vedere la mia posizione GPS su una mappa interattiva per orientarmi.

**Checklist:**
- [ ] Marker sulla posizione corrente, aggiornamento ogni 10 secondi
- [ ] Mappa centrata automaticamente
- [ ] Punti obiettivo visibili

**Nota del Progettista:** Precisione GPS degradata nel centro storico per effetto canyon. Raggio tolleranza 30-50m. watchPosition con maximumAge: 10000 per risparmio batteria.

**Labels:** ~"frontend" ~"mobile"

---

## 2. Sblocco la domanda quando arrivo nel posto giusto (US2)

**User Story:** Quando la squadra entra nell'area di attivazione (30-50m), la domanda viene sbloccata per tutti i membri simultaneamente.

**Checklist:**
- [ ] Notifica "Sei arrivato!" all'ingresso nel geofence
- [ ] Domanda visibile su tutti i dispositivi della squadra
- [ ] Broadcast enigma_unlocked su canale team-{id}

**Nota del Progettista:** Calcolo distanza con turf.distance (Haversine). Raggio configurabile in activation_radius_meters. Evento registrato in game_events.

**Labels:** ~"backend" ~"geolocalizzazione" ~"mobile"

---

## 3. Rispondo alla domanda a tempo (US3) [KEY]

**User Story:** Ho 10 secondi per rispondere a una domanda in stile Kahoot. Se sbaglio: +10 secondi di penalita e una **nuova domanda diversa**. Se rispondo correttamente: passo alla tappa successiva e ottengo **-1 secondo di bonus** sul tempo totale (massimo -5 secondi cumulativi).

**Checklist:**
- [ ] Countdown di 10 secondi visibile
- [ ] Corretta: tappa completata, -1s bonus (max -5s), avanzamento
- [ ] Sbagliata: +10s penalita, NUOVA domanda diversa
- [ ] Timeout (10s scaduti): +10s penalita, nuova domanda

**Nota del Progettista:** check-answer gestisce l'intera logica. Timer lato client con verifica server del timestamp. Nuova domanda dopo errore pescata da enigma_pool escludendo quella fallita. Bonus tappe (location_bonus) contatore in teams fino a max 5. Classifica: total_penalty_seconds - location_bonus ASC.

**Labels:** ~"backend" ~"game-logic" ~"timer"

---

## 4. Vedo la classifica a tempo (US4)

**User Story:** Voglio vedere la classifica in tempo reale basata sul tempo totale. La classifica esiste **solo durante la partita**; nessun dato viene salvato dopo.

**Checklist:**
- [ ] Classifica ordinata per tempo crescente
- [ ] Bonus tappe (-1s ciascuna, max -5s) applicato
- [ ] Dati azzerati quando l'operatore ferma la partita

**Nota del Progettista:** Ordinamento: ORDER BY (total_penalty_seconds - location_bonus) ASC. Nessuna persistenza post-partita. Supabase Realtime per aggiornamenti live.

**Labels:** ~"frontend" ~"mobile" ~"real-time"

---

## 5. Operatore: creo gioco, scelgo tema domande (US5)

**User Story:** Come operatore che gestisce l'escape room il giorno dell'evento, posiziono i punti di interesse sulla mappa con un click, scelgo il tema delle domande (**cultura generale** oppure **Perugia e Italia**), creo le squadre e avvio la partita.

**Checklist:**
- [ ] Click sulla mappa per posizionare un POI
- [ ] Selezione tema: "Cultura Generale" / "Perugia e Italia"
- [ ] Creazione squadre con codice di accesso automatico
- [ ] Pulsante avvio e stop partita
- [ ] Monitoraggio eventi in tempo reale

**Nota del Progettista:** Il tema viene salvato in games.question_theme e passato a generate-enigma. Prompt si adatta: perugia_italia include contesto locale; cultura_generale omette riferimenti geografici. Pannello progettato per uso desktop con interazione semplificata. Gestione tecnica via Supabase Dashboard (solo team sviluppo).

**Labels:** ~"frontend" ~"admin" ~"backend"

---

## 6. Domande tutte diverse per ogni squadra (US6)

**User Story:** Le domande generate per una squadra devono essere **tutte diverse** da quelle delle altre squadre.

**Checklist:**
- [ ] start-game chiama generate-enigma 5 volte per POI per ogni squadra
- [ ] Prompt include question_theme
- [ ] Nessuna domanda duplicata tra squadre

**Nota del Progettista:** Ogni chiamata a generate-enigma produce una domanda unica (seed: timestamp + team_id). Domande inserite in enigma_pool con isolamento per squadra. Groq Llama 3.3 70B con temperature 0.8 per varieta.

**Labels:** ~"backend"

---

## 7. Il GPS mi guida se mi perdo (US7)

**User Story:** Se il segnale GPS e assente, l'app mi avvisa. Se mi allontano dall'area obiettivo, il GPS mi fornisce **indicazioni per rientrare**.

**Checklist:**
- [ ] Messaggio "GPS non disponibile" se segnale assente
- [ ] Se distanza > raggio * 2: freccia direzionale verso il POI
- [ ] Mappa sempre visibile anche senza GPS

**Nota del Progettista:** locationerror handler + calcolo distanza corrente dal POI. Se distance > activation_radius * 2, frontend mostra indicatore direzionale con turf.bearing.

**Labels:** ~"frontend" ~"mobile" ~"geolocalizzazione"

---

## 8. Schermata compagni si aggiorna quando qualcuno risolve (US8)

**User Story:** Come membro del team, voglio che quando un compagno risolve la domanda, la mia schermata si aggiorni immediatamente entro 2 secondi, cosi evitiamo invii duplicati.

**Checklist:**
- [ ] Risoluzione notificata a tutti i dispositivi della squadra entro 2s
- [ ] Impossibile inviare risposte multiple per lo stesso enigma
- [ ] Stato squadra sincronizzato su tutti i dispositivi

**Nota del Progettista:** Supabase Realtime broadcast su `team-{id}` con evento `enigma_solved`. Payload: `enigma_id`, `next_point_id`, `blind_choice`. Previene race condition tra membri stessa squadra.

**Labels:** ~"backend" ~"real-time" ~"websocket"

---

## 9. Suggerimento per domanda difficile (US9)

**User Story:** Come giocatore, posso chiedere un suggerimento se l'enigma e troppo difficile (max 2-3 per tappa).

**Checklist:**
- [ ] Pulsante "Aiuto" visibile sotto la domanda
- [ ] Suggerimento orienta senza rivelare la risposta
- [ ] Limite 2-3 richieste per tappa

**Nota del Progettista:** Campo `hint` pre-generato nel prompt di `generate-enigma`. Il suggerimento deve essere vago (es. "Osserva i dettagli del monumento"). Nessuna chiamata API aggiuntiva: l'hint e gia nell'enigma.

**Labels:** ~"backend" ~"mobile"

---

## 10. Operatore: crea squadre con codice accesso (US10)

**User Story:** Come operatore, creo le squadre, assegno codici di accesso univoci e imposto la difficolta (1-4) per ciascuna.

**Checklist:**
- [ ] Creazione squadre con nome e codice univoco automatico
- [ ] Selezione difficolta per squadra (1-4)
- [ ] Codice usato per login nella schermata iniziale

**Nota del Progettista:** Tabella `teams`: `access_code` UNIQUE, `difficulty` CHECK 1-4. Il codice generato automaticamente (es. `TEAM-A1B2C3`). La difficolta determina il formato domande: true_false per 1-2, multiple_choice per 3-4.

**Labels:** ~"backend" ~"admin"

---

## 11. Ottimizzazione batteria (US11)

**User Story:** L'app consuma poca batteria: polling GPS ogni 10 secondi, cache dati, luminosita adattiva.

**Checklist:**
- [ ] watchPosition con maximumAge: 10000
- [ ] PWA Serwist cache-first per tile OSM
- [ ] Consumo dati < 5 MB/ora

**Labels:** ~"mobile" ~"performance"

---

## 12. Riprendo dopo crash (US12)

**User Story:** Se l'app crasha o chiudo il browser, alla riapertura recupero la sessione di gioco.

**Checklist:**
- [ ] Stato salvato in Zustand store (teamId, gameId, currentEnigma)
- [ ] Resync da Supabase all'avvio
- [ ] Gestione conflitto se enigma gia risolto da altro membro

**Labels:** ~"frontend" ~"mobile" ~"resilience"

---

## 13. Operatore: log eventi in tempo reale (US13)

**User Story:** Come operatore, visualizzo il log degli eventi in tempo reale per monitorare l'andamento della partita.

**Checklist:**
- [ ] Eventi registrati con timestamp (sblocco, risposta, GPS sospetto)
- [ ] Filtrabili per game_id e team_id
- [ ] Visualizzazione in tempo reale

**Nota del Progettista:** Tabella `game_events` popolata da tutte le Edge Function. Tipi evento: `enigma_unlocked`, `enigma_solved`, `location_update`, `suspicious_gps`. Payload JSON con dettagli.

**Labels:** ~"backend" ~"admin"

---

## 14. Classifica: mia squadra evidenziata (US14)

**User Story:** Nella classifica, la mia squadra e visivamente evidenziata per capire subito la nostra posizione.

**Checklist:**
- [ ] Squadra corrente con stile distinto (bg-primary text-primary-content)
- [ ] Classifica accessibile in ogni momento dal gioco

**Labels:** ~"frontend" ~"mobile" ~"gamification"

---

## 15. Classifica si aggiorna senza refresh (US15)

**User Story:** La classifica si aggiorna automaticamente via WebSocket entro 2 secondi da ogni evento, senza refresh manuale.

**Checklist:**
- [ ] Supabase Realtime `postgres_changes` su UPDATE teams
- [ ] Aggiornamento entro 2s dall'evento
- [ ] Animazione fluida, nessun refresh pagina

**Labels:** ~"frontend" ~"real-time" ~"mobile"

---

## 16. Spiegazione regole punteggio (US16) [FUTURO]

**User Story:** Come giocatore, voglio capire come funziona il sistema di punteggio. (Documentato in SRS, schermata UI non prioritaria)

**Labels:** ~"frontend" ~"documentazione"

---

## 17. Badge e titoli (US17) [FUTURO]

**User Story:** La squadra vincente riceve un riconoscimento speciale (titoli, badge). Logica backend pronta, UI non implementata.

**Labels:** ~"backend" ~"gamification"

---

## 18. Classifica finale e riepilogo (US18) [FUTURO]

**User Story:** Al termine del gioco, vedo la classifica definitiva e un riepilogo. Usa la stessa pagina leaderboard; schermata dedicata non implementata.

**Labels:** ~"frontend" ~"mobile" ~"gamification"

---

## 19. Anti-cheat GPS (US19)

**User Story:** Il sistema rileva spostamenti GPS sospetti (>50 m/s) e marca la squadra.

**Checklist:**
- [ ] Calcolo velocita con formula Haversine
- [ ] Soglia 50 m/s (180 km/h)
- [ ] Evento `suspicious_gps` registrato in game_events

**Nota del Progettista:** Edge Function `validate-location`. Distanza: `2*R*atan2(√a, √(1-a))`. Velocita: `distance/timeDelta`. Soglia alta per evitare falsi positivi da imprecisione GPS urbana.

**Labels:** ~"backend" ~"sicurezza"

---

## 20. Percorsi accessibili (US20) [FUTURO]

**User Story:** Come giocatore con mobilita ridotta, voglio percorsi senza barriere architettoniche. Richiede tile OSM accessibilita; campo `accessibility_notes` predisposto.

**Labels:** ~"frontend" ~"accessibilita"

---

## 21. Cache mappe, <5 MB/h (US21)

**User Story:** Le tile della mappa sono in cache; consumo dati inferiore a 5 MB/ora.

**Checklist:**
- [ ] PWA Serwist cache-first per tile OSM
- [ ] Cache limitata a 50 MB
- [ ] Tile disponibili offline dopo precaricamento

**Labels:** ~"mobile" ~"performance" ~"pwa"

---

## 22. Dati effimeri: nessuna persistenza (US22)

**User Story:** I dati di gioco esistono solo durante la partita; nessuna persistenza dopo lo stop dell'operatore.

**Checklist:**
- [ ] Dati azzerati a fine partita
- [ ] Classifica visibile solo durante il gioco
- [ ] Nessun dato recuperabile dopo lo stop

**Labels:** ~"backend" ~"privacy" ~"gdpr"

---

## 23. Domanda visibile offline (US23)

**User Story:** Se perdo connessione dopo aver sbloccato una domanda, posso comunque leggerla e preparare la risposta offline.

**Checklist:**
- [ ] Domanda salvata in IndexedDB allo sblocco
- [ ] Risposta sincronizzata al ripristino connessione
- [ ] Gestione conflitto se enigma gia risolto

**Labels:** ~"mobile" ~"offline" ~"pwa"

---

## 24. Voto domanda per miglioramento (US24) [FUTURO]

**User Story:** Dopo la risoluzione, posso valutare la domanda (1-5 stelle) per aiutare a migliorare la generazione futura. Tabella `enigma_ratings` creata; logica non implementata.

**Labels:** ~"backend" ~"miglioramento"

---

## 25. Foto verifica monumento (US25)

**User Story:** Scatto una foto al monumento; il sistema verifica automaticamente entro 3 secondi.

**Checklist:**
- [ ] Pulsante "Scatta Foto" apre fotocamera senza uscire dall'app
- [ ] Analisi server-side entro 3s
- [ ] Feedback chiaro (illuminazione, soggetto errato)

**Nota del Progettista:** Edge Function `verify-photo`. Immagine JPEG base64 compressa. Pollinations.ai (visione) + Groq (testuale/OCR). Prompt italiano con output JSON `{match, confidence, feedback}`.

**Labels:** ~"mobile" ~"camera" ~"frontend"

---

## 26. Audio-guida automatica (US26)

**User Story:** All'arrivo in una tappa, parte una narrazione audio (max 60s) sulla storia del luogo.

**Checklist:**
- [ ] Player audio con narrazione automatica (o pulsante Play)
- [ ] Supporto pausa, riproduzione, avanzamento
- [ ] Audio continua se dispositivo bloccato
- [ ] Durata max 60 secondi

**Nota del Progettista:** Edge Function `generate-audio`. File MP3 in bucket Supabase Storage `audio-guides`. URL firmato validita 1 ora. Cache per evitare download ripetuti.

**Labels:** ~"mobile" ~"multimedia" ~"accessibility" ~"audio"

---

## 27. Chat rapida di squadra (US27) [BACKEND PRONTO]

**User Story:** Chat testuale con emoji in tempo reale tra membri della squadra. Infrastruttura Supabase Realtime pronta; frontend non implementato.

**Labels:** ~"backend" ~"real-time" ~"frontend"

---

## 28. Scelta percorso: due strade (US28) [BACKEND PRONTO]

**User Story:** Dopo un bivio, la squadra sceglie tra percorsi diversi. Modellato in `game_points` con `is_branch` e `parent_id`; `check-answer` rileva branch. Frontend non implementato.

**Labels:** ~"backend" ~"logica-gioco"

---

## 29. Bonus -1s per ogni tappa completata (US29)

**User Story:** Ogni tappa completata riduce il mio tempo totale di **1 secondo**, fino a **-5 secondi** massimi.

**Checklist:**
- [ ] Dopo risposta corretta: location_bonus incrementato di 1
- [ ] Cap a 5 (non superabile)
- [ ] Classifica: total_penalty_seconds - location_bonus

**Nota del Progettista:** check-answer chiama RPC increment_location_bonus con CHECK location_bonus < 5. Bonus premia la costanza senza sbilanciare (max 5s vantaggio).

**Labels:** ~"backend" ~"game-logic"

---

## 30. Login atmosferico (US30)

**User Story:** La schermata di accesso immerge il giocatore nell'atmosfera del gioco: sfondo di Perugia, form centrato, animazione di una porta che si apre al login corretto.

**Checklist:**
- [ ] Sfondo Perugia ad alta risoluzione
- [ ] Form di accesso centrato con input codice squadra
- [ ] Animazione porta (scale-150 opacity-0) prima del redirect
- [ ] Validazione codice via Supabase

**Nota del Progettista:** `login/page.tsx`. Immagine Unsplash Perugia come sfondo. Card `bg-white/90 shadow-xl backdrop-blur-sm`. Input `access_code`, validazione Supabase, store Zustand popolato con teamId/gameId, redirect a `/game/map`.

**Labels:** ~"frontend" ~"mobile" ~"ux"

---

## 31. Setup squadra con partenza casuale diversa (US31)

**User Story:** Il caposquadra sceglie nome, colore e difficolta. Il sistema assegna automaticamente un **punto di partenza casuale diverso per ogni squadra**.

**Checklist:**
- [ ] Scelta nome, colore, difficolta (1-4)
- [ ] POI partenza casuale con esclusione dei gia assegnati
- [ ] Due squadre non partono mai dallo stesso POI

**Nota del Progettista:** start-game seleziona casualmente da game_points con filtro WHERE id NOT IN (SELECT current_game_point_id FROM teams WHERE game_id = ...).

**Labels:** ~"backend"

---

## 32. 5 domande per zona (US32)

**User Story:** Ogni zona del gioco richiede 5 domande generate automaticamente con difficolta variabile; completate tutte, la zona e risolta e si sblocca il percorso successivo.

**Checklist:**
- [ ] 5 domande distinte per ogni POI
- [ ] Difficolta ciclica 1-4 (i % 4 + 1)
- [ ] Chiamate `generate-enigma` in Promise.all
- [ ] Fallback placeholder se Groq non risponde

**Nota del Progettista:** `start-game` esegue 5 iterazioni per game_point. Rate limit Groq gestito con catch; placeholder "Cosa rende speciale {zona} a Perugia?" come fallback. Completamento gestito da conteggio enigma_sessions con stato solved.

**Labels:** ~"backend" ~"logica-gioco"

---

## 33. Bivio Mistico (US33)

**User Story:** Tre simboli misteriosi. La squadra vota al buio. Il simbolo con piu voti determina il percorso. Pareggio: spareggio.

**Checklist:**
- [ ] Tre simboli mostrati al bivio
- [ ] Voto al buio
- [ ] Maggioranza >50%: percorso deciso
- [ ] Pareggio: spareggio automatico

**Nota del Progettista:** cast-blind-vote: UNIQUE (game_id, team_id, branch_point_id). Conteggio voteCounts[symbol]. Se > totalVotes/2: risolto. Se totalVotes >= totalTeams senza maggioranza: tie: true, spareggio.

**Labels:** ~"backend" ~"game-logic" ~"real-time"

---

*33 User Stories complete -- vedi SRS.md per l'elenco completo con priorita*
