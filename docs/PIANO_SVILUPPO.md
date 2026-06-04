# Piano di Sviluppo -- Escape Room Perugia

---

## Fase 0 -- Setup (Completato)
- [x] Schema database con policy RLS
- [x] App Next.js con pagina mappa GPS
- [x] Client Supabase e variabili d'ambiente
- [x] Stub Edge Functions creati
- [x] Progettazione prompt per generazione domande (Groq)

## Fase 1 -- MVP Core (Completato)
- [x] US1  -- Tracciamento mappa GPS
- [x] US2  -- Sblocco domanda via geofence
- [x] US3  -- Validazione risposte con timer 10s e punteggio a tempo
- [x] US4  -- Classifica in tempo reale (effimera)
- [x] US10 -- Operatore: crea squadre e difficolta
- [x] US30 -- Login atmosferico
- [x] US31 -- Setup squadra con partenza casuale

## Fase 2 -- Generazione e Funzionalita Avanzate (Completato)
- [x] US6  -- Domande generate automaticamente, tutte diverse per squadra
- [x] US9  -- Sistema di indizi integrato nel prompt
- [x] US25 -- Verifica fotografica (Edge Function deployata)
- [x] US26 -- Audio-guida con cache su Supabase Storage
- [x] US32 -- 5 domande per zona
- [x] US33 -- Bivio Mistico con spareggio

## Fase 3 -- Pannello Operatore (Completato)
- [x] US5  -- Operatore crea gioco su mappa, sceglie tema domande
- [x] US13 -- Log eventi di gioco in tempo reale

## Fase 4 -- Rifinitura e Demo (Completato tranne video)
- [x] US19 -- Anti-cheat GPS (validate-location)
- [x] US22 -- Dati effimeri, nessuna persistenza post-partita
- [x] Backend verificato: tutte le 7 Edge Functions testate
- [ ] **Registrazione video demo**

---

*Piano aggiornato al 4 Giugno 2026*
