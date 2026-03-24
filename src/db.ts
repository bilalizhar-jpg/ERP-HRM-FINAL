import 'dotenv/config';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'not-configured', // Prevent defaulting to 127.0.0.1
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 
};

if (!process.env.DB_HOST) {
  console.error('CRITICAL: DB_HOST is not defined in environment variables.');
}

const pool = mysql.createPool(dbConfig);

export default pool;
