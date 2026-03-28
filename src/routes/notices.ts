import { Router } from "express";
import db from "../db";

const router = Router();

router.get("/", async (req, res) => {
  const { company_id } = req.query;
  if (!company_id) return res.status(400).json({ error: "Missing company_id" });
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM notices WHERE company_id = ? ORDER BY notice_date DESC",
      [company_id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

router.post("/", async (req, res) => {
  const { company_id, notice_type, description, notice_date, notice_by, attachment_url } = req.body;
  if (!company_id || !notice_type || !description || !notice_date || !notice_by) return res.status(400).json({ error: "Missing required fields" });
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query(
      "INSERT INTO notices (company_id, notice_type, description, notice_date, notice_by, attachment_url) VALUES (?, ?, ?, ?, ?, ?)",
      [company_id, notice_type, description, notice_date, notice_by, attachment_url || null]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving notice:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query("DELETE FROM notices WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
