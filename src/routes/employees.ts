import express from 'express';
import { RowDataPacket } from 'mysql2';
import db from '../db';
import { fetchWithRetry } from '../utils/fetchWithRetry';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = 'SELECT id, company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields, created_at FROM employees';
    const params: (string | number)[] = [];
    
    if (company_id) {
      query += ' WHERE company_id = ?';
      params.push(company_id as string);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields, created_at FROM employees WHERE id = ?',
      [id]
    ) as [RowDataPacket[], unknown];
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

interface AlertSetting {
  message_template?: string;
}

// Create a new employee
router.post('/', async (req, res) => {
  try {
    const { company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields } = req.body;
    
    // Hash password - changed to plain text for admin visibility as requested
    const passwordToStore = password || '123456';
    
    const [result] = await db.query(
      "INSERT INTO employees (company_id, name, email, password, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [company_id, name, email, passwordToStore, employee_id, department, designation, status || 'active', mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields ? JSON.stringify(custom_fields) : null]
    );
    
    const insertId = (result as { insertId: number }).insertId;
    
    // Send WhatsApp Welcome Message
    try {
      const [welcomeSettings] = await db.query(
        "SELECT * FROM employee_welcome_settings WHERE company_id = ? AND is_active = TRUE",
        [company_id]
      ) as [RowDataPacket[], unknown];

      if (welcomeSettings.length > 0 && mobile_no) {
        const setting = welcomeSettings[0] as AlertSetting;
        const template = setting.message_template || "Dear {{employee_name}},\nWelcome to the company.\n\nYour login details are:\nUsername: {{username}}\nPassword: {{password}}\n\nPlease login and update your password.\n\nThank you";
        
        let message = template.replace(/{{employee_name}}/g, name || '');
        message = message.replace(/{{username}}/g, username || '');
        message = message.replace(/{{password}}/g, passwordToStore);

        // Use fetchWithRetry to call our own API to handle rate limiting and Baileys logic
        fetchWithRetry(`http://localhost:3000/api/whatsapp/send`, {
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
  }
});

// Update an employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields } = req.body;
    
    await db.query(
      "UPDATE employees SET name = ?, email = ?, employee_id = ?, department = ?, designation = ?, status = ?, mobile_no = ?, date_of_birth = ?, joining_date = ?, blood_group = ?, location = ?, city = ?, employee_type = ?, national_id = ?, salary = ?, tax_deduction = ?, bank_name = ?, bank_account_no = ?, mode_of_payment = ?, username = ?, profile_picture = ?, custom_fields = ? WHERE id = ?",
      [name, email, employee_id, department, designation, status, mobile_no, date_of_birth, joining_date, blood_group, location, city, employee_type, national_id, salary, tax_deduction, bank_name, bank_account_no, mode_of_payment, username, profile_picture, custom_fields ? JSON.stringify(custom_fields) : null, id]
    );
    
    res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating employee:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM employees WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
