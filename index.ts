import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import db from "./src/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  console.log("Starting server...");
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${PORT}`);

  app.use(express.json());

  // Test database connection
  if (process.env.DB_HOST) {
    try {
      const connection = await db.getConnection();
      console.log("Database connected successfully");
      connection.release();
    } catch (error) {
      console.error("Database connection failed. Please check your credentials in the Settings menu.");
      console.error("Error details:", error instanceof Error ? error.message : String(error));
    }
  } else {
    console.warn("DB_HOST is not set. Skipping database connection test. Please configure your database in the Settings menu.");
  }

  app.post("/api/contact-us", async (req, res) => {
    const { name, email, message } = req.body;

    // Configure nodemailer
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

  // API routes
  app.get("/api/db-health", async (req, res) => {
    if (!process.env.DB_HOST) {
      return res.json({ status: "not_configured", message: "DB_HOST is not set in environment variables." });
    }
    try {
      const connection = await db.getConnection();
      connection.release();
      res.json({ status: "connected", message: "Successfully connected to the database." });
    } catch (error) {
      res.status(500).json({ status: "error", message: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/request-demo", async (req, res) => {
    const { name, email, description, date } = req.body;

    // Configure nodemailer
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
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, index.js is inside the dist folder
    const distPath = __dirname; 
    console.log(`Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
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
  });
}

startServer();
