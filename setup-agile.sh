#!/bin/bash
# Configura Agile/Scrum su GitHub — esegui questo script UNA volta
# Richiede GitHub CLI: https://cli.github.com

REPO="boluwaji-cmd/ESCAPE-ROOM"

echo "=== 1. Login a GitHub ==="
gh auth login

echo "=== 2. Creazione Label ==="
# Priorità MoSCoW
gh label create "M — Must Have" --color e74c3c --repo $REPO
gh label create "S — Should Have" --color f39c12 --repo $REPO
gh label create "C — Could Have" --color f1c40f --repo $REPO
gh label create "W — Won't" --color 95a5a6 --repo $REPO
# Ruoli
gh label create "frontend" --color 3498db --repo $REPO
gh label create "backend" --color 2ecc71 --repo $REPO
gh label create "admin" --color 9b59b6 --repo $REPO
gh label create "documentation" --color 1abc9c --repo $REPO
echo "✅ Label create"

echo "=== 3. Creazione Milestone ==="
gh api repos/$REPO/milestones -f title="Sprint 1 — Setup & Core" -f state="closed" -f description="Setup progetto, database, prime 3 Edge Functions" --silent
gh api repos/$REPO/milestones -f title="Sprint 2 — Frontend & Admin" -f state="open" -f description="Pagine giocatore, pannello operatore, integrazione" --silent
gh api repos/$REPO/milestones -f title="Sprint 3 — Demo & Consegna" -f state="open" -f description="Demo video, documentazione finale, presentazione" --silent
echo "✅ Milestone creati"

echo "=== 4. Creazione Issue di esempio ==="
gh issue create --repo $REPO --title "[US1] Mappa GPS interattiva" --body "**Come** giocatore, **voglio** vedere la mia posizione GPS su una mappa interattiva **per** orientarmi.

**Priorità:** M (Must Have)
**Sprint:** Sprint 1
**Checklist:**
- [ ] Marker posizione corrente
- [ ] Mappa centrata sul giocatore
- [ ] POI visibili come cerchi" --label "M — Must Have,frontend" --milestone "Sprint 1 — Setup & Core"

gh issue create --repo $REPO --title "[US3] Domanda a tempo con timer 10s" --body "**Come** giocatore, **voglio** rispondere a domande entro 10 secondi **per** competere.

**Priorità:** M (Must Have)
**Sprint:** Sprint 1
**Checklist:**
- [ ] Timer countdown 10s
- [ ] Risposta errata = +10s + nuova domanda
- [ ] Risposta corretta = -1s bonus" --label "M — Must Have,frontend,backend" --milestone "Sprint 1 — Setup & Core"

gh issue create --repo $REPO --title "[US5] Pannello operatore — creazione gioco" --body "**Come** operatore, **voglio** posizionare POI, scegliere tema, creare squadre e avviare la partita **per** gestire l'evento.

**Priorità:** M (Must Have)
**Sprint:** Sprint 2
**Checklist:**
- [ ] Wizard creazione gioco a step
- [ ] Selezione POI con checkbox
- [ ] Generazione codici squadra" --label "M — Must Have,admin" --milestone "Sprint 2 — Frontend & Admin"

gh issue create --repo $REPO --title "[US6] Generazione automatica enigmi con AI" --body "**Come** operatore, **voglio** che le domande siano generate automaticamente e siano tutte diverse **per** offrire un'esperienza unica.

**Priorità:** M (Must Have)
**Sprint:** Sprint 1
**Checklist:**
- [ ] Prompt Groq in italiano
- [ ] JSON validato
- [ ] 5 domande per POI
- [ ] Domande diverse per squadra" --label "M — Must Have,backend" --milestone "Sprint 1 — Setup & Core"

gh issue create --repo $REPO --title "[US22] Classifica effimera — GDPR" --body "**Come** sistema, **devo** cancellare tutti i dati dopo la partita **per** rispettare il GDPR.

**Priorità:** M (Must Have)
**Sprint:** Sprint 1
**Checklist:**
- [ ] Dati azzerati dopo 1 ora
- [ ] Funzione cleanup_old_games
- [ ] Nessun dato salvato dopo la partita" --label "M — Must Have,backend" --milestone "Sprint 1 — Setup & Core"
echo "✅ 5 Issue create"

echo "=== 5. Branch Protection ==="
gh api repos/$REPO/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["Build & Lint"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  --silent 2>/dev/null && echo "✅ Branch protection attiva" || echo "⚠️ Branch protection richiede account Pro — saltato"

echo ""
echo "=== FATTO! ==="
echo "Label: 8 create"
echo "Milestone: 3 creati"
echo "Issue: 5 create"
echo "Board: https://github.com/boluwaji-cmd/ESCAPE-ROOM/projects"
echo ""
echo "Per il Project Board: vai su GitHub > Projects > New Project > Board"
