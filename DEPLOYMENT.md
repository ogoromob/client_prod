# TradingPool Platform - Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub account with repository access
- Render account (free tier works perfectly)

### One-Click Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Go to Render Dashboard**
   - Visit: https://render.com
   - Click "New +"
   - Select "Blueprint"

3. **Connect Repository**
   - Select your GitHub repository
   - Render will auto-detect `render.yaml`
   - Click "Apply"

4. **Deployment Complete! 🎉**
   - Backend: https://tradingpool-backend.onrender.com
   - Frontend: https://tradingpool-frontend.onrender.com
   - Swagger API Docs: https://tradingpool-backend.onrender.com/api/docs

### Manual Deployment (Alternative)

#### Backend Service
1. New Web Service
2. Connect repository
3. Build Command: `cd backend && npm install && npm run build`
4. Start Command: `cd backend && node dist/main`
5. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_NAME=./data/tradingpool.db
   JWT_ACCESS_SECRET=<generate-random-secret>
   JWT_REFRESH_SECRET=<generate-random-secret>
   MASTER_ENCRYPTION_KEY=<generate-32-char-key>
   ADMIN_EMAIL=sesshomaru@admin.com
   ADMIN_PASSWORD=inyasha
   ADMIN_USERNAME=sesshomaru
   ```

#### Frontend Service
1. New Static Site
2. Connect repository
3. Build Command: `cd frontend && npm install && npm run build`
4. Publish Directory: `frontend/dist`
5. Rewrites/Redirects: `/*` → `/index.html` (200)
6. Environment Variables:
   ```
   VITE_API_URL=https://tradingpool-backend.onrender.com/api/v1
   VITE_WS_URL=wss://tradingpool-backend.onrender.com
   VITE_MOCK_MODE=false
   VITE_API_TIMEOUT=90000
   ```

## 🔧 Configuration

### Cold Start Handling
The platform is optimized for Render's free tier:
- **Backend**: Health check endpoint at `/health`
- **Frontend**: 90-second timeout with 3 automatic retries
- **Database**: SQLite persists in `./data/` directory

### Performance Optimizations
✅ Non-blocking admin seed on startup  
✅ Graceful shutdown handling  
✅ CORS enabled for all origins  
✅ Compression enabled  
✅ Request rate limiting (100 req/min)

## 🔐 Security

### Production Checklist
- [x] HTTPS enforced
- [x] JWT token rotation
- [x] Input validation (class-validator)
- [x] Rate limiting enabled
- [x] SQL injection protection (TypeORM)
- [x] XSS protection (sanitization)
- [x] CORS configured
- [ ] Change default admin password
- [ ] Set strong JWT secrets
- [ ] Enable MFA for admin

## 📊 Monitoring

### Health Checks
- Backend: `GET https://tradingpool-backend.onrender.com/health`
  ```json
  {
    "status": "ok",
    "timestamp": 1234567890,
    "uptime": 3600,
    "environment": "production"
  }
  ```

### Logs
- Render Dashboard → Service → Logs
- Real-time log streaming available

## 🧪 Testing

### Admin Login
- URL: https://tradingpool-frontend.onrender.com/login
- Email: `sesshomaru@admin.com`
- Password: `inyasha`

### Investor Test Account
- Email: `investor@example.com`
- Password: `Password123!`

## 🔄 Updates

### Deploy New Changes
```bash
# Make changes
git add .
git commit -m "feat: description"
git push origin main

# Render auto-deploys on push to main
```

### Rollback
- Render Dashboard → Service → Settings → Rollback to previous deploy

## 🐛 Troubleshooting

### Backend Won't Start
1. Check logs in Render Dashboard
2. Verify environment variables are set
3. Ensure `DATABASE_NAME` path is writable
4. Health check should return 200 OK

### Frontend 404 Errors
1. Verify rewrite rule: `/*` → `/index.html`
2. Check `VITE_API_URL` points to backend
3. Rebuild if environment variables changed

### Database Issues
1. SQLite file persists in `./data/` directory
2. First startup creates admin user automatically
3. Database resets if service is deleted

### Timeout Errors
1. Cold start can take 30-60 seconds on free tier
2. Frontend has 90-second timeout with retries
3. Keep backend warm with external monitoring (e.g., UptimeRobot)

## 📚 API Documentation

### Swagger UI
Visit: https://tradingpool-backend.onrender.com/api/docs

### Key Endpoints
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/pools` - List all pools
- `GET /api/v1/investments` - User investments
- `POST /api/v1/withdrawals` - Request withdrawal
- `GET /api/v1/admin/dashboard` - Admin dashboard (requires admin role)

## 🌐 Environment Variables Reference

### Backend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | production | Environment mode |
| PORT | No | 3000 | Server port (auto-set by Render) |
| DATABASE_NAME | Yes | ./data/tradingpool.db | SQLite database path |
| JWT_ACCESS_SECRET | Yes | - | JWT access token secret |
| JWT_REFRESH_SECRET | Yes | - | JWT refresh token secret |
| MASTER_ENCRYPTION_KEY | Yes | - | Data encryption key (32 chars) |
| ADMIN_EMAIL | Yes | sesshomaru@admin.com | Default admin email |
| ADMIN_PASSWORD | Yes | inyasha | Default admin password |
| ADMIN_USERNAME | Yes | sesshomaru | Default admin username |

### Frontend
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | Yes | - | Backend API URL |
| VITE_WS_URL | Yes | - | WebSocket URL |
| VITE_MOCK_MODE | No | false | Enable mock data |
| VITE_API_TIMEOUT | No | 90000 | API timeout (ms) |

## 🚨 Important Notes

1. **Free Tier Limitations**
   - Backend spins down after 15 minutes of inactivity
   - Cold start takes 30-60 seconds
   - Database resets if service is deleted (use paid tier for persistence)

2. **Production Recommendations**
   - Use paid tier for 24/7 uptime
   - Migrate to PostgreSQL for better performance
   - Enable Redis for session management
   - Set up monitoring (Sentry, DataDog)

3. **Security Reminders**
   - Change default admin credentials immediately
   - Use strong JWT secrets (256-bit random strings)
   - Enable MFA for withdrawals > 1000€
   - Regular security audits

## 📞 Support

- GitHub Issues: [Repository Issues](https://github.com/ogoromob/client_prod/issues)
- Documentation: See README.md files in `/backend` and `/frontend`

---

**Status**: ✅ Production Ready  
**Last Updated**: December 9, 2024  
**Version**: 1.0.0
