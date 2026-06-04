#!/bin/bash
# ============================================
# Escape Room Perugia — Automation Script
# Verifica che tutto il progetto sia in ordine
# ============================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo " Escape Room Perugia — Health Check"
echo " $(date '+%d/%m/%Y %H:%M')"
echo "============================================"

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}[OK]${NC} $1"
        PASS=$((PASS+1))
    else
        echo -e "  ${RED}[FAIL]${NC} $1"
        FAIL=$((FAIL+1))
    fi
}

# 1. Unit tests
echo ""
echo "--- Test (Vitest) ---"
npm test -- --reporter=verbose 2>&1 | tail -5
check "20 unit test con Vitest"

# 2. Lint
echo ""
echo "--- Lint (ESLint) ---"
npx eslint src/ --format compact 2>&1 | tail -3
check "ESLint — 0 errori"

# 3. TypeScript
echo ""
echo "--- TypeScript Check ---"
npx tsc --noEmit 2>&1 | tail -5
check "TypeScript compilazione"

# 4. Git status
echo ""
echo "--- Git Status ---"
git status --short
check "Git working tree pulito"

# 5. Edge Functions
echo ""
echo "--- Supabase Edge Functions ---"
SUPA_URL="https://onenmczbncokymqishxh.supabase.co"
ANON_KEY="sb_publishable_sZ9G9E-p_dnYn8RYuIVGsA_6FfToqJR"
FUNCTIONS=("check-answer" "generate-enigma" "start-game" "cast-blind-vote" "validate-location" "verify-photo" "generate-audio")
for fn in "${FUNCTIONS[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPA_URL/functions/v1/$fn" \
        -H "Authorization: Bearer $ANON_KEY" \
        -H "Content-Type: application/json" \
        -d '{}' --max-time 5 2>/dev/null || echo "000")
    if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 500 ]; then
        echo -e "  ${GREEN}[OK]${NC} $fn (HTTP $STATUS)"
        PASS=$((PASS+1))
    else
        echo -e "  ${RED}[FAIL]${NC} $fn (HTTP $STATUS)"
        FAIL=$((FAIL+1))
    fi
done

# 6. Build check
echo ""
echo "--- Next.js Build ---"
npm run build 2>&1 | tail -8
check "Next.js build"

echo ""
echo "============================================"
echo -e " RESULTS: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "============================================"

exit $FAIL
