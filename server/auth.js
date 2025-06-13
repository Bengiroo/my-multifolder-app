import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const users = []; // In-memory for demo; use a DB in production
const JWT_SECRET = process.env.JWT_SECRET || 'roobetsecret';

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User exists' });
  }
  // Add balance property
  users.push({ username, password, balance: 1000 });
  res.json({ message: 'Registered' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  // Optionally return balance for convenience
  res.json({ token, balance: user.balance });
});

export default router;