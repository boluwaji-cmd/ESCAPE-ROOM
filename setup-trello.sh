#!/bin/bash
# Configura Trello Board Agile — esegui questo script UNA volta
# Richiede API Key e Token da https://trello.com/power-ups/admin

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usa: ./setup-trello.sh TRELLO_API_KEY TRELLO_TOKEN"
  echo ""
  echo "Come ottenere le credenziali:"
  echo "1. Vai su https://trello.com/power-ups/admin"
  echo "2. Clicca 'Create a Power-Up' o vai alla sezione API Key"
  echo "3. Copia la API Key"
  echo "4. Vai su: https://trello.com/1/authorize?expiration=never&name=EscapeRoom&scope=read,write&response_type=token&key=LA_TUA_API_KEY"
  echo "5. Copia il Token"
  exit 1
fi

API_KEY="$1"
TOKEN="$2"
AUTH="key=$API_KEY&token=$TOKEN"

echo "=== 1. Creazione Board ==="
BOARD=$(curl -s -X POST "https://api.trello.com/1/boards/?$AUTH&name=Escape%20Room%20Outdoor%20Perugia&defaultLists=false" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
if [ -z "$BOARD" ]; then
  echo "❌ Errore creazione board. Verifica API Key e Token."
  exit 1
fi
echo "✅ Board creata: $BOARD"
echo "   URL: https://trello.com/b/$BOARD"

echo ""
echo "=== 2. Creazione Liste ==="
BACKLOG=$(curl -s -X POST "https://api.trello.com/1/lists?$AUTH&name=Backlog&idBoard=$BOARD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
TODO=$(curl -s -X POST "https://api.trello.com/1/lists?$AUTH&name=To%20Do&idBoard=$BOARD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
INPROGRESS=$(curl -s -X POST "https://api.trello.com/1/lists?$AUTH&name=In%20Progress&idBoard=$BOARD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
REVIEW=$(curl -s -X POST "https://api.trello.com/1/lists?$AUTH&name=Review&idBoard=$BOARD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
DONE=$(curl -s -X POST "https://api.trello.com/1/lists?$AUTH&name=Done&idBoard=$BOARD" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
echo "✅ 5 liste create: Backlog → To Do → In Progress → Review → Done"

echo ""
echo "=== 3. Creazione Card (33 User Stories) ==="

card() {
  local list=$1 title=$2 desc=$3 label=$4
  curl -s -X POST "https://api.trello.com/1/cards?$AUTH&idList=$list&name=$title&desc=$desc" > /dev/null
}

# Must Have (M) — vanno in Done o In Progress
card "$DONE" "[US1] Mappa GPS — M — Valentin" "Giocatore: vedere posizione GPS su mappa interattiva.\nChecklist: marker, centratura, cerchi POI." "frontend"
card "$DONE" "[US3] Domanda a tempo — M — Valentin" "Giocatore: rispondere entro 10 secondi.\nTimer countdown, +10s penalità, nuova domanda se sbagli." "frontend"
card "$DONE" "[US6] Generazione AI enigmi — M — Boluwaji ✅" "Operatore: domande generate automaticamente, tutte diverse.\nGroq Llama 3.3 70B, JSON validato." "backend"
card "$DONE" "[US22] Classifica effimera GDPR — M — Boluwaji ✅" "Dati cancellati dopo 1 ora. Funzione cleanup_old_games()." "backend"
card "$DONE" "[US30] Login atmosferico — M — Valentin" "Giocatore: inserire codice squadra, sfondo Perugia, animazione." "frontend"
card "$DONE" "[US31] Partenza casuale — M — Boluwaji ✅" "Ogni squadra parte da POI diverso, assegnato casualmente." "backend"

card "$TODO" "[US2] Sblocco enigma via geofence — M — Valentin" "Quando squadra entra nel raggio (30-50m), domanda sbloccata.\nCalcolo turf.distance()." "frontend"
card "$TODO" "[US4] Classifica in tempo reale — M — Valentin" "Classifica ordinata per tempo, aggiornamento WebSocket.\nSquadra corrente evidenziata." "frontend"
card "$TODO" "[US5] Pannello operatore — M — Vitaly" "Operatore: posizionare POI, scegliere tema, creare squadre, avviare partita.\nWizard a step, semplice." "admin"
card "$TODO" "[US8] Broadcast aggiornamento squadra — M — Valentin" "Se un membro risolve, tutti i dispositivi si aggiornano entro 2s.\nSupabase Realtime." "frontend"
card "$TODO" "[US10] Creazione squadre — M — Vitaly" "Operatore: creare squadre con codice univoco e difficoltà 1-4." "admin"
card "$TODO" "[US14] Classifica evidenzia squadra — M — Valentin" "La propria squadra evidenziata nella classifica." "frontend"
card "$TODO" "[US15] Classifica WebSocket no refresh — M — Valentin" "Aggiornamento via WebSocket entro 2s da ogni evento." "frontend"
card "$TODO" "[US28] Bivio Mistico — M — Boluwaji ✅" "Tre simboli, votazione al buio, maggioranza decide percorso." "backend"
card "$TODO" "[US32] 5 enigmi per zona — M — Boluwaji ✅" "Generazione automatica di 5 domande per ogni POI." "backend"
card "$TODO" "[US33] Bivio spareggio — M — Boluwaji ✅" "Cast blind vote con spareggio in caso di pareggio." "backend"

# Should Have (S)
card "$TODO" "[US7] GPS recovery — S — Valentin" "Se GPS assente: messaggio. Se lontano: freccia per rientrare.\nturf.bearing()." "frontend"
card "$TODO" "[US9] Pulsante suggerimento — S — Valentin" "Mostra hint senza rivelare risposta (max 2-3 per tappa)." "frontend"
card "$TODO" "[US13] Log eventi in tempo reale — S — Vitaly" "Operatore: vedere log eventi durante la partita.\nTabella game_events." "admin"
card "$TODO" "[US19] Anti-cheat GPS — S — Boluwaji ✅" "Rilevamento velocità >50 m/s (Haversine)." "backend"
card "$TODO" "[US25] Verifica foto — S — Valentin" "Scatto foto al monumento, AI verifica (Pollinations.ai)." "frontend"
card "$TODO" "[US29] Bonus -1s per tappa — S — Boluwaji ✅" "Location bonus: -1s per tappa, max -5s cumulativi." "backend"

# Could Have (C)
card "$BACKLOG" "[US11] Risparmio batteria — C — Valentin" "Polling GPS ogni 10s, cache. Priorità bassa." "frontend"
card "$BACKLOG" "[US21] Cache mappe offline — C — Valentin" "PWA Serwist cache-first tile OSM." "frontend"
card "$BACKLOG" "[US23] Domanda offline dopo sblocco — C — Valentin" "PWA + IndexedDB per domande offline." "frontend"
card "$BACKLOG" "[US26] Audioguida automatica — C — Valentin" "All'arrivo, audio narrazione sulla storia del luogo.\nEdge Function generate-audio." "frontend"
card "$BACKLOG" "[US27] Chat rapida squadra — C — Valentin" "Chat WebSocket per coordinarsi (messaggi cancellati a fine partita)." "frontend"

# Won't (W)
card "$BACKLOG" "[US16] Schermata regole — W" "Previsto per iterazioni future." ""
card "$BACKLOG" "[US17] Badge e titoli — W" "Previsto per iterazioni future." ""
card "$BACKLOG" "[US18] Schermata finale — W" "Previsto per iterazioni future." ""
card "$BACKLOG" "[US20] Percorsi accessibili — W" "Previsto per iterazioni future." ""
card "$BACKLOG" "[US24] Votazione domande — W" "Previsto per iterazioni future." ""

echo "✅ 33 card create"

echo ""
echo "=== FATTO! ==="
echo "Board: https://trello.com/b/$BOARD"
echo "Liste: Backlog | To Do | In Progress | Review | Done"
echo "Card: 33 (6 Done, 15 To Do, 5 Backlog)"
