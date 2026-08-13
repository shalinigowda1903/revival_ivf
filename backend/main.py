from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File
)

from sqlalchemy.orm import Session

from pydantic import BaseModel

from datetime import date

from pathlib import Path

import bcrypt
import shutil
import uuid


# =========================================================
# LOCAL IMPORTS
# =========================================================

from database import engine, Base, get_db

import models

from auth import (
    create_access_token,
    get_current_user,
    require_doctor,
    require_patient
)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Revival IVF API",
    version="1.0.0"
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# PYDANTIC SCHEMAS
# =========================================================

class DoctorRegister(BaseModel):

    first_name: str
    last_name: str
    specialization: str | None = None
    phone: str
    email: str
    password: str


class DoctorLogin(BaseModel):

    email: str
    password: str


class PatientRegister(BaseModel):

    first_name: str
    last_name: str
    dob: date
    gender: str
    blood_group: str | None = None
    phone: str
    email: str
    country: str | None = None
    state: str | None = None
    city: str | None = None
    address: str | None = None
    password: str


class PatientLogin(BaseModel):

    email: str
    password: str


# =========================================================
# PASSWORD HASH
# =========================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:

        password_bytes = password_bytes[:72]

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


# =========================================================
# PASSWORD VERIFY
# =========================================================

def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:

        password_bytes = password_bytes[:72]

    try:

        return bcrypt.checkpw(
            password_bytes,
            hashed_password.encode("utf-8")
        )

    except Exception:

        return False


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Revival IVF Backend is running",
        "status": "success"
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# =========================================================
# DOCTOR REGISTER
# =========================================================

@app.post("/doctors/register")
def register_doctor(
    doctor: DoctorRegister,
    db: Session = Depends(get_db)
):

    existing_doctor = db.query(
        models.Doctor
    ).filter(
        models.Doctor.email == doctor.email
    ).first()

    if existing_doctor:

        raise HTTPException(
            status_code=400,
            detail="Doctor with this email already exists"
        )

    existing_phone = db.query(
        models.Doctor
    ).filter(
        models.Doctor.phone == doctor.phone
    ).first()

    if existing_phone:

        raise HTTPException(
            status_code=400,
            detail="Doctor with this phone number already exists"
        )

    hashed_password = hash_password(
        doctor.password
    )

    new_doctor = models.Doctor(
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        phone=doctor.phone,
        email=doctor.email,
        password=hashed_password
    )

    db.add(new_doctor)

    db.commit()

    db.refresh(new_doctor)

    return {
        "message": "Doctor registered successfully",
        "doctor_id": new_doctor.id
    }


# =========================================================
# DOCTOR LOGIN
# =========================================================

@app.post("/doctors/login")
def doctor_login(
    doctor: DoctorLogin,
    db: Session = Depends(get_db)
):

    existing_doctor = db.query(
        models.Doctor
    ).filter(
        models.Doctor.email == doctor.email
    ).first()

    if not existing_doctor:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        doctor.password,
        existing_doctor.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        existing_doctor.id,
        "doctor"
    )

    return {
        "message": "Doctor login successful",
        "access_token": token,
        "token_type": "bearer",
        "doctor_id": existing_doctor.id,
        "first_name": existing_doctor.first_name,
        "last_name": existing_doctor.last_name,
        "email": existing_doctor.email,
        "specialization": existing_doctor.specialization,
        "role": "doctor"
    }


# =========================================================
# PATIENT REGISTER
# =========================================================

@app.post("/patients/register")
def register_patient(
    patient: PatientRegister,
    db: Session = Depends(get_db)
):

    existing_patient = db.query(
        models.Patient
    ).filter(
        models.Patient.email == patient.email
    ).first()

    if existing_patient:

        raise HTTPException(
            status_code=400,
            detail="Patient with this email already exists"
        )

    existing_phone = db.query(
        models.Patient
    ).filter(
        models.Patient.phone == patient.phone
    ).first()

    if existing_phone:

        raise HTTPException(
            status_code=400,
            detail="Patient with this phone number already exists"
        )

    hashed_password = hash_password(
        patient.password
    )

    new_patient = models.Patient(
        first_name=patient.first_name,
        last_name=patient.last_name,
        dob=patient.dob,
        gender=patient.gender,
        blood_group=patient.blood_group,
        phone=patient.phone,
        email=patient.email,
        country=patient.country,
        state=patient.state,
        city=patient.city,
        address=patient.address,
        password=hashed_password
    )

    db.add(new_patient)

    db.commit()

    db.refresh(new_patient)

    return {
        "message": "Patient registered successfully",
        "patient_id": new_patient.id
    }


# =========================================================
# PATIENT LOGIN
# =========================================================

@app.post("/patients/login")
def patient_login(
    patient: PatientLogin,
    db: Session = Depends(get_db)
):

    existing_patient = db.query(
        models.Patient
    ).filter(
        models.Patient.email == patient.email
    ).first()

    if not existing_patient:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        patient.password,
        existing_patient.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        existing_patient.id,
        "patient"
    )

    return {
        "message": "Patient login successful",
        "access_token": token,
        "token_type": "bearer",
        "patient_id": existing_patient.id,
        "first_name": existing_patient.first_name,
        "last_name": existing_patient.last_name,
        "email": existing_patient.email,
        "role": "patient"
    }


# =========================================================
# AUTH ME
# =========================================================

@app.get("/auth/me")
def auth_me(
    current_user: dict = Depends(get_current_user)
):

    return {
        "message": "Authentication successful",
        "user_id": current_user["user_id"],
        "role": current_user["role"]
    }


# =========================================================
# DOCTOR PROFILE
# =========================================================

@app.get("/doctors/me")
def doctor_profile(
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor = db.query(
        models.Doctor
    ).filter(
        models.Doctor.id == doctor_user["user_id"]
    ).first()

    if not doctor:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return {
        "doctor_id": doctor.id,
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "specialization": doctor.specialization,
        "phone": doctor.phone,
        "email": doctor.email,
        "role": "doctor"
    }


# =========================================================
# DOCTOR PATIENTS
# =========================================================

@app.get("/doctors/patients")
def get_doctor_patients(
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

    embryos = db.query(
        models.Embryo
    ).filter(
        models.Embryo.doctor_id == doctor_id
    ).all()

    patient_ids = []

    for embryo in embryos:

        if embryo.patient_id not in patient_ids:

            patient_ids.append(
                embryo.patient_id
            )

    patients = []

    for patient_id in patient_ids:

        patient = db.query(
            models.Patient
        ).filter(
            models.Patient.id == patient_id
        ).first()

        if patient:

            embryo_count = db.query(
                models.Embryo
            ).filter(
                models.Embryo.doctor_id == doctor_id,
                models.Embryo.patient_id == patient.id
            ).count()

            patients.append({
                "patient_id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "email": patient.email,
                "phone": patient.phone,
                "dob": patient.dob,
                "gender": patient.gender,
                "blood_group": patient.blood_group,
                "country": patient.country,
                "state": patient.state,
                "city": patient.city,
                "address": patient.address,
                "embryo_count": embryo_count
            })

    return {
        "doctor_id": doctor_id,
        "patient_count": len(patients),
        "patients": patients
    }


# =========================================================
# SEARCH DOCTOR PATIENTS
# =========================================================

@app.get("/doctors/patients/search")
def search_patients(
    query: str,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

    embryos = db.query(
        models.Embryo
    ).filter(
        models.Embryo.doctor_id == doctor_id
    ).all()

    patient_ids = []

    for embryo in embryos:

        if embryo.patient_id not in patient_ids:

            patient_ids.append(
                embryo.patient_id
            )

    results = []

    search_text = query.strip().lower()

    for patient_id in patient_ids:

        patient = db.query(
            models.Patient
        ).filter(
            models.Patient.id == patient_id
        ).first()

        if not patient:

            continue

        full_name = (
            f"{patient.first_name} "
            f"{patient.last_name}"
        ).lower()

        email = patient.email.lower()

        phone = patient.phone.lower()

        if (
            search_text in full_name
            or search_text in email
            or search_text in phone
        ):

            results.append({
                "patient_id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "email": patient.email,
                "phone": patient.phone,
                "dob": patient.dob,
                "gender": patient.gender,
                "blood_group": patient.blood_group,
                "city": patient.city
            })

    return {
        "patients": results
    }


# =========================================================
# GET PATIENT DETAILS
# =========================================================

@app.get("/doctors/patients/{patient_id}")
def get_patient(
    patient_id: int,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

    embryo = db.query(
        models.Embryo
    ).filter(
        models.Embryo.doctor_id == doctor_id,
        models.Embryo.patient_id == patient_id
    ).first()

    if not embryo:

        raise HTTPException(
            status_code=404,
            detail="Patient not found in your patient list"
        )

    patient = db.query(
        models.Patient
    ).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return {
        "patient_id": patient.id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "dob": patient.dob,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "email": patient.email,
        "country": patient.country,
        "state": patient.state,
        "city": patient.city,
        "address": patient.address
    }


# =========================================================
# GET PATIENT EMBRYOS
# =========================================================

@app.get("/doctors/patients/{patient_id}/embryos")
def get_patient_embryos(
    patient_id: int,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

    patient = db.query(
        models.Patient
    ).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    embryos = db.query(
        models.Embryo
    ).filter(
        models.Embryo.patient_id == patient_id,
        models.Embryo.doctor_id == doctor_id
    ).all()

    return {
        "patient": {
            "patient_id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "email": patient.email,
            "phone": patient.phone,
            "dob": patient.dob,
            "gender": patient.gender,
            "blood_group": patient.blood_group
        },
        "embryo_count": len(embryos),
        "embryos": [
            {
                "embryo_id": embryo.id,
                "image_path": embryo.image_path,
                "status": embryo.status,
                "embryo_grade": embryo.embryo_grade,
                "confidence": embryo.confidence,
                "implantation_chance":
                    embryo.implantation_chance
            }
            for embryo in embryos
        ]
    }


# =========================================================
# EMBRYO UPLOAD
#
# ONLY DOCTOR CAN UPLOAD
# =========================================================

@app.post("/embryos/upload")
async def upload_embryo(
    patient_id: int,
    file: UploadFile = File(...),
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

    # -----------------------------------------------------
    # CHECK DOCTOR
    # -----------------------------------------------------

    doctor = db.query(
        models.Doctor
    ).filter(
        models.Doctor.id == doctor_id
    ).first()

    if not doctor:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    # -----------------------------------------------------
    # CHECK PATIENT
    # -----------------------------------------------------

    patient = db.query(
        models.Patient
    ).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # -----------------------------------------------------
    # CHECK FILE
    # -----------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Please select an embryo image"
        )

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png"
    }

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are allowed"
        )

    extension = Path(
        file.filename
    ).suffix.lower()

    if extension not in [
        ".jpg",
        ".jpeg",
        ".png"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG files are allowed"
        )

    # -----------------------------------------------------
    # UNIQUE FILE NAME
    # -----------------------------------------------------

    unique_filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        UPLOAD_DIR / unique_filename
    )

    # -----------------------------------------------------
    # SAVE IMAGE
    # -----------------------------------------------------

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save image: {str(error)}"
        )

    # -----------------------------------------------------
    # SAVE DATABASE RECORD
    # -----------------------------------------------------

    try:

        new_embryo = models.Embryo(
            patient_id=patient_id,
            doctor_id=doctor_id,
            image_path=str(file_path),
            status="uploaded"
        )

        db.add(new_embryo)

        db.commit()

        db.refresh(new_embryo)

    except Exception as error:

        db.rollback()

        if file_path.exists():

            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to save embryo record: {str(error)}"
        )

    return {
        "message": "Embryo image uploaded successfully",
        "embryo_id": new_embryo.id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "filename": unique_filename,
        "status": "uploaded"
    }


# =========================================================
# ANALYZE EMBRYO
#
# ONLY DOCTOR CAN ANALYZE
# =========================================================

@app.post("/embryos/{embryo_id}/analyze")
def analyze_embryo(
    embryo_id: int,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    embryo = db.query(
        models.Embryo
    ).filter(
        models.Embryo.id == embryo_id
    ).first()

    if not embryo:

        raise HTTPException(
            status_code=404,
            detail="Embryo not found"
        )

    if embryo.doctor_id != doctor_user["user_id"]:

        raise HTTPException(
            status_code=403,
            detail="You can only analyze your own uploaded embryos"
        )

    # -----------------------------------------------------
    # TEMPORARY AI RESULT
    #
    # Replace with CNN model later
    # -----------------------------------------------------

    embryo.embryo_grade = "4AA"

    embryo.confidence = "92%"

    embryo.implantation_chance = "78%"

    embryo.status = "analyzed"

    db.commit()

    db.refresh(embryo)

    return {
        "message": "Embryo analysis completed",
        "embryo_id": embryo.id,
        "status": embryo.status,
        "embryo_grade": embryo.embryo_grade,
        "confidence": embryo.confidence,
        "implantation_chance":
            embryo.implantation_chance
    }


# =========================================================
# GET EMBRYO
#
# ONLY DOCTOR CAN VIEW
# =========================================================

@app.get("/embryos/{embryo_id}")
def get_embryo(
    embryo_id: int,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    embryo = db.query(
        models.Embryo
    ).filter(
        models.Embryo.id == embryo_id
    ).first()

    if not embryo:

        raise HTTPException(
            status_code=404,
            detail="Embryo not found"
        )

    if embryo.doctor_id != doctor_user["user_id"]:

        raise HTTPException(
            status_code=403,
            detail="You can only access your own embryos"
        )

    return {
        "embryo_id": embryo.id,
        "patient_id": embryo.patient_id,
        "doctor_id": embryo.doctor_id,
        "image_path": embryo.image_path,
        "status": embryo.status,
        "embryo_grade": embryo.embryo_grade,
        "confidence": embryo.confidence,
        "implantation_chance":
            embryo.implantation_chance
    }