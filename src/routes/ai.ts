import express from "express";
import db from "../db.ts";

const router = express.Router();

// Save AI history
router.post("/history", async (req, res) => {
  let connection;
  try {
    const { user_id, module, prompt, response } = req.body;
    connection = await db.getConnection();
    await connection.query(
      "INSERT INTO ai_history (user_id, module, prompt, response) VALUES (?, ?, ?, ?)",
      [user_id, module, prompt, response]
    );
    res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error saving AI history:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Get AI history for a user
router.get("/history/:user_id", async (req, res) => {
  let connection;
  try {
    const { user_id } = req.params;
    connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM ai_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [user_id]
    );
    res.json(rows);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching AI history:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
