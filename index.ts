import express from "express";
import bcrypt from 'bcryptjs';
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import { Connection } from "mysql2/promise";
import db from "./src/db";
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState as getAuthState, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import QRCode from "qrcode";
import fs from "fs";
import { join } from "path";

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

  // Initialize database tables
  async function initializeDatabase(connection: Connection) {
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

    // Create companies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(50),
        unique_code VARCHAR(50) UNIQUE NOT NULL,
        subsidiary VARCHAR(255),
        head_office_location VARCHAR(255),
        factory_location VARCHAR(255),
        admin_username VARCHAR(255) UNIQUE NOT NULL,
        admin_password VARCHAR(255) NOT NULL,
        logo_url TEXT,
        plan VARCHAR(50) DEFAULT 'Basic',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        license_status ENUM('valid', 'expired') DEFAULT 'valid',
        gmail_tokens TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure 'plan' column exists in companies (in case table was created before)
    try {
      await connection.query("ALTER TABLE companies ADD COLUMN plan VARCHAR(50) DEFAULT 'Basic'");
    } catch {
      // Column might already exist, ignore error
    }

    // Create invoices table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        plan VARCHAR(50) NOT NULL,
        status ENUM('paid', 'unpaid', 'cancelled') DEFAULT 'unpaid',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Create settings table for Gmail OAuth tokens
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create WhatsApp accounts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT UNIQUE NOT NULL,
        status ENUM('connected', 'disconnected', 'connecting') DEFAULT 'disconnected',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Create WhatsApp messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        to_number VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        retries INT DEFAULT 0,
        response_log TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Create dashboard_widgets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS dashboard_widgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        widget_id VARCHAR(50) NOT NULL,
        is_enabled BOOLEAN DEFAULT TRUE,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE KEY unique_company_widget (company_id, widget_id)
      )
    `);

    // Create modules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company_modules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS company_modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        module_id INT NOT NULL,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
        UNIQUE KEY unique_company_module (company_id, module_id)
      )
    `);

    // Create departments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        head_of_department VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Create designations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS designations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        department_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      )
    `);

    // Create employees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        employee_id VARCHAR(50),
        department VARCHAR(100),
        designation VARCHAR(100),
        status ENUM('active', 'inactive') DEFAULT 'active',
        mobile_no VARCHAR(50),
        date_of_birth DATE,
        joining_date DATE,
        blood_group VARCHAR(10),
        location VARCHAR(255),
        city VARCHAR(100),
        employee_type VARCHAR(100),
        national_id VARCHAR(100),
        salary DECIMAL(10, 2),
        tax_deduction DECIMAL(5, 2),
        bank_name VARCHAR(255),
        bank_account_no VARCHAR(100),
        mode_of_payment VARCHAR(50),
        username VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Ensure new columns exist in employees table (in case table was created before)
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN mobile_no VARCHAR(50)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN date_of_birth DATE");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN joining_date DATE");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN blood_group VARCHAR(10)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN location VARCHAR(255)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN city VARCHAR(100)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN employee_type VARCHAR(100)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN national_id VARCHAR(100)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN salary DECIMAL(10, 2)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN tax_deduction DECIMAL(5, 2)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN bank_account_no VARCHAR(100)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN mode_of_payment VARCHAR(50)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN username VARCHAR(100)");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN profile_picture LONGTEXT");
    } catch { /* Ignore if column exists */ }
    try {
      await connection.query("ALTER TABLE employees ADD COLUMN custom_fields JSON");
    } catch { /* Ignore if column exists */ }

    // Create employer_permissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employer_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        module_name VARCHAR(255) NOT NULL,
        is_granted BOOLEAN DEFAULT TRUE,
        UNIQUE KEY comp_mod (company_id, module_name),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Create attendance table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        break_time INT DEFAULT 0, -- in minutes
        status ENUM('Present', 'Absent', 'Leave', 'Half Day') NOT NULL,
        is_late BOOLEAN DEFAULT FALSE,
        working_hours DECIMAL(5,2) DEFAULT 0,
        overtime_hours DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY emp_date (employee_id, date),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Insert default super admin if not exists
    const [existingAdmins] = await connection.query("SELECT * FROM admins WHERE email = 'admin@erp.com'") as [Record<string, unknown>[], unknown];
    if (existingAdmins.length === 0) {
      await connection.query("INSERT INTO admins (email, password, name) VALUES ('admin@erp.com', 'admin123', 'Super Admin')");
    }
  }

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
    try {
      const { company_id } = req.query;
      const connection = await db.getConnection();
      let query = "SELECT id, name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields, created_at FROM employees";
      const params: (string | number)[] = [];
      
      if (company_id) {
        query += " WHERE company_id = ?";
        params.push(company_id as string);
      }
      
      query += " ORDER BY created_at DESC";
      
      const [rows] = await connection.query(query, params);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching employees:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const { company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields } = req.body;
      const connection = await db.getConnection();
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password || '123456', 10);
      
      const [result] = await connection.query(
        "INSERT INTO employees (company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [company_id, name, email, hashedPassword, employee_id, department, designation, status || 'active', mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields ? JSON.stringify(custom_fields) : null]
      );
      
      connection.release();
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating employee:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields } = req.body;
      const connection = await db.getConnection();
      
      await connection.query(
        "UPDATE employees SET name = ?, email = ?, employee_id = ?, department = ?, designation = ?, status = ?, mobile_no = ?, date_of_birth = ?, joining_date = ?, blood_group = ?, location = ?, city = ?, employee_type = ?, national_id = ?, salary = ?, tax_deduction = ?, bank_name = ?, bank_account_no = ?, mode_of_payment = ?, username = ?, profile_picture = ?, custom_fields = ? WHERE id = ?",
        [name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields ? JSON.stringify(custom_fields) : null, id]
      );
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating employee:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();
      
      await connection.query("DELETE FROM employees WHERE id = ?", [id]);
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting employee:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Departments API
  app.get("/api/departments", async (req, res) => {
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      const connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM departments WHERE company_id = ? ORDER BY created_at DESC", [company_id]);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching departments:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const { company_id, name, head_of_department, status } = req.body;
      const connection = await db.getConnection();
      
      const [result] = await connection.query(
        "INSERT INTO departments (company_id, name, head_of_department, status) VALUES (?, ?, ?, ?)",
        [company_id, name, head_of_department, status || 'active']
      );
      
      connection.release();
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating department:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, head_of_department, status } = req.body;
      const connection = await db.getConnection();
      
      await connection.query(
        "UPDATE departments SET name = ?, head_of_department = ?, status = ? WHERE id = ?",
        [name, head_of_department, status, id]
      );
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating department:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();
      
      await connection.query("DELETE FROM departments WHERE id = ?", [id]);
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting department:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Designations API
  app.get("/api/designations", async (req, res) => {
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      const connection = await db.getConnection();
      const [rows] = await connection.query(`
        SELECT d.*, dep.name as department_name 
        FROM designations d
        JOIN departments dep ON d.department_id = dep.id
        WHERE d.company_id = ? 
        ORDER BY d.created_at DESC
      `, [company_id]);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching designations:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/designations", async (req, res) => {
    try {
      const { company_id, department_id, name, status } = req.body;
      const connection = await db.getConnection();
      
      const [result] = await connection.query(
        "INSERT INTO designations (company_id, department_id, name, status) VALUES (?, ?, ?, ?)",
        [company_id, department_id, name, status || 'active']
      );
      
      connection.release();
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating designation:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/designations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { department_id, name, status } = req.body;
      const connection = await db.getConnection();
      
      await connection.query(
        "UPDATE designations SET department_id = ?, name = ?, status = ? WHERE id = ?",
        [department_id, name, status, id]
      );
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating designation:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/designations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await db.getConnection();
      
      await connection.query("DELETE FROM designations WHERE id = ?", [id]);
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error deleting designation:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard Widgets API
  app.get("/api/dashboard-widgets", async (req, res) => {
    try {
      const { company_id } = req.query;
      if (!company_id) {
        return res.status(400).json({ error: "company_id is required" });
      }
      
      const connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM dashboard_widgets WHERE company_id = ? ORDER BY position ASC", [company_id]);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching dashboard widgets:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/dashboard-widgets", async (req, res) => {
    try {
      const { company_id, widgets } = req.body; // widgets: [{widget_id, is_enabled, position}, ...]
      const connection = await db.getConnection();
      
      for (const widget of widgets) {
        await connection.query(`
          INSERT INTO dashboard_widgets (company_id, widget_id, is_enabled, position)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE is_enabled = ?, position = ?
        `, [company_id, widget.widget_id, widget.is_enabled, widget.position, widget.is_enabled, widget.position]);
      }
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating dashboard widgets:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Modules API
  app.get("/api/modules", async (req, res) => {
    try {
      const connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM modules");
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching modules:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const { name, description, status } = req.body;
      const connection = await db.getConnection();
      const [result] = await connection.query(
        "INSERT INTO modules (name, description, status) VALUES (?, ?, ?)",
        [name, description, status || 'active']
      );
      connection.release();
      res.json({ success: true, id: (result as { insertId: number }).insertId });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error creating module:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/company-modules", async (req, res) => {
    try {
      const { company_id } = req.query;
      const connection = await db.getConnection();
      const query = company_id 
        ? "SELECT m.*, cm.is_enabled FROM modules m LEFT JOIN company_modules cm ON m.id = cm.module_id AND cm.company_id = ?"
        : "SELECT * FROM modules";
      const params = company_id ? [company_id] : [];
      const [rows] = await connection.query(query, params);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching company modules:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/company-modules", async (req, res) => {
    try {
      const { company_id, module_id, is_enabled } = req.body;
      const connection = await db.getConnection();
      await connection.query(`
        INSERT INTO company_modules (company_id, module_id, is_enabled)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE is_enabled = ?
      `, [company_id, module_id, is_enabled, is_enabled]);
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating company module:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Attendance API
  app.get("/api/attendance", async (req, res) => {
    try {
      const { company_id, date, start, end } = req.query;
      const connection = await db.getConnection();
      
      let query = `
        SELECT a.*, e.name as employee_name, e.employee_id as emp_code 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.company_id = ?
      `;
      const params: (string | number)[] = [company_id as string];
      
      if (date) {
        query += " AND a.date = ?";
        params.push(date);
      } else if (start && end) {
        query += " AND a.date >= ? AND a.date <= ?";
        params.push(start, end);
      }
      
      query += " ORDER BY a.date DESC, e.name ASC";
      
      const [rows] = await connection.query(query, params);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching attendance:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const { company_id, employee_id, date, check_in, check_out, break_time, status, is_late, working_hours, overtime_hours } = req.body;
      const connection = await db.getConnection();
      
      // Upsert attendance record
      await connection.query(`
        INSERT INTO attendance (company_id, employee_id, date, check_in, check_out, break_time, status, is_late, working_hours, overtime_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          check_in = VALUES(check_in),
          check_out = VALUES(check_out),
          break_time = VALUES(break_time),
          status = VALUES(status),
          is_late = VALUES(is_late),
          working_hours = VALUES(working_hours),
          overtime_hours = VALUES(overtime_hours)
      `, [company_id, employee_id, date, check_in || null, check_out || null, break_time || 0, status, is_late || false, working_hours || 0, overtime_hours || 0]);
      
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error saving attendance:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Employer Permissions API
  app.get("/api/employer-permissions", async (req, res) => {
    try {
      const { company_id } = req.query;
      const connection = await db.getConnection();
      let query = "SELECT * FROM employer_permissions";
      const params: (string | number)[] = [];
      
      if (company_id) {
        query += " WHERE company_id = ?";
        params.push(company_id);
      }
      
      const [rows] = await connection.query(query, params);
      connection.release();
      res.json(rows);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching permissions:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/employer-permissions", async (req, res) => {
    const { permissions } = req.body; // Array of { company_id, module_name, is_granted }
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    try {
      const connection = await db.getConnection();
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
      connection.release();
      res.json({ success: true, message: "Permissions saved successfully" });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error saving permissions:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Super Admin Stats
  app.get("/api/super-admin/stats", async (req, res) => {
    try {
      const connection = await db.getConnection();
      
      const [totalResult] = await connection.query("SELECT COUNT(*) as count FROM companies") as [Record<string, unknown>[], unknown];
      const [activeResult] = await connection.query("SELECT COUNT(*) as count FROM companies WHERE status = 'active'") as [Record<string, unknown>[], unknown];
      const [expiredResult] = await connection.query("SELECT COUNT(*) as count FROM companies WHERE license_status = 'expired'") as [Record<string, unknown>[], unknown];
      
      connection.release();
      res.json({
        totalCompanies: totalResult[0].count,
        activeCompanies: activeResult[0].count,
        expiredLicenses: expiredResult[0].count
      });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Company Admin Login
  app.post("/api/company-admin/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const connection = await db.getConnection();
      const [companies] = await connection.query(
        "SELECT * FROM companies WHERE admin_username = ? AND admin_password = ?",
        [username, password]
      ) as [Record<string, unknown>[], unknown];
      connection.release();

      if (companies.length > 0) {
        res.json({ success: true, company: companies[0] });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Employee Login
  app.post("/api/employee/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const connection = await db.getConnection();
      const [employees] = await connection.query(
        "SELECT e.*, c.name as company_name FROM employees e JOIN companies c ON e.company_id = c.id WHERE e.email = ? AND e.password = ? AND e.status = 'active'",
        [email, password]
      ) as [Record<string, unknown>[], unknown];
      connection.release();

      if (employees.length > 0) {
        res.json({ success: true, employee: employees[0] });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials or inactive account" });
      }
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
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
    try {
      const connection = await db.getConnection();
      const [invoices] = await connection.query(`
        SELECT i.*, c.name as company_name, c.email as company_email 
        FROM invoices i 
        JOIN companies c ON i.company_id = c.id 
        ORDER BY i.created_at DESC
      `) as [Record<string, unknown>[], unknown];
      connection.release();
      res.json(invoices);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Send invoice email
  app.post("/api/invoices/:id/send", async (req, res) => {
    const { id } = req.params;
    try {
      const connection = await db.getConnection();
      const [invoice] = await connection.query(`
        SELECT i.*, c.name as company_name, c.email as company_email 
        FROM invoices i 
        JOIN companies c ON i.company_id = c.id 
        WHERE i.id = ?
      `, [id]) as [Record<string, unknown>[], unknown];
      
      if (invoice.length === 0) {
        connection.release();
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
          connection.release();
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

        connection.release();
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
          
          connection.release();
          return res.json({ success: true, message: `Invoice sent to ${companyEmail} via SMTP` });
        } else {
          connection.release();
          return res.status(400).json({ success: false, message: "Email service not configured. Please connect Gmail or set SMTP settings." });
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error sending invoice:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // List all companies
  app.get("/api/companies", async (req, res) => {
    try {
      const connection = await db.getConnection();
      const [companies] = await connection.query("SELECT * FROM companies ORDER BY created_at DESC") as [Record<string, unknown>[], unknown];
      connection.release();
      res.json(companies);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
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
    try {
      const connection = await db.getConnection();
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
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Delete company
  app.delete("/api/companies/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Deleting company with ID:", id);
    try {
      const connection = await db.getConnection();
      await connection.query("DELETE FROM companies WHERE id = ?", [id]);
      connection.release();
      res.json({ success: true });
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Recent Companies
  app.get("/api/super-admin/recent-companies", async (req, res) => {
    try {
      const connection = await db.getConnection();
      const [companies] = await connection.query("SELECT * FROM companies ORDER BY created_at DESC LIMIT 5") as [Record<string, unknown>[], unknown];
      connection.release();
      res.json(companies);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
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
  const sessions = new Map<number, ReturnType<typeof makeWASocket>>();
  const qrCodes = new Map<number, string>();

  const logger = pino({ level: "silent" });

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
      const connectionDb = await db.getConnection();
      await connectionDb.query(
        "INSERT INTO whatsapp_accounts (company_id, status) VALUES (?, 'connecting') ON DUPLICATE KEY UPDATE status = 'connecting'",
        [companyId]
      );
      connectionDb.release();

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

          const connectionDb = await db.getConnection();
          await connectionDb.query(
            "UPDATE whatsapp_accounts SET status = 'disconnected' WHERE company_id = ?",
            [companyId]
          );
          connectionDb.release();

          if (shouldReconnect) {
            console.log(`[WhatsApp] Reconnecting for company ${companyId}`);
            initWhatsApp(companyId);
          }
        } else if (connection === "open") {
          console.log(`[WhatsApp] Connection opened for company ${companyId}`);
          qrCodes.delete(companyId);
          const connectionDb = await db.getConnection();
          await connectionDb.query(
            "INSERT INTO whatsapp_accounts (company_id, status) VALUES (?, 'connected') ON DUPLICATE KEY UPDATE status = 'connected'",
            [companyId]
          );
          connectionDb.release();
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
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    try {
      const connection = await db.getConnection();
      const [rows] = await connection.query(
        "SELECT status FROM whatsapp_accounts WHERE company_id = ?",
        [companyId]
      ) as [Record<string, unknown>[], unknown];
      connection.release();

      const status = rows.length > 0 ? rows[0].status : "disconnected";
      const qr = qrCodes.get(Number(companyId)) || null;

      res.json({ status, qr });
    } catch {
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  app.post("/api/whatsapp/connect", async (req, res) => {
    const { companyId } = req.body;
    console.log(`[WhatsApp] Connect request received for company ${companyId}`);
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    try {
      await initWhatsApp(Number(companyId));
      res.json({ success: true, message: "Initializing connection..." });
    } catch {
      res.status(500).json({ error: "Failed to initialize connection" });
    }
  });

  app.post("/api/whatsapp/disconnect", async (req, res) => {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ error: "Company ID required" });

    try {
      const sock = sessions.get(Number(companyId));
      if (sock) {
        await sock.logout();
        sessions.delete(companyId);
      }

      const connection = await db.getConnection();
      await connection.query(
        "UPDATE whatsapp_accounts SET status = 'disconnected' WHERE company_id = ?",
        [companyId]
      );
      
      // Clear session directory
      const sessionDir = join("/tmp", "whatsapp_sessions", `company_${companyId}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      }

      connection.release();
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to disconnect" });
    }
  });

  app.post("/api/whatsapp/send", async (req, res) => {
    const { company_id, to_number, message } = req.body;
    console.log(`[WhatsApp] Send request received for company ${company_id} to ${to_number}`);
    if (!company_id || !to_number || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

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
      const connection = await db.getConnection();
      const [recentRows] = await connection.query(
        "SELECT COUNT(*) as count FROM whatsapp_messages WHERE company_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)",
        [company_id]
      ) as [Record<string, unknown>[], unknown];

      if (recentRows[0].count as number >= 20) {
        connection.release();
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

        connection.release();
        res.json({ success: true, message: "Message sent" });
      } catch (sendError) {
        await connection.query(
          "INSERT INTO whatsapp_messages (company_id, to_number, message, status, response_log) VALUES (?, ?, ?, 'failed', ?)",
          [company_id, to_number, message, JSON.stringify(sendError)]
        );
        connection.release();
        res.status(500).json({ error: "Failed to send message", details: sendError });
      }
    } catch {
      res.status(500).json({ error: "Internal server error" });
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

    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/gmail.send", 
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
      ],
      prompt: "consent",
      state: companyId ? String(companyId) : undefined
    });
    res.json({ url });
  });

  app.get("/api/gmail/callback", async (req, res) => {
    const { code, state: companyId } = req.query;
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

    try {
      const { tokens } = await client.getToken(code as string);
      const connection = await db.getConnection();
      
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
      
      connection.release();
      
      // Redirect back to the appropriate page
      const redirectPath = companyId ? '/super-admin/companies' : '/super-admin/gmail';
      
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
    }
  });

  app.get("/api/gmail/status", async (req, res) => {
    const { companyId } = req.query;
    try {
      const connection = await db.getConnection();
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
      
      connection.release();
      
      res.json({
        connected,
        sentToday: sentTodayRows.length > 0 ? parseInt(sentTodayRows[0].setting_value as string) : 0,
        lastSync
      });
    } catch {
      res.status(500).json({ connected: false });
    }
  });

  app.post("/api/gmail/send-test", async (req, res) => {
    try {
      const connection = await db.getConnection();
      const [rows] = await connection.query("SELECT * FROM settings WHERE setting_key = 'gmail_tokens'") as [Record<string, unknown>[], unknown];
      
      if (rows.length === 0) {
        connection.release();
        return res.status(401).json({ success: false, message: "Gmail not connected" });
      }

      const tokens = JSON.parse(rows[0].setting_value as string);
      const client = getOAuth2Client();
      if (!client) {
        connection.release();
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

      connection.release();
      res.json({ success: true });
    } catch (error) {
      console.error("Gmail Send Error:", error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
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
