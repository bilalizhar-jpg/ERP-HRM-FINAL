import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (!dbConfig.host) {
  console.warn('DB_HOST is not defined. Database connection will likely fail or default to localhost.');
}

const pool = mysql.createPool(dbConfig);

export default pool;
