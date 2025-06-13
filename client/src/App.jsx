import React, { useState, useRef } from "react";
import "./App.css";

// Ship and missile options
const shipOptions = [
  { name: "Patrol Boat", min: 3, max: 3, width: 1 },
  { name: "Destroyer", min: 3, max: 3, width: 2 },
  { name: "Submarine", min: 5, max: 5, width: 2 },
  { name: "Battleship", min: 8, max: 8, width: 2 },
  { name: "Aircraft Carrier", min: 10, max: 10, width: 2 },
];

const missileSizeOptions = [
  { name: "Strike Missile", label: "2x1", width: 2, height: 1 },      
  { name: "Torpedo Shot", label: "4x1", width: 4, height: 1 },         
  { name: "Cluster Blaster", label: "4x2", width: 4, height: 2 },      
  { name: "Arc Storm", label: "7x2", width: 7, height: 2 },            
  { name: "Hellfire Barrage", label: "8x3", width: 8, height: 3 },     
];

const API_URL = "http://localhost:4000";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(""); // "offense" or "defense"
  const [balance, setBalance] = useState(1000);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(""); // For win/lose/outcome
  const [bet, setBet] = useState(""); // Bet input
  const [autoRolling, setAutoRolling] = useState(false);

  // Slider states
  const [shipIdx, setShipIdx] = useState(0);
  const [missileIdx, setMissileIdx] = useState(0);

  const intervalRef = useRef(null);

  const GRID_SIZE = 10;

  const handleLogin = async () => {
    const r = await fetch(API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) {
      const { token } = await r.json();
      setToken(token);
      setScreen("mode");
    }
  };

  // Changed mode selection to offense/defense
  const handleModeSelect = (m) => {
    setMode(m);
    setScreen("game");
    // Optionally reset selected for new mode
    setSelected([]);
  };

  const isSelected = (row, col) =>
    selected.some(([r, c]) => r === row && c === col);

  const handleCellClick = (row, col) => {
    setSelected((prev) => {
      if (prev.some(([r, c]) => r === row && c === col)) {
        return prev.filter(([r, c]) => !(r === row && c === col));
      } else {
        return [...prev, [row, col]];
      }
    });
  };

  const callDiceRoll = async (tilesCount, amount) => {
    setResult("...");
    const payload = {
      clientSeed: "testseed",
      amount,
      mode: "under",
      targetNumber: tilesCount,
      targetNumberEnd: 0,
      targetNumber2: 0,
      targetNumberEnd2: 0,
    };
    console.log("API REQUEST:", payload);
    try {
      const r = await fetch(API_URL + "/dice/roll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });
      let data;
      try {
        data = await r.json();
      } catch {
        data = null;
      }
      console.log("API RESPONSE:", data);
      if (r.ok && data) {
        if (data.result === "win") {
          setResult("WIN");
          if (typeof data.newBalance === "number") {
            setBalance(data.newBalance);
          } else if (typeof data.payout === "number") {
            setBalance((b) => b + data.payout);
          } else {
            setBalance((b) => b + Number(amount));
          }
        } else {
          setResult("LOSE");
          setBalance((b) => b - Number(amount));
        }
      } else {
        setResult("API error");
      }
    } catch (e) {
      console.log("API ERROR:", e);
      setResult("Network error");
    }
  };

  const handleReset = () => {
    setSelected([]);
    setResult("");
    stopAutoRolling();
  };

  const handleRoll = () => {
    if (selected.length === 0) return;
    const betAmount = Number(bet);
    if (!betAmount || betAmount <= 0) {
      setResult("Enter valid bet");
      return;
    }
    if (betAmount > balance) {
      setResult("Insufficient balance");
      return;
    }
    callDiceRoll(selected.length, betAmount);
  };

  // Auto rolling logic
  const startAutoRolling = () => {
    if (autoRolling) return;
    if (selected.length === 0) return;
    const betAmount = Number(bet);
    if (!betAmount || betAmount <= 0) {
      setResult("Enter valid bet");
      return;
    }
    setAutoRolling(true);
    intervalRef.current = setInterval(() => {
      if (selected.length === 0 || betAmount > balance) {
        stopAutoRolling();
        return;
      }
      callDiceRoll(selected.length, betAmount);
    }, 1000);
  };

  const stopAutoRolling = () => {
    setAutoRolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  React.useEffect(() => {
    if (autoRolling && (selected.length === 0 || Number(bet) > balance || !bet)) {
      stopAutoRolling();
    }
    // eslint-disable-next-line
  }, [selected, balance, bet]);

  // --- UI STARTS HERE ---
  if (screen === "login") {
    return (
      <div className="login-bg">
        <div className="login-box">
          <h2>Login</h2>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  // --- Mode selection: offense/defense ---
  if (screen === "mode") {
    return (
      <div className="mode-screen">
        <h2>Choose Mode</h2>
        <div className="mode-buttons">
          <button onClick={() => handleModeSelect("offense")}>Offense (Missile)</button>
          <button onClick={() => handleModeSelect("defense")}>Defense (Ship)</button>
        </div>
      </div>
    );
  }

  // Game screen
  // Slider config: ship options for defense, missile options for offense
  const sliderMax = mode === "offense" ? missileSizeOptions.length - 1 : shipOptions.length - 1;
  const sliderValue = mode === "offense" ? missileIdx : shipIdx;
  const setSliderValue = mode === "offense"
    ? (v) => setMissileIdx(v)
    : (v) => setShipIdx(v);

  // Display info based on mode
  const sliderLabel = mode === "offense"
    ? `${missileSizeOptions[missileIdx].name} (${missileSizeOptions[missileIdx].label})`
    : `${shipOptions[shipIdx].name} (size: ${shipOptions[shipIdx].min}${shipOptions[shipIdx].width > 1 ? `x${shipOptions[shipIdx].width}` : ""})`;

  return (
    <div className="game-root">
      <div className="game-grid-wrap">
        <div className="game-grid">
          {[...Array(GRID_SIZE)].map((_, row) =>
            <div className="grid-row" key={row}>
              {[...Array(GRID_SIZE)].map((_, col) =>
                <div
                  className={`grid-cell${isSelected(row, col) ? " selected" : ""}`}
                  key={col}
                  tabIndex={0}
                  onClick={() => handleCellClick(row, col)}
                >
                  {row},{col}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="control-panel">
        <div className="panel-row result-row">
          <span>Result</span>
          <div className="result-display">{result}</div>
        </div>
        <div className="panel-row">
          <span>Balance: {balance}</span>
          <span>Slider: 0</span>
        </div>
        <div className="panel-row">
          <button onClick={handleReset}>Reset</button>
          <button>Rotate</button>
          {/* Slider for ship/missile size */}
          <input
            className="slider"
            type="range"
            min={0}
            max={sliderMax}
            step={1}
            value={sliderValue}
            onChange={e => setSliderValue(Number(e.target.value))}
            style={{ maxWidth: 160, marginLeft: 12, marginRight: 12 }}
          />
          <span style={{ minWidth: 140, display: "inline-block" }}>{sliderLabel}</span>
        </div>
        <div className="panel-row">
          <span>Win:</span>
          <button onClick={stopAutoRolling} style={{ background: autoRolling ? "#ff6b00" : undefined }}>
            Anchor
          </button>
          <button
            onClick={startAutoRolling}
            disabled={autoRolling || selected.length === 0 || !bet || Number(bet) > balance}
          >
            Roll
          </button>
        </div>
        <div className="panel-row tabs-row">
          <button className="tab">Manual</button>
          <button className="tab">Mode</button>
          <button className="tab">Auto</button>
        </div>
        <div className="bet-input-wrap">
          <input
            className="bet-input"
            placeholder="Bet"
            value={bet}
            onChange={e => setBet(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <button className="bet-btn" onClick={() => setBet((b) => b ? String(Number(b) * 2) : "2")}>2x</button>
          <button className="bet-btn" onClick={() => setBet((b) => b && Number(b) > 1 ? String(Math.floor(Number(b) / 2)) : "1")}>1/2</button>
          <button className="bet-btn" onClick={() => setBet(String(balance))}>Max</button>
        </div>
      </div>
    </div>
  );
}