import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { RsaKeyManager } from 'src/shared/utils/RsaKeyManager';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/ws/socket.io',
})
export class SocketGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(private readonly keyManager: RsaKeyManager) {}

  afterInit(server: Server) {
    // Enforce JWT auth on every Socket.IO connection.
    server.use((client, next) => {
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        return next(new Error('auth_error'));
      }

      try {
        const payload = jwt.verify(token, this.keyManager.getPublicKeyAccess(), {
          algorithms: ['RS256'],
        });

        // Attach user info for downstream handlers if needed later.
        client.data.user = payload;
        return next();
      } catch (error) {
        this.logger.warn(`Socket auth failed: ${(error as Error)?.message ?? error}`);
        return next(new Error('auth_error'));
      }
    });
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    // Preferred: io(..., { auth: { token } })
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) {
      return authToken.trim();
    }

    // Fallback: Authorization: Bearer <token>
    const authorization = client.handshake.headers?.authorization;
    if (typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    return undefined;
  }

  emitSensor(room: string, data: any) {
    this.server.emit(`sensor:${room}`, data);
  }

  emitDevices(data: any) {
    this.server.emit(`devices`, data);
  }

  emitDevice(room: string, data: any) {
    this.server.emit(`device:${room}`, data);
  }

  emitDeviceStatus(room: string, data: any) {
    this.server.emit(`device-status:${room}`, data);
  }
}