import { createApp } from './app';
import { env } from './config/env';
import { runMigrations } from './database/migrate';
import { closePool } from './database/pool';
import { initSocketServer } from './socket';

async function main(): Promise<void> {
  await runMigrations();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`[Server] Running on port ${env.port} in ${env.nodeEnv} mode`);
  });

  initSocketServer(server);

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      await closePool();
      console.log('[Server] Shutdown complete.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('[Server] Fatal error during startup:', err);
  process.exit(1);
});
