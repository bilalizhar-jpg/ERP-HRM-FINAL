import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import db from "./src/db.ts";
import { initializeDatabase } from "./src/db/initializeDatabase";
import cron from "node-cron";
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState as getAuthState, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import fs from "fs";
import { join } from "path";
import dbHealthRouter from "./src/routes/dbHealth";
import noticesRouter from "./src/routes/notices";

interface AttendanceRecord {
  id: number;
  company_id: number;
  employee_id: number;
  date: string;
  check_in_time: Date | null;
  check_out_time: Date | null;
  break_start_time: Date | null;
  break_end_time: Date | null;
  break_duration_minutes: number;
  status: string;
  check_in_lat: number | null;
  check_in_long: number | null;
  check_out_lat: number | null;
  check_out_long: number | null;
  selfie_url: string | null;
  is_late: boolean;
  working_hours: number;
  overtime_hours: number;
  created_at?: Date;
}

interface AlertSetting {
  company_id: number;
  message_template: string;
  grace_time?: number;
  idle_minutes?: number;
}

interface EmployeeRow {
  id: number;
  name: string;
  mobile: string;
  last_activity_time?: string;
}

const __filename = typeof import.meta !== 'undefined' ? fileURLToPath(import.meta.url) : (globalThis as Record<string, unknown>).__filename as string;
const __dirname = typeof import.meta !== 'undefined' ? path.dirname(__filename) : (globalThis as Record<string, unknown>).__dirname as string;

async function startServer() {
  process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  });

  const app = express();
  const PORT = process.env.PORT || 3000;

  console.log("Starting server...");
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${PORT}`);

  app.use(express.json());

  app.use("/api", (req, res, next) => {
    console.log(`[${new Date().toISOString()}] API request: ${req.method} ${req.url}`);
    next();
  });

  app.use("/api", dbHealthRouter);
  app.use("/api/notices", noticesRouter);

  app.get("/api/ping", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.post("/api/init-db", async (req, res) => {
    try {
      const connection = await db.getConnection();
      await initializeDatabase(connection);
      connection.release();
      res.json({ success: true, message: "Database initialized successfully." });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Database initialization error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Employees API
  app.get("/api/employees", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      let query = "SELECT id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields, created_at FROM employees";
      const params: (string | number)[] = [];
      
      if (company_id) {
        query += " WHERE company_id = ?";
        params.push(company_id as string);
      }
      
      query += " ORDER BY created_at DESC";
      
      const [rows] = await connection.query(query, params);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching employees:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/employees", async (req, res) => {
    let connection;
    try {
      const { company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields } = req.body;
      connection = await db.getConnection();
      
      // Hash password - changed to plain text for admin visibility as requested
      const passwordToStore = password || '123456';
      
      const [result] = await connection.query(
        "INSERT INTO employees (company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [company_id, name, email, passwordToStore, employee_id, department, designation, status || 'active', mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields ? JSON.stringify(custom_fields) : null]
      );
      
      const insertId = (result as { insertId: number }).insertId;
      
      // Send WhatsApp Welcome Message
      try {
        const [welcomeSettings] = await connection.query(
          "SELECT * FROM employee_welcome_settings WHERE company_id = ? AND is_active = TRUE",
          [company_id]
        ) as [unknown[], unknown];

        if (welcomeSettings.length > 0 && mobile_no) {
          const setting = (welcomeSettings as AlertSetting[])[0];
          const template = setting.message_template || "Dear {{employee_name}},\nWelcome to the company.\n\nYour login details are:\nUsername: {{username}}\nPassword: {{password}}\n\nPlease login and update your password.\n\nThank you";
          
          let message = template.replace(/{{employee_name}}/g, name || '');
          message = message.replace(/{{username}}/g, username || '');
          message = message.replace(/{{password}}/g, passwordToStore);

          // Use fetch to call our own API to handle rate limiting and Baileys logic
          fetch(`http://127.0.0.1:3000/api/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id,
              to_number: mobile_no,
              message
            })
          }).catch(err => console.error("[WhatsApp] Failed to trigger welcome message:", err));
        }
      } catch (waErr) {
        console.error("[WhatsApp] Error processing welcome message:", waErr);
      }

      res.json({ success: true, id: insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating employee:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields } = req.body;
      connection = await db.getConnection();
      
      await connection.query(
        "UPDATE employees SET name = ?, email = ?, employee_id = ?, department = ?, designation = ?, status = ?, mobile_no = ?, date_of_birth = ?, joining_date = ?, blood_group = ?, location = ?, city = ?, employee_type = ?, national_id = ?, salary = ?, tax_deduction = ?, bank_name = ?, bank_account_no = ?, mode_of_payment = ?, username = ?, profile_picture = ?, custom_fields = ? WHERE id = ?",
        [name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields ? JSON.stringify(custom_fields) : null, id]
      );
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating employee:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await db.getConnection();
      
      await connection.query("DELETE FROM employees WHERE id = ?", [id]);
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting employee:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Awards API
  app.get("/api/awards", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT a.*, e.name as employee_name FROM awards a JOIN employees e ON a.employee_id = e.id WHERE a.company_id = ? ORDER BY a.created_at DESC",
        [company_id]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/awards", async (req, res) => {
    let connection;
    try {
      const { company_id, name, description, gift, date, employee_id, award_by } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO awards (company_id, name, description, gift, date, employee_id, award_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [company_id, name, description, gift, date, employee_id, award_by]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  // Weekly Holidays API
  app.get("/api/weekly-holidays", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM weekly_holidays WHERE company_id = ?", [company_id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/weekly-holidays", async (req, res) => {
    let connection;
    try {
      const { company_id, day_of_week, is_active } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO weekly_holidays (company_id, day_of_week, is_active) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_active = ?",
        [company_id, day_of_week, is_active, is_active]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  // Holidays API
  app.get("/api/holidays", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM holidays WHERE company_id = ? ORDER BY date ASC", [company_id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/holidays", async (req, res) => {
    let connection;
    try {
      const { company_id, name, date, description } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO holidays (company_id, name, date, description) VALUES (?, ?, ?, ?)",
        [company_id, name, date, description]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete("/api/holidays/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await db.getConnection();
      await connection.query("DELETE FROM holidays WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  // Leave Types API
  app.get("/api/leave-types", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM leave_types WHERE company_id = ?", [company_id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/leave-types", async (req, res) => {
    let connection;
    try {
      const { company_id, name, days_allowed } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO leave_types (company_id, name, days_allowed) VALUES (?, ?, ?)",
        [company_id, name, days_allowed]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete("/api/leave-types/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await db.getConnection();
      await connection.query("DELETE FROM leave_types WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  // Leave Requests API
  app.get("/api/leave-requests", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT l.*, e.name as employee_name FROM leaves l JOIN employees e ON l.employee_id = e.id WHERE l.company_id = ? ORDER BY l.created_at DESC",
        [company_id]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/leave-requests/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { status } = req.body;
      connection = await db.getConnection();
      await connection.query("UPDATE leaves SET status = ? WHERE id = ?", [status, id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  // Departments API
  app.get("/api/departments", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM departments WHERE company_id = ? ORDER BY created_at DESC", [company_id]);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching departments:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/departments", async (req, res) => {
    let connection;
    try {
      const { company_id, name, head_of_department, status } = req.body;
      connection = await db.getConnection();
      
      const [result] = await connection.query(
        "INSERT INTO departments (company_id, name, head_of_department, status) VALUES (?, ?, ?, ?)",
        [company_id, name, head_of_department, status || 'active']
      );
      
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating department:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { name, head_of_department, status } = req.body;
      connection = await db.getConnection();
      
      await connection.query(
        "UPDATE departments SET name = ?, head_of_department = ?, status = ? WHERE id = ?",
        [name, head_of_department, status, id]
      );
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating department:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await db.getConnection();
      
      await connection.query("DELETE FROM departments WHERE id = ?", [id]);
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting department:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Designations API
  app.get("/api/designations", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      connection = await db.getConnection();
      const [rows] = await connection.query(`
        SELECT d.*, dep.name as department_name 
        FROM designations d
        JOIN departments dep ON d.department_id = dep.id
        WHERE d.company_id = ? 
        ORDER BY d.created_at DESC
      `, [company_id]);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching designations:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/designations", async (req, res) => {
    let connection;
    try {
      const { company_id, department_id, name, status } = req.body;
      connection = await db.getConnection();
      
      const [result] = await connection.query(
        "INSERT INTO designations (company_id, department_id, name, status) VALUES (?, ?, ?, ?)",
        [company_id, department_id, name, status || 'active']
      );
      
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating designation:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/designations/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { department_id, name, status } = req.body;
      connection = await db.getConnection();
      
      await connection.query(
        "UPDATE designations SET department_id = ?, name = ?, status = ? WHERE id = ?",
        [department_id, name, status, id]
      );
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating designation:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete("/api/designations/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await db.getConnection();
      
      await connection.query("DELETE FROM designations WHERE id = ?", [id]);
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting designation:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Dashboard Widgets API
  app.get("/api/dashboard-widgets", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM dashboard_widgets WHERE company_id = ? ORDER BY position ASC", [company_id]);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching dashboard widgets:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/dashboard-widgets", async (req, res) => {
    let connection;
    try {
      const { company_id, widgets } = req.body; // widgets: [{widget_id, is_enabled, position}, ...]
      connection = await db.getConnection();
      
      for (const widget of widgets) {
        await connection.query(`
          INSERT INTO dashboard_widgets (company_id, widget_id, is_enabled, position)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE is_enabled = ?, position = ?
        `, [company_id, widget.widget_id, widget.is_enabled, widget.position, widget.is_enabled, widget.position]);
      }
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating dashboard widgets:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Modules API
  app.get("/api/modules", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM modules");
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching modules:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/modules", async (req, res) => {
    let connection;
    try {
      const { name, description, status } = req.body;
      connection = await db.getConnection();
      const [result] = await connection.query(
        "INSERT INTO modules (name, description, status) VALUES (?, ?, ?)",
        [name, description, status || 'active']
      );
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating module:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/company-modules", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      const query = company_id 
        ? "SELECT m.*, cm.is_enabled FROM modules m LEFT JOIN company_modules cm ON m.id = cm.module_id AND cm.company_id = ?"
        : "SELECT * FROM modules";
      const params = company_id ? [company_id] : [];
      const [rows] = await connection.query(query, params);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching company modules:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/company-modules", async (req, res) => {
    let connection;
    try {
      const { company_id, module_id, is_enabled } = req.body;
      connection = await db.getConnection();
      await connection.query(`
        INSERT INTO company_modules (company_id, module_id, is_enabled)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE is_enabled = ?
      `, [company_id, module_id, is_enabled, is_enabled]);
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating company module:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Attendance API
  app.get("/api/attendance", async (req, res) => {
    let connection;
    try {
      const { company_id, date, start, end } = req.query;
      connection = await db.getConnection();
      
      let query = `
        SELECT a.*, 
               COALESCE(a.check_in, DATE_FORMAT(a.check_in_time, '%H:%i')) as check_in,
               COALESCE(a.check_out, DATE_FORMAT(a.check_out_time, '%H:%i')) as check_out,
               COALESCE(a.break_time, a.break_duration_minutes) as break_time,
               e.name as employee_name, e.employee_id as emp_code 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.company_id = ?
      `;
      const params: (string | number)[] = [company_id as string];
      
      if (date) {
        query += " AND a.date = ?";
        params.push(date as string);
      } else if (start && end) {
        query += " AND a.date >= ? AND a.date <= ?";
        params.push(start as string, end as string);
      }
      
      query += " ORDER BY a.date DESC, e.name ASC";
      
      const [rows] = await connection.query(query, params);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/attendance", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, shift_id, date, check_in, check_out, break_time, status, is_late, working_hours, overtime_hours } = req.body;
      connection = await db.getConnection();
      
      // Upsert attendance record
      await connection.query(`
        INSERT INTO attendance (company_id, employee_id, shift_id, date, check_in, check_out, break_time, status, is_late, working_hours, overtime_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          shift_id = VALUES(shift_id),
          check_in = VALUES(check_in),
          check_out = VALUES(check_out),
          break_time = VALUES(break_time),
          status = VALUES(status),
          is_late = VALUES(is_late),
          working_hours = VALUES(working_hours),
          overtime_hours = VALUES(overtime_hours)
      `, [company_id, employee_id, shift_id || null, date, check_in || null, check_out || null, break_time || 0, status, is_late || false, working_hours || 0, overtime_hours || 0]);
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error saving attendance:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // --- Time Tracking APIs ---
  app.get("/api/time-tracking/settings/:company_id", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.params;
      connection = await db.getConnection();
      const [rows] = await connection.query(`
        SELECT tts.*, e.name as employee_name 
        FROM time_tracking_settings tts
        JOIN employees e ON tts.employee_id = e.id
        WHERE tts.company_id = ?
      `, [company_id]) as [Record<string, unknown>[], unknown];
      
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching time tracking settings list:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/time-tracking/settings/:company_id/:employee_id", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id } = req.params;
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM time_tracking_settings WHERE company_id = ? AND employee_id = ?",
        [company_id, employee_id]
      ) as [Record<string, unknown>[], unknown];
      
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json({
          company_id: parseInt(company_id),
          employee_id: parseInt(employee_id),
          status: 'deactive',
          auto_mode: 'off',
          is_enabled: false,
          screenshot_enabled: false,
          screenshot_interval: 10,
          idle_threshold: 5
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching time tracking settings:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/time-tracking/settings", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, status, auto_mode, is_enabled, screenshot_enabled, screenshot_interval, idle_threshold } = req.body;
      connection = await db.getConnection();
      
      await connection.query(`
        INSERT INTO time_tracking_settings (company_id, employee_id, status, auto_mode, is_enabled, screenshot_enabled, screenshot_interval, idle_threshold)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          auto_mode = VALUES(auto_mode),
          is_enabled = VALUES(is_enabled),
          screenshot_enabled = VALUES(screenshot_enabled),
          screenshot_interval = VALUES(screenshot_interval),
          idle_threshold = VALUES(idle_threshold)
      `, [company_id, employee_id, status || 'deactive', auto_mode || 'off', is_enabled || false, screenshot_enabled || false, screenshot_interval || 10, idle_threshold || 5]);
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error saving time tracking settings:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/time-tracking/sync", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, date, hour, active_minutes, idle_minutes, keystrokes, mouse_clicks } = req.body;
      connection = await db.getConnection();
      
      await connection.query(`
        INSERT INTO time_tracking_logs (company_id, employee_id, date, hour, active_minutes, idle_minutes, keystrokes, mouse_clicks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          active_minutes = active_minutes + VALUES(active_minutes),
          idle_minutes = idle_minutes + VALUES(idle_minutes),
          keystrokes = keystrokes + VALUES(keystrokes),
          mouse_clicks = mouse_clicks + VALUES(mouse_clicks)
      `, [company_id, employee_id, date, hour, active_minutes || 0, idle_minutes || 0, keystrokes || 0, mouse_clicks || 0]);
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error syncing time tracking data:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/time-tracking/screenshot", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, image_data } = req.body;
      connection = await db.getConnection();
      
      await connection.query(
        "INSERT INTO time_tracking_screenshots (company_id, employee_id, image_data) VALUES (?, ?, ?)",
        [company_id, employee_id, image_data]
      );
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error saving screenshot:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/time-tracking/logs/:company_id/:employee_id", async (req, res) => {
    try {
      const { company_id, employee_id } = req.params;
      const { date } = req.query;
      const connection = await db.getConnection();
      
      let query = "SELECT * FROM time_tracking_logs WHERE company_id = ? AND employee_id = ?";
      const params: (string | number)[] = [company_id, employee_id];
      
      if (date) {
        query += " AND date = ?";
        params.push(date);
      }
      
      query += " ORDER BY date DESC, hour DESC";
      
      const [rows] = await connection.query(query, params);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching time tracking logs:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/time-tracking/screenshots/:company_id/:employee_id", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id } = req.params;
      const { date } = req.query;
      connection = await db.getConnection();
      
      let query = "SELECT * FROM time_tracking_screenshots WHERE company_id = ? AND employee_id = ?";
      const params: (string | number)[] = [company_id, employee_id];
      
      if (date) {
        query += " AND DATE(timestamp) = ?";
        params.push(date as string);
      }
      
      query += " ORDER BY timestamp DESC";
      
      const [rows] = await connection.query(query, params);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching screenshots:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/time-tracking/report/:company_id", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.params;
      const { start_date, end_date, employee_id } = req.query;
      connection = await db.getConnection();
      
      let query = `
        SELECT 
          l.employee_id, 
          e.name as employee_name,
          l.date,
          SUM(l.active_minutes) as total_active_minutes,
          SUM(l.idle_minutes) as total_idle_minutes,
          SUM(l.keystrokes) as total_keystrokes,
          SUM(l.mouse_clicks) as total_mouse_clicks
        FROM time_tracking_logs l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.company_id = ?
      `;
      const params: (string | number)[] = [company_id];
      
      if (start_date && end_date) {
        query += " AND l.date BETWEEN ? AND ?";
        params.push(start_date as string, end_date as string);
      }
      
      if (employee_id) {
        query += " AND l.employee_id = ?";
        params.push(employee_id as string);
      }
      
      query += " GROUP BY l.employee_id, l.date ORDER BY l.date DESC, e.name ASC";
      
      const [rows] = await connection.query(query, params);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching time tracking report:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Employee Attendance API
  app.post("/api/employee/attendance/action", async (req, res) => {
    let connection;
    try {
      const { employee_id, company_id, action, lat, long, selfie_url } = req.body;
      console.log(`[Attendance API] Action: ${action}, Employee: ${employee_id}, Company: ${company_id}`);
      
      if (!employee_id || !company_id || !action) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      connection = await db.getConnection();
      const date = new Date().toISOString().split('T')[0];
      const now = new Date();

      const [existing] = await connection.query(
        "SELECT * FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1",
        [employee_id, date]
      ) as [AttendanceRecord[], unknown];

      console.log(`[Attendance API] Existing record status: ${existing.length > 0 ? existing[0].status : 'None'}`);

      if (action === 'check-in') {
        if (existing.length > 0 && existing[0].status !== 'Checked-Out') {
          return res.status(400).json({ error: "Already checked in. Please check out first." });
        }

        // Fetch employee's shift
        const [empRows] = await connection.query(
          "SELECT e.shift_id, e.mobile_no, e.name, s.start_time, s.grace_period FROM employees e LEFT JOIN shifts s ON e.shift_id = s.id WHERE e.id = ?",
          [employee_id]
        ) as [Record<string, unknown>[], unknown];

        let isLate = false;
        if (empRows.length > 0) {
          const emp = empRows[0];
          let shiftStartTime = emp.start_time;
          let gracePeriod = emp.grace_period || 0;

          // If no shift assigned, try to find the first active shift for the company
          if (!shiftStartTime) {
             const [activeShifts] = await connection.query(
               "SELECT start_time, grace_period FROM shifts WHERE status = 'Active' LIMIT 1"
             ) as [Record<string, unknown>[], unknown];
             if (activeShifts.length > 0) {
               shiftStartTime = activeShifts[0].start_time;
               gracePeriod = activeShifts[0].grace_period || 0;
             }
          }

          if (shiftStartTime) {
            const [sHour, sMin] = shiftStartTime.split(':').map(Number);
            const shiftDate = new Date();
            shiftDate.setHours(sHour, sMin, 0, 0);
            
            const lateThreshold = new Date(shiftDate.getTime() + gracePeriod * 60000);
            if (now > lateThreshold) {
              isLate = true;
            }
          }
        }

        await connection.query(
          `INSERT INTO attendance (company_id, employee_id, date, check_in_time, check_in_lat, check_in_long, selfie_url, status, is_late) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [company_id, employee_id, date, now, lat, long, selfie_url, 'Present', isLate]
        );

        // Send WhatsApp if late
        if (isLate && empRows.length > 0 && empRows[0].mobile_no) {
           const emp = empRows[0] as Record<string, unknown>;
           const message = `Hello ${emp.name}, you are marked late for your shift today. Please ensure timely arrival.`;
           
           // Try to send if session exists
           const sock = sessions.get(Number(company_id));
           if (sock) {
             let formattedNumber = String(emp.mobile_no).replace(/\D/g, "");
             if (!formattedNumber.endsWith("@s.whatsapp.net")) {
               formattedNumber += "@s.whatsapp.net";
             }
             try {
               const sentMsg = await sock.sendMessage(formattedNumber, { text: message });
               await connection.query(
                 "INSERT INTO whatsapp_messages (company_id, to_number, message, status, response_log) VALUES (?, ?, ?, 'sent', ?)",
                 [company_id, emp.mobile_no, message, JSON.stringify(sentMsg)]
               );
             } catch (err) {
               console.error("[WhatsApp] Failed to send late notification:", err);
               await connection.query(
                 "INSERT INTO whatsapp_messages (company_id, to_number, message, status) VALUES (?, ?, ?, 'failed')",
                 [company_id, emp.mobile_no, message]
               );
             }
           } else {
             // Just log it in the table as pending
             await connection.query(
               "INSERT INTO whatsapp_messages (company_id, to_number, message, status) VALUES (?, ?, ?, 'pending')",
               [company_id, emp.mobile_no, message]
             );
           }
        }
      } else if (action === 'check-out') {
        if (existing.length === 0 || existing[0].status === 'Checked-Out') {
          return res.status(400).json({ error: "No active check-in found" });
        }
        const record = existing[0];
        const checkIn = record.check_in_time ? new Date(record.check_in_time) : new Date();
        const breakStart = record.break_start_time ? new Date(record.break_start_time) : null;
        
        let breakDuration = record.break_duration_minutes || 0;
        let finalBreakEnd = record.break_end_time ? new Date(record.break_end_time) : null;
        
        if (record.status === 'On Break' && breakStart) {
          // If still on break, end it now
          breakDuration += Math.round((now.getTime() - breakStart.getTime()) / 60000);
          finalBreakEnd = now;
        }
        
        const totalDurationMs = now.getTime() - checkIn.getTime();
        const totalDurationMinutes = Math.round(totalDurationMs / 60000);
        const workingHours = Math.max(0, (totalDurationMinutes - breakDuration) / 60);
        
        await connection.query(
          "UPDATE attendance SET check_out_time = ?, check_out_lat = ?, check_out_long = ?, status = 'Checked-Out', working_hours = ?, break_duration_minutes = ?, break_end_time = ? WHERE id = ?",
          [now, lat, long, workingHours.toFixed(2), breakDuration, finalBreakEnd || record.break_end_time, record.id]
        );
      } else if (action === 'break-start') {
        if (existing.length === 0 || existing[0].status !== 'Present') {
          return res.status(400).json({ error: "Must be checked in and not on break" });
        }
        await connection.query("UPDATE attendance SET break_start_time = ?, status = 'On Break' WHERE id = ?", [now, existing[0].id]);
      } else if (action === 'break-end') {
        if (existing.length === 0 || existing[0].status !== 'On Break') {
          return res.status(400).json({ error: "Not currently on break" });
        }
        const record = existing[0];
        const breakStart = record.break_start_time ? new Date(record.break_start_time) : null;
        let additionalBreak = 0;
        if (breakStart) {
          additionalBreak = Math.round((now.getTime() - breakStart.getTime()) / 60000);
        }
        await connection.query(
          "UPDATE attendance SET break_end_time = ?, status = 'Present', break_duration_minutes = COALESCE(break_duration_minutes, 0) + ? WHERE id = ?", 
          [now, additionalBreak, record.id]
        );
      }

      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error performing attendance action:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/employee/attendance/stats", async (req, res) => {
    let connection;
    try {
      const { employee_id } = req.query;
      if (!employee_id) {
        return res.status(400).json({ error: "employee_id is required" });
      }
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date_str FROM attendance WHERE employee_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY id DESC",
        [employee_id]
      ) as [AttendanceRecord[], unknown];
      
      const data = Array.isArray(rows) ? rows : [];
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const dailyHours = data
        .filter(r => (r as AttendanceRecord & { date_str: string }).date_str === todayStr)
        .reduce((acc, curr) => acc + parseFloat(String(curr.working_hours || 0)), 0);
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      const weeklyHours = data
        .filter(r => new Date(r.date) >= oneWeekAgo)
        .reduce((acc, curr) => acc + parseFloat(String(curr.working_hours || 0)), 0);
        
      const monthlyHours = data.reduce((acc, curr) => acc + parseFloat(String(curr.working_hours || 0)), 0);
      
      const lateCount = data.filter((r: AttendanceRecord) => r.is_late).length;
      const dailyAttendance = data.slice(0, 7); // Last 7 days
      
      res.json({ dailyHours, weeklyHours, monthlyHours, lateCount, dailyAttendance });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching attendance stats:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  interface Employee {
    id: number;
    name: string;
    email: string;
    employee_id: string;
    department: string;
    designation: string;
    manager_id: number | null;
    profile_picture: string | null;
    children?: Employee[];
  }

  app.get("/api/employees/hierarchy/:company_id", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.params;
      connection = await db.getConnection();
      
      const [employees] = await connection.query(
        "SELECT id, name, email, employee_id, department, designation, manager_id, profile_picture FROM employees WHERE company_id = ? AND status = 'active'",
        [company_id]
      ) as [Employee[], unknown];
      
      // Build tree structure
      const employeeMap = new Map<number, Employee>();
      employees.forEach(emp => {
        employeeMap.set(emp.id, { ...emp, children: [] });
      });
      
      const rootNodes: Employee[] = [];
      employees.forEach(emp => {
        const node = employeeMap.get(emp.id);
        if (node && emp.manager_id && employeeMap.has(emp.manager_id)) {
          employeeMap.get(emp.manager_id)!.children!.push(node);
        } else if (node) {
          rootNodes.push(node);
        }
      });
      
      res.json(rootNodes);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching employee hierarchy:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/employees/:id/manager", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { manager_id } = req.body;
      connection = await db.getConnection();
      
      await connection.query(
        "UPDATE employees SET manager_id = ? WHERE id = ?",
        [manager_id, id]
      );
      
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating employee manager:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/debug/schema", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query("DESCRIBE shifts");
      res.json(rows);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/employee/dashboard/stats", async (req, res) => {
    let connection;
    try {
      const { employee_id, company_id } = req.query;
      if (!employee_id || !company_id) {
        return res.status(400).json({ error: "employee_id and company_id are required" });
      }
      connection = await db.getConnection();
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      // Format startOfMonth properly avoiding timezone shifts
      const startOfMonthStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-01`;
      
      // Today's attendance
      const [todayAttendance] = await connection.query(
        "SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date_str FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC",
        [employee_id, todayStr]
      ) as [AttendanceRecord[], unknown];
      
      // Monthly attendance
      const [monthlyAttendance] = await connection.query(
        "SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date_str FROM attendance WHERE employee_id = ? AND date >= ? ORDER BY date DESC, id DESC",
        [employee_id, startOfMonthStr]
      ) as [AttendanceRecord[], unknown];
      
      // Leaves
      const [leaves] = await connection.query(
        "SELECT *, DATE_FORMAT(start_date, '%Y-%m-%d') as start_date_str, DATE_FORMAT(end_date, '%Y-%m-%d') as end_date_str FROM leaves WHERE employee_id = ? ORDER BY created_at DESC",
        [employee_id]
      ) as [Record<string, unknown>[], unknown];
      
      // Notes
      const [notes] = await connection.query(
        "SELECT *, DATE_FORMAT(date, '%Y-%m-%d') as date_str FROM notes WHERE employee_id = ? ORDER BY date DESC",
        [employee_id]
      ) as [Record<string, unknown>[], unknown];

      // Calculate stats
      const workedTimeToday = todayAttendance.reduce((acc, curr) => acc + parseFloat(String(curr.working_hours || 0)), 0);
      const breakTimeToday = todayAttendance.reduce((acc, curr) => acc + (curr.break_duration_minutes || 0), 0);
      
      const monthlyWorkedTime = monthlyAttendance.reduce((acc, curr) => acc + parseFloat(String(curr.working_hours || 0)), 0);
      const monthlyBreakTime = monthlyAttendance.reduce((acc, curr) => acc + (curr.break_duration_minutes || 0), 0);
      const monthlyLateCount = monthlyAttendance.filter(r => r.is_late).length;
      const monthlyOvertime = monthlyAttendance.reduce((acc, curr) => acc + parseFloat(String(curr.overtime_hours || 0)), 0);
      
      const totalLeavesDays = leaves.filter(l => l.status === 'Approved').reduce((acc, curr) => acc + curr.total_days, 0);
      const leaveBalance = 20 - totalLeavesDays;
      const salarySlipNotification = now.getDate() >= 25 ? `Your salary slip for ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()} is ready.` : null;

      // Fetch shift info
      const [empRows] = await connection.query(
        "SELECT e.shift_id, s.* FROM employees e LEFT JOIN shifts s ON e.shift_id = s.id WHERE e.id = ?",
        [employee_id]
      ) as [Record<string, unknown>[], unknown];

      let shiftInfo = null;
      if (empRows.length > 0 && empRows[0].shift_id) {
        shiftInfo = empRows[0] as Record<string, unknown>;
      } else {
        // Try to find first active shift
        const [activeShifts] = await connection.query(
          "SELECT * FROM shifts WHERE status = 'Active' LIMIT 1"
        ) as [Record<string, unknown>[], unknown];
        if (activeShifts.length > 0) {
          shiftInfo = activeShifts[0] as Record<string, unknown>;
        }
      }

      const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return 9;
        const [sH, sM] = start.split(':').map(Number);
        const [eH, eM] = end.split(':').map(Number);
        let diff = (eH * 60 + eM) - (sH * 60 + sM);
        if (diff < 0) diff += 24 * 60; // Overnight shift
        return diff / 60;
      };

      const scheduledHours = shiftInfo ? calculateDuration(String(shiftInfo.start_time), String(shiftInfo.end_time)) : 9;

      res.json({
        today: {
          punchIn: todayAttendance.length > 0 ? [...todayAttendance].sort((a, b) => new Date(a.check_in_time!).getTime() - new Date(b.check_in_time!).getTime())[0].check_in_time : null,
          punchOut: todayAttendance.length > 0 ? [...todayAttendance].sort((a, b) => new Date(b.check_out_time || 0).getTime() - new Date(a.check_out_time || 0).getTime())[0].check_out_time : null,
          workedTime: workedTimeToday,
          breakTime: breakTimeToday / 60,
          scheduled: scheduledHours,
          leftTime: Math.max(0, scheduledHours - workedTimeToday)
        },
        monthly: {
          scheduled: 22 * scheduledHours,
          workedTime: monthlyWorkedTime,
          overtime: monthlyOvertime,
          breakTime: monthlyBreakTime / 60,
          lateTime: monthlyLateCount,
          totalLeaves: totalLeavesDays
        },
        leaveBalance,
        salarySlipNotification,
        attendanceList: monthlyAttendance,
        leaveList: leaves,
        notes: notes,
        shift: shiftInfo
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching dashboard stats:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/employee/notes", async (req, res) => {
    let connection;
    try {
      const { employee_id, title, content, date } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO notes (employee_id, title, content, date) VALUES (?, ?, ?, ?)",
        [employee_id, title, content, date || new Date().toISOString().split('T')[0]]
      );
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.put("/api/employee/notes/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "UPDATE notes SET title = ?, content = ? WHERE id = ?",
        [title, content, id]
      );
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.delete("/api/employee/notes/:id", async (req, res) => {
    let connection;
    try {
      const { id } = req.params;
      connection = await db.getConnection();
      await connection.query("DELETE FROM notes WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/employee/leaves", async (req, res) => {
    let connection;
    try {
      const { employee_id } = req.query;
      if (!employee_id) {
        return res.status(400).json({ error: "employee_id is required" });
      }
      connection = await db.getConnection();
      
      // Get employee to get company_id
      const [employees] = await connection.query("SELECT company_id FROM employees WHERE id = ?", [employee_id]) as [Record<string, unknown>[], unknown];
      if (employees.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      const company_id = employees[0].company_id as number;

      // Get all leave types for this company to calculate total allowed days
      const [leaveTypes] = await connection.query("SELECT days_allowed FROM leave_types WHERE company_id = ?", [company_id]) as [Record<string, unknown>[], unknown];
      const totalAllowedDays = leaveTypes.reduce((acc, curr) => acc + ((curr.days_allowed as number) || 0), 0);

      const [leaves] = await connection.query(
        "SELECT * FROM leaves WHERE employee_id = ? ORDER BY created_at DESC",
        [employee_id]
      ) as [Record<string, unknown>[], unknown];
      
      const totalLeavesDays = leaves.filter(l => l.status === 'Approved').reduce((acc, curr) => acc + ((curr.total_days as number) || 0), 0);
      const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;
      const approvedLeavesCount = leaves.filter(l => l.status === 'Approved').length;
      const leaveBalance = totalAllowedDays - totalLeavesDays;

      res.json({
        leaves,
        stats: {
          total: leaves.length,
          approved: approvedLeavesCount,
          pending: pendingLeavesCount,
          balance: leaveBalance
        }
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/employee/leaves", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, leave_type, start_date, end_date, reason, total_days } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO leaves (company_id, employee_id, leave_type, start_date, end_date, reason, total_days) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [company_id, employee_id, leave_type, start_date, end_date, reason, total_days]
      );
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Payroll APIs for Employee
  app.get("/api/employee/salary-slips", async (req, res) => {
    let connection;
    try {
      const { employee_id } = req.query;
      if (!employee_id) return res.status(400).json({ error: "Employee ID is required" });
      
      connection = await db.getConnection();
      const [slips] = await connection.query(
        "SELECT * FROM salary_slips WHERE employee_id = ? ORDER BY year DESC, month DESC",
        [employee_id]
      );
      res.json({ success: true, slips });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/employee/loan-requests", async (req, res) => {
    let connection;
    try {
      const { employee_id } = req.query;
      if (!employee_id) return res.status(400).json({ error: "Employee ID is required" });
      
      connection = await db.getConnection();
      const [requests] = await connection.query(
        "SELECT * FROM loan_requests WHERE employee_id = ? ORDER BY created_at DESC",
        [employee_id]
      );
      res.json({ success: true, requests });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/employee/loan-requests", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, amount, reason, date } = req.body;
      connection = await db.getConnection();
      await connection.query(
        "INSERT INTO loan_requests (company_id, employee_id, amount, reason, date) VALUES (?, ?, ?, ?, ?)",
        [company_id, employee_id, amount, reason, date]
      );
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/employee/commissions", async (req, res) => {
    let connection;
    try {
      const { employee_id } = req.query;
      if (!employee_id) return res.status(400).json({ error: "Employee ID is required" });
      
      connection = await db.getConnection();
      const [commissions] = await connection.query(
        "SELECT * FROM commissions_bonuses WHERE employee_id = ? ORDER BY date DESC",
        [employee_id]
      );
      res.json({ success: true, commissions });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Employer Permissions API
  app.get("/api/employer-permissions", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      connection = await db.getConnection();
      let query = "SELECT * FROM employer_permissions";
      const params: (string | number)[] = [];
      
      if (company_id) {
        query += " WHERE company_id = ?";
        params.push(company_id as string);
      }
      
      const [rows] = await connection.query(query, params);
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching permissions:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/employer-permissions", async (req, res) => {
    const { permissions } = req.body; // Array of { company_id, module_name, is_granted }
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      for (const perm of permissions) {
        await connection.query(
          `INSERT INTO employer_permissions (company_id, module_name, is_granted) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE is_granted = VALUES(is_granted)`,
          [perm.company_id, perm.module_name, perm.is_granted]
        );
      }

      await connection.commit();
      res.json({ success: true, message: "Permissions saved successfully" });
    } catch (error: unknown) {
      const err = error as Error;
      if (connection) await connection.rollback();
      console.error("Error saving permissions:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Company Admin Dashboard Stats
  app.get("/api/company-admin/dashboard-stats", async (req, res) => {
    let connection;
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      connection = await db.getConnection();
      const today = new Date().toISOString().split('T')[0];
      
      // Total Employees
      const [empResult] = await connection.query(
        "SELECT COUNT(*) as count FROM employees WHERE company_id = ? AND status = 'active'",
        [company_id]
      ) as [Record<string, unknown>[], unknown];
      
      // Present Today
      const [presentResult] = await connection.query(
        "SELECT COUNT(DISTINCT employee_id) as count FROM attendance WHERE company_id = ? AND date = ? AND status IN ('Present', 'On Break', 'Half Day')",
        [company_id, today]
      ) as [Record<string, unknown>[], unknown];
      
      // Pending Leaves
      const [leaveResult] = await connection.query(
        "SELECT COUNT(*) as count FROM leaves WHERE company_id = ? AND status = 'Pending'",
        [company_id]
      ) as [Record<string, unknown>[], unknown];
      
      // Departments Count
      const [deptResult] = await connection.query(
        "SELECT COUNT(*) as count FROM departments WHERE company_id = ?",
        [company_id]
      ) as [Record<string, unknown>[], unknown];
 
      // Attendance Trend (Last 7 days)
      const [trendResult] = await connection.query(`
        SELECT date, COUNT(DISTINCT employee_id) as count 
        FROM attendance 
        WHERE company_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY date
        ORDER BY date ASC
      `, [company_id]) as [Record<string, unknown>[], unknown];
 
      // Recent Absentees (Employees who are not present today)
      const [absenteeResult] = await connection.query(`
        SELECT id, name, designation, department 
        FROM employees 
        WHERE company_id = ? AND status = 'active' 
        AND id NOT IN (
          SELECT employee_id FROM attendance WHERE company_id = ? AND date = ?
        )
        LIMIT 5
      `, [company_id, company_id, today]) as [Record<string, unknown>[], unknown];
      
      res.json({
        totalEmployees: empResult[0].count as number,
        presentToday: presentResult[0].count as number,
        absentToday: Math.max(0, (empResult[0].count as number) - (presentResult[0].count as number)),
        pendingLeaves: leaveResult[0].count as number,
        totalDepartments: deptResult[0].count as number,
        attendanceTrend: trendResult,
        recentAbsentees: absenteeResult
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching dashboard stats:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Employer Attendance Daily Status
  app.get("/api/employer/attendance/daily", async (req, res) => {
    let connection;
    try {
      const { company_id, date, search } = req.query;
      if (!company_id) return res.status(400).json({ error: "company_id is required" });
      
      connection = await db.getConnection();
      let query = `
        SELECT a.*, DATE_FORMAT(a.date, '%Y-%m-%d') as date_str, e.name as employee_name, s.name as shift_name
        FROM attendance a 
        JOIN employees e ON a.employee_id = e.id 
        LEFT JOIN shifts s ON a.shift_id = s.id
        WHERE a.company_id = ?
      `;
      const params: (string | number | string[] | undefined)[] = [company_id as string];
      
      if (date) {
        query += " AND a.date = ?";
        params.push(date as string);
      }
      
      if (search) {
        query += " AND e.name LIKE ?";
        params.push(`%${search}%`);
      }
      
      query += " ORDER BY a.date DESC, a.check_in_time DESC";
      
      const [results] = await connection.query(query, params) as [Record<string, unknown>[], unknown];
      res.json(results);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching daily attendance:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Employer Attendance Monthly Report
  app.get("/api/employer/attendance/monthly", async (req, res) => {
    let connection;
    try {
      const { company_id, month, search } = req.query;
      if (!company_id) return res.status(400).json({ error: "company_id is required" });
      
      connection = await db.getConnection();
      let query = `
        SELECT 
          e.id as employee_id,
          e.name as employee_name,
          COUNT(DISTINCT a.date) as total_days,
          SUM(CASE WHEN a.status IN ('Present', 'Half Day', 'On Break') THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN a.status = 'Leave' THEN 1 ELSE 0 END) as leave_days,
          SUM(a.working_hours) as total_hours
        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employee_id
      `;
      const params: (string | number | string[] | undefined)[] = [company_id as string];
      
      query += " WHERE e.company_id = ?";
      
      if (month) {
        query += " AND DATE_FORMAT(a.date, '%Y-%m') = ?";
        params.push(month as string);
      }
      
      if (search) {
        query += " AND e.name LIKE ?";
        params.push(`%${search}%`);
      }
      
      query += " GROUP BY e.id, e.name";
      
      const [results] = await connection.query(query, params) as [Record<string, unknown>[], unknown];
      res.json(results);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching monthly report:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Employer Attendance Working Hours Report
  app.get("/api/employer/attendance/working-hours", async (req, res) => {
    let connection;
    try {
      const { company_id, employee_id, date, month } = req.query;
      if (!company_id) return res.status(400).json({ error: "company_id is required" });
      
      connection = await db.getConnection();
      
      // Trend Data (Last 7 days)
      const [trendResult] = await connection.query(`
        SELECT 
          DATE_FORMAT(date, '%a') as name,
          SUM(working_hours) as hours
        FROM attendance
        WHERE company_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY date
        ORDER BY date ASC
      `, [company_id]) as [Record<string, unknown>[], unknown];

      // Stats
      let statsQuery = `
        SELECT 
          SUM(working_hours) as total_hours,
          AVG(working_hours) as avg_hours,
          SUM(overtime_hours) as overtime_hours
        FROM attendance
        WHERE company_id = ?
      `;
      const statsParams: (string | number | string[] | undefined)[] = [company_id as string];

      if (employee_id && employee_id !== 'All Employees') {
        statsQuery += " AND employee_id = ?";
        statsParams.push(employee_id as string);
      }

      if (date) {
        statsQuery += " AND date = ?";
        statsParams.push(date as string);
      } else if (month) {
        statsQuery += " AND DATE_FORMAT(date, '%Y-%m') = ?";
        statsParams.push(month as string);
      }

      const [statsResult] = await connection.query(statsQuery, statsParams) as [Record<string, unknown>[], unknown];
      
      res.json({
        trend: trendResult,
        stats: statsResult[0] || { total_hours: 0, avg_hours: 0, overtime_hours: 0 }
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching working hours report:", err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Super Admin Stats
  app.get("/api/super-admin/stats", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      
      const [totalResult] = await connection.query("SELECT COUNT(*) as count FROM companies") as [Record<string, unknown>[], unknown];
      const [activeResult] = await connection.query("SELECT COUNT(*) as count FROM companies WHERE status = 'active'") as [Record<string, unknown>[], unknown];
      const [expiredResult] = await connection.query("SELECT COUNT(*) as count FROM companies WHERE license_status = 'expired'") as [Record<string, unknown>[], unknown];
      
      res.json({
        totalCompanies: totalResult[0].count,
        activeCompanies: activeResult[0].count,
        expiredLicenses: expiredResult[0].count
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Super Admin Login
  app.post("/api/super-admin/login", async (req, res) => {
    const { email, password } = req.body;
    let connection;
    try {
      connection = await db.getConnection();
      const [admins] = await connection.query(
        "SELECT * FROM admins WHERE email = ? AND password = ?",
        [email, password]
      ) as [Record<string, unknown>[], unknown];

      if (admins.length > 0) {
        res.json({ success: true, admin: admins[0] });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Company Admin Login
  app.post("/api/company-admin/login", async (req, res) => {
    console.log("Login attempt:", req.body);
    const { username, password } = req.body;
    let connection;
    try {
      connection = await db.getConnection();
      const [companies] = await connection.query(
        "SELECT * FROM companies WHERE admin_username = ? AND admin_password = ?",
        [username, password]
      ) as [Record<string, unknown>[], unknown];

      if (companies.length > 0) {
        res.json({ success: true, company: companies[0] });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("*all", (req, res, next) => {
    console.log("POST request:", req.method, req.url);
    next();
  });

  // Employee Login
  app.post("/api/employee/login", async (req, res) => {
    const { username, password } = req.body;
    let connection;
    try {
      connection = await db.getConnection();
      const [employees] = await connection.query(
        "SELECT e.*, c.name as company_name FROM employees e JOIN companies c ON e.company_id = c.id WHERE e.username = ? AND e.password = ? AND e.status = 'active'",
        [username, password]
      ) as [Record<string, unknown>[], unknown];

      if (employees.length > 0) {
        res.json({ success: true, employee: employees[0] });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials or inactive account" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Create a new company
  app.post("/api/companies", async (req, res) => {
    const { 
      name, email, mobile, unique_code, subsidiary, 
      head_office_location, factory_location, 
      admin_username, admin_password, logo_url, plan 
    } = req.body;

    console.log("Registering company:", { name, email, plan });

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      // Auto-generate unique code if not provided
      const finalUniqueCode = unique_code || `CMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Auto-generate admin credentials if not provided
      const finalAdminUsername = admin_username || `${name.toLowerCase().replace(/\s+/g, '')}_admin`;
      const finalAdminPassword = admin_password || Math.random().toString(36).substring(2, 10);

      // Check if email or unique code already exists
      const [existing] = await connection.query(
        "SELECT email, unique_code FROM companies WHERE email = ? OR unique_code = ?",
        [email, finalUniqueCode]
      ) as [Record<string, unknown>[], unknown];

      if (existing.length > 0) {
        const isEmail = existing.some(e => e.email === email);
        const isCode = existing.some(e => e.unique_code === finalUniqueCode);
        await connection.rollback();
        connection.release();
        let msg = "A company with this email already exists.";
        if (isCode && !isEmail) msg = "This unique code is already in use.";
        if (isCode && isEmail) msg = "Both email and unique code are already in use.";
        
        return res.status(400).json({ 
          success: false, 
          message: msg
        });
      }

      console.log("Inserting company into DB...");
      const [result] = await connection.query(`
        INSERT INTO companies (
          name, email, mobile, unique_code, subsidiary, 
          head_office_location, factory_location, 
          admin_username, admin_password, logo_url, plan, status, license_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'valid')
      `, [
        name, email, mobile, finalUniqueCode, subsidiary, 
        head_office_location, factory_location, 
        finalAdminUsername, finalAdminPassword, logo_url, plan || 'Basic'
      ]) as [import('mysql2').ResultSetHeader, unknown];

      const companyId = result.insertId;
      console.log("Company inserted with ID:", companyId);

      // Auto-generate Invoice
      const planPrices: Record<string, number> = {
        'Basic': 40,
        'Premium': 80,
        'Enterprise': 100,
        'Ultimate': 100
      };
      const amount = planPrices[plan] || 40;
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days from now

      console.log("Generating invoice...");
      await connection.query(`
        INSERT INTO invoices (company_id, invoice_number, amount, plan, due_date)
        VALUES (?, ?, ?, ?, ?)
      `, [companyId, invoiceNumber, amount, plan || 'Basic', dueDate]);
      console.log("Invoice generated successfully.");

      await connection.commit();
      console.log("Transaction committed successfully");

      res.json({ 
        success: true, 
        message: "Company registered and invoice generated successfully.",
        credentials: {
          username: finalAdminUsername,
          password: finalAdminPassword,
          code: finalUniqueCode
        }
      });
    } catch (error: unknown) {
      if (connection) await connection.rollback();
      const err = error as Error;
      console.error("Error in /api/companies:", err);
      res.status(500).json({ success: false, message: "Server Error: " + err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // List all invoices
  app.get("/api/invoices", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [invoices] = await connection.query(`
        SELECT i.*, c.name as company_name, c.email as company_email 
        FROM invoices i 
        JOIN companies c ON i.company_id = c.id 
        ORDER BY i.created_at DESC
      `) as [Record<string, unknown>[], unknown];
      res.json(invoices);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Send invoice email
  app.post("/api/invoices/:id/send", async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
      connection = await db.getConnection();
      const [invoice] = await connection.query(`
        SELECT i.*, c.name as company_name, c.email as company_email 
        FROM invoices i 
        JOIN companies c ON i.company_id = c.id 
        WHERE i.id = ?
      `, [id]) as [Record<string, unknown>[], unknown];
      
      if (invoice.length === 0) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      const companyId = invoice[0].company_id as number;
      const companyEmail = invoice[0].company_email as string;
      const invoiceNumber = invoice[0].invoice_number as string;
      const amount = invoice[0].amount as number;

      // Check if Company has its own Gmail connected
      const [companyRows] = await connection.query("SELECT gmail_tokens FROM companies WHERE id = ?", [companyId]) as [Record<string, unknown>[], unknown];
      
      let tokens = null;
      if (companyRows.length > 0 && companyRows[0].gmail_tokens) {
        tokens = JSON.parse(companyRows[0].gmail_tokens as string);
      } else {
        // Fallback to global Gmail tokens
        const [globalRows] = await connection.query("SELECT setting_value FROM settings WHERE setting_key = 'gmail_tokens'") as [Record<string, unknown>[], unknown];
        if (globalRows.length > 0) {
          tokens = JSON.parse(globalRows[0].setting_value as string);
        }
      }
      
      if (tokens) {
        // Use Gmail API
        const client = getOAuth2Client();
        if (!client) {
          return res.status(400).json({ success: false, message: "Gmail OAuth not configured" });
        }
        client.setCredentials(tokens);
        const gmail = google.gmail({ version: "v1", auth: client });
        
        const oauth2 = google.oauth2({ version: "v2", auth: client });
        const userInfo = await oauth2.userinfo.get();
        const userEmail = userInfo.data.email;

        const subject = `Invoice ${invoiceNumber} from HRM & ERP Platform`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
        const messageParts = [
          `From: HRM & ERP Platform <${userEmail}>`,
          `To: ${companyEmail}`,
          `Content-Type: text/html; charset=utf-8`,
          `MIME-Version: 1.0`,
          `Subject: ${utf8Subject}`,
          "",
          `Hello ${invoice[0].company_name},`,
          "<br><br>",
          `Please find your invoice details below:`,
          "<br>",
          `<b>Invoice Number:</b> ${invoiceNumber}`,
          "<br>",
          `<b>Amount Due:</b> $${amount.toFixed(2)}`,
          "<br>",
          `<b>Due Date:</b> ${new Date(invoice[0].due_date as string).toLocaleDateString()}`,
          "<br><br>",
          "Thank you for your business!"
        ];
        const message = messageParts.join("\n");

        const encodedMessage = Buffer.from(message)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage,
          },
        });

        // Update sent today count
        await connection.query(
          "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = CAST(setting_value AS UNSIGNED) + 1",
          ["gmail_sent_today", "1"]
        );

        return res.json({ success: true, message: `Invoice sent to ${companyEmail} via Gmail API` });
      } else {
        // Fallback to SMTP if configured
        if (process.env.SMTP_HOST) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: '"HRM & ERP Platform" <info@inforesumeedge.com>',
            to: companyEmail,
            subject: `Invoice ${invoiceNumber} from HRM & ERP Platform`,
            html: `
              <p>Hello ${invoice[0].company_name},</p>
              <p>Please find your invoice details below:</p>
              <p><b>Invoice Number:</b> ${invoiceNumber}</p>
              <p><b>Amount Due:</b> $${amount.toFixed(2)}</p>
              <p><b>Due Date:</b> ${new Date(invoice[0].due_date as string).toLocaleDateString()}</p>
              <p>Thank you for your business!</p>
            `
          });
          
          return res.json({ success: true, message: `Invoice sent to ${companyEmail} via SMTP` });
        } else {
          return res.status(400).json({ success: false, message: "Email service not configured. Please connect Gmail or set SMTP settings." });
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error sending invoice:", err);
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // List all companies
  app.get("/api/companies", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [companies] = await connection.query("SELECT * FROM companies ORDER BY created_at DESC") as [Record<string, unknown>[], unknown];
      res.json(companies);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Update company
  app.put("/api/companies/:id", async (req, res) => {
    const { id } = req.params;
    const { 
      name, email, mobile, unique_code, subsidiary, 
      head_office_location, factory_location, 
      admin_username, admin_password, logo_url, plan 
    } = req.body;
    let connection;
    try {
      connection = await db.getConnection();
      await connection.query(
        `UPDATE companies SET 
          name = ?, email = ?, mobile = ?, unique_code = ?, subsidiary = ?, 
          head_office_location = ?, factory_location = ?, 
          admin_username = ?, admin_password = ?, logo_url = ?, plan = ? 
         WHERE id = ?`,
        [
          name, email, mobile, unique_code, subsidiary, 
          head_office_location, factory_location, 
          admin_username, admin_password, logo_url, plan, id
        ]
      );
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Delete company
  app.delete("/api/companies/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Deleting company with ID:", id);
    let connection;
    try {
      connection = await db.getConnection();
      await connection.query("DELETE FROM companies WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (connection) connection.release();
    }
  });

  // Recent Companies
  app.get("/api/super-admin/recent-companies", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [companies] = await connection.query("SELECT * FROM companies ORDER BY created_at DESC LIMIT 5") as [Record<string, unknown>[], unknown];
      res.json(companies);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
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

  // WhatsApp Service Logic
  const initWhatsApp = async (companyId: number) => {
    if (sessions.has(companyId)) return sessions.get(companyId);

    const sessionDir = join("/tmp", "whatsapp_sessions", `company_${companyId}`);
    console.log(`[WhatsApp] Initializing session for company ${companyId} at ${sessionDir}`);
    
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    try {
      const { state, saveCreds } = await getAuthState(sessionDir);
      
      // Update status to connecting
      let connectionDb;
      try {
        connectionDb = await db.getConnection();
        await connectionDb.query(
          "INSERT INTO whatsapp_accounts (company_id, status) VALUES (?, 'connecting') ON DUPLICATE KEY UPDATE status = 'connecting'",
          [companyId]
        );
      } finally {
        if (connectionDb) connectionDb.release();
      }

      const { version } = await fetchLatestBaileysVersion();
      console.log(`[WhatsApp] Using Baileys version ${version}`);

      const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        logger,
        browser: ["ERP Platform", "Chrome", "1.0.0"],
      });

      sessions.set(companyId, sock);

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          console.log(`[WhatsApp] QR generated for company ${companyId}`);
          const qrBase64 = await QRCode.toDataURL(qr);
          qrCodes.set(companyId, qrBase64);
        }

        if (connection === "close") {
          console.log(`[WhatsApp] Connection closed for company ${companyId}`);
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          sessions.delete(companyId);
          qrCodes.delete(companyId);

          let connectionDb;
          try {
            connectionDb = await db.getConnection();
            await connectionDb.query(
              "UPDATE whatsapp_accounts SET status = 'disconnected' WHERE company_id = ?",
              [companyId]
            );
          } finally {
            if (connectionDb) connectionDb.release();
          }

          if (shouldReconnect) {
            console.log(`[WhatsApp] Reconnecting for company ${companyId}`);
            initWhatsApp(companyId);
          }
        } else if (connection === "open") {
          console.log(`[WhatsApp] Connection opened for company ${companyId}`);
          qrCodes.delete(companyId);
          let connectionDb;
          try {
            connectionDb = await db.getConnection();
            await connectionDb.query(
              "INSERT INTO whatsapp_accounts (company_id, status) VALUES (?, 'connected') ON DUPLICATE KEY UPDATE status = 'connected'",
              [companyId]
            );
          } finally {
            if (connectionDb) connectionDb.release();
          }
        }
      });

      sock.ev.on("creds.update", saveCreds);

      return sock;
    } catch (err) {
      console.error(`[WhatsApp] Error initializing session for company ${companyId}:`, err);
      throw err;
    }
  };

  // WhatsApp Routes
  app.get("/api/whatsapp/status", async (req, res) => {
    const { companyId } = req.query;
    if (companyId === undefined || companyId === null) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT status FROM whatsapp_accounts WHERE company_id = ?",
        [companyId]
      ) as [Record<string, unknown>[], unknown];

      const status = rows.length > 0 ? rows[0].status : "disconnected";
      const qr = qrCodes.get(Number(companyId)) || null;

      res.json({ status, qr });
    } catch {
      res.status(500).json({ error: "Failed to get status" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/whatsapp/connect", async (req, res) => {
    const { companyId } = req.body;
    console.log(`[WhatsApp] Connect request received for company ${companyId}`);
    if (companyId === undefined || companyId === null) return res.status(400).json({ error: "Company ID required" });

    try {
      await initWhatsApp(Number(companyId));
      res.json({ success: true, message: "Initializing connection..." });
    } catch {
      res.status(500).json({ error: "Failed to initialize connection" });
    }
  });

  app.post("/api/whatsapp/disconnect", async (req, res) => {
    const { companyId } = req.body;
    if (companyId === undefined || companyId === null) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      const sock = sessions.get(Number(companyId));
      if (sock) {
        await sock.logout();
        sessions.delete(companyId);
      }

      connection = await db.getConnection();
      await connection.query(
        "UPDATE whatsapp_accounts SET status = 'disconnected' WHERE company_id = ?",
        [companyId]
      );
      
      // Clear session directory
      const sessionDir = join("/tmp", "whatsapp_sessions", `company_${companyId}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to disconnect" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/whatsapp/send", async (req, res) => {
    const { company_id, to_number, message } = req.body;
    console.log(`[WhatsApp] Send request received for company ${company_id} to ${to_number}`);
    if (company_id === undefined || company_id === null || !to_number || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let connection;
    try {
      const sock = sessions.get(Number(company_id));
      if (!sock) {
        return res.status(400).json({ error: "WhatsApp not connected for this company" });
      }

      // Format number: remove +, spaces, and add @s.whatsapp.net
      let formattedNumber = to_number.replace(/\D/g, "");
      if (!formattedNumber.endsWith("@s.whatsapp.net")) {
        formattedNumber += "@s.whatsapp.net";
      }

      // Rate limiting: check messages in last minute
      connection = await db.getConnection();
      const [recentRows] = await connection.query(
        "SELECT COUNT(*) as count FROM whatsapp_messages WHERE company_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)",
        [company_id]
      ) as [Record<string, unknown>[], unknown];

      if (recentRows[0].count as number >= 20) {
        return res.status(429).json({ error: "Rate limit exceeded (max 20 msgs/min)" });
      }

      // Add delay (2-5 seconds)
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

      try {
        const sentMsg = await sock.sendMessage(formattedNumber, { text: message });
        
        await connection.query(
          "INSERT INTO whatsapp_messages (company_id, to_number, message, status, response_log) VALUES (?, ?, ?, 'sent', ?)",
          [company_id, to_number, message, JSON.stringify(sentMsg)]
        );

        res.json({ success: true, message: "Message sent" });
      } catch (sendError) {
        await connection.query(
          "INSERT INTO whatsapp_messages (company_id, to_number, message, status, response_log) VALUES (?, ?, ?, 'failed', ?)",
          [company_id, to_number, message, JSON.stringify(sendError)]
        );
        res.status(500).json({ error: "Failed to send message", details: sendError });
      }
    } catch {
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/whatsapp/employee-welcome-settings", async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM employee_welcome_settings WHERE company_id = ?",
        [companyId]
      ) as [unknown[], unknown];
      
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching employee welcome settings:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/whatsapp/employee-welcome-settings", async (req, res) => {
    const { companyId, is_active, message_template } = req.body;
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      
      const [existing] = await connection.query(
        "SELECT id FROM employee_welcome_settings WHERE company_id = ?",
        [companyId]
      ) as [unknown[], unknown];

      if (existing.length > 0) {
        await connection.query(
          "UPDATE employee_welcome_settings SET is_active = ?, message_template = ? WHERE company_id = ?",
          [is_active, message_template, companyId]
        );
      } else {
        await connection.query(
          "INSERT INTO employee_welcome_settings (company_id, is_active, message_template) VALUES (?, ?, ?)",
          [companyId, is_active, message_template]
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving employee welcome settings:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/whatsapp/idle-alert-settings", async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM idle_alert_settings WHERE company_id = ?",
        [companyId]
      ) as [unknown[], unknown];
      
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching idle alert settings:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/whatsapp/idle-alert-settings", async (req, res) => {
    const { companyId, idle_minutes, message_template, is_active } = req.body;
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      
      const [existing] = await connection.query(
        "SELECT id FROM idle_alert_settings WHERE company_id = ?",
        [companyId]
      ) as [unknown[], unknown];

      if (existing.length > 0) {
        await connection.query(
          "UPDATE idle_alert_settings SET idle_minutes = ?, message_template = ?, is_active = ? WHERE company_id = ?",
          [idle_minutes, message_template, is_active, companyId]
        );
      } else {
        await connection.query(
          "INSERT INTO idle_alert_settings (company_id, idle_minutes, message_template, is_active) VALUES (?, ?, ?, ?)",
          [companyId, idle_minutes, message_template, is_active]
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving idle alert settings:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/whatsapp/attendance-settings", async (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT * FROM attendance_alert_settings WHERE company_id = ?",
        [companyId]
      ) as [unknown[], unknown];
      
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching attendance settings:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/whatsapp/attendance-settings", async (req, res) => {
    const { company_id, office_time, grace_time, trigger_time, message_template, is_active } = req.body;
    if (!company_id) return res.status(400).json({ error: "Company ID required" });

    let connection;
    try {
      connection = await db.getConnection();
      
      const [existing] = await connection.query(
        "SELECT id FROM attendance_alert_settings WHERE company_id = ?",
        [company_id]
      ) as [unknown[], unknown];

      if (existing.length > 0) {
        await connection.query(
          `UPDATE attendance_alert_settings 
           SET office_time = ?, grace_time = ?, trigger_time = ?, message_template = ?, is_active = ?
           WHERE company_id = ?`,
          [office_time || null, grace_time || null, trigger_time || null, message_template || '', is_active ? 1 : 0, company_id]
        );
      } else {
        await connection.query(
          `INSERT INTO attendance_alert_settings (company_id, office_time, grace_time, trigger_time, message_template, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [company_id, office_time || null, grace_time || null, trigger_time || null, message_template || '', is_active ? 1 : 0]
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving attendance settings:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      if (connection) connection.release();
    }
  });

  const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    // Use GOOGLE_REDIRECT_URI if set, otherwise construct it from APP_URL or request context
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      (process.env.APP_URL ? `${process.env.APP_URL}/api/gmail/callback` : null);

    if (!clientId || !clientSecret || clientId === 'undefined' || clientSecret === 'undefined') {
      return null;
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  };

  app.get("/api/gmail/auth-url", (req, res) => {
    const { companyId } = req.query;
    const client = getOAuth2Client();
    
    if (!client) {
      return res.status(400).json({ 
        success: false,
        message: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the Settings > Secrets menu." 
      });
    }

    // If redirectUri was null (no APP_URL set), we can try to get it from the request
    if (!client.redirectUri) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      client.redirectUri = `${protocol}://${host}/api/gmail/callback`;
    }

    const state = JSON.stringify({ 
      companyId: companyId ? String(companyId) : undefined,
      source: req.query.source || 'super-admin'
    });

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.send", 
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
      ],
      prompt: "consent",
      state
    });
    res.json({ url });
  });

  app.get("/api/gmail/callback", async (req, res) => {
    const { code, state } = req.query;
    let companyId: string | undefined;
    let source = 'super-admin';

    if (state) {
      try {
        const parsedState = JSON.parse(state as string);
        companyId = parsedState.companyId;
        source = parsedState.source;
      } catch {
        companyId = state as string;
      }
    }

    const client = getOAuth2Client();
    
    if (!client) {
      return res.status(500).send("OAuth client not initialized. Check server environment variables.");
    }

    // Ensure redirectUri is set for token exchange
    if (!client.redirectUri) {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.get('host');
      client.redirectUri = `${protocol}://${host}/api/gmail/callback`;
    }

    let connection;
    try {
      const { tokens } = await client.getToken(code as string);
      connection = await db.getConnection();
      
      if (companyId) {
        // Save tokens for a specific company
        await connection.query(
          "UPDATE companies SET gmail_tokens = ? WHERE id = ?",
          [JSON.stringify(tokens), companyId]
        );
      } else {
        // Fallback to global super admin tokens
        await connection.query(
          "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
          ["gmail_tokens", JSON.stringify(tokens), JSON.stringify(tokens)]
        );
      }
      
      // Redirect back to the appropriate page
      let redirectPath = '/super-admin/gmail';
      if (source === 'employer') {
        redirectPath = '/company-admin/settings/gmail';
      } else if (companyId) {
        redirectPath = '/super-admin/companies';
      }
      
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8f9fa;">
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
              <h1 style="color: #10b981;">Authentication Successful!</h1>
              <p style="color: #64748b;">The Gmail account has been connected successfully.</p>
              <p style="color: #94a3b8; font-size: 14px;">Redirecting back to the dashboard...</p>
              <script>
                setTimeout(() => {
                  window.location.href = '${redirectPath}';
                }, 2000);
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Gmail Auth Error:", error);
      res.status(500).send("Authentication failed. Please try again.");
    } finally {
      if (connection) connection.release();
    }
  });

  app.get("/api/gmail/status", async (req, res) => {
    const { companyId } = req.query;
    let connection;
    try {
      connection = await db.getConnection();
      let connected = false;
      let lastSync = null;

      if (companyId) {
        const [rows] = await connection.query("SELECT gmail_tokens FROM companies WHERE id = ?", [companyId]) as [Record<string, unknown>[], unknown];
        connected = rows.length > 0 && rows[0].gmail_tokens !== null;
      } else {
        const [rows] = await connection.query("SELECT * FROM settings WHERE setting_key = 'gmail_tokens'") as [Record<string, unknown>[], unknown];
        connected = rows.length > 0;
        const [lastSyncRows] = await connection.query("SELECT updated_at FROM settings WHERE setting_key = 'gmail_tokens'") as [Record<string, unknown>[], unknown];
        lastSync = lastSyncRows.length > 0 ? new Date(lastSyncRows[0].updated_at as string).toLocaleString() : null;
      }
      
      const [sentTodayRows] = await connection.query("SELECT setting_value FROM settings WHERE setting_key = 'gmail_sent_today'") as [Record<string, unknown>[], unknown];
      
      res.json({
        connected,
        sentToday: sentTodayRows.length > 0 ? parseInt(sentTodayRows[0].setting_value as string) : 0,
        lastSync
      });
    } catch {
      res.status(500).json({ connected: false });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/gmail/send-test", async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM settings WHERE setting_key = 'gmail_tokens'") as [Record<string, unknown>[], unknown];
      
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: "Gmail not connected" });
      }

      const tokens = JSON.parse(rows[0].setting_value as string);
      const client = getOAuth2Client();
      if (!client) {
        return res.status(400).json({ success: false, message: "Gmail OAuth not configured" });
      }
      client.setCredentials(tokens);

      const gmail = google.gmail({ version: "v1", auth: client });
      
      // Get user email
      const oauth2 = google.oauth2({ version: "v2", auth: client });
      const userInfo = await oauth2.userinfo.get();
      const userEmail = userInfo.data.email;

      const subject = "System Test Email";
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
      const messageParts = [
        `From: HRM & ERP Platform <${userEmail}>`,
        `To: ${userEmail}`,
        `Content-Type: text/html; charset=utf-8`,
        `MIME-Version: 1.0`,
        `Subject: ${utf8Subject}`,
        "",
        "This is a test email from your HRM & ERP Platform Gmail Integration protocol.",
        "<br><br>",
        "<b>Status:</b> Active",
        "<br>",
        "<b>Protocol:</b> Gmail API OAuth 2.0"
      ];
      const message = messageParts.join("\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      // Update sent today count
      await connection.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = CAST(setting_value AS UNSIGNED) + 1",
        ["gmail_sent_today", "1"]
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Gmail Send Error:", error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  // SMTP Settings Endpoints
  app.get("/api/smtp/settings", async (req, res) => {
    let connection;
    try {
      const companyId = req.query.companyId as string;
      connection = await db.getConnection();
      
      if (companyId === 'global') {
        const [rows] = await connection.query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_config'") as [Record<string, unknown>[], unknown];
        if (rows.length > 0) {
          res.json(JSON.parse(rows[0].setting_value as string));
        } else {
          res.json(null);
        }
      } else {
        const [rows] = await connection.query("SELECT smtp_settings FROM companies WHERE id = ?", [companyId]) as [Record<string, unknown>[], unknown];
        if (rows.length > 0 && rows[0].smtp_settings) {
          res.json(JSON.parse(rows[0].smtp_settings as string));
        } else {
          res.json(null);
        }
      }
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/smtp/settings", async (req, res) => {
    let connection;
    try {
      const { companyId, settings } = req.body;
      connection = await db.getConnection();
      
      if (companyId === 'global') {
        await connection.query(
          "INSERT INTO settings (setting_key, setting_value) VALUES ('smtp_config', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
          [JSON.stringify(settings), JSON.stringify(settings)]
        );
      } else {
        await connection.query(
          "UPDATE companies SET smtp_settings = ? WHERE id = ?",
          [JSON.stringify(settings), companyId]
        );
      }
      
      res.json({ success: true });
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      if (connection) connection.release();
    }
  });

  app.post("/api/smtp/send-test", async (req, res) => {
    try {
      const { host, port, user, password, encryption, fromEmail, fromName } = req.body;
      
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: encryption === 'ssl',
        auth: {
          user,
          pass: password,
        },
        tls: encryption === 'tls' ? { rejectUnauthorized: false } : undefined
      });

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: user, // Send to self for testing
        subject: "SMTP Integration Test",
        text: "This is a test email from your ERP SMTP integration.",
        html: "<b>This is a test email from your ERP SMTP integration.</b>",
      });

      res.json({ success: true });
    } catch (error: unknown) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
  });

  // Employer Settings Routes
  app.get('/api/employer/settings/shifts', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM shifts') as [Record<string, unknown>[], unknown];
      const formattedShifts = rows.map(row => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id),
          name: r.name,
          startTime: String(r.start_time).substring(0, 5),
          endTime: String(r.end_time).substring(0, 5),
          breakTime: r.break_time,
          gracePeriod: r.grace_period,
          minWorkingHours: r.min_working_hours,
          lateMarkRule: r.late_mark_rule,
          status: r.status
        };
      });
      res.json(formattedShifts);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/employer/settings/shifts', async (req, res) => {
    try {
      console.log('Received shift update request:', req.body);
      const shift = req.body;
      await db.query(
        'UPDATE shifts SET name = ?, start_time = ?, end_time = ?, break_time = ?, grace_period = ?, min_working_hours = ?, late_mark_rule = ?, status = ? WHERE id = ?',
        [
          shift.name || null, 
          shift.startTime || null, 
          shift.endTime || null, 
          shift.breakTime || 0, 
          shift.gracePeriod || 0, 
          shift.minWorkingHours || 0, 
          shift.lateMarkRule || null, 
          shift.status || 'active', 
          shift.id
        ]
      );
      console.log(`Shift ${shift.name} updated successfully in database.`);
      res.json({ message: 'Shift updated successfully' });
    } catch (error) {
      console.error('Error updating shift:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/employer/settings/rules', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT business_rules FROM companies LIMIT 1') as [ { business_rules: string }[], unknown];
      if (rows.length > 0 && rows[0].business_rules) {
        res.json(JSON.parse(rows[0].business_rules));
      } else {
        res.json({
          language: 'English',
          currency: 'USD',
          timeZone: 'UTC',
          timeFormat: '24h',
          taxRate: 0,
          vatRate: 0,
          customField: ''
        });
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/employer/settings/rules', async (req, res) => {
    try {
      const rules = req.body || {};
      await db.query('UPDATE companies SET business_rules = ? LIMIT 1', [JSON.stringify(rules)]);
      res.json({ message: 'Rules saved successfully' });
    } catch (error) {
      console.error('Error saving rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/employer/settings/profile', async (req, res) => {
    try {
      console.log('Fetching company profile...');
      const [rows] = await db.query('SELECT name, email, mobile as phone, website, about, head_office_location, factory_location, logo_url FROM companies LIMIT 1') as [ Record<string, unknown>[], unknown];
      if (rows.length > 0) {
        console.log('Profile fetched successfully:', rows[0]);
        res.json(rows[0]);
      } else {
        console.warn('No company found in database.');
        res.status(404).json({ error: 'Company not found' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/employer/settings/profile', async (req, res) => {
    try {
      console.log('Received profile update request:', req.body);
      const { name, email, phone, website, about, head_office_location, factory_location, logo_url } = req.body;
      
      // Validation
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required' });
      }

      await db.query(
        'UPDATE companies SET name = ?, email = ?, mobile = ?, website = ?, about = ?, head_office_location = ?, factory_location = ?, logo_url = ? LIMIT 1',
        [
          name || null, 
          email || null, 
          phone || null, 
          website || null, 
          about || null, 
          head_office_location || null, 
          factory_location || null, 
          logo_url || null
        ]
      );
      console.log('Profile updated successfully in database.');
      res.json({ message: 'Profile saved successfully' });
    } catch (error) {
      console.error('Error saving profile:', error);
      res.status(500).json({ error: 'Internal server error' });
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
    console.log(`Checking for index.html at: ${path.resolve(distPath, 'index.html')}`);
    app.use(express.static(distPath));
    
    app.get('*all', (req, res) => {
      const indexPath = path.resolve(distPath, 'index.html');
      console.log(`Sending file: ${indexPath}`);
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`Error sending index.html: ${err.message}`);
          res.status(500).send("Server Error: Could not load frontend.");
        }
      });
    });
  }

  // Cron job for WhatsApp Attendance Alerts
  cron.schedule('* * * * *', async () => {
    let connection;
    try {
      connection = await db.getConnection();
      const now = new Date();
      // Use UTC or server local time? The user might be in a different timezone.
      // For simplicity, we'll use the server's local time.
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const [settings] = await connection.query(`
        SELECT * FROM attendance_alert_settings 
        WHERE is_active = TRUE AND TIME_FORMAT(trigger_time, '%H:%i') = ?
      `, [currentTime]) as [unknown[], unknown];

      for (const setting of settings as AlertSetting[]) {
        const companyId = setting.company_id;
        const template = setting.message_template;

        const [lateEmployees] = await connection.query(`
          SELECT e.id, e.name, e.mobile as phone 
          FROM employees e
          LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
          WHERE e.company_id = ? 
          AND e.status = 'active'
          AND a.id IS NULL
        `, [todayStr, companyId]) as [unknown[], unknown];

        for (const emp of lateEmployees as EmployeeRow[]) {
          if (!emp.phone) continue;

          const [existingLogs] = await connection.query(`
            SELECT id FROM whatsapp_logs 
            WHERE company_id = ? AND employee_id = ? AND type = 'attendance_alert' AND DATE(sent_at) = ?
          `, [companyId, emp.id, todayStr]) as [unknown[], unknown];

          if (existingLogs.length > 0) continue;

          let phone = emp.phone.replace(/\D/g, '');
          if (phone.startsWith('0')) {
            phone = '92' + phone.substring(1);
          }
          if (!phone.endsWith("@s.whatsapp.net")) {
            phone += "@s.whatsapp.net";
          }

          const message = template.replace(/{{employee_name}}/g, emp.name);

          const sock = sessions.get(Number(companyId));
          if (sock) {
            try {
              await sock.sendMessage(phone, { text: message });
              await connection.query(`
                INSERT INTO whatsapp_logs (company_id, employee_id, phone_number, message, status, type)
                VALUES (?, ?, ?, ?, 'sent', 'attendance_alert')
              `, [companyId, emp.id, phone, message]);
            } catch {
              await connection.query(`
                INSERT INTO whatsapp_logs (company_id, employee_id, phone_number, message, status, type)
                VALUES (?, ?, ?, ?, 'failed', 'attendance_alert')
              `, [companyId, emp.id, phone, message]);
            }
            
            const delay = Math.floor(Math.random() * 3000) + 2000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error) {
      console.error('Error processing attendance alerts:', error);
    } finally {
      if (connection) connection.release();
    }
  });

  // Idle Alert Cron Job
  cron.schedule('* * * * *', async () => {
    let connection;
    try {
      connection = await db.getConnection();
      
      const [settings] = await connection.query(`
        SELECT * FROM idle_alert_settings WHERE is_active = TRUE
      `) as [unknown[], unknown];

      for (const setting of settings as AlertSetting[]) {
        const companyId = setting.company_id;
        const idleMinutes = setting.idle_minutes;
        const template = setting.message_template || "Dear {{employee_name}}, you have been inactive for {{idle_minutes}} minutes. Please resume your work.";

        const [idleEmployees] = await connection.query(`
          SELECT e.id, e.name, e.mobile as phone, t.last_activity_time
          FROM employees e
          JOIN time_tracking t ON e.id = t.employee_id
          WHERE e.company_id = ? 
          AND e.status = 'active'
          AND TIMESTAMPDIFF(MINUTE, t.last_activity_time, NOW()) >= ?
        `, [companyId, idleMinutes]) as [unknown[], unknown];

        for (const emp of idleEmployees as EmployeeRow[]) {
          if (!emp.phone) continue;

          // Check if we already sent an alert for this specific last_activity_time
          const [existingLogs] = await connection.query(`
            SELECT id FROM whatsapp_logs 
            WHERE company_id = ? AND employee_id = ? AND type = 'idle_alert' 
            AND sent_at > ?
          `, [companyId, emp.id, emp.last_activity_time]) as [unknown[], unknown];

          if (existingLogs.length > 0) continue; // Already sent an alert for this idle period

          let phone = emp.phone.replace(/\D/g, '');
          if (phone.startsWith('0')) {
            phone = '92' + phone.substring(1);
          }
          if (!phone.endsWith("@s.whatsapp.net")) {
            phone += "@s.whatsapp.net";
          }

          let message = template.replace(/{{employee_name}}/g, emp.name);
          message = message.replace(/{{idle_minutes}}/g, idleMinutes.toString());

          const sock = sessions.get(Number(companyId));
          if (sock) {
            try {
              await sock.sendMessage(phone, { text: message });
              await connection.query(`
                INSERT INTO whatsapp_logs (company_id, employee_id, phone_number, message, status, type)
                VALUES (?, ?, ?, ?, 'sent', 'idle_alert')
              `, [companyId, emp.id, phone, message]);
            } catch {
              await connection.query(`
                INSERT INTO whatsapp_logs (company_id, employee_id, phone_number, message, status, type)
                VALUES (?, ?, ?, ?, 'failed', 'idle_alert')
              `, [companyId, emp.id, phone, message]);
            }
            
            // 2-5 sec delay between messages
            const delay = Math.floor(Math.random() * 3000) + 2000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error) {
      console.error('Error processing idle alerts:', error);
    } finally {
      if (connection) connection.release();
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Test database connection in the background
    if (process.env.DB_HOST) {
      console.log(`Testing connection to: ${process.env.DB_HOST}`);
      db.getConnection()
        .then(connection => {
          console.log("✅ Database connected successfully to Hostinger");
          initializeDatabase(connection)
            .then(() => console.log("✅ Database initialized successfully"))
            .catch(err => console.error("❌ Database initialization failed", err))
            .finally(() => connection.release());
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
