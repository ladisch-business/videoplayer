const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const pool = require('../database/connection');
const { requireAuth } = require('../middleware/auth');

ffmpeg.setFfmpegPath(ffmpegStatic);

const router = express.Router();

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const videoId = req.videoId || uuidv4();
    req.videoId = videoId;
    
    const uploadDir = path.join(process.env.UPLOAD_PATH || './uploads', videoId);
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, 'video.mp4');
    } else if (file.fieldname === 'preview') {
      cb(null, 'preview.jpg');
    } else if (file.fieldname === 'cover') {
      cb(null, 'cover.jpg');
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10737418240
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed'));
      }
    } else if (file.fieldname === 'preview' || file.fieldname === 'cover') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else {
      cb(new Error('Invalid field name'));
    }
  }
});

const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(Math.round(metadata.format.duration));
      }
    });
  });
};

router.post('/upload', requireAuth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'preview', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, status = 'draft' } = req.body;
    const videoId = req.videoId;

    if (!req.files.video) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const videoPath = req.files.video[0].path;
    const previewPath = req.files.preview ? req.files.preview[0].path : null;
    const coverPath = req.files.cover ? req.files.cover[0].path : null;

    const duration = await getVideoDuration(videoPath);

    const result = await pool.query(
      'INSERT INTO videos (id, filepath, title, description, preview_path, cover_path, duration, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [videoId, videoPath, title, description, previewPath, coverPath, duration, status]
    );

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, tags, favorites, status } = req.query;
    
    let query = `
      SELECT DISTINCT v.*, 
             CASE WHEN f.video_id IS NOT NULL THEN true ELSE false END as is_favorite,
             ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names
      FROM videos v
      LEFT JOIN favorites f ON v.id = f.video_id AND f.user_id = $1
      LEFT JOIN video_tags vt ON v.id = vt.video_id
      LEFT JOIN tags t ON vt.tag_id = t.id
    `;
    
    const conditions = [];
    const params = [req.session.userId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      conditions.push(`(v.title ILIKE $${paramCount} OR v.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      paramCount++;
      conditions.push(`v.id IN (
        SELECT vt.video_id FROM video_tags vt
        JOIN tags t ON vt.tag_id = t.id
        WHERE t.name = ANY($${paramCount})
      )`);
      params.push(tagArray);
    }

    if (favorites === 'true') {
      conditions.push('f.video_id IS NOT NULL');
    }

    if (status) {
      paramCount++;
      conditions.push(`v.status = $${paramCount}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY v.id, f.video_id ORDER BY v.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, 
              CASE WHEN f.video_id IS NOT NULL THEN true ELSE false END as is_favorite,
              ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names
       FROM videos v
       LEFT JOIN favorites f ON v.id = f.video_id AND f.user_id = $1
       LEFT JOIN video_tags vt ON v.id = vt.video_id
       LEFT JOIN tags t ON vt.tag_id = t.id
       WHERE v.id = $2
       GROUP BY v.id, f.video_id`,
      [req.session.userId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/stream', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT filepath FROM videos WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoPath = result.rows[0].filepath;
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const readStream = require('fs').createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      readStream.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(200, head);
      require('fs').createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Stream failed' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    const result = await pool.query(
      'UPDATE videos SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
      [title, description, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT filepath FROM videos WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoDir = path.dirname(result.rows[0].filepath);
    
    await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);
    
    try {
      await fs.rmdir(videoDir, { recursive: true });
    } catch (fsError) {
      console.error('Error deleting video files:', fsError);
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
