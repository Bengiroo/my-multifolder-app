import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';
import diceRoutes from './dice.js';

export const stats = {
  successfulRequests: [], // { timestamp, type }
  activeUsers: new Set(),
  totalWagered: 0,
  profit: 0,
  totalPayout: 0,
};

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes); // <-- Includes /register /login /validate
app.use('/dice', diceRoutes);

// Stats summary endpoint for dashboard
app.get('/stats/summary', (req, res) => {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const recent = stats.successfulRequests.filter(r => r.timestamp > hourAgo);

  const buckets = {};
  for (let r of recent) {
    const t = new Date(Math.floor(r.timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000));
    const label = t.toTimeString().slice(0, 5);
    buckets[label] = (buckets[label] || 0) + 1;
  }

  const chartData = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ time, count }));

  const rtp = stats.totalWagered ? (stats.totalPayout / stats.totalWagered) * 100 : 0;

  res.json({
    activeUsers: stats.activeUsers.size,
    totalWagered: stats.totalWagered,
    profit: stats.profit,
    rtp: rtp.toFixed(2),
    successData: chartData,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Roobet Dice Mock API running on port ${PORT}`);
});
