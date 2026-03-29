import { Router } from 'express';
import db from '../db';

const router = Router();

// Get all tasks
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    due_date,
    labels,
    assignees,
    image_url,
    project_id
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO tasks (
        title, 
        description, 
        status, 
        priority, 
        due_date, 
        labels, 
        assignees, 
        image_url, 
        project_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        status || 'To Do',
        priority || 'Medium',
        due_date,
        labels ? JSON.stringify(labels) : null,
        assignees ? JSON.stringify(assignees) : null,
        image_url,
        project_id
      ]
    );
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status (for drag and drop)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Get task activities
router.get('/:id/activities', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM task_activities WHERE task_id = ? ORDER BY created_at DESC', [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add task activity (comment)
router.post('/:id/activities', async (req, res) => {
  const { id } = req.params;
  const { user_name, user_avatar, content } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO task_activities (task_id, user_name, user_avatar, content) VALUES (?, ?, ?, ?)',
      [id, user_name, user_avatar, content]
    );
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Activity added successfully' });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Get all labels
router.get('/labels', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM labels ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// Create a new label
router.post('/labels', async (req, res) => {
  const { name, color } = req.body;
  try {
    const [result] = await db.query('INSERT INTO labels (name, color) VALUES (?, ?)', [name, color]);
    res.status(201).json({ id: (result as { insertId: number }).insertId, message: 'Label created successfully' });
  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// Update task (general)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  
  if (updates.labels) updates.labels = JSON.stringify(updates.labels);
  if (updates.assignees) updates.assignees = JSON.stringify(updates.assignees);
  if (updates.checklist) updates.checklist = JSON.stringify(updates.checklist);
  if (updates.attachments) updates.attachments = JSON.stringify(updates.attachments);

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    await db.query(`UPDATE tasks SET ${fields} WHERE id = ?`, [...values, id]);
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
