const express = require('express');
const argon2 = require('argon2');
const pool = require('../database/connection');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      return res.status(403).json({ error: 'Registration is closed. Only one user allowed.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await argon2.hash(password);
    
    const result = await pool.query(
      'INSERT INTO users (email, hashed_password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    req.session.userId = result.rows[0].id;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Checking for existing user...');
    let result = await pool.query('SELECT id, email, hashed_password FROM users WHERE email = $1', [email]);
    console.log('Existing user query result:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No existing user found, checking user count...');
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log('Total user count:', userCount.rows[0].count);
      
      if (parseInt(userCount.rows[0].count) === 0) {
        console.log('No users exist, creating first user...');
        const hashedPassword = await argon2.hash(password);
        
        const newUserResult = await pool.query(
          'INSERT INTO users (email, hashed_password) VALUES ($1, $2) RETURNING id, email, created_at',
          [email, hashedPassword]
        );
        console.log('First user created:', newUserResult.rows[0].id);

        req.session.userId = newUserResult.rows[0].id;
        console.log('Session userId set:', req.session.userId);
        
        return res.status(201).json({
          message: 'First user registered and logged in successfully',
          user: { id: newUserResult.rows[0].id, email: newUserResult.rows[0].email }
        });
      } else {
        console.log('Users exist but credentials invalid');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    console.log('Existing user found, verifying password...');
    const user = result.rows[0];
    const validPassword = await argon2.verify(user.hashed_password, password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    console.log('Login successful, session userId set:', req.session.userId);
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [req.session.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
