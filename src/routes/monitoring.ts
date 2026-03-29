import express from 'express';
import pool from '../db';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get monitoring settings for an employee
router.get('/settings/:employeeId', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM monitoring_settings WHERE employee_id = ?',
      [req.params.employeeId]
    );
    res.json(rows[0] || { is_enabled: false });
  } catch (error) {
    console.error('Error fetching monitoring settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get company-wide monitoring settings
router.get('/company-settings/:companyId', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM monitoring_company_settings WHERE company_id = ?',
      [req.params.companyId]
    );
    res.json(rows[0] || {
      company_id: req.params.companyId,
      idle_threshold_minutes: 5,
      screenshot_enabled: true,
      screenshot_interval_minutes: 10,
      track_apps: true,
      track_internet: true,
      track_mouse_clicks: true,
      track_keyboard_activity: true,
      track_location: true
    });
  } catch (error) {
    console.error('Error fetching company monitoring settings:', error);
    res.status(500).json({ error: 'Failed to fetch company settings' });
  }
});

// Update company-wide monitoring settings
router.post('/company-settings', async (req, res) => {
  const { 
    company_id, 
    idle_threshold_minutes, 
    screenshot_enabled, 
    screenshot_interval_minutes, 
    track_apps, 
    track_internet, 
    track_mouse_clicks, 
    track_keyboard_activity, 
    track_location 
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO monitoring_company_settings 
       (company_id, idle_threshold_minutes, screenshot_enabled, screenshot_interval_minutes, track_apps, track_internet, track_mouse_clicks, track_keyboard_activity, track_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       idle_threshold_minutes = VALUES(idle_threshold_minutes),
       screenshot_enabled = VALUES(screenshot_enabled),
       screenshot_interval_minutes = VALUES(screenshot_interval_minutes),
       track_apps = VALUES(track_apps),
       track_internet = VALUES(track_internet),
       track_mouse_clicks = VALUES(track_mouse_clicks),
       track_keyboard_activity = VALUES(track_keyboard_activity),
       track_location = VALUES(track_location)`,
      [company_id, idle_threshold_minutes, screenshot_enabled, screenshot_interval_minutes, track_apps, track_internet, track_mouse_clicks, track_keyboard_activity, track_location]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating company monitoring settings:', error);
    res.status(500).json({ error: 'Failed to update company settings' });
  }
});

// Get app classifications for productivity rules
router.get('/classifications/:companyId', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM monitoring_app_classification WHERE company_id = ?',
      [req.params.companyId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching classifications:', error);
    res.status(500).json({ error: 'Failed to fetch classifications' });
  }
});

// Add or update app classification
router.post('/classifications', async (req, res) => {
  const { company_id, name, activity_type, category, is_productive } = req.body;
  try {
    await pool.query(
      `INSERT INTO monitoring_app_classification 
       (company_id, name, activity_type, category, is_productive)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       category = VALUES(category),
       is_productive = VALUES(is_productive)`,
      [company_id, name, activity_type, category, is_productive]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving classification:', error);
    res.status(500).json({ error: 'Failed to save classification' });
  }
});

// Delete app classification
router.delete('/classifications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM monitoring_app_classification WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting classification:', error);
    res.status(500).json({ error: 'Failed to delete classification' });
  }
});

// Update monitoring settings
router.post('/settings', async (req, res) => {
  const { 
    employee_id, 
    company_id, 
    is_enabled, 
    track_mouse_clicks, 
    track_keyboard_activity, 
    track_apps, 
    track_internet, 
    track_location,
    idle_threshold_minutes,
    screenshot_interval_minutes
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO monitoring_settings 
       (employee_id, company_id, is_enabled, track_mouse_clicks, track_keyboard_activity, track_apps, track_internet, track_location, idle_threshold_minutes, screenshot_interval_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       is_enabled = VALUES(is_enabled),
       track_mouse_clicks = VALUES(track_mouse_clicks),
       track_keyboard_activity = VALUES(track_keyboard_activity),
       track_apps = VALUES(track_apps),
       track_internet = VALUES(track_internet),
       track_location = VALUES(track_location),
       idle_threshold_minutes = VALUES(idle_threshold_minutes),
       screenshot_interval_minutes = VALUES(screenshot_interval_minutes)`,
      [employee_id, company_id, is_enabled, track_mouse_clicks, track_keyboard_activity, track_apps, track_internet, track_location, idle_threshold_minutes, screenshot_interval_minutes]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating monitoring settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Log activity (app or website)
router.post('/activity', async (req, res) => {
  const { employee_id, company_id, activity_type, name, title, url, start_time, end_time, duration_seconds } = req.body;
  try {
    // Check classification
    const [classification] = await pool.query<RowDataPacket[]>(
      'SELECT is_productive FROM monitoring_app_classification WHERE company_id = ? AND name = ? AND activity_type = ?',
      [company_id, name, activity_type]
    );
    
    const is_productive = classification.length > 0 ? classification[0].is_productive : true;

    await pool.query(
      `INSERT INTO monitoring_activities 
       (employee_id, company_id, activity_type, name, title, url, start_time, end_time, duration_seconds, is_productive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, company_id, activity_type, name, title, url, start_time, end_time, duration_seconds, is_productive]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// Update daily stats (clicks, keys, active/idle)
router.post('/stats', async (req, res) => {
  const { employee_id, company_id, date, active_seconds, idle_seconds, mouse_clicks, keyboard_keystrokes } = req.body;
  try {
    // Calculate productivity score based on activities of that day
    const [activities] = await pool.query<RowDataPacket[]>(
      'SELECT SUM(duration_seconds) as total, SUM(CASE WHEN is_productive = 1 THEN duration_seconds ELSE 0 END) as productive FROM monitoring_activities WHERE employee_id = ? AND DATE(start_time) = ?',
      [employee_id, date]
    );

    const total = activities[0].total || 1;
    const productive = activities[0].productive || 0;
    const productivity_score = (productive / total) * 100;

    await pool.query(
      `INSERT INTO monitoring_daily_stats 
       (employee_id, company_id, date, active_seconds, idle_seconds, mouse_clicks, keyboard_keystrokes, productivity_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       active_seconds = active_seconds + VALUES(active_seconds),
       idle_seconds = idle_seconds + VALUES(idle_seconds),
       mouse_clicks = mouse_clicks + VALUES(mouse_clicks),
       keyboard_keystrokes = keyboard_keystrokes + VALUES(keyboard_keystrokes),
       productivity_score = VALUES(productivity_score)`,
      [employee_id, company_id, date, active_seconds, idle_seconds, mouse_clicks, keyboard_keystrokes, productivity_score]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// Get timeline for an employee
router.get('/timeline/:employeeId/:date', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM monitoring_activities WHERE employee_id = ? AND DATE(start_time) = ? ORDER BY start_time ASC',
      [req.params.employeeId, req.params.date]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Get daily stats for an employee
router.get('/stats/:employeeId/:date', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM monitoring_daily_stats WHERE employee_id = ? AND date = ?',
      [req.params.employeeId, req.params.date]
    );
    res.json(rows[0] || { active_seconds: 0, idle_seconds: 0, mouse_clicks: 0, keyboard_keystrokes: 0, productivity_score: 0 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Log location
router.post('/location', async (req, res) => {
  const { employee_id, company_id, latitude, longitude, ip_address } = req.body;
  try {
    await pool.query(
      'INSERT INTO monitoring_locations (employee_id, company_id, latitude, longitude, ip_address) VALUES (?, ?, ?, ?, ?)',
      [employee_id, company_id, latitude, longitude, ip_address]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging location:', error);
    res.status(500).json({ error: 'Failed to log location' });
  }
});

export default router;
