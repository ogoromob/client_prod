#!/bin/bash
###############################################################################
# test_xss.sh - Cross-Site Scripting (XSS) Security Tests
# Tests various XSS attack vectors on the TradingPool platform
###############################################################################

set -e

# Configuration
BACKEND_URL="${BACKEND_URL:-https://tradingpool-backend.onrender.com}"
ADMIN_EMAIL="sesshomaru@admin.com"
ADMIN_PASSWORD="inyasha"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

log_section() {
    echo -e "\n${BOLD}${CYAN}=========================================="
    echo -e "  $1"
    echo -e "==========================================${NC}\n"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_test() {
    echo -e "${CYAN}🧪 TEST: $1${NC}"
}

# Vérifier que jq est installé
if ! command -v jq &> /dev/null; then
    log_error "jq is not installed. Please install it: apt-get install jq"
    exit 1
fi

log_section "🔒 TRADINGPOOL XSS SECURITY TESTS"

log_info "Backend URL: $BACKEND_URL"

# Obtenir un token d'authentification admin
log_info "Authenticating as admin..."

TOKEN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    log_error "Failed to authenticate as admin"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

log_success "Authenticated successfully"
log_info "Token: ${TOKEN:0:30}..."

# Compteurs de résultats
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
VULNERABLE=0

run_test() {
    local test_name="$1"
    local expected_result="$2"  # "blocked" ou "passed"
    local curl_cmd="$3"
    
    ((TOTAL_TESTS++))
    log_test "$test_name"
    
    # Exécuter la commande
    RESPONSE=$(eval "$curl_cmd" 2>&1)
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    # Analyser la réponse
    if [ "$expected_result" == "blocked" ]; then
        # On s'attend à ce que l'attaque soit bloquée (4xx ou erreur de validation)
        if [[ "$HTTP_CODE" == "4"* ]] || echo "$BODY" | grep -qi "error\|invalid\|bad request\|validation"; then
            log_success "Attack blocked (as expected)"
            ((PASSED_TESTS++))
        else
            log_error "Attack NOT blocked! (VULNERABLE)"
            log_warning "HTTP Code: $HTTP_CODE"
            log_warning "Response: ${BODY:0:200}"
            ((FAILED_TESTS++))
            ((VULNERABLE++))
        fi
    else
        # On s'attend à ce que la requête normale passe
        if [[ "$HTTP_CODE" == "2"* ]]; then
            log_success "Normal request passed (as expected)"
            ((PASSED_TESTS++))
        else
            log_warning "Normal request failed"
            ((FAILED_TESTS++))
        fi
    fi
    
    echo ""
}

log_section "📝 Test 1: XSS in Pool Name (POST)"

run_test "XSS via <script> tag in pool name" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/admin/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"name\":\"<script>alert(\\\"XSS\\\")</script>\",\"description\":\"Test\",\"coin\":\"BTC\",\"duration\":3600,\"minDeposit\":10}'"

run_test "XSS via <img> tag with onerror" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/admin/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"name\":\"<img src=x onerror=alert(1)>\",\"description\":\"Test\",\"coin\":\"BTC\",\"duration\":3600,\"minDeposit\":10}'"

run_test "XSS via javascript: protocol" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/admin/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"name\":\"javascript:alert(1)\",\"description\":\"Test\",\"coin\":\"BTC\",\"duration\":3600,\"minDeposit\":10}'"

log_section "📝 Test 2: XSS in Pool Description"

run_test "XSS in description field" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/admin/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"name\":\"Normal Pool\",\"description\":\"<script>document.cookie</script>\",\"coin\":\"BTC\",\"duration\":3600,\"minDeposit\":10}'"

log_section "📝 Test 3: SQL Injection in Authentication"

run_test "SQL Injection via email field" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/auth/login' \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"admin@example.com' OR 1=1--\",\"password\":\"test\"}'"

run_test "SQL Injection via password field" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/auth/login' \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"test@test.com\",\"password\":\"\\\" OR 1=1--\"}'"

log_section "📝 Test 4: XSS in Query Parameters"

run_test "XSS in search query parameter" "blocked" \
  "curl -s -w '\n%{http_code}' '$BACKEND_URL/api/v1/pools?search=<script>alert(1)</script>' \
    -H 'Authorization: Bearer $TOKEN'"

run_test "XSS in query with encoded payload" "blocked" \
  "curl -s -w '\n%{http_code}' '$BACKEND_URL/api/v1/pools?search=%3Cscript%3Ealert(1)%3C/script%3E' \
    -H 'Authorization: Bearer $TOKEN'"

log_section "📝 Test 5: Path Traversal"

run_test "Path traversal to /etc/passwd" "blocked" \
  "curl -s -w '\n%{http_code}' '$BACKEND_URL/../../../etc/passwd'"

run_test "Path traversal with URL encoding" "blocked" \
  "curl -s -w '\n%{http_code}' '$BACKEND_URL/%2e%2e/%2e%2e/%2e%2e/etc/passwd'"

log_section "📝 Test 6: Command Injection"

run_test "Command injection in pool name" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/admin/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"name\":\"; ls -la; #\",\"description\":\"Test\",\"coin\":\"BTC\",\"duration\":3600,\"minDeposit\":10}'"

log_section "📝 Test 7: Header Injection"

run_test "Header injection via X-Forwarded-For" "blocked" \
  "curl -s -w '\n%{http_code}' '$BACKEND_URL/api/v1/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'X-Forwarded-For: <script>alert(1)</script>'"

log_section "📝 Test 8: NoSQL Injection (if applicable)"

run_test "NoSQL injection in email" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/auth/login' \
    -H 'Content-Type: application/json' \
    -d '{\"email\":{\"\$ne\":null},\"password\":{\"\$ne\":null}}'"

log_section "📝 Test 9: LDAP Injection"

run_test "LDAP injection in email" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/auth/login' \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"*)(uid=*))(&(uid=*\",\"password\":\"test\"}'"

log_section "📝 Test 10: XXE (XML External Entity)"

run_test "XXE injection via XML payload" "blocked" \
  "curl -s -w '\n%{http_code}' -X POST '$BACKEND_URL/api/v1/admin/pools' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/xml' \
    -d '<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]><pool><name>&xxe;</name></pool>'"

log_section "📊 FINAL RESULTS"

echo -e "${BOLD}Test Summary:${NC}"
echo -e "  Total tests: ${TOTAL_TESTS}"
echo -e "  ${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "  ${RED}Failed: ${FAILED_TESTS}${NC}"

if [ $VULNERABLE -gt 0 ]; then
    echo -e "\n${RED}${BOLD}⚠️  SECURITY ALERT: ${VULNERABLE} VULNERABILITIES DETECTED!${NC}"
    echo -e "${YELLOW}The application may be vulnerable to attacks. Please review the failed tests.${NC}"
    exit 1
else
    echo -e "\n${GREEN}${BOLD}✅ All security tests passed!${NC}"
    echo -e "${GREEN}No obvious vulnerabilities detected.${NC}"
    exit 0
fi
