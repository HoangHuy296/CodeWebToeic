// Minimal in-process WebSocket gateway that fans bell notifications out to connected role/user targets.
import { createHash, randomUUID } from 'node:crypto';
import type { IncomingMessage, Server as HttpServer } from 'node:http';
import type { Socket } from 'node:net';
import { URL } from 'node:url';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AppNotification, NotificationDispatchInput, NotificationRole } from '../types/notification.js';

interface ConnectedClient {
  socket: Socket;
  userId: string;
  role: NotificationRole;
}

const clients = new Set<ConnectedClient>();
const WEB_SOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function serializeNotification(input: NotificationDispatchInput): AppNotification {
  return {
    id: randomUUID(),
    title: input.title,
    message: input.message,
    severity: input.severity,
    channel: input.channel ?? 'system',
    entityType: input.entityType,
    createdAt: new Date().toISOString(),
    actorRole: input.actorRole,
    actorUserId: input.actorUserId,
    metadata: input.metadata,
  };
}

function parseAccessToken(requestUrl: string | undefined, host: string | undefined): string | null {
  if (!requestUrl || !host) {
    return null;
  }

  const url = new URL(requestUrl, `http://${host}`);
  return url.pathname === '/ws/notifications' ? url.searchParams.get('token') : null;
}

function buildAcceptKey(key: string): string {
  return createHash('sha1')
    .update(`${key}${WEB_SOCKET_GUID}`)
    .digest('base64');
}

function encodeTextFrame(payload: string): Buffer {
  const body = Buffer.from(payload);

  if (body.length < 126) {
    return Buffer.concat([Buffer.from([0x81, body.length]), body]);
  }

  if (body.length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
    return Buffer.concat([header, body]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(body.length), 2);
  return Buffer.concat([header, body]);
}

function sendEvent(socket: Socket, type: 'connected' | 'notification', payload: unknown): void {
  if (socket.destroyed || !socket.writable) {
    return;
  }

  socket.write(encodeTextFrame(JSON.stringify({ type, payload })));
}

function removeClient(target: ConnectedClient): void {
  clients.delete(target);
}

function attachSocketLifecycle(client: ConnectedClient): void {
  const cleanup = () => removeClient(client);

  client.socket.on('close', cleanup);
  client.socket.on('end', cleanup);
  client.socket.on('error', cleanup);
  client.socket.on('data', (chunk: Buffer) => {
    if (chunk.length === 0) {
      return;
    }

    const opcode = chunk[0] & 0x0f;

    if (opcode === 0x8) {
      client.socket.end();
    }
  });
}

export function attachNotificationGateway(server: HttpServer): void {
  server.on('upgrade', (request: IncomingMessage, socket: Socket) => {
    const token = parseAccessToken(request.url, request.headers.host);
    const key = request.headers['sec-websocket-key'];

    if (!token || typeof key !== 'string') {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      const role = payload.role;

      if (role === 'guest') {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      socket.write(
        [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Accept: ${buildAcceptKey(key)}`,
          '\r\n',
        ].join('\r\n'),
      );

      const client: ConnectedClient = {
        socket,
        userId: payload.userId,
        role,
      };

      clients.add(client);
      attachSocketLifecycle(client);
      sendEvent(socket, 'connected', {
        userId: payload.userId,
        role,
        connectedAt: new Date().toISOString(),
      });
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
    }
  });
}

export function dispatchNotification(input: NotificationDispatchInput): void {
  const notification = serializeNotification(input);
  const allowedRoles = new Set(input.roles ?? []);
  const allowedUserIds = new Set(input.userIds ?? []);
  const excludedUserIds = new Set(input.excludeUserIds ?? []);

  clients.forEach((client) => {
    if (excludedUserIds.has(client.userId)) {
      return;
    }

    const matchesRole = allowedRoles.size > 0 && allowedRoles.has(client.role);
    const matchesUser = allowedUserIds.size > 0 && allowedUserIds.has(client.userId);

    if ((allowedRoles.size === 0 && allowedUserIds.size === 0) || (!matchesRole && !matchesUser)) {
      return;
    }

    sendEvent(client.socket, 'notification', notification);
  });
}

export function notifyUsers(userIds: string[], input: Omit<NotificationDispatchInput, 'userIds'>): void {
  dispatchNotification({
    ...input,
    userIds,
  });
}

export function notifyRoles(roles: NotificationRole[], input: Omit<NotificationDispatchInput, 'roles'>): void {
  dispatchNotification({
    ...input,
    roles,
  });
}
