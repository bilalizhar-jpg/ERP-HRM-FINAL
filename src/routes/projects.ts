import { Router } from 'express';
import db from '../db.ts';

const router = Router();

// Get all projects
router.get('/', async (req, res) => {
  const { company_id } = req.query;
  try {
    let query = 'SELECT * FROM projects';
    const params = [];
    if (company_id) {
      query += ' WHERE company_id = ?';
      params.push(company_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  const {
    company_id,
    company_name,
    project_name,
    contact_person,
    project_type,
    duration,
    assigned_to,
    start_date,
    end_date,
    timeline_milestones
  } = req.body;

  if (!company_id) {
    return res.status(400).json({ error: 'company_id is required' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO projects (
        company_id,
        company_name, 
        project_name, 
        contact_person, 
        project_type, 
        duration, 
        assigned_to, 
        start_date, 
        end_date, 
        timeline_milestones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        company_name,
        project_name,
        contact_person,
        project_type,
        duration,
        assigned_to,
        start_date,
        end_date,
        timeline_milestones
      ]
    );
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

export default router;
