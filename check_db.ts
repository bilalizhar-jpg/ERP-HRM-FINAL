import db from "./src/db";

async function checkDb() {
  try {
    const connection = await db.getConnection();
    console.log("Database connection successful!");
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tables:", tables);
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

checkDb();
