import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Authentification du socket via le token JWT
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization;

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: no token`);
        client.disconnect();
        return;
      }

      // Nettoyage du Bearer
      const jwt = token.replace('Bearer ', '');
      const payload = this.jwtService.verify(jwt);

      // Rejoindre une "room" spécifique à l'utilisateur pour les notifs privées
      client.join(`user_${payload.sub}`);
      this.logger.log(
        `Client connected: ${client.id} (User: ${payload.sub})`
      );
    } catch (e) {
      this.logger.error(`Connection error: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Diffuser les mises à jour de pool à tout le monde
  broadcastPoolUpdate(poolId: string, data: any) {
    this.server.emit('pool:update', {
      poolId,
      ...data,
      timestamp: new Date(),
    });
  }

  // Diffuser les mises à jour de trade
  broadcastTradeExecuted(poolId: string, tradeData: any) {
    this.server.emit('trade:executed', {
      poolId,
      ...tradeData,
      timestamp: new Date(),
    });
  }

  // Diffuser les mises à jour de position
  broadcastPositionUpdate(poolId: string, positionData: any) {
    this.server.emit('position:update', {
      poolId,
      ...positionData,
      timestamp: new Date(),
    });
  }

  // Diffuser les mises à jour de PnL
  broadcastPnLUpdate(poolId: string, pnlData: any) {
    this.server.emit('pnl:update', {
      poolId,
      ...pnlData,
      timestamp: new Date(),
    });
  }

  // Notifier un utilisateur spécifique
  notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
  }
}
