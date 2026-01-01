import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface PoolHealthMetrics {
  poolId: string;
  currentPnL: number;
  dailyPnL: number;
  drawdownPercentage: number;
  isHealthy: boolean;
  alerts: string[];
}

interface Alert {
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  poolId?: string;
  poolName?: string;
  message: string;
  timestamp: Date;
  [key: string]: any;
}

interface UserNotification {
  type: string;
  message: string;
  [key: string]: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedUsers = new Map<string, string>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization;

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: no token`);
        client.disconnect();
        return;
      }

      const jwt = token.replace('Bearer ', '');
      const payload = this.jwtService.verify(jwt);

      client.join(`user_${payload.sub}`);
      this.connectedUsers.set(client.id, payload.sub);
      this.logger.log(
        `Client connected: ${client.id} (User: ${payload.sub})`
      );
    } catch (e) {
      this.logger.error(`Connection error: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('subscribeToPool')
  handleSubscribeToPool(
    @MessageBody() data: { poolId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`pool_${data.poolId}`);
    this.logger.log(`Client ${client.id} subscribed to pool ${data.poolId}`);
  }

  @SubscribeMessage('subscribeToAlerts')
  handleSubscribeToAlerts(@ConnectedSocket() client: Socket) {
    client.join('alerts');
    this.logger.log(`Client ${client.id} subscribed to alerts`);
  }

  broadcastPoolHealth(health: PoolHealthMetrics) {
    this.server.to(`pool_${health.poolId}`).emit('poolHealth', health);
    this.server.to('alerts').emit('poolHealthUpdate', health);
  }

  broadcastAlert(alert: Alert) {
    this.server.to('alerts').emit('systemAlert', alert);
    
    if (alert.severity === 'CRITICAL') {
      this.logger.error(`Critical alert: ${alert.message}`, alert);
    }
  }

  notifyUser(userId: string, notification: UserNotification) {
    this.server.to(`user_${userId}`).emit('userNotification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  broadcastPoolUpdate(poolId: string, update: any) {
    this.server.to(`pool_${poolId}`).emit('poolUpdate', {
      poolId,
      ...update,
      timestamp: new Date(),
    });
  }

  broadcastTradeExecuted(poolId: string, tradeData: any) {
    this.server.emit('trade:executed', {
      poolId,
      ...tradeData,
      timestamp: new Date(),
    });
  }

  broadcastPositionUpdate(poolId: string, positionData: any) {
    this.server.emit('position:update', {
      poolId,
      ...positionData,
      timestamp: new Date(),
    });
  }

  broadcastPnLUpdate(poolId: string, pnlData: any) {
    this.server.emit('pnl:update', {
      poolId,
      ...pnlData,
      timestamp: new Date(),
    });
  }

  broadcastGlobalStats(stats: any) {
    this.server.emit('globalStats', {
      ...stats,
      timestamp: new Date(),
    });
  }

  broadcastInvestmentUpdate(userId: string, investment: any) {
    this.server.to(`user_${userId}`).emit('investmentUpdate', {
      ...investment,
      timestamp: new Date(),
    });
  }
}
