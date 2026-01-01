# Backend Implementation Notes

## 3 Piliers Critiques Implémentés

### 1. WebSocket Temps Réel (EventsGateway)

**Fichiers créés:**
- `src/modules/events/events.gateway.ts` - Gateway WebSocket avec authentification JWT
- `src/modules/events/events.module.ts` - Module Events

**Fonctionnalités:**
- Authentification WebSocket via JWT token
- Rooms privées par utilisateur (`user_${userId}`)
- Broadcast d'événements en temps réel:
  - `pool:update` - Mises à jour générales du pool
  - `trade:executed` - Trades exécutés
  - `position:update` - Mises à jour de positions
  - `pnl:update` - Mises à jour de P&L

**Intégration:**
- WebhookService injecte EventsGateway
- Chaque webhook (trade, position, PnL) déclenche un broadcast WebSocket
- Frontend reçoit les mises à jour en temps réel sans recharger

**Frontend:**
```typescript
// Dans useWebSocket hook
const socket = io('http://localhost:3000', {
  auth: { token: `Bearer ${accessToken}` }
});

socket.on('pool:update', (data) => {
  // Mettre à jour l'UI en temps réel
});
```

---

### 2. Abonnement 2$ (Subscription Validation)

**Modifications:**
- `src/database/entities/user.entity.ts`:
  - Ajout `subscriptionExpiresAt: Date` - Date d'expiration de l'abonnement
  - Ajout `hasActiveSubscription: boolean` - Flag pour optimisation
  - Getter `isSubscriptionActive` - Vérifie si l'abo est valide

- `src/modules/investment/investment.service.ts`:
  - Vérification de `user.isSubscriptionActive` avant création d'investissement
  - Erreur `ForbiddenException` si pas d'abonnement actif

**Workflow:**
1. Utilisateur s'inscrit → `subscriptionExpiresAt = null` (pas d'abo)
2. Utilisateur paie 2$ → `subscriptionExpiresAt = now + 1 month`
3. Utilisateur tente d'investir → Vérification `isSubscriptionActive`
4. Si expiré → Erreur "Abonnement requis"

**À implémenter:**
- Endpoint `/auth/subscribe` pour paiement 2$ (Stripe/PayPal)
- Cron job pour renouvellement automatique
- Email de rappel avant expiration

---

### 3. Automatisation des Dates (PoolScheduler)

**Fichiers créés:**
- `src/modules/scheduler/pool.scheduler.ts` - Scheduler CRON
- `src/modules/scheduler/scheduler.module.ts` - Module Scheduler

**Transitions automatiques (toutes les minutes):**

1. **PENDING → ACTIVE**
   - Condition: `startDate < now`
   - Action: Pool passe en trading actif
   - Logs: "Pool {name} automatiquement activé"

2. **ACTIVE → CLOSED**
   - Condition: `endDate < now`
   - Action: Pool ferme les investissements
   - Logs: "Pool {name} automatiquement fermé"

3. **CLOSED → SETTLING**
   - Condition: `settleDate < now`
   - Action: Pool en cours de règlement
   - Logs: "Pool {name} en cours de règlement"

**Workflow 48h:**
- Admin crée pool avec `startDate = now + 48h`
- Utilisateurs ont 48h pour investir (avant `startDate`)
- À `startDate`, pool passe ACTIVE → trading commence
- À `endDate`, pool passe CLOSED → plus d'investissements

**À implémenter:**
- Endpoint admin pour créer pools avec dates strictes
- Validation des dates (startDate > now, endDate > startDate)
- Notification WebSocket quand pool change de statut

---

## Architecture Globale

```
Frontend (React)
    ↓
    ├─ HTTP REST API (/api/v1)
    │   ├─ Auth (login, register, refresh)
    │   ├─ Pools (list, detail, create)
    │   ├─ Investments (create, list, history)
    │   ├─ Withdrawals (create, list, approve)
    │   └─ Admin (dashboard, pool management)
    │
    └─ WebSocket (Socket.io)
        ├─ pool:update
        ├─ trade:executed
        ├─ position:update
        └─ pnl:update

Backend (NestJS)
    ├─ EventsGateway (WebSocket)
    ├─ WebhookService (reçoit du modèle Python)
    ├─ PoolScheduler (CRON jobs)
    ├─ InvestmentService (validation abo)
    └─ Modules (Auth, Pool, Investment, Withdrawal, Admin)

Trading Model (Python)
    └─ POST /webhook/model
        ├─ trade_executed
        ├─ position_update
        ├─ pnl_update
        └─ pool_update
```

---

## Prochaines Étapes

### Priorité 1: Admin Pool Management
- [ ] Page `/admin/pools` avec liste + create modal
- [ ] Form avec 5 types de pools (Momentum BTC, Swing ETH, etc.)
- [ ] Champs: name, description, targetAmount, minInvestment, dates, paire, riskLevel
- [ ] Actions: edit, publish (PENDING → ACTIVE), pause, resume, settle

### Priorité 2: Subscription Payment
- [ ] Intégration Stripe/PayPal
- [ ] Endpoint `/auth/subscribe` pour paiement 2$
- [ ] Email de confirmation + rappel avant expiration
- [ ] Dashboard utilisateur pour gérer abonnement

### Priorité 3: Frontend WebSocket
- [ ] Connecter `useWebSocket` hook au backend
- [ ] Afficher mises à jour temps réel sur dashboard
- [ ] Notifications toast pour trades/positions
- [ ] Graphiques live avec recharts

### Priorité 4: Tests & Monitoring
- [ ] Tests e2e pour WebSocket
- [ ] Tests unitaires pour PoolScheduler
- [ ] Logs centralisés (Winston)
- [ ] Monitoring Render (CPU, memory, errors)

---

## Commandes Utiles

```bash
# Démarrer le backend
npm run start:dev

# Voir les logs
npm run start:dev | grep -E "EventsGateway|PoolScheduler|WebhookService"

# Tester WebSocket
npm install -g wscat
wscat -c ws://localhost:3000 --auth '{"token":"Bearer YOUR_JWT"}'

# Tester webhook
curl -X POST http://localhost:3000/api/v1/webhook/model \
  -H "Content-Type: application/json" \
  -d '{"event":"trade_executed","poolId":"pool-1","data":{"side":"BUY","quantity":1,"symbol":"BTC/USDT","price":45000}}'
```

---

## Notes de Sécurité

- ✅ JWT auth sur WebSocket
- ✅ Validation d'abonnement avant investissement
- ✅ HMAC signature sur webhooks
- ✅ Rate limiting global (100 req/min)
- ✅ Exception filter global
- ✅ Roles guard (INVESTOR, ADMIN, MANAGER)

À améliorer:
- [ ] HTTPS en production
- [ ] Redis pour sessions WebSocket
- [ ] Audit logs pour toutes les actions
- [ ] 2FA obligatoire pour admin
