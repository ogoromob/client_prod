# TradingPool Platform

Plateforme complète de gestion de pools d'investissement en trading algorithmique.

## 📊 Vue d'ensemble

TradingPool permet aux investisseurs de participer à des pools de trading gérés par des experts, avec une interface moderne et sécurisée pour suivre les performances en temps réel.

### ✨ Fonctionnalités Principales

- **Pour les Investisseurs**
  - Dashboard personnalisé avec vue d'ensemble
  - Navigation des pools disponibles avec filtres
  - Investissement dans les pools actifs
  - Suivi en temps réel des performances
  - Système de retrait sécurisé avec validation

- **Pour les Administrateurs**
  - Dashboard admin complet
  - Gestion des pools (création, modification, pause, settlement)
  - Validation des retraits
  - Gestion des utilisateurs et KYC
  - Logs d'audit immuables
  - Monitoring et alertes

## 🏗️ Architecture

```
tradingpool/
├── frontend/          # Application React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── README.md
├── backend/           # API NestJS (En cours de développement)
│   ├── src/
│   │   ├── modules/
│   │   ├── adapters/
│   │   └── config/
│   └── README.md
└── README.md
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 18.x
- npm ou yarn
- Git

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

**Identifiants de test (mode mock)**:
- **Investisseur**: investor@example.com / Password123!
- **Admin**: sesshomaru@admin.com / inyasha

### Backend (À venir)

```bash
cd backend
npm install
npm run start:dev
```

L'API sera accessible sur `http://localhost:3000`

## 📁 Modules

### Frontend (✅ Complété)

- ✅ React 18 + TypeScript + Vite
- ✅ Authentification JWT + MFA
- ✅ Dashboard investisseur
- ✅ Gestion des pools
- ✅ Système de retrait
- ✅ Interface admin complète
- ✅ Mode mock pour développement
- ✅ Build de production

### Backend (🔄 En cours)

- 🔄 NestJS + TypeScript
- ⏳ PostgreSQL + TimescaleDB
- ⏳ Redis (cache + queue)
- ⏳ Authentification & sécurité
- ⏳ Module Pool Management
- ⏳ Module Investment
- ⏳ Settlement Worker
- ⏳ Adapter Python Trading

## 🔐 Sécurité

- JWT double token (access + refresh)
- MFA (TOTP) pour opérations sensibles
- Rate limiting
- Audit logging immuable
- Chiffrement AES-256
- Validation des entrées
- Protection CSRF

## 📈 Stack Technique

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Zustand + React Query
- Axios
- Recharts
- Sonner

### Backend (Prévu)
- NestJS
- PostgreSQL + TimescaleDB
- Redis
- Socket.io
- Passport JWT
- Class Validator
- TypeORM/Prisma

## 🔌 API Endpoints (Backend)

### Authentification
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Pools
- `GET /api/v1/pools`
- `GET /api/v1/pools/:id`
- `GET /api/v1/pools/:id/performance`
- `GET /api/v1/pools/:id/positions`

### Investissements
- `GET /api/v1/investments`
- `GET /api/v1/investments/:id`
- `POST /api/v1/investments`

### Retraits
- `GET /api/v1/withdrawals`
- `POST /api/v1/withdrawals`
- `GET /api/v1/withdrawals/:id`

### Admin
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/pools`
- `POST /api/v1/admin/pools`
- `PUT /api/v1/admin/withdrawals/:id/approve`
- `PUT /api/v1/admin/withdrawals/:id/reject`

## 🧪 Tests

```bash
# Frontend
cd frontend
npm run test

# Backend (à venir)
cd backend
npm run test
```

## 📦 Déploiement

### Frontend (Production)

```bash
cd frontend
npm run build
# Les fichiers sont dans frontend/dist/
```

### Backend (À venir)

```bash
cd backend
npm run build
npm run start:prod
```

## 🌐 Variables d'Environnement

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
VITE_MOCK_MODE=true  # false pour utiliser l'API réelle
```

### Backend (`.env`) - À venir

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
```

## 📝 Roadmap

### Phase 1: MVP Frontend ✅ (Complété)
- [x] Interface utilisateur complète
- [x] Authentification
- [x] Gestion des pools
- [x] Dashboard investisseur
- [x] Interface admin
- [x] Mode mock

### Phase 2: Backend API (En cours)
- [x] Architecture NestJS
- [ ] Authentification JWT + MFA
- [ ] Module Pool
- [ ] Module Investment
- [ ] Settlement Worker
- [ ] Integration tests

### Phase 3: Integration (À venir)
- [ ] Connexion Frontend ↔ Backend
- [ ] WebSocket temps réel
- [ ] Tests E2E
- [ ] Documentation API (Swagger)

### Phase 4: Production (À venir)
- [ ] Adapter Python modules
- [ ] Monitoring & Alerting
- [ ] CI/CD Pipeline
- [ ] Déploiement production

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Équipe

- **Sesshomaru** - Admin & Lead Developer

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

**Status**: 🟢 Frontend Complété | 🟡 Backend En Cours | 🔴 Integration À Venir

**Dernière mise à jour**: 2 Décembre 2024
