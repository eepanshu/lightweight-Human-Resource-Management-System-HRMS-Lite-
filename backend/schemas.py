from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, Any
from datetime import datetime
import re

DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations", "Legal", "Support"]

# Helper to handle MongoDB ObjectId
class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(cls),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id")
    @classmethod
    def validate_emp_id(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Employee ID is required")
        if len(v) < 2 or len(v) > 20:
            raise ValueError("Employee ID must be between 2 and 20 characters")
        return v.upper()

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Full name is required")
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Name must be between 2 and 100 characters")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Department is required")
        return v


class EmployeeOut(BaseModel):
    id: str  # MongoDB _id as string
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AttendanceCreate(BaseModel):
    employee_id: str
    date: str
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in ("Present", "Absent"):
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v):
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", v):
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v


class AttendanceOut(BaseModel):
    id: str
    employee_db_id: str
    date: str
    status: str
    employee: Optional[EmployeeOut] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
