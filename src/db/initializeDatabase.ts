import { Connection } from 'mysql2/promise';

export async function initializeDatabase(connection: Connection) {
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
      smtp_settings TEXT,
      business_rules TEXT,
      website VARCHAR(255),
      about TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add missing columns if table already exists
  try {
    const [columns] = await connection.query('SHOW COLUMNS FROM companies') as [Record<string, unknown>[], unknown];
    const columnNames = columns.map(c => c.Field as string);
    if (!columnNames.includes('website')) {
      await connection.query('ALTER TABLE companies ADD COLUMN website VARCHAR(255)');
    }
    if (!columnNames.includes('about')) {
      await connection.query('ALTER TABLE companies ADD COLUMN about TEXT');
    }
  } catch (err) {
    console.error('Error adding missing columns to companies table:', err);
  }

  // Create shifts table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      break_time INT DEFAULT 60,
      grace_period INT DEFAULT 15,
      min_working_hours INT DEFAULT 8,
      late_mark_rule VARCHAR(255) DEFAULT '15',
      status ENUM('Active', 'Deactive') DEFAULT 'Active',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Insert default shifts if not exists
  const [existingShifts] = await connection.query('SELECT COUNT(*) as count FROM shifts') as [Record<string, unknown>[], unknown];
  if ((existingShifts[0] as { count: number }).count === 0) {
    await connection.query(`
      INSERT INTO shifts (name, start_time, end_time, break_time, grace_period, min_working_hours, late_mark_rule, status)
      VALUES 
      ('Morning', '09:00:00', '17:00:00', 60, 15, 8, '15', 'Active'),
      ('Evening', '14:00:00', '22:00:00', 60, 15, 8, '15', 'Active'),
      ('Night', '22:00:00', '06:00:00', 60, 15, 8, '15', 'Active')
    `);
  }

  // Insert default company if not exists
  const [existingCompanies] = await connection.query('SELECT COUNT(*) as count FROM companies') as [Record<string, unknown>[], unknown];
  if ((existingCompanies[0] as { count: number }).count === 0) {
    await connection.query(`
      INSERT INTO companies (
        name, email, mobile, unique_code, subsidiary, 
        head_office_location, factory_location, 
        admin_username, admin_password, logo_url, plan, status, license_status, business_rules
      ) VALUES (
        'Acme Corp', 'support@acmecorp.com', '+1 234 567 890', 'ACME-001', 'None',
        '123 Main St, New York, NY', '456 Industrial Way, Newark, NJ',
        'acme_admin', 'admin123', 'https://picsum.photos/seed/acme/200/200', 'Premium', 'active', 'valid',
        '{"language":"English","currency":"USD","timeZone":"UTC","timeFormat":"24h","taxRate":0,"vatRate":0,"customField":""}'
      )
    `);
  }

  // Ensure 'plan' column exists in companies (in case table was created before)
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN plan VARCHAR(50) DEFAULT 'Basic'");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN gmail_tokens TEXT");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN smtp_settings TEXT");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN subsidiary VARCHAR(255)");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN head_office_location VARCHAR(255)");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN factory_location VARCHAR(255)");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN logo_url TEXT");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN business_rules TEXT");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN website VARCHAR(255)");
  } catch {
    // Column might already exist
  }
  try {
    await connection.query("ALTER TABLE companies ADD COLUMN about TEXT");
  } catch {
    // Column might already exist
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
      manager_id INT,
      shift_id INT,
      profile_picture LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL
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

  try {
    await connection.query("ALTER TABLE employees ADD COLUMN manager_id INT");
  } catch { /* Ignore if column exists */ }
  try {
    await connection.query("ALTER TABLE employees ADD COLUMN profile_picture LONGTEXT");
  } catch { /* Ignore if column exists */ }
  try {
    await connection.query("ALTER TABLE employees ADD CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL");
  } catch { /* Ignore if constraint exists */ }
  try {
    await connection.query("ALTER TABLE employees ADD COLUMN shift_id INT");
  } catch { /* Ignore if column exists */ }
  try {
    await connection.query("ALTER TABLE employees ADD CONSTRAINT fk_emp_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL");
  } catch { /* Ignore if constraint exists */ }
  
  // Create attendance table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      shift_id INT,
      date DATE NOT NULL,
      check_in_time DATETIME,
      check_out_time DATETIME,
      break_start_time DATETIME,
      break_end_time DATETIME,
      check_in VARCHAR(10),
      check_out VARCHAR(10),
      break_time INT DEFAULT 0,
      check_in_lat DECIMAL(10, 8),
      check_in_long DECIMAL(11, 8),
      check_out_lat DECIMAL(10, 8),
      check_out_long DECIMAL(11, 8),
      selfie_url LONGTEXT,
      status ENUM('Present', 'Absent', 'Leave', 'Half Day', 'On Break', 'Checked-Out') DEFAULT 'Checked-Out',
      is_late BOOLEAN DEFAULT FALSE,
      working_hours DECIMAL(5,2) DEFAULT 0,
      break_duration_minutes INT DEFAULT 0,
      overtime_hours DECIMAL(5,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL
    )
  `);

  // Remove unique constraint if it exists to allow multi check-ins
  try {
    await connection.query("ALTER TABLE attendance DROP INDEX emp_date");
  } catch { /* Ignore */ }

  // Ensure columns exist and selfie_url is LONGTEXT
  try {
    await connection.query("ALTER TABLE attendance MODIFY COLUMN selfie_url LONGTEXT");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE attendance ADD COLUMN check_in VARCHAR(10)");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE attendance ADD COLUMN check_out VARCHAR(10)");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE attendance ADD COLUMN break_time INT DEFAULT 0");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE attendance ADD COLUMN shift_id INT");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE attendance ADD CONSTRAINT fk_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL");
  } catch { /* Ignore */ }

  // Create leaves table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leaves (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      leave_type VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      total_days INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create weekly_holidays table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS weekly_holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      day_of_week VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Create holidays table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Create leave_types table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leave_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      days_allowed INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Create notes table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      title VARCHAR(255),
      content TEXT,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create time tracking tables
  await connection.query(`
    CREATE TABLE IF NOT EXISTS time_tracking_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      status ENUM('active', 'deactive') DEFAULT 'deactive',
      auto_mode ENUM('on', 'off') DEFAULT 'off',
      is_enabled BOOLEAN DEFAULT FALSE,
      screenshot_enabled BOOLEAN DEFAULT FALSE,
      screenshot_interval INT DEFAULT 10,
      idle_threshold INT DEFAULT 5,
      UNIQUE KEY company_employee (company_id, employee_id),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Ensure id column exists and is primary key if table was already created
  try {
    await connection.query("ALTER TABLE time_tracking_settings ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE time_tracking_settings ADD UNIQUE KEY company_employee (company_id, employee_id)");
  } catch { /* Ignore */ }

  // Ensure status and auto_mode columns exist if table was already created
  try {
    await connection.query("ALTER TABLE time_tracking_settings ADD COLUMN status ENUM('active', 'deactive') DEFAULT 'deactive'");
  } catch { /* Ignore */ }
  try {
    await connection.query("ALTER TABLE time_tracking_settings ADD COLUMN auto_mode ENUM('on', 'off') DEFAULT 'off'");
  } catch { /* Ignore */ }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS time_tracking_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      hour INT NOT NULL,
      active_minutes FLOAT DEFAULT 0,
      idle_minutes FLOAT DEFAULT 0,
      keystrokes INT DEFAULT 0,
      mouse_clicks INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_log (employee_id, date, hour),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS time_tracking_screenshots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      image_data LONGTEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create salary_slips table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS salary_slips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      month VARCHAR(20) NOT NULL,
      year INT NOT NULL,
      basic_salary DECIMAL(10, 2) NOT NULL,
      allowances DECIMAL(10, 2) DEFAULT 0,
      deductions DECIMAL(10, 2) DEFAULT 0,
      loan_deductions DECIMAL(10, 2) DEFAULT 0,
      commissions_bonuses DECIMAL(10, 2) DEFAULT 0,
      net_salary DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create loan_requests table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS loan_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      reason TEXT,
      date DATE NOT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create commissions_bonuses table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS commissions_bonuses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create awards table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS awards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      gift VARCHAR(255),
      date DATE,
      employee_id INT NOT NULL,
      award_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create attendance_alert_settings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS attendance_alert_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      office_time TIME,
      grace_time TIME,
      trigger_time TIME,
      message_template TEXT,
      is_active BOOLEAN DEFAULT FALSE,
      UNIQUE KEY (company_id),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Create employee_welcome_settings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS employee_welcome_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      is_active BOOLEAN DEFAULT FALSE,
      message_template TEXT,
      UNIQUE KEY (company_id),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Create idle_alert_settings table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS idle_alert_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      idle_minutes INT DEFAULT 5,
      message_template TEXT,
      is_active BOOLEAN DEFAULT FALSE,
      UNIQUE KEY (company_id),
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Create time_tracking table (assumed by user, creating if not exists)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS time_tracking (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      last_activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (employee_id),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create whatsapp_logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      employee_id INT,
      phone_number VARCHAR(50),
      message TEXT,
      status VARCHAR(50),
      type VARCHAR(50),
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  // Create notices table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      notice_type VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      notice_date DATE NOT NULL,
      notice_by VARCHAR(255) NOT NULL,
      attachment_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // Insert default super admin if not exists
  const [existingAdmins] = await connection.query("SELECT * FROM admins WHERE email = 'admin@erp.com'") as [Record<string, unknown>[], unknown];
  if (existingAdmins.length === 0) {
    await connection.query("INSERT INTO admins (email, password, name) VALUES ('admin@erp.com', 'admin123', 'Super Admin')");
  }

  // Seed sample payroll data for the first employee if none exists
  const [employees] = await connection.query("SELECT id, company_id FROM employees LIMIT 1") as [Record<string, unknown>[], unknown];
  if (employees.length > 0) {
    const empId = employees[0].id as number;
    const compId = employees[0].company_id as number;

    const [existingSlips] = await connection.query("SELECT id FROM salary_slips WHERE employee_id = ?", [empId]) as [Record<string, unknown>[], unknown];
    if (existingSlips.length === 0) {
      await connection.query(
        "INSERT INTO salary_slips (company_id, employee_id, month, year, basic_salary, allowances, deductions, loan_deductions, commissions_bonuses, net_salary) VALUES (?, ?, 'March', 2026, 5000, 500, 200, 0, 300, 5600)",
        [compId, empId]
      );
      await connection.query(
        "INSERT INTO salary_slips (company_id, employee_id, month, year, basic_salary, allowances, deductions, loan_deductions, commissions_bonuses, net_salary) VALUES (?, ?, 'February', 2026, 5000, 500, 200, 0, 0, 5300)",
        [compId, empId]
      );
    }

    const [existingLoans] = await connection.query("SELECT id FROM loan_requests WHERE employee_id = ?", [empId]) as [Record<string, unknown>[], unknown];
    if (existingLoans.length === 0) {
      await connection.query(
        "INSERT INTO loan_requests (company_id, employee_id, amount, reason, date, status) VALUES (?, ?, 1000, 'Medical emergency', '2026-03-15', 'Approved')",
        [compId, empId]
      );
    }

    const [existingComms] = await connection.query("SELECT id FROM commissions_bonuses WHERE employee_id = ?", [empId]) as [Record<string, unknown>[], unknown];
    if (existingComms.length === 0) {
      await connection.query(
        "INSERT INTO commissions_bonuses (company_id, employee_id, amount, date, description) VALUES (?, ?, 300, '2026-03-20', 'Performance Bonus - March')",
        [compId, empId]
      );
    }
  }

  // Create chats table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS chats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('one-to-one', 'group', 'channel') NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create chat_participants table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS chat_participants (
      chat_id INT NOT NULL,
      user_id INT NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (chat_id, user_id),
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create messages table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chat_id INT NOT NULL,
      sender_id INT NOT NULL,
      parent_id INT DEFAULT NULL,
      content TEXT,
      type ENUM('text', 'image', 'file') DEFAULT 'text',
      is_edited BOOLEAN DEFAULT 0,
      is_deleted BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE SET NULL
    )
  `);

  // Create message_reactions table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS message_reactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message_id INT NOT NULL,
      user_id INT NOT NULL,
      emoji VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE KEY (message_id, user_id, emoji)
    )
  `);

  // Create message_reads table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS message_reads (
      message_id INT NOT NULL,
      user_id INT NOT NULL,
      read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (message_id, user_id),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `);

  // Create guest_invites table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS guest_invites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      chat_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      invited_by INT,
      used BOOLEAN DEFAULT 0,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  // Create ai_history table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS ai_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      module VARCHAR(100) NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
