from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import schemas, crud
from database import get_db

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Removed get_db local definition as it's now in database.py

# ─── Employees ────────────────────────────────────────────────────────────────

@app.get("/api/employees", response_model=List[schemas.EmployeeOut])
async def list_employees(db = Depends(get_db)):
    return await crud.get_employees(db)

@app.post("/api/employees", response_model=schemas.EmployeeOut, status_code=201)
async def create_employee(employee: schemas.EmployeeCreate, db = Depends(get_db)):
    if await crud.get_employee_by_emp_id(db, employee.employee_id):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    if await crud.get_employee_by_email(db, employee.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    return await crud.create_employee(db, employee)

@app.get("/api/employees/{employee_id}", response_model=schemas.EmployeeOut)
async def get_employee(employee_id: str, db = Depends(get_db)):
    emp = await crud.get_employee_by_emp_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@app.delete("/api/employees/{employee_id}", status_code=204)
async def delete_employee(employee_id: str, db = Depends(get_db)):
    emp = await crud.get_employee_by_emp_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    await crud.delete_employee(db, emp["id"])

# ─── Attendance ───────────────────────────────────────────────────────────────

@app.get("/api/attendance", response_model=List[schemas.AttendanceOut])
async def list_attendance(date: str = None, db = Depends(get_db)):
    return await crud.get_attendance(db, date=date)

@app.get("/api/attendance/{employee_id}", response_model=List[schemas.AttendanceOut])
async def get_employee_attendance(employee_id: str, date: str = None, db = Depends(get_db)):
    emp = await crud.get_employee_by_emp_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return await crud.get_attendance_by_employee(db, emp["id"], date=date)

@app.post("/api/attendance", response_model=schemas.AttendanceOut, status_code=201)
async def mark_attendance(record: schemas.AttendanceCreate, db = Depends(get_db)):
    emp = await crud.get_employee_by_emp_id(db, record.employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    existing = await crud.get_attendance_record(db, emp["id"], record.date)
    if existing:
        return await crud.update_attendance(db, existing["id"], record.status)
    return await crud.create_attendance(db, emp["id"], record)

# ─── Dashboard ────────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
async def dashboard(db = Depends(get_db)):
    return await crud.get_dashboard_stats(db)

@app.get("/")
def root():
    return {"message": "HRMS Lite API is running", "docs": "/docs"}
