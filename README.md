# PollWave — Full Stack Polling App

React + FastAPI + PostgreSQL + JWT Auth

---

## Project Structure

```
polling-app/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   ├── auth.py
│   ├── database.py
│   └── requirements.txt
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/client.js
    │   ├── context/AuthContext.jsx
    │   ├── components/Navbar.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── CreatePoll.jsx
    │       └── PollDetail.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup

### 1. PostgreSQL

Create a database:
```sql
CREATE DATABASE pollingapp;
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env
# Edit .env: set DATABASE_URL and SECRET_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Features

- ✅ Register / Login with JWT auth
- ✅ Create polls with multiple options
- ✅ Vote once per poll
- ✅ Live results with percentage bars
- ✅ Share polls via URL
- ✅ Poll owner can close or delete polls
- ✅ Browse all polls on home page

---

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pollingapp
SECRET_KEY=your-super-secret-key-here
```
