import express from 'express';
import db from '../db.ts';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendEmailNotification = async (to: string, subject: string, text: string) => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) return;
  try {
    await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text });
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'uploads/messages';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/messages/${req.file.filename}`;
  res.json({ success: true, fileUrl, fileName: req.file.originalname, fileType: req.file.mimetype });
});

// Edit a message
router.put('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { content } = req.body;
    connection = await db.getConnection();
    await connection.query('UPDATE messages SET content = ?, is_edited = 1 WHERE id = ?', [content, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await db.getConnection();
    await connection.query('UPDATE messages SET is_deleted = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Get chats for a user with last message and participant info
router.get('/chats', async (req, res) => {
  let connection;
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });
    
    connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, 
             (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = ?
      ORDER BY last_message_at DESC
    `, [user_id]) as [unknown[], unknown];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Get all employees for DMs
router.get('/employees', async (req, res) => {
  let connection;
  try {
    const { company_id } = req.query;
    connection = await db.getConnection();
    const [rows] = await connection.query('SELECT id, name, email, profile_picture FROM employees WHERE company_id = ?', [company_id]) as [unknown[], unknown];
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Get or create a DM chat
router.post('/dm', async (req, res) => {
  let connection;
  try {
    const { user1_id, user2_id } = req.body;
    connection = await db.getConnection();
    
    // Check if DM exists
    const [existing] = await connection.query(`
      SELECT c.id 
      FROM chats c
      JOIN chat_participants cp1 ON c.id = cp1.chat_id
      JOIN chat_participants cp2 ON c.id = cp2.chat_id
      WHERE c.type = 'one-to-one' 
      AND cp1.user_id = ? 
      AND cp2.user_id = ?
    `, [user1_id, user2_id]);
    
    if ((existing as unknown[]).length > 0) {
      return res.json({ success: true, chat_id: (existing as { id: number }[])[0].id });
    }
    
    // Create new DM
    await connection.beginTransaction();
    const [result] = await connection.query('INSERT INTO chats (type) VALUES (?)', ['one-to-one']);
    const chat_id = (result as { insertId: number }).insertId;
    
    await connection.query('INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?), (?, ?)', [chat_id, user1_id, chat_id, user2_id]);
    
    await connection.commit();
    res.json({ success: true, chat_id });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Create a chat
router.post('/chats', async (req, res) => {
  let connection;
  try {
    const { type, name, participant_ids } = req.body;
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.query('INSERT INTO chats (type, name) VALUES (?, ?)', [type, name]);
    const chat_id = (result as { insertId: number }).insertId;
    
    for (const user_id of participant_ids) {
      await connection.query('INSERT INTO chat_participants (chat_id, user_id) VALUES (?, ?)', [chat_id, user_id]);
    }
    await connection.commit();
    res.json({ success: true, chat_id });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Get messages for a chat with sender info and reactions
router.get('/:chat_id', async (req, res) => {
  let connection;
  try {
    const { chat_id } = req.params;
    connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT m.*, e.name as sender_name, e.profile_picture as sender_avatar,
             (SELECT GROUP_CONCAT(CONCAT(emoji, ':', user_id)) FROM message_reactions WHERE message_id = m.id) as reactions
      FROM messages m
      JOIN employees e ON m.sender_id = e.id
      WHERE m.chat_id = ? 
      ORDER BY m.created_at ASC
    `, [chat_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Add a reaction
router.post('/reactions', async (req, res) => {
  let connection;
  try {
    const { message_id, user_id, emoji } = req.body;
    connection = await db.getConnection();
    await connection.query(
      'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE emoji = VALUES(emoji)',
      [message_id, user_id, emoji]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Remove a reaction
router.delete('/reactions', async (req, res) => {
  let connection;
  try {
    const { message_id, user_id, emoji } = req.body;
    connection = await db.getConnection();
    await connection.query(
      'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      [message_id, user_id, emoji]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Send a message
router.post('/', async (req, res) => {
  let connection;
  try {
    const { chat_id, sender_id, content, type, parent_id } = req.body;
    connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO messages (chat_id, sender_id, content, type, parent_id) VALUES (?, ?, ?, ?, ?)',
      [chat_id, sender_id, content, type || 'text', parent_id || null]
    );

    // Send email notifications to other participants (simplified)
    const [participants] = await connection.query(
      'SELECT e.email FROM chat_participants cp JOIN employees e ON cp.user_id = e.id WHERE cp.chat_id = ? AND cp.user_id != ?',
      [chat_id, sender_id]
    ) as [unknown[], unknown];

    for (const p of participants as { email: string }[]) {
      sendEmailNotification(p.email, 'New Message in ERP', `You have a new message from a colleague: ${content}`);
    }

    res.json({ success: true, message_id: (result as { insertId: number }).insertId });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Generate a guest invite link
router.post('/invite-guest', async (req, res) => {
  let connection;
  try {
    const { chat_id, email, invited_by } = req.body;
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7); // 7 days expiry
    
    connection = await db.getConnection();
    await connection.query(
      'INSERT INTO guest_invites (chat_id, email, token, invited_by, expires_at) VALUES (?, ?, ?, ?, ?)',
      [chat_id, email, token, invited_by, expires_at]
    );
    
    const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/guest/join/${token}`;
    res.json({ success: true, inviteLink, token });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Verify guest token and join
router.get('/verify-guest/:token', async (req, res) => {
  let connection;
  try {
    const { token } = req.params;
    connection = await db.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM guest_invites WHERE token = ? AND expires_at > NOW() AND used = 0',
      [token]
    );
    
    if ((rows as unknown[]).length === 0) {
      return res.status(404).json({ error: "Invalid or expired invite link" });
    }
    
    res.json({ success: true, invite: (rows as unknown[])[0] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

// Mark messages as read
router.post('/read/:chat_id', async (req, res) => {
  let connection;
  try {
    const { chat_id } = req.params;
    const { user_id } = req.body;
    connection = await db.getConnection();
    
    // Get all messages in this chat that are not from the current user
    const [messages] = await connection.query(
      'SELECT id FROM messages WHERE chat_id = ? AND sender_id != ?',
      [chat_id, user_id]
    ) as [unknown[], unknown];

    for (const msg of messages as { id: number }[]) {
      await connection.query(
        'INSERT IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)',
        [msg.id, user_id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
