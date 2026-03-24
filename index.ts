import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import db from "./src/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const environment = process.env.NODE_ENV ?? "development";

  console.log("Starting server...");
  console.log(`Environment: ${environment}`);
  console.log(`Port: ${PORT}`);

  app.use(express.json());

  // API routes
  app.get("/api/db-health", async (req, res) => {
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
        isInitialized: tableList.includes('admins')
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

  // Initialize database tables
  app.post("/api/init-db", async (req, res) => {
    try {
      const connection = await db.getConnection();
      
      // Create admins table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role ENUM('admin', 'user') DEFAULT 'user',
          subscription_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create subscriptions table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          plan VARCHAR(50) NOT NULL,
          status ENUM('active', 'expired', 'trial') DEFAULT 'trial',
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default super admin if not exists
      const [existingAdmins] = await connection.query("SELECT * FROM admins WHERE email = 'admin@erp.com'") as [Record<string, unknown>[], unknown];
      if (existingAdmins.length === 0) {
        await connection.query("INSERT INTO admins (email, password, name) VALUES ('admin@erp.com', 'admin123', 'Super Admin')");
      }

      connection.release();
      res.json({ success: true, message: "Database initialized successfully." });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/contact-us", async (req, res) => {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: '"Contact Form" <info@inforesumeedge.com>',
        to: "info@inforesumeedge.com",
        subject: "New Contact Form Submission",
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  app.post("/api/request-demo", async (req, res) => {
    const { name, email, description, date } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: '"HRM & ERP Platform" <info@inforesumeedge.com>',
        to: "info@inforesumeedge.com",
        subject: "New Demo Request",
        text: `New demo request from ${name} (${email}) for ${date}.\nDescription: ${description}`,
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (environment !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname); 
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    
    app.get('/{*path}', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`Error sending index.html: ${err.message}`);
          res.status(500).send("Server Error: Could not load frontend.");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Test database connection in the background
    if (process.env.DB_HOST) {
      console.log(`Testing connection to: ${process.env.DB_HOST}`);
      db.getConnection()
        .then(connection => {
          console.log("✅ Database connected successfully to Hostinger");
          connection.release();
        })
        .catch(error => {
          const errMessage = error instanceof Error ? error.message : String(error);
          console.error("❌ Database connection failed.");
          if (errMessage.includes("ECONNREFUSED") && errMessage.includes("127.0.0.1")) {
            console.error("TIP: The app is defaulting to localhost. Please set DB_HOST in Settings > Secrets to your Hostinger MySQL host.");
          } else if (errMessage.includes("ETIMEDOUT")) {
            console.error("TIP: Connection timed out. Make sure you have allowed remote access in Hostinger hPanel > Remote MySQL.");
          }
          console.error("Error details:", errMessage);
        });
    } else {
      console.warn("⚠️ DB_HOST is not set. Database features will be disabled until configured in Settings > Secrets.");
    }
  });
}

startServer();
