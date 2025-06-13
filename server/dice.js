import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { stats } from './index.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'roobetsecret';

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function randomRoll() {
  // Simulate a dice roll between 1-100
  return Math.floor(Math.random() * 100) + 1;
}

router.post('/roll', authenticateToken, (req, res) => {
  const {
    clientSeed, amount, mode,
    targetNumber, targetNumberEnd,
    targetNumber2, targetNumberEnd2
  } = req.body;

  const roll = randomRoll();

  // Simplified win logic matching OpenAPI modes
  let win = false;
  switch (mode) {
    case 'under':
      win = roll < targetNumber;
      break;
    case 'over':
      win = roll > targetNumber;
      break;
    case 'between':
      win = roll > targetNumber && roll < targetNumberEnd;
      break;
    case 'outside':
      win = roll < targetNumber || roll > targetNumberEnd;
      break;
    case 'between-sets':
      win = (roll > targetNumber && roll < targetNumberEnd) ||
            (roll > targetNumber2 && roll < targetNumberEnd2);
      break;
    default:
      return res.status(400).json({ error: 'Invalid mode' });
  }

  // Stats tracking
  const payout = win ? amount * 2 : 0; // simple payout logic, adjust as needed
  const profit = amount - payout;

  stats.successfulRequests.push({ timestamp: Date.now(), type: win ? "win" : "lose" });
  stats.activeUsers.add(req.user.username);
  stats.totalWagered += amount;
  stats.profit += profit;
  stats.totalPayout += payout;

  // Response matches OpenAPI DiceGame schema
  res.json({
    bet: {
      balanceType: 'main',
      betAmount: amount,
    },
    provablyFairInfo: {
      newRound: true,
      currentRound: {
        gameName: 'dice',
        nonce: Date.now(),
        roundOver: true,
        userId: req.user.username,
        hash: 'demo-hash-' + uuidv4(),
      },
      clientSeed,
    },
    roll,
    result: win ? 'win' : 'lose',
  });
});

export default router;