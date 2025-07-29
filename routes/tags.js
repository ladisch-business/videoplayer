const express = require('express');
const pool = require('../database/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM tags t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY c.name, t.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, category_id } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Name and category_id are required' });
    }

    const result = await pool.query(
      'INSERT INTO tags (name, description, category_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, category_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description, category_id } = req.body;

    const result = await pool.query(
      'UPDATE tags SET name = $1, description = $2, category_id = $3 WHERE id = $4 RETURNING *',
      [name, description, category_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/videos/:videoId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO video_tags (video_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.videoId, req.params.id]
    );

    res.json({ message: 'Tag added to video successfully' });
  } catch (error) {
    console.error('Add tag to video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/videos/:videoId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM video_tags WHERE video_id = $1 AND tag_id = $2',
      [req.params.videoId, req.params.id]
    );

    res.json({ message: 'Tag removed from video successfully' });
  } catch (error) {
    console.error('Remove tag from video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
