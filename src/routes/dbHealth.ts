import { Router } from "express";
import db from "../db.ts";

const router = Router();

router.get("/db-health", async (_req, res) => {
  if (!process.env.DB_HOST || process.env.DB_HOST === '') {
    return res.json({ 
      status: "not_configured", 
      message: "DB_HOST is not set. Please add your Hostinger MySQL host in Settings > Secrets." 
    });
  }
  try {
    const connection = await db.getConnection();
    
    // Check for tables
    const [tables] = await connection.query("SHOW TABLES") as [Record<string, unknown>[], unknown];
    const tableList = tables.map((t) => Object.values(t)[0] as string);
    
    connection.release();
    res.json({ 
      status: "connected", 
      message: "Successfully connected to the database.",
      tables: tableList,
      isInitialized: tableList.includes('admins') && tableList.includes('invoices')
    });
  } catch (error: unknown) {
    const mysqlError = error as { message?: string; code?: string };
    const errMessage = mysqlError.message || String(error);
    const errCode = mysqlError.code;
    
    let status = "error";
    let message = errMessage;

    if (errCode === 'ER_ACCESS_DENIED_ERROR' || errMessage.includes("Access denied")) {
      status = "auth_error";
      message = "Access Denied: The username or password for your Hostinger database is incorrect. Please double-check your 'DB_PASSWORD' in Settings > Secrets.";
    } else if (errMessage.includes("ECONNREFUSED") && errMessage.includes("127.0.0.1")) {
      status = "not_configured";
      message = "The app is trying to connect to localhost. Please set your remote Hostinger DB_HOST in Settings.";
    } else if (errMessage.includes("ETIMEDOUT")) {
      message = "Connection timed out. Ensure Remote MySQL is enabled in Hostinger and your IP is allowed.";
    }

    res.status(500).json({ status, message, code: errCode });
  }
});

export default router;
