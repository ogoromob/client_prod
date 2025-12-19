#!/bin/bash
###############################################################################
# monitor_deploy.sh - Monitor Render deployment in real-time
###############################################################################

set -e

# Configuration
SERVICE_ID="srv-d4rsd5vpm1nc73adnehg"
RENDER_API_KEY="rnd_8B9XhUYjteXMonrpmjRHKZFcZOPf"
DEPLOY_ID="${1:-}"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

if [ -z "$DEPLOY_ID" ]; then
    echo -e "${BLUE}Fetching latest deployment...${NC}"
    DEPLOY_ID=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
      "https://api.render.com/v1/services/$SERVICE_ID/deploys?limit=1" | \
      jq -r '.[0].deploy.id')
fi

echo -e "${BOLD}${CYAN}=========================================="
echo -e "  Monitoring Deployment"
echo -e "==========================================${NC}"
echo -e "${BLUE}Deploy ID:${NC} $DEPLOY_ID"
echo -e "${BLUE}Service ID:${NC} $SERVICE_ID"
echo ""

PREV_STATUS=""
START_TIME=$(date +%s)

while true; do
    # Récupérer le statut du déploiement
    DEPLOY_DATA=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
      "https://api.render.com/v1/services/$SERVICE_ID/deploys/$DEPLOY_ID")
    
    STATUS=$(echo "$DEPLOY_DATA" | jq -r '.status')
    COMMIT_MSG=$(echo "$DEPLOY_DATA" | jq -r '.commit.message' | head -1)
    UPDATED_AT=$(echo "$DEPLOY_DATA" | jq -r '.updatedAt')
    
    # Afficher seulement si le statut change
    if [ "$STATUS" != "$PREV_STATUS" ]; then
        ELAPSED=$(($(date +%s) - START_TIME))
        echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} Status: ${YELLOW}$STATUS${NC} (${ELAPSED}s elapsed)"
        PREV_STATUS="$STATUS"
    fi
    
    # Vérifier si le déploiement est terminé
    case "$STATUS" in
        "live")
            echo -e "\n${GREEN}${BOLD}✅ DEPLOYMENT SUCCESSFUL!${NC}"
            echo -e "${GREEN}The service is now live.${NC}"
            echo -e "\n${BLUE}Commit:${NC} ${COMMIT_MSG:0:60}..."
            echo -e "${BLUE}Frontend URL:${NC} https://tradingpool-frontend.onrender.com"
            
            # Attendre 10s pour que le service démarre
            echo -e "\n${CYAN}Waiting 10s for service to start...${NC}"
            sleep 10
            
            # Tester le frontend
            echo -e "${CYAN}Testing frontend...${NC}"
            HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' https://tradingpool-frontend.onrender.com)
            
            if [ "$HTTP_CODE" -eq 200 ]; then
                echo -e "${GREEN}✅ Frontend is responding (HTTP $HTTP_CODE)${NC}"
            else
                echo -e "${YELLOW}⚠️  Frontend returned HTTP $HTTP_CODE${NC}"
            fi
            
            exit 0
            ;;
        "build_failed"|"deploy_failed")
            echo -e "\n${BOLD}${YELLOW}❌ DEPLOYMENT FAILED${NC}"
            echo -e "${YELLOW}Status: $STATUS${NC}"
            echo -e "\n${BLUE}Check logs at:${NC}"
            echo -e "  https://dashboard.render.com/web/$SERVICE_ID/deploys/$DEPLOY_ID"
            exit 1
            ;;
        "canceled")
            echo -e "\n${YELLOW}⚠️  Deployment was canceled${NC}"
            exit 1
            ;;
    esac
    
    # Attendre 5 secondes avant la prochaine vérification
    sleep 5
done
