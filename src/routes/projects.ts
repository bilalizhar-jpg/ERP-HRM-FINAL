import { Router } from 'express';
import db from '../db.ts';

const router = Router();

// Get all projects
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  const {
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

  try {
    const [result] = await db.query(
      `INSERT INTO projects (
        company_name, 
        project_name, 
        contact_person, 
        project_type, 
        duration, 
        assigned_to, 
        start_date, 
        end_date, 
        timeline_milestones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
