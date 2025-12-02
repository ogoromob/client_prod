# TradingPool Backend API

API REST sécurisée pour la plateforme TradingPool, construite avec NestJS.

## 🏗️ Architecture

### Modules Principaux

- **Auth Module**: Authentification JWT, MFA, gestion sessions
- **Pool Module**: Gestion des pools de trading
- **Investment Module**: Gestion des investissements
- **Withdrawal Module**: Traitement des retraits
- **Settlement Module**: Worker de règlement automatique
- **Admin Module**: Fonctionnalités d'administration
- **Trading Adapter**: Interface avec modules Python de trading

### Stack Technique

- **Framework**: NestJS 10+
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 15+ avec TimescaleDB
- **Cache**: Redis 7+
- **ORM**: TypeORM / Prisma
- **Auth**: Passport JWT + TOTP
- **Validation**: Class Validator
- **Documentation**: Swagger / OpenAPI
- **WebSocket**: Socket.io
- **Testing**: Jest

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Créer un fichier `.env`:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=trading_pool
POSTGRES_USER=pool_app
POSTGRES_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_ACCESS_SECRET=your_access_secret_256_bits
JWT_REFRESH_SECRET=your_refresh_secret_256_bits
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Encryption
MASTER_ENCRYPTION_KEY=your_aes_256_key

# Admin Credentials
ADMIN_USERNAME=sesshomaru
ADMIN_PASSWORD_HASH=$argon2id$v=19$m=65536,t=3,p=4$...

# Trading Module (Python)
TRADING_MODULE_URL=http://localhost:4000
TRADING_API_KEY=your_trading_api_key

# SMTP (Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@votredomaine.com
SMTP_PASSWORD=your_smtp_password

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 🚀 Lancement

### Développement

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

### Debug

```bash
npm run start:debug
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Documentation API

Une fois l'application lancée, accédez à:
- Swagger UI: `http://localhost:3000/api`
- JSON OpenAPI: `http://localhost:3000/api-json`

## 🔐 Sécurité

### Authentification

- **JWT Double Token**: Access token (15min) + Refresh token (7 jours)
- **MFA**: TOTP pour les opérations sensibles (>1000€)
- **Rate Limiting**: Protection contre brute force
- **Device Fingerprinting**: Détection d'appareils suspects

### Chiffrement

- Données sensibles: AES-256-GCM
- Passwords: Argon2id
- HTTPS obligatoire en production

### Audit

- Tous les événements critiques sont loggés
- Logs immuables dans TimescaleDB
- Rétention: 7 ans

## 📡 API Endpoints

### Authentification
```
POST   /api/v1/auth/register              # Créer compte
POST   /api/v1/auth/login                 # Connexion
POST   /api/v1/auth/refresh               # Renouveler token
POST   /api/v1/auth/logout                # Déconnexion
POST   /api/v1/auth/mfa/setup             # Activer MFA
POST   /api/v1/auth/mfa/verify            # Vérifier code MFA
```

### Pools
```
GET    /api/v1/pools                      # Liste pools
GET    /api/v1/pools/:id                  # Détail pool
GET    /api/v1/pools/:id/performance      # Métriques temps réel
GET    /api/v1/pools/:id/positions        # Positions actuelles
WS     /pools/:id/subscribe               # WebSocket metrics
```

### Investissements
```
GET    /api/v1/investments                # Mes investissements
GET    /api/v1/investments/:id            # Détail investissement
POST   /api/v1/investments                # Créer investissement
GET    /api/v1/investments/:id/history    # Historique valeur
```

### Retraits
```
GET    /api/v1/withdrawals                # Mes retraits
POST   /api/v1/withdrawals                # Demander retrait
GET    /api/v1/withdrawals/:id            # Statut retrait
```

### Admin (Protected)
```
GET    /api/v1/admin/dashboard            # Métriques globales
GET    /api/v1/admin/pools                # Tous pools
POST   /api/v1/admin/pools                # Créer pool
PUT    /api/v1/admin/pools/:id            # Modifier pool
POST   /api/v1/admin/pools/:id/pause      # Pause trading
POST   /api/v1/admin/pools/:id/resume     # Reprendre trading
POST   /api/v1/admin/pools/:id/force-settlement # Settlement manuel
GET    /api/v1/admin/users                # Liste utilisateurs
PUT    /api/v1/admin/users/:id/kyc-status # Valider KYC
GET    /api/v1/admin/withdrawals          # Tous retraits
PUT    /api/v1/admin/withdrawals/:id/approve # Approuver
PUT    /api/v1/admin/withdrawals/:id/reject  # Rejeter
GET    /api/v1/admin/audit-logs           # Logs audit
```

## 🗄️ Database Schema

### Principales Tables

**users**: Utilisateurs et authentification
**pools**: Pools de trading
**investments**: Investissements dans les pools
**withdrawals**: Demandes de retrait
**audit_logs**: Logs d'audit immuables (TimescaleDB)

Voir `/migrations` pour le schema complet.

## 🔌 Integration Python Trading Modules

### Adapter Interface

L'adapter permet de connecter vos modules Python existants:

```typescript
interface ITradingAdapter {
  connect(config: TradingConfig): Promise<void>;
  getPoolPnL(strategyId: string): Promise<number>;
  getPositions(poolId: string): Promise<Position[]>;
  subscribeToMetrics(poolId: string, callback: Function): void;
  pauseTrading(poolId: string): Promise<void>;
  emergencyStop(poolId: string): Promise<void>;
}
```

### Configuration

Les paramètres de stratégie sont stockés dans `pool.metadata`:

```json
{
  "trading": {
    "adapter": "your_custom_module",
    "strategyId": "momentum_btc_v2",
    "exchanges": ["binance", "bybit"],
    "pairs": ["BTC/USDT", "ETH/USDT"]
  }
}
```

## ⚙️ Settlement Worker

Worker automatique qui:
1. Récupère P&L depuis les modules trading
2. Calcule les parts proportionnelles
3. Prélève les frais manager (15%)
4. Met à jour les soldes
5. Débloque les retraits
6. Envoie les notifications

Exécution: Fin de chaque cycle de pool (configurable)

## 📊 Monitoring

### Métriques Prometheus

- `http_request_duration_seconds`: Latence requêtes
- `active_investments_total`: Nombre investissements actifs
- `settlement_duration_seconds`: Durée settlements
- Database connections, cache hit rate, etc.

### Alertes

- Taux d'erreur élevé (>5%)
- Settlement échoué
- Connexion DB perdue
- Latence anormale

### Dashboards Grafana

- Business metrics (AUM, investisseurs, P&L)
- Performance API
- Database health
- Sécurité

## 🚀 Déploiement

### Docker

```bash
docker build -t tradingpool-api .
docker run -p 3000:3000 tradingpool-api
```

### Docker Compose

```bash
docker-compose up -d
```

Inclut:
- API (NestJS)
- PostgreSQL + TimescaleDB
- Redis
- Nginx (reverse proxy)

### Production Checklist

- [ ] Variables d'environnement sécurisées (Vault)
- [ ] Certificat SSL/TLS configuré
- [ ] Rate limiting activé
- [ ] CORS configuré
- [ ] Logs centralisés (ELK/Loki)
- [ ] Monitoring activé (Prometheus/Grafana)
- [ ] Backups automatiques configurés
- [ ] CI/CD pipeline testé

## 📝 Structure du Code

```
src/
├── modules/
│   ├── auth/           # Authentification & sécurité
│   ├── pool/           # Gestion des pools
│   ├── investment/     # Gestion des investissements
│   ├── withdrawal/     # Traitement des retraits
│   ├── settlement/     # Worker de règlement
│   ├── admin/          # Fonctionnalités admin
│   └── user/           # Gestion utilisateurs
├── adapters/
│   └── trading/        # Interface modules Python
├── common/
│   ├── decorators/     # Décorateurs personnalisés
│   ├── filters/        # Exception filters
│   ├── guards/         # Guards (Auth, Admin, etc.)
│   ├── interceptors/   # Intercepteurs
│   ├── pipes/          # Pipes de validation
│   └── dto/            # DTOs partagés
├── config/             # Configuration modules
├── database/
│   ├── entities/       # Entités TypeORM
│   └── migrations/     # Migrations DB
└── main.ts             # Point d'entrée
```

## 🤝 Contribution

Voir le README principal du projet.

## 📄 Licence

MIT

---

**Status**: 🟡 En cours de développement

**Dernière mise à jour**: 2 Décembre 2024
