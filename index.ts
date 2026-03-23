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
      connection.release();
      res.json({ status: "connected", message: "Successfully connected to the database." });
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      let status = "error";
      let message = errMessage;

      if (errMessage.includes("ECONNREFUSED") && errMessage.includes("127.0.0.1")) {
        status = "not_configured";
        message = "The app is trying to connect to localhost (127.0.0.1). Please set your remote Hostinger DB_HOST in Settings.";
      } else if (errMessage.includes("ETIMEDOUT")) {
        message = "Connection timed out. Ensure Remote MySQL is enabled in Hostinger and your IP is allowed.";
      }

      res.status(500).json({ status, message });
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
  if (process.env.NODE_ENV !== "production") {
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
    
    app.get('(.*)', (req, res) => {
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
