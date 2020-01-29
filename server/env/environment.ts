import { config as dotenv } from 'dotenv';
import { config } from 'mssql';

dotenv();

export const DB_NAME = process.env.DB_NAME!;
export const JTW_KEY = process.env.JTW_KEY!;

const DB_PORT = parseInt(process.env.DB_PORT as string, undefined);

export const sqlConfig: config = {
  parseJSON: false,
  server: process.env.DB_HOST!,
  port: DB_PORT,
  database: DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  requestTimeout: 1000 * 60 * 2,
  pool: { min: 1000, max: 1000 * 10, autostart: true },
  options: { encrypt: true }
};

