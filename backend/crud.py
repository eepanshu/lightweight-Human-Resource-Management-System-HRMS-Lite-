from datetime import datetime
from bson import ObjectId
import schemas

# Helper to format MongoDB document for Pydantic
def format_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

# ─── Employee CRUD ────────────────────────────────────────────────────────────

async def get_employees(db):
    cursor = db.employees.find().sort("created_at", -1)
    employees = await cursor.to_list(length=100)
    return [format_doc(e) for e in employees]

async def get_employee_by_emp_id(db, employee_id: str):
    doc = await db.employees.find_one({"employee_id": employee_id.upper()})
    return format_doc(doc)

async def get_employee_by_email(db, email: str):
    doc = await db.employees.find_one({"email": email.lower()})
    return format_doc(doc)

async def create_employee(db, employee: schemas.EmployeeCreate):
    db_emp = {
        "employee_id": employee.employee_id.upper(),
        "full_name": employee.full_name.strip(),
        "email": employee.email.lower(),
        "department": employee.department.strip(),
        "created_at": datetime.utcnow()
    }
    result = await db.employees.insert_one(db_emp)
    db_emp["_id"] = result.inserted_id
    return format_doc(db_emp)

async def delete_employee(db, employee_id: str):
    # Also delete associated attendance
    await db.attendance.delete_many({"employee_db_id": employee_id})
    await db.employees.delete_one({"_id": ObjectId(employee_id)})


# ─── Attendance CRUD ──────────────────────────────────────────────────────────

async def get_attendance(db, date: str = None):
    query = {}
    if date:
        query["date"] = date
    
    cursor = db.attendance.find(query).sort("date", -1)
    records = await cursor.to_list(length=1000)
    
    formatted_records = []
    for r in records:
        r = format_doc(r)
        # Fetch employee details for each record
        emp = await db.employees.find_one({"_id": ObjectId(r["employee_db_id"])})
        r["employee"] = format_doc(emp)
        formatted_records.append(r)
        
    return formatted_records

async def get_attendance_by_employee(db, employee_db_id: str, date: str = None):
    query = {"employee_db_id": employee_db_id}
    if date:
        query["date"] = date
        
    cursor = db.attendance.find(query).sort("date", -1)
    records = await cursor.to_list(length=100)
    return [format_doc(r) for r in records]

async def get_attendance_record(db, employee_db_id: str, date: str):
    doc = await db.attendance.find_one({"employee_db_id": employee_db_id, "date": date})
    return format_doc(doc)

async def create_attendance(db, employee_db_id: str, record: schemas.AttendanceCreate):
    db_record = {
        "employee_db_id": employee_db_id,
        "date": record.date,
        "status": record.status,
        "created_at": datetime.utcnow()
    }
    result = await db.attendance.insert_one(db_record)
    db_record["_id"] = result.inserted_id
    return format_doc(db_record)

async def update_attendance(db, record_id: str, status: str):
    await db.attendance.update_one(
        {"_id": ObjectId(record_id)},
        {"$set": {"status": status}}
    )
    doc = await db.attendance.find_one({"_id": ObjectId(record_id)})
    return format_doc(doc)


# ─── Dashboard ────────────────────────────────────────────────────────────────

async def get_dashboard_stats(db):
    total_employees = await db.employees.count_documents({})
    total_present = await db.attendance.count_documents({"status": "Present"})
    total_absent = await db.attendance.count_documents({"status": "Absent"})

    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    dept_cursor = db.employees.aggregate(pipeline)
    departments = await dept_cursor.to_list(length=100)

    # Per-employee present count
    top_pipeline = [
        {"$match": {"status": "Present"}},
        {"$group": {"_id": "$employee_db_id", "present_days": {"$sum": 1}}},
        {"$sort": {"present_days": -1}},
        {"$limit": 5}
    ]
    top_cursor = db.attendance.aggregate(top_pipeline)
    top_results = await top_cursor.to_list(length=5)

    top_attendance = []
    for r in top_results:
        emp = await db.employees.find_one({"_id": ObjectId(r["_id"])})
        if emp:
            top_attendance.append({
                "full_name": emp["full_name"],
                "employee_id": emp["employee_id"],
                "department": emp["department"],
                "present_days": r["present_days"]
            })

    return {
        "total_employees": total_employees,
        "total_present": total_present,
        "total_absent": total_absent,
        "departments": [{"department": d["_id"], "count": d["count"]} for d in departments],
        "top_attendance": top_attendance,
    }
