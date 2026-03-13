# HRMS Lite — Human Resource Management System

A lightweight, production-ready HRMS built with **FastAPI + React**. Manage employees and track daily attendance through a clean, professional interface.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | `https://hrms-lite.vercel.app` *(replace after deploy)* |
| Backend  | `https://hrms-lite-api.onrender.com` *(replace after deploy)* |
| API Docs | `https://hrms-lite-api.onrender.com/docs` |

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, React Router, Recharts, Axios |
| Backend    | Python 3.11, FastAPI, Uvicorn           |
| Database   | SQLite (via SQLAlchemy ORM)             |
| Validation | Pydantic v2                             |
| Deploy FE  | Vercel                                  |
| Deploy BE  | Render / Railway                        |

---

## Features

### Core
- ✅ Add, view, delete employees (with duplicate ID/email validation)
- ✅ Mark daily attendance (Present / Absent) per employee
- ✅ View all attendance records with date/status filters
- ✅ Upsert logic — re-marking attendance on same date updates the record

### Bonus
- ✅ Dashboard with live stats (total employees, present/absent counts, attendance rate)
- ✅ Department breakdown bar chart
- ✅ Top 5 employees by present days
- ✅ Filter attendance by date and status
- ✅ Employee search across name, ID, email

### UI/UX
- ✅ Loading, empty, and error states on every view
- ✅ Toast notifications for all actions
- ✅ Confirm dialog before destructive actions
- ✅ Responsive layout

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py          # FastAPI app, routes
│   ├── database.py      # SQLAlchemy engine & session
│   ├── models.py        # ORM models (Employee, Attendance)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database operations
│   ├── requirements.txt
│   ├── render.yaml      # Render deployment config
│   └── Procfile         # Railway/Heroku config
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── UI.jsx       # Reusable components (Modal, Badge, Avatar, etc.)
    │   │   └── Sidebar.jsx  # Navigation sidebar
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   └── Attendance.jsx
    │   ├── services/
    │   │   └── api.js       # Axios API calls
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css        # Global design system styles
    ├── package.json
    └── vercel.json
```

---

## Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/your-username/hrms-lite.git
cd hrms-lite
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**  
Interactive API docs at **http://localhost:8000/docs**

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL (optional — defaults to localhost:8000)
cp .env.example .env.local
# Edit .env.local: REACT_APP_API_URL=http://localhost:8000

# Start the dev server
npm start
```

The app will open at **http://localhost:3000**

---

## API Reference

### Employees

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/api/employees`               | List all employees       |
| POST   | `/api/employees`               | Add a new employee       |
| GET    | `/api/employees/{employee_id}` | Get single employee      |
| DELETE | `/api/employees/{employee_id}` | Delete employee          |

**POST /api/employees body:**
```json
{
  "employee_id": "EMP001",
  "full_name": "Priya Sharma",
  "email": "priya@company.com",
  "department": "Engineering"
}
```

### Attendance

| Method | Endpoint                         | Description                       |
|--------|----------------------------------|-----------------------------------|
| GET    | `/api/attendance`                | List all records (filter: `date`) |
| GET    | `/api/attendance/{employee_id}`  | Records for one employee          |
| POST   | `/api/attendance`                | Mark/update attendance            |

**POST /api/attendance body:**
```json
{
  "employee_id": "EMP001",
  "date": "2024-06-15",
  "status": "Present"
}
```

### Dashboard

| Method | Endpoint         | Description         |
|--------|------------------|---------------------|
| GET    | `/api/dashboard` | Aggregated stats    |

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set root to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel

1. Create a new project on [vercel.com](https://vercel.com)
2. Import your GitHub repo, set root to `frontend/`
3. Add environment variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## Assumptions & Limitations

- **Single admin user** — no authentication is implemented (as per spec)
- **SQLite** is used for simplicity; swap `SQLALCHEMY_DATABASE_URL` in `database.py` for PostgreSQL in production
- Attendance is **upsert-based** — marking attendance for the same employee + date updates the existing record
- Employee IDs are stored and compared in **uppercase** (e.g. `EMP001`)
- Dates follow **YYYY-MM-DD** format throughout

---

## License

MIT
