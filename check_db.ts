import db from './src/db';

async function checkSchema() {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query('DESCRIBE companies');
    console.log('Companies Table Schema:', rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
  }
}

checkSchema();
