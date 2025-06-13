import React, { useEffect, useState } from "react";
import {
  LineChart, Line, PieChart, Pie, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
} from "recharts";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:4000";

export default function App() {
  const [successData, setSuccessData] = useState([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [wagered, setWagered] = useState(0);
  const [profit, setProfit] = useState(0);
  const [liveRTP, setLiveRTP] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get(`${API_BASE}/stats/summary`);
        setSuccessData(res.data.successData);
        setActiveUsers(res.data.activeUsers);
        setWagered(res.data.totalWagered);
        setProfit(res.data.profit);
        setLiveRTP(res.data.rtp);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Game Dashboard</h1>
      <div className="stat-cards">
        <div className="stat-card accent1">
          <div className="stat-label">Active Users</div>
          <div className="stat-value">{activeUsers}</div>
        </div>
        <div className="stat-card accent2">
          <div className="stat-label">Total Wagered</div>
          <div className="stat-value">${wagered}</div>
        </div>
        <div className="stat-card accent3">
          <div className="stat-label">Profit Margin</div>
          <div className="stat-value">${profit}</div>
        </div>
        <div className="stat-card accent4">
          <div className="stat-label">Live RTP</div>
          <div className="stat-value">{liveRTP}%</div>
        </div>
      </div>
      <div className="chart-section">
        <div className="chart-card">
          <h3>Successful Requests Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={successData}>
              <CartesianGrid
                strokeDasharray="6 6"
                vertical={true}
                horizontal={true}
                stroke="#444B5A"
              />
              <XAxis dataKey="time" stroke="#B0B8C1" />
              <YAxis allowDecimals={false} stroke="#B0B8C1" />
              <Tooltip
                contentStyle={{ background: "#23293A", border: "1px solid #444B5A", color: "#F1F2F8" }}
                labelStyle={{ color: "#F1F2F8" }}
                itemStyle={{ color: "#F1F2F8" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#5F9DF7"
                strokeWidth={3}
                activeDot={{ r: 7 }}
                dot={{ stroke: "#23293A", strokeWidth: 2 }}
                name="Success"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Profit vs Wagered</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Profit", value: profit },
                  { name: "Wagered", value: wagered },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#5F9DF7"
                label
                stroke="#23293A"
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{ background: "#23293A", border: "1px solid #444B5A", color: "#F1F2F8" }}
                labelStyle={{ color: "#F1F2F8" }}
                itemStyle={{ color: "#F1F2F8" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}