import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { attachNotificationGateway } from './services/notification.service.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);
  attachNotificationGateway(server);

  server.on('error', async (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${env.port} is already in use. Stop the existing process or set PORT to another value.`);
      await disconnectDatabase();
      process.exit(1);
      return;
    }

    console.error('HTTP server failed to start.', error);
    await disconnectDatabase();
    process.exit(1);
  });

  server.listen(env.port, () => {
    const address = server.address() as AddressInfo | null;
    console.log(`Backend running on http://localhost:${address?.port ?? env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start backend application.', error);
  process.exit(1);
});
