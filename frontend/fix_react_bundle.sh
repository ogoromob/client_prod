#!/bin/bash
# fix_react_bundle.sh - Correction du problème React forwardRef
# Version robuste avec validation à chaque étape

set -e

echo "=========================================="
echo "🔧 CORRECTION REACT FORWARDREF - TRADINGPOOL"
echo "=========================================="
echo ""

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Aller dans le répertoire frontend
cd /home/user/webapp/frontend

log_info "Répertoire de travail : $(pwd)"
echo ""

# Étape 1 : Backup de la config actuelle
log_info "Étape 1/8 : Sauvegarde de la configuration actuelle"
if [ -f "vite.config.ts" ]; then
    cp vite.config.ts vite.config.ts.bak
    log_success "vite.config.ts sauvegardé"
else
    log_warning "Pas de vite.config.ts existant"
fi

if [ -f "package.json" ]; then
    cp package.json package.json.bak
    log_success "package.json sauvegardé"
fi
echo ""

# Étape 2 : Nettoyage complet
log_info "Étape 2/8 : Nettoyage complet des caches et builds"
rm -rf node_modules/.vite 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf .vite 2>/dev/null || true
log_success "Caches Vite nettoyés"
echo ""

# Étape 3 : Vérification des versions React
log_info "Étape 3/8 : Vérification des versions React dans package.json"

REACT_VERSION=$(node -pe "require('./package.json').dependencies.react")
REACT_DOM_VERSION=$(node -pe "require('./package.json').dependencies['react-dom']")

echo "  React : $REACT_VERSION"
echo "  React-DOM : $REACT_DOM_VERSION"

if [ "$REACT_VERSION" != "$REACT_DOM_VERSION" ]; then
    log_error "Versions React différentes détectées !"
    log_info "Correction automatique en cours..."
    
    # Corriger package.json
    node << 'NODEJS'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const reactVersion = pkg.dependencies.react;
pkg.dependencies['react-dom'] = reactVersion;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('✅ Versions React synchronisées');
NODEJS
    
    log_success "package.json corrigé"
else
    log_success "Versions React cohérentes"
fi
echo ""

# Étape 4 : Optimisation de vite.config.ts
log_info "Étape 4/8 : Optimisation de vite.config.ts avec dedupe React"

cat > vite.config.ts << 'VITECONFIG'
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // CRITICAL: Force single React instance
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
    // Deduplicate React packages
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'lucide-react',
      'framer-motion',
      'zustand',
      '@tanstack/react-query'
    ],
    force: true  // Force re-optimization
  },
  build: {
    outDir: 'dist',
    sourcemap: true,  // Enable sourcemaps for debugging
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries (MUST be together)
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('lucide-react') || id.includes('sonner')) {
            return 'ui-vendor';
          }
          // Animation libraries
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          // Charts and visualizations
          if (id.includes('recharts') || id.includes('d3')) {
            return 'charts-vendor';
          }
          // State management and data fetching
          if (id.includes('zustand') || id.includes('@tanstack/react-query') || id.includes('axios')) {
            return 'state-vendor';
          }
          // Socket.io
          if (id.includes('socket.io')) {
            return 'socket-vendor';
          }
        },
      },
    },
  },
})
VITECONFIG

log_success "vite.config.ts optimisé avec dedupe React"
echo ""

# Étape 5 : Vérifier node_modules
log_info "Étape 5/8 : Vérification de node_modules"

if [ -d "node_modules" ]; then
    REACT_COUNT=$(find node_modules -name "package.json" -path "*/react/package.json" 2>/dev/null | wc -l)
    echo "  Versions de React installées : $REACT_COUNT"
    
    if [ "$REACT_COUNT" -gt 1 ]; then
        log_warning "Plusieurs versions de React détectées !"
        log_info "Suppression de node_modules pour réinstallation propre..."
        rm -rf node_modules package-lock.json
        log_success "node_modules supprimé"
    else
        log_success "Une seule version de React (OK)"
    fi
else
    log_info "node_modules n'existe pas (installation nécessaire)"
fi
echo ""

# Étape 6 : Installation propre
log_info "Étape 6/8 : Installation propre des dépendances"

if [ ! -d "node_modules" ]; then
    log_info "Installation de toutes les dépendances..."
    npm install
    log_success "npm install terminé"
else
    log_info "Installation des dépendances manquantes..."
    npm install
    log_success "npm install terminé"
fi

# Déduplication
log_info "Déduplication des packages..."
npm dedupe
log_success "npm dedupe terminé"
echo ""

# Étape 7 : Vérification finale
log_info "Étape 7/8 : Vérification finale de l'installation"

REACT_COUNT_FINAL=$(find node_modules -name "package.json" -path "*/react/package.json" 2>/dev/null | wc -l)
echo "  Versions de React après installation : $REACT_COUNT_FINAL"

if [ "$REACT_COUNT_FINAL" -eq 1 ]; then
    log_success "✅ UNE SEULE version de React installée (PARFAIT)"
    
    # Afficher la version
    INSTALLED_REACT_VERSION=$(node -pe "require('./node_modules/react/package.json').version")
    echo "  Version installée : React $INSTALLED_REACT_VERSION"
else
    log_error "Plusieurs versions de React détectées !"
    echo ""
    echo "Détails des versions :"
    find node_modules -name "package.json" -path "*/react/package.json" -exec cat {} \; | grep '"version"'
    exit 1
fi
echo ""

# Étape 8 : Build de test
log_info "Étape 8/8 : Build de production"

npm run build

BUILD_STATUS=$?

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    log_success "🎉 BUILD RÉUSSI !"
    echo ""
    
    # Analyse du bundle
    log_info "📊 Analyse du bundle généré :"
    echo ""
    
    if [ -d "dist" ]; then
        echo "  Fichiers générés :"
        ls -lh dist/ | grep -E "index.html|assets" | head -10
        
        echo ""
        echo "  Chunks JavaScript :"
        ls -lh dist/assets/*.js 2>/dev/null | head -10 || echo "    Pas de fichiers JS trouvés"
        
        echo ""
        echo "  Fichiers CSS :"
        ls -lh dist/assets/*.css 2>/dev/null | head -5 || echo "    Pas de fichiers CSS trouvés"
        
        # Vérifier forwardRef dans les bundles
        echo ""
        log_info "🔍 Vérification de forwardRef dans les bundles..."
        if grep -r "forwardRef" dist/assets/*.js > /dev/null 2>&1; then
            log_success "forwardRef trouvé dans le bundle (normal)"
        else
            log_info "forwardRef non trouvé (possiblement optimisé)"
        fi
        
        # Taille totale
        echo ""
        TOTAL_SIZE=$(du -sh dist | cut -f1)
        echo "  Taille totale du build : $TOTAL_SIZE"
    else
        log_warning "Dossier dist/ non trouvé"
    fi
    
    echo ""
    log_success "=========================================="
    log_success "✅ CORRECTION TERMINÉE AVEC SUCCÈS"
    log_success "=========================================="
    echo ""
    echo "Prochaines étapes :"
    echo "  1. Tester localement : npm run preview"
    echo "  2. Commit : git add . && git commit -m 'fix: resolve React forwardRef bundle issue'"
    echo "  3. Push : git push origin main"
    echo "  4. Attendre le déploiement Render (~5 min)"
    echo ""
    
else
    log_error "=========================================="
    log_error "❌ BUILD ÉCHOUÉ"
    log_error "=========================================="
    echo ""
    echo "Logs d'erreur :"
    npm run build 2>&1 | grep -i "error" | tail -20
    echo ""
    echo "Actions recommandées :"
    echo "  1. Vérifier les logs ci-dessus"
    echo "  2. Exécuter manuellement : npm run build"
    echo "  3. Restaurer la config : mv vite.config.ts.bak vite.config.ts"
    exit 1
fi
