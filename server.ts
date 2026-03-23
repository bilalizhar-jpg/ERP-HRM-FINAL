import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./src/generated/prisma";
import { createServer as createViteServer } from "vite";
import path from "path";

dotenv.config();

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MSSQL via Prisma
  try {
    await prisma.$connect();
    console.log("Connected to MSSQL via Prisma");
  } catch (error) {
    console.error("Error connecting to MSSQL:", error);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
