const express = require('express');
const pool = require('../database/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, true as is_favorite,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names
      FROM videos v
      JOIN favorites f ON v.id = f.video_id
      LEFT JOIN video_tags vt ON v.id = vt.video_id
      LEFT JOIN tags t ON vt.tag_id = t.id
      WHERE f.user_id = $1
      GROUP BY v.id
      ORDER BY f.created_at DESC
    `, [req.session.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:videoId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, video_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.session.userId, req.params.videoId]
    );

    res.json({ message: 'Video added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:videoId', requireAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND video_id = $2',
      [req.session.userId, req.params.videoId]
    );

    res.json({ message: 'Video removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
