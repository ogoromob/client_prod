# 🔧 Guide de Débogage Frontend - TradingPool

**Problème**: Page blanche, aucun contenu affiché  
**Erreur Lighthouse**: `NO_FCP (No First Contentful Paint)`  
**Cause Probable**: Erreur JavaScript empêchant le rendu React

---

## 🚀 Débogage Rapide (5 minutes)

### Étape 1: Ouvrir la Console du Navigateur

1. Aller à https://tradingpool-frontend.onrender.com
2. Appuyer sur **F12** (ou Cmd+Option+I sur Mac)
3. Cliquer sur l'onglet **"Console"**
4. Chercher les messages d'erreur en **ROUGE**

### Étape 2: Identifier l'Erreur

**Erreurs courantes à chercher**:

```javascript
// Erreur 1: Module manquant
Uncaught Error: Cannot find module 'xyz'

// Erreur 2: Propriété undefined
Uncaught TypeError: Cannot read property 'x' of undefined

// Erreur 3: Fonction non définie
Uncaught ReferenceError: xyz is not defined

// Erreur 4: Problème d'import
Uncaught SyntaxError: Unexpected token

// Erreur 5: Problème CORS
Access to XMLHttpRequest blocked by CORS policy
```

### Étape 3: Copier l'Erreur Exacte

Copier le message d'erreur complet (stack trace) pour analyse.

---

## 🔍 Débogage Avancé

### Onglet Network

1. Ouvrir DevTools (F12)
2. Aller à l'onglet **"Network"**
3. Recharger la page (F5)
4. Chercher les requêtes en **ROUGE** (erreurs)

**À vérifier**:
- `/assets/index-*.js` → Doit être 200
- `/assets/index-*.css` → Doit être 200
- Requêtes API → Vérifier les 401/403/500

### Onglet Sources

1. Aller à l'onglet **"Sources"**
2. Chercher les fichiers avec des erreurs
3. Vérifier les breakpoints

### Onglet Application

1. Aller à l'onglet **"Application"**
2. Vérifier **"Local Storage"**
3. Chercher les clés:
   - `accessToken`
   - `refreshToken`
   - `user`

---

## 🛠️ Solutions Courantes

### Solution 1: Erreur d'Import

**Symptôme**: `Cannot find module 'xyz'`

**Cause**: Dépendance manquante ou chemin incorrect

**Fix**:
```bash
# Vérifier les dépendances
npm ls

# Réinstaller
npm install

# Rebuild
npm run build
```

### Solution 2: Erreur CORS

**Symptôme**: `Access to XMLHttpRequest blocked by CORS policy`

**Cause**: Backend n'accepte pas les requêtes du frontend

**Fix**:
```bash
# Vérifier VITE_API_URL
cat frontend/.env.production

# Doit être:
VITE_API_URL=https://tradingpool-backend.onrender.com/api/v1

# Vérifier que le backend accepte le frontend
curl -H "Origin: https://tradingpool-frontend.onrender.com" \
  https://tradingpool-backend.onrender.com/health
```

### Solution 3: Erreur de Rendu React

**Symptôme**: `Cannot read property 'x' of undefined`

**Cause**: Composant essaie d'accéder à une propriété undefined

**Fix**:
1. Vérifier les props des composants
2. Ajouter des vérifications null/undefined
3. Vérifier les appels API

### Solution 4: Erreur de Build

**Symptôme**: `Unexpected token` ou erreur de syntaxe

**Cause**: Erreur TypeScript ou JSX

**Fix**:
```bash
# Vérifier les erreurs TypeScript
npm run build 2>&1 | grep -i error

# Vérifier la syntaxe
npm run lint
```

---

## 📝 Checklist de Débogage

- [ ] Ouvrir la console (F12)
- [ ] Chercher les erreurs rouges
- [ ] Copier le message d'erreur
- [ ] Vérifier l'onglet Network
- [ ] Vérifier les requêtes API
- [ ] Vérifier les variables d'environnement
- [ ] Tester localement (npm run dev)
- [ ] Vérifier les logs Render
- [ ] Reconstruire et redéployer

---

## 🧪 Test Local

### Étape 1: Installer les Dépendances

```bash
cd frontend
npm install
```

### Étape 2: Lancer le Serveur de Développement

```bash
npm run dev
```

**Output attendu**:
```
  VITE v7.2.4  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Étape 3: Ouvrir dans le Navigateur

Aller à http://localhost:5173/

**Vérifier**:
- L'app s'affiche-t-elle?
- Y a-t-il des erreurs dans la console?
- Les pages se chargent-elles?

### Étape 4: Tester la Connexion

1. Cliquer sur "Login"
2. Entrer les credentials:
   - Email: `sesshomaru@admin.com`
   - Password: `inyasha`
3. Vérifier que la connexion fonctionne

---

## 🔧 Commandes Utiles

### Build et Test

```bash
# Build production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint

# Vérifier les types TypeScript
npx tsc --noEmit
```

### Debugging

```bash
# Voir les erreurs de build
npm run build 2>&1 | head -50

# Voir les avertissements
npm run build 2>&1 | grep -i warn

# Voir les erreurs TypeScript
npx tsc --noEmit 2>&1 | head -20
```

### Nettoyage

```bash
# Supprimer node_modules
rm -rf node_modules

# Supprimer le cache npm
npm cache clean --force

# Réinstaller
npm install

# Rebuild
npm run build
```

---

## 📊 Vérification de l'API

### Tester la Connexion au Backend

```bash
# Health check
curl https://tradingpool-backend.onrender.com/health

# Swagger docs
curl https://tradingpool-backend.onrender.com/api/docs

# Login
curl -X POST https://tradingpool-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sesshomaru@admin.com","password":"inyasha"}'
```

### Vérifier les Variables d'Environnement

```bash
# Vérifier le fichier .env
cat frontend/.env.production

# Doit contenir:
VITE_API_URL=https://tradingpool-backend.onrender.com/api/v1
```

---

## 🚀 Redéploiement

### Après Correction

```bash
# Vérifier que tout fonctionne localement
npm run dev
# Tester l'app

# Build
npm run build

# Pousser vers GitHub
git add -A
git commit -m "fix: resolve frontend rendering issue"
git push origin main

# Render redéploiera automatiquement
# Attendre 2-3 minutes
```

### Vérifier le Déploiement

1. Aller à https://dashboard.render.com
2. Sélectionner le service frontend
3. Vérifier le statut du déploiement
4. Vérifier les logs pour les erreurs
5. Tester l'URL: https://tradingpool-frontend.onrender.com

---

## 📞 Ressources

### Documentation
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org

### Outils
- **DevTools**: F12 dans le navigateur
- **Render Dashboard**: https://dashboard.render.com
- **GitHub**: https://github.com/ogoromob/client_prod

### Support
- **Backend Health**: https://tradingpool-backend.onrender.com/health
- **Swagger Docs**: https://tradingpool-backend.onrender.com/api/docs

---

## ⏱️ Temps Estimé

- **Identification de l'erreur**: 2-5 minutes
- **Correction**: 5-15 minutes
- **Test local**: 5 minutes
- **Redéploiement**: 2-3 minutes
- **Vérification**: 2 minutes

**Total**: 15-30 minutes

---

## 🎯 Prochaines Étapes

1. **Immédiat**: Ouvrir la console et identifier l'erreur
2. **Court terme**: Corriger l'erreur et tester localement
3. **Redéploiement**: Pousser vers GitHub et vérifier
4. **Validation**: Tester l'app en production

---

**Bonne chance! 🚀**

Une fois l'erreur identifiée, elle devrait être facile à corriger.
