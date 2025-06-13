# my-multifolder-app
server with dashboard and game client
# My Multi-Folder App

This monorepo contains three main parts:

- **server/** &mdash; Node.js/Express backend
- **dashboard/** &mdash; React admin dashboard (Vite, Recharts)
- **client/** &mdash; (Optional) Your main client app

## Getting Started

### 1. Install dependencies

From the root folder, run:

```bash
cd server
npm install
cd ../dashboard
npm install
cd ../client
npm install  # if you have a client folder
```

### 2. Start the servers

**Backend API:**

```bash
cd server
node index.js
```

**Dashboard:**

```bash
cd dashboard
npm run dev
```

**Client (if present):**

```bash
cd client
npm run dev
```

### 3. Usage

- The dashboard expects the backend to run at `http://localhost:4000`.
- Visit `http://localhost:5173` for the dashboard UI.

## Folder Structure

```
/
├── client/      # Main application frontend (optional)
├── dashboard/   # React dashboard
├── server/      # Express backend API
└── README.md
```

## Notes

- All subfolders (`server`, `dashboard`, `client`) have their own `package.json`.
- Environment variables and secrets should go in `.env` files and be listed in `.gitignore`.

## License

MIT (or your preferred license)
