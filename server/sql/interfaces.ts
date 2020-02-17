import { ConnectionConfig } from 'tedious';

export type ConnectionConfigAndPool = ConnectionConfig & { pool: { min: number, max: number, idleTimeoutMillis: number } };
