# TradingPool Frontend

Interface web moderne pour la gestion de pools d'investissement en trading algorithmique.

## 🚀 Fonctionnalités

### Pour les Investisseurs
- ✅ Authentification sécurisée (JWT + MFA)
- ✅ Dashboard avec vue d'ensemble des investissements
- ✅ Navigation des pools disponibles
- ✅ Détail des pools avec métriques temps réel
- ✅ Suivi des investissements personnels
- ✅ Système de retrait avec validation

### Pour les Administrateurs
- ✅ Dashboard admin complet
- ✅ Gestion des pools (création, modification, pause)
- ✅ Validation des retraits
- ✅ Gestion des utilisateurs et KYC
- ✅ Logs d'audit

## 🛠️ Stack Technique

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Notifications**: Sonner

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Créer un fichier `.env` à la racine du projet:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
VITE_MOCK_MODE=true
```

### Mode Mock

Le mode mock permet de tester l'interface sans backend:
- `VITE_MOCK_MODE=true`: Utilise des données mockées
- `VITE_MOCK_MODE=false`: Utilise l'API backend réelle

## 🚀 Lancement

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Production

```bash
npm run build
npm run preview
```

## 🔐 Identifiants de Test (Mode Mock)

### Investisseur
- **Email**: investor@example.com
- **Password**: Password123!

### Administrateur
- **Email**: sesshomaru@admin.com
- **Password**: inyasha

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Composants d'authentification
│   ├── pools/          # Composants liés aux pools
│   ├── admin/          # Composants admin
│   ├── common/         # Composants communs
│   └── layout/         # Layouts (Public, Investor, Admin)
├── pages/              # Pages de l'application
│   ├── public/         # Pages publiques
│   ├── investor/       # Pages investisseur
│   └── admin/          # Pages admin
├── services/           # Services API
│   ├── authService.ts
│   ├── poolService.ts
│   ├── withdrawalService.ts
│   └── adminService.ts
├── stores/             # State management (Zustand)
│   └── authStore.ts
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
│   └── format.ts       # Formatage (dates, monnaie, etc.)
├── lib/                # Configuration des librairies
│   └── axios.ts        # Instance Axios configurée
├── mocks/              # Données mockées
│   └── data.ts
├── App.tsx             # Composant principal avec routes
└── main.tsx            # Point d'entrée
```

## 🎨 Design System

### Palette de Couleurs

- **Primary (Green)**: Actions principales, succès
- **Dark**: Backgrounds et surfaces
- **Yellow**: Éléments admin
- **Red**: Erreurs et actions dangereuses
- **Blue**: Informations

### Composants

Tous les composants sont définis dans `App.tsx` pour ce MVP. Dans une version de production, ils seraient séparés en fichiers individuels.

## 🔌 Intégration Backend

### Endpoints API Attendus

Voir la documentation backend pour la liste complète des endpoints.

Base URL: `/api/v1`

**Authentification**
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `POST /auth/logout`

**Pools**
- `GET /pools`
- `GET /pools/:id`
- `GET /pools/:id/performance`
- `GET /pools/:id/positions`

**Investissements**
- `GET /investments`
- `GET /investments/:id`
- `POST /investments`

**Retraits**
- `GET /withdrawals`
- `POST /withdrawals`

**Admin**
- `GET /admin/dashboard`
- `GET /admin/pools`
- `GET /admin/users`
- `GET /admin/withdrawals`
- `PUT /admin/withdrawals/:id/approve`
- `PUT /admin/withdrawals/:id/reject`

## 🧪 Tests

```bash
# Tests unitaires (à implémenter)
npm run test

# Tests E2E (à implémenter)
npm run test:e2e
```

## 📝 TODO

- [ ] Ajouter tests unitaires (Vitest)
- [ ] Ajouter tests E2E (Playwright)
- [ ] Implémenter graphiques de performance (Recharts)
- [ ] Ajouter système de notifications push
- [ ] Implémenter WebSocket pour données temps réel
- [ ] Ajouter export PDF des rapports
- [ ] Implémenter système de recherche/filtres avancés
- [ ] Ajouter mode sombre/clair
- [ ] Optimisation performance (lazy loading, code splitting)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- **Sesshomaru** - Admin initial

## 🙏 Remerciements

- Design inspiré des meilleures pratiques UX/UI pour les applications financières
- Architecture basée sur les standards React modernes
