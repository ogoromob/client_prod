#!/bin/bash
###############################################################################
# security_audit.sh - Comprehensive Security Audit
# Performs npm audit, dependency analysis, and vulnerability scanning
###############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/security_reports"

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

# Créer le dossier de sortie
mkdir -p "$OUTPUT_DIR"

log_section "🔒 TRADINGPOOL SECURITY AUDIT"

log_info "Output directory: $OUTPUT_DIR"
log_info "Working directory: $SCRIPT_DIR"

# Test 1: npm audit
log_section "📦 Test 1: npm audit"

log_info "Running npm audit..."

npm audit --json > "$OUTPUT_DIR/npm_audit_raw.json" 2>&1 || true

if [ -f "$OUTPUT_DIR/npm_audit_raw.json" ]; then
    # Extraire les statistiques
    TOTAL_VULNERABILITIES=$(jq -r '.metadata.vulnerabilities.total // 0' "$OUTPUT_DIR/npm_audit_raw.json")
    INFO_VULNS=$(jq -r '.metadata.vulnerabilities.info // 0' "$OUTPUT_DIR/npm_audit_raw.json")
    LOW_VULNS=$(jq -r '.metadata.vulnerabilities.low // 0' "$OUTPUT_DIR/npm_audit_raw.json")
    MODERATE_VULNS=$(jq -r '.metadata.vulnerabilities.moderate // 0' "$OUTPUT_DIR/npm_audit_raw.json")
    HIGH_VULNS=$(jq -r '.metadata.vulnerabilities.high // 0' "$OUTPUT_DIR/npm_audit_raw.json")
    CRITICAL_VULNS=$(jq -r '.metadata.vulnerabilities.critical // 0' "$OUTPUT_DIR/npm_audit_raw.json")
    
    log_info "Vulnerability Summary:"
    echo -e "  Total: $TOTAL_VULNERABILITIES"
    echo -e "  ${CYAN}Info: $INFO_VULNS${NC}"
    echo -e "  ${BLUE}Low: $LOW_VULNS${NC}"
    echo -e "  ${YELLOW}Moderate: $MODERATE_VULNS${NC}"
    echo -e "  ${RED}High: $HIGH_VULNS${NC}"
    echo -e "  ${BOLD}${RED}Critical: $CRITICAL_VULNS${NC}"
    
    # Générer un rapport lisible
    cat > "$OUTPUT_DIR/npm_audit_summary.txt" << EOF
NPM AUDIT SUMMARY
Generated: $(date)

VULNERABILITY COUNTS:
  Total: $TOTAL_VULNERABILITIES
  Info: $INFO_VULNS
  Low: $LOW_VULNS
  Moderate: $MODERATE_VULNS
  High: $HIGH_VULNS
  Critical: $CRITICAL_VULNS

DETAILS:
EOF
    
    # Ajouter les détails des vulnérabilités
    jq -r '.vulnerabilities | to_entries[] | "\n[\(.value.severity | ascii_upcase)] \(.key)\n  Via: \(.value.via[0].name // "N/A")\n  Range: \(.value.range // "N/A")\n  Fix: \(.value.fixAvailable.name // "none")"' \
      "$OUTPUT_DIR/npm_audit_raw.json" >> "$OUTPUT_DIR/npm_audit_summary.txt" 2>/dev/null || true
    
    log_success "npm audit completed"
    log_info "Full report: $OUTPUT_DIR/npm_audit_raw.json"
    log_info "Summary: $OUTPUT_DIR/npm_audit_summary.txt"
    
    if [ "$CRITICAL_VULNS" -gt 0 ] || [ "$HIGH_VULNS" -gt 0 ]; then
        log_error "$CRITICAL_VULNS critical and $HIGH_VULNS high vulnerabilities found!"
    elif [ "$MODERATE_VULNS" -gt 0 ]; then
        log_warning "$MODERATE_VULNS moderate vulnerabilities found"
    else
        log_success "No critical or high vulnerabilities"
    fi
else
    log_error "npm audit failed to generate output"
fi

# Test 2: Packages obsolètes
log_section "📦 Test 2: Outdated Packages"

log_info "Checking for outdated packages..."

npm outdated --json > "$OUTPUT_DIR/outdated_packages.json" 2>&1 || true

if [ -f "$OUTPUT_DIR/outdated_packages.json" ] && [ -s "$OUTPUT_DIR/outdated_packages.json" ]; then
    OUTDATED_COUNT=$(jq 'keys | length' "$OUTPUT_DIR/outdated_packages.json")
    
    log_info "Found $OUTDATED_COUNT outdated packages"
    
    # Top 10 packages obsolètes
    echo -e "\nTop 10 outdated packages:"
    jq -r 'to_entries | sort_by(.value.current) | reverse | .[:10] | .[] | "  \(.key): \(.value.current) → \(.value.latest)"' \
      "$OUTPUT_DIR/outdated_packages.json" 2>/dev/null || echo "  (Unable to parse)"
    
    log_success "Outdated packages report saved"
else
    log_success "All packages are up to date!"
fi

# Test 3: Analyse des dépendances
log_section "📦 Test 3: Dependency Analysis"

log_info "Analyzing dependency tree..."

npm list --all --json > "$OUTPUT_DIR/dependency_tree.json" 2>&1 || true

if [ -f "$OUTPUT_DIR/dependency_tree.json" ]; then
    TOTAL_DEPS=$(jq '[.. | .dependencies? | select(. != null) | keys[]] | unique | length' "$OUTPUT_DIR/dependency_tree.json" 2>/dev/null || echo "0")
    
    log_info "Total unique dependencies: $TOTAL_DEPS"
    
    # Lister les dépendances directes
    echo -e "\nDirect dependencies:"
    jq -r '.dependencies | keys[]' "$OUTPUT_DIR/dependency_tree.json" 2>/dev/null | head -20 | while read dep; do
        echo "  - $dep"
    done
    
    log_success "Dependency tree saved"
fi

# Test 4: Recherche de secrets dans le code
log_section "🔍 Test 4: Secret Detection"

log_info "Scanning for potential secrets in code..."

SECRET_PATTERNS=(
    "password.*=.*['\"][^'\"]*['\"]"
    "api[_-]?key.*=.*['\"][^'\"]*['\"]"
    "secret.*=.*['\"][^'\"]*['\"]"
    "token.*=.*['\"][^'\"]*['\"]"
    "private[_-]?key"
    "access[_-]?token"
)

SECRETS_FOUND=0

for pattern in "${SECRET_PATTERNS[@]}"; do
    matches=$(grep -rn -i -E "$pattern" "$SCRIPT_DIR/src" 2>/dev/null | grep -v "node_modules" | wc -l)
    if [ "$matches" -gt 0 ]; then
        log_warning "Found $matches potential matches for pattern: $pattern"
        ((SECRETS_FOUND+=matches))
    fi
done

if [ "$SECRETS_FOUND" -eq 0 ]; then
    log_success "No obvious secrets found in source code"
else
    log_warning "$SECRETS_FOUND potential secrets found - review manually"
fi

# Test 5: Vérification des permissions de fichiers
log_section "🔐 Test 5: File Permissions"

log_info "Checking file permissions..."

SUSPICIOUS_PERMS=$(find "$SCRIPT_DIR" -type f \( -perm -002 -o -perm -020 \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | wc -l)

if [ "$SUSPICIOUS_PERMS" -eq 0 ]; then
    log_success "No suspicious file permissions found"
else
    log_warning "Found $SUSPICIOUS_PERMS files with world or group write permissions"
    find "$SCRIPT_DIR" -type f \( -perm -002 -o -perm -020 \) ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | head -10
fi

# Test 6: Vérification des variables d'environnement
log_section "🌍 Test 6: Environment Variables"

log_info "Checking for hardcoded environment variables..."

ENV_HARDCODED=$(grep -rn "process\.env\." "$SCRIPT_DIR/src" 2>/dev/null | grep -v "node_modules" | wc -l)

log_info "Found $ENV_HARDCODED references to process.env"

if [ "$ENV_HARDCODED" -gt 0 ]; then
    log_info "Top environment variables used:"
    grep -rh "process\.env\." "$SCRIPT_DIR/src" 2>/dev/null | \
      grep -v "node_modules" | \
      sed -E 's/.*process\.env\.([A-Z_]+).*/\1/' | \
      sort | uniq -c | sort -rn | head -10
fi

# Test 7: Package.json analysis
log_section "📄 Test 7: package.json Analysis"

log_info "Analyzing package.json..."

if [ -f "$SCRIPT_DIR/package.json" ]; then
    # Scripts potentiellement dangereux
    POSTINSTALL_SCRIPT=$(jq -r '.scripts.postinstall // empty' "$SCRIPT_DIR/package.json")
    
    if [ -n "$POSTINSTALL_SCRIPT" ]; then
        log_warning "postinstall script found: $POSTINSTALL_SCRIPT"
        log_warning "Review this script carefully for malicious code"
    else
        log_success "No postinstall script found"
    fi
    
    # Vérifier les protocoles Git
    GIT_DEPS=$(jq -r '.dependencies, .devDependencies | to_entries[] | select(.value | startswith("git")) | "\(.key): \(.value)"' "$SCRIPT_DIR/package.json" 2>/dev/null)
    
    if [ -n "$GIT_DEPS" ]; then
        log_warning "Git dependencies found (potential security risk):"
        echo "$GIT_DEPS"
    else
        log_success "No Git dependencies found"
    fi
fi

# Test 8: Génération du rapport final
log_section "📊 GENERATING FINAL REPORT"

REPORT_FILE="$OUTPUT_DIR/security_audit_report_$(date +%Y%m%d_%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# 🔒 TradingPool Frontend - Security Audit Report

**Generated:** $(date)

## 📊 Summary

### npm Vulnerabilities
- **Total:** $TOTAL_VULNERABILITIES
- **Critical:** $CRITICAL_VULNS
- **High:** $HIGH_VULNS
- **Moderate:** $MODERATE_VULNS
- **Low:** $LOW_VULNS
- **Info:** $INFO_VULNS

### Outdated Packages
- **Count:** ${OUTDATED_COUNT:-0}

### Dependencies
- **Total Unique:** ${TOTAL_DEPS:-0}

### Potential Secrets
- **Found:** $SECRETS_FOUND

### File Permissions
- **Suspicious:** $SUSPICIOUS_PERMS

## 📋 Detailed Findings

### 1. npm audit Results
$(cat "$OUTPUT_DIR/npm_audit_summary.txt" 2>/dev/null || echo "No data available")

### 2. Outdated Packages
\`\`\`
$(jq -r 'to_entries | .[] | "\(.key): \(.value.current) → \(.value.latest)"' "$OUTPUT_DIR/outdated_packages.json" 2>/dev/null | head -20 || echo "All up to date")
\`\`\`

### 3. Environment Variables Used
$(grep -rh "process\.env\." "$SCRIPT_DIR/src" 2>/dev/null | grep -v "node_modules" | sed -E 's/.*process\.env\.([A-Z_]+).*/\1/' | sort | uniq | sed 's/^/- /' || echo "None found")

## 🎯 Recommendations

EOF

if [ "$CRITICAL_VULNS" -gt 0 ]; then
    echo "1. **URGENT:** Fix $CRITICAL_VULNS critical vulnerabilities immediately" >> "$REPORT_FILE"
    echo "   Run: \`npm audit fix --force\`" >> "$REPORT_FILE"
fi

if [ "$HIGH_VULNS" -gt 0 ]; then
    echo "2. **HIGH PRIORITY:** Address $HIGH_VULNS high severity vulnerabilities" >> "$REPORT_FILE"
fi

if [ "${OUTDATED_COUNT:-0}" -gt 10 ]; then
    echo "3. Update outdated packages to latest versions" >> "$REPORT_FILE"
    echo "   Run: \`npm update\`" >> "$REPORT_FILE"
fi

if [ "$SECRETS_FOUND" -gt 0 ]; then
    echo "4. **CRITICAL:** Review and remove $SECRETS_FOUND potential hardcoded secrets" >> "$REPORT_FILE"
    echo "   Use environment variables instead" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

## 📂 Generated Files

- npm audit: \`$OUTPUT_DIR/npm_audit_raw.json\`
- npm audit summary: \`$OUTPUT_DIR/npm_audit_summary.txt\`
- Outdated packages: \`$OUTPUT_DIR/outdated_packages.json\`
- Dependency tree: \`$OUTPUT_DIR/dependency_tree.json\`

---

*End of Report*
EOF

log_success "Final report generated: $REPORT_FILE"

# Afficher le résumé
log_section "✅ AUDIT COMPLETE"

echo -e "${BOLD}Summary:${NC}"
echo -e "  📦 npm vulnerabilities: $TOTAL_VULNERABILITIES (Critical: $CRITICAL_VULNS, High: $HIGH_VULNS)"
echo -e "  📦 Outdated packages: ${OUTDATED_COUNT:-0}"
echo -e "  🔍 Potential secrets: $SECRETS_FOUND"
echo -e "  🔐 Suspicious file permissions: $SUSPICIOUS_PERMS"

echo -e "\n📂 All reports saved to: $OUTPUT_DIR/"
echo -e "📄 Main report: $REPORT_FILE"

# Code de sortie basé sur les vulnérabilités critiques
if [ "$CRITICAL_VULNS" -gt 0 ]; then
    log_error "CRITICAL vulnerabilities found! Please address them immediately."
    exit 1
elif [ "$HIGH_VULNS" -gt 5 ]; then
    log_warning "Multiple HIGH vulnerabilities found. Consider addressing them."
    exit 0
else
    log_success "Security audit passed with acceptable risk level."
    exit 0
fi
