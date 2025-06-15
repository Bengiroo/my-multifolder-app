import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const users = []; // In-memory for demo only
const JWT_SECRET = process.env.JWT_SECRET || 'roobetsecret';

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User exists' });
  }
  users.push({ username, password, balance: 1000 });
  res.json({ message: 'Registered' });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, balance: user.balance });
});

// Validate
router.get('/validate', authenticateToken, (req, res) => {
  res.json({ ok: true });
});

export default router;
