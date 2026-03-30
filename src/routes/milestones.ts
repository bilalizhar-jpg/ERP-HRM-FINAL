import { Router } from 'express';
import db from '../db.ts';

const router = Router();

// Get all milestones
router.get('/', async (req, res) => {
  const { company_id } = req.query;
  try {
    let query = `
      SELECT m.*, p.project_name, e.name as assignee_name 
      FROM milestones m
      JOIN projects p ON m.project_id = p.id
      JOIN employees e ON m.assignee_id = e.id
    `;
    const params = [];
    if (company_id) {
      query += ' WHERE m.company_id = ?';
      params.push(company_id);
    }
    query += ' ORDER BY m.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Create a new milestone
router.post('/', async (req, res) => {
  const {
    company_id,
    project_id,
    name,
    assignee_id,
    priority,
    start_date,
    end_date,
    notes,
    status,
    completion_percentage
  } = req.body;

  if (!company_id || !project_id || !name || !assignee_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO milestones (
        company_id,
        project_id,
        name,
        assignee_id,
        priority,
        start_date,
        end_date,
        notes,
        status,
        completion_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        project_id,
        name,
        assignee_id,
        priority || 'Medium',
        start_date,
        end_date,
        notes,
        status || 'Active',
        completion_percentage || 0
      ]
    );
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Milestone created successfully' });
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// Update a milestone
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    assignee_id,
    priority,
    start_date,
    end_date,
    notes,
    status,
    completion_percentage
  } = req.body;

  try {
    await db.query(
      `UPDATE milestones SET 
        name = ?, 
        assignee_id = ?, 
        priority = ?, 
        start_date = ?, 
        end_date = ?, 
        notes = ?, 
        status = ?, 
        completion_percentage = ?
      WHERE id = ?`,
      [name, assignee_id, priority, start_date, end_date, notes, status, completion_percentage, id]
    );
    res.json({ message: 'Milestone updated successfully' });
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Delete a milestone
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM milestones WHERE id = ?', [id]);
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

export default router;
