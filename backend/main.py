# =========================================================
# main.py
# REVIVAL IVF BACKEND
# =========================================================

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File
)

from fastapi.middleware.cors import CORSMiddleware

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

from database import (
    engine,
    Base,
    get_db
)

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
    version="2.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://192.168.1.14:3000",
        "http://192.168.1.14:3001"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# DEFAULT ACCOUNTS
# =========================================================

DEFAULT_DOCTOR_EMAIL = "doctor@revivalivf.com"

DEFAULT_DOCTOR_PASSWORD = "RevivalIVF@123"

DEFAULT_PATIENT_EMAIL = "patient@revivalivf.com"

DEFAULT_PATIENT_PASSWORD = "PatientIVF@123"


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# PASSWORD HASH
# =========================================================

def hash_password(
    password: str
) -> str:

    password_bytes = password.encode(
        "utf-8"
    )

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

    password_bytes = password.encode(
        "utf-8"
    )

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
# AGE
# =========================================================

def calculate_age(
    dob: date
) -> int:

    today = date.today()

    age = today.year - dob.year

    if (
        today.month,
        today.day
    ) < (
        dob.month,
        dob.day
    ):

        age -= 1

    return age


# =========================================================
# STARTUP
# =========================================================

@app.on_event("startup")
def seed_default_accounts():

    db = next(get_db())

    try:

        # =================================================
        # DEFAULT DOCTOR
        # =================================================

        doctor = db.query(
            models.Doctor
        ).filter(
            models.Doctor.email ==
            DEFAULT_DOCTOR_EMAIL
        ).first()

        if doctor is None:

            doctor = models.Doctor(

                first_name="Dr.",

                last_name="Revival",

                specialization="General IVF",

                phone="+15550000001",

                email=DEFAULT_DOCTOR_EMAIL,

                password=hash_password(
                    DEFAULT_DOCTOR_PASSWORD
                )
            )

            db.add(doctor)

            db.commit()

            db.refresh(doctor)

        else:

            if not verify_password(
                DEFAULT_DOCTOR_PASSWORD,
                doctor.password
            ):

                doctor.password = hash_password(
                    DEFAULT_DOCTOR_PASSWORD
                )

                db.commit()

        # =================================================
        # DEFAULT PATIENT
        # =================================================

        patient = db.query(
            models.Patient
        ).filter(
            models.Patient.email ==
            DEFAULT_PATIENT_EMAIL
        ).first()

        if patient is None:

            patient = models.Patient(

                first_name="Patient",

                last_name="Revival",

                dob=date(
                    1995,
                    1,
                    15
                ),

                gender="Female",

                blood_group="O+",

                phone="+15550000002",

                email=DEFAULT_PATIENT_EMAIL,

                country="India",

                state="Karnataka",

                city="Bengaluru",

                address="Demo Patient Address",

                medical_history="No major medical history",

                current_problems="Infertility evaluation",

                previous_surgeries="None",

                chronic_conditions="None",

                allergies="None known",

                current_medications="None",

                family_medical_history="No significant family history",

                ongoing_treatments="No ongoing treatment",

                previous_ivf_history="None",

                previous_pregnancy_history="None",

                infertility_duration="Not specified",

                infertility_cause="Under evaluation",

                menstrual_history="Regular",

                fertility_treatment_history="None",

                doctor_notes="Demo patient",

                emergency_contact_name="Emergency Contact",

                emergency_contact_phone="+15550000003",

                password=hash_password(
                    DEFAULT_PATIENT_PASSWORD
                )
            )

            db.add(patient)

            db.commit()

            db.refresh(patient)

        else:

            if not verify_password(
                DEFAULT_PATIENT_PASSWORD,
                patient.password
            ):

                patient.password = hash_password(
                    DEFAULT_PATIENT_PASSWORD
                )

                db.commit()

    finally:

        db.close()


# =========================================================
# SCHEMAS
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


# =========================================================
# DOCTOR PATIENT CREATE
# =========================================================

class DoctorPatientCreate(BaseModel):

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

    medical_history: str | None = None

    current_problems: str | None = None

    previous_surgeries: str | None = None

    chronic_conditions: str | None = None

    allergies: str | None = None

    current_medications: str | None = None

    family_medical_history: str | None = None

    ongoing_treatments: str | None = None

    previous_ivf_history: str | None = None

    previous_pregnancy_history: str | None = None

    infertility_duration: str | None = None

    infertility_cause: str | None = None

    menstrual_history: str | None = None

    fertility_treatment_history: str | None = None

    doctor_notes: str | None = None

    emergency_contact_name: str | None = None

    emergency_contact_phone: str | None = None


# =========================================================
# DOCTOR UPDATE PATIENT MEDICAL INFORMATION
# =========================================================

class DoctorPatientMedicalUpdate(BaseModel):

    medical_history: str | None = None

    ongoing_treatments: str | None = None

    current_medications: str | None = None


class PatientLogin(BaseModel):

    email: str

    password: str


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Revival IVF Backend is running",
        "status": "success",
        "version": "2.0.0"
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "Revival IVF Backend"
    }


# =========================================================
# DOCTOR REGISTER
# =========================================================

@app.post("/doctors/register")
def register_doctor(
    doctor: DoctorRegister,
    db: Session = Depends(get_db)
):

    email = doctor.email.strip().lower()

    phone = doctor.phone.strip()

    existing_doctor = db.query(
        models.Doctor
    ).filter(
        models.Doctor.email == email
    ).first()

    if existing_doctor:

        raise HTTPException(
            status_code=400,
            detail="Doctor with this email already exists"
        )

    existing_phone = db.query(
        models.Doctor
    ).filter(
        models.Doctor.phone == phone
    ).first()

    if existing_phone:

        raise HTTPException(
            status_code=400,
            detail="Doctor with this phone number already exists"
        )

    new_doctor = models.Doctor(

        first_name=doctor.first_name.strip(),

        last_name=doctor.last_name.strip(),

        specialization=doctor.specialization,

        phone=phone,

        email=email,

        password=hash_password(
            doctor.password
        )
    )

    db.add(new_doctor)

    db.commit()

    db.refresh(new_doctor)

    return {

        "message":
            "Doctor registered successfully",

        "doctor_id":
            new_doctor.id
    }


# =========================================================
# DOCTOR LOGIN
# =========================================================

@app.post("/doctors/login")
def doctor_login(
    doctor: DoctorLogin,
    db: Session = Depends(get_db)
):

    email = doctor.email.strip().lower()

    existing_doctor = db.query(
        models.Doctor
    ).filter(
        models.Doctor.email == email
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

        "message":
            "Doctor login successful",

        "access_token":
            token,

        "token_type":
            "bearer",

        "doctor_id":
            existing_doctor.id,

        "first_name":
            existing_doctor.first_name,

        "last_name":
            existing_doctor.last_name,

        "email":
            existing_doctor.email,

        "specialization":
            existing_doctor.specialization,

        "role":
            "doctor"
    }


# =========================================================
# PATIENT REGISTER
#
# IMPORTANT:
# Patient registration automatically creates a patient
# record in the same database.
#
# Therefore the patient immediately appears in the
# doctor's patient list.
# =========================================================

@app.post("/patients/register")
def register_patient(
    patient: PatientRegister,
    db: Session = Depends(get_db)
):

    email = patient.email.strip().lower()

    phone = patient.phone.strip()

    existing_patient = db.query(
        models.Patient
    ).filter(
        models.Patient.email == email
    ).first()

    if existing_patient:

        raise HTTPException(
            status_code=400,
            detail="Patient with this email already exists"
        )

    existing_phone = db.query(
        models.Patient
    ).filter(
        models.Patient.phone == phone
    ).first()

    if existing_phone:

        raise HTTPException(
            status_code=400,
            detail="Patient with this phone number already exists"
        )

    new_patient = models.Patient(

        first_name=patient.first_name.strip(),

        last_name=patient.last_name.strip(),

        dob=patient.dob,

        gender=patient.gender.strip(),

        blood_group=patient.blood_group,

        phone=phone,

        email=email,

        country=patient.country,

        state=patient.state,

        city=patient.city,

        address=patient.address,

        password=hash_password(
            patient.password
        )
    )

    db.add(new_patient)

    db.commit()

    db.refresh(new_patient)

    return {

        "message":
            "Patient registered successfully",

        "patient_id":
            new_patient.id
    }


# =========================================================
# PATIENT LOGIN
# =========================================================

@app.post("/patients/login")
def patient_login(
    patient: PatientLogin,
    db: Session = Depends(get_db)
):

    email = patient.email.strip().lower()

    existing_patient = db.query(
        models.Patient
    ).filter(
        models.Patient.email == email
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

        "message":
            "Patient login successful",

        "access_token":
            token,

        "token_type":
            "bearer",

        "patient_id":
            existing_patient.id,

        "first_name":
            existing_patient.first_name,

        "last_name":
            existing_patient.last_name,

        "email":
            existing_patient.email,

        "phone":
            existing_patient.phone,

        "role":
            "patient"
    }


# =========================================================
# AUTH ME
# =========================================================

@app.get("/auth/me")
def auth_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user_id = current_user["user_id"]

    role = current_user["role"]

    # =====================================================
    # PATIENT
    #
    # NO EMBRYO INFORMATION HERE
    # =====================================================

    if role == "patient":

        patient = db.query(
            models.Patient
        ).filter(
            models.Patient.id == user_id
        ).first()

        if not patient:

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )

        return {

            "message":
                "Authentication successful",

            "user_id":
                patient.id,

            "patient_id":
                patient.id,

            "first_name":
                patient.first_name,

            "last_name":
                patient.last_name,

            "email":
                patient.email,

            "phone":
                patient.phone,

            "age":
                calculate_age(patient.dob),

            "dob":
                patient.dob,

            "gender":
                patient.gender,

            "blood_group":
                patient.blood_group,

            "country":
                patient.country,

            "state":
                patient.state,

            "city":
                patient.city,

            "address":
                patient.address,

            "role":
                "patient"
        }

    # =====================================================
    # DOCTOR
    # =====================================================

    if role == "doctor":

        doctor = db.query(
            models.Doctor
        ).filter(
            models.Doctor.id == user_id
        ).first()

        if not doctor:

            raise HTTPException(
                status_code=404,
                detail="Doctor not found"
            )

        return {

            "message":
                "Authentication successful",

            "user_id":
                doctor.id,

            "doctor_id":
                doctor.id,

            "first_name":
                doctor.first_name,

            "last_name":
                doctor.last_name,

            "email":
                doctor.email,

            "phone":
                doctor.phone,

            "specialization":
                doctor.specialization,

            "role":
                "doctor"
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid user role"
    )


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
        models.Doctor.id ==
        doctor_user["user_id"]
    ).first()

    if not doctor:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return {

        "doctor_id":
            doctor.id,

        "first_name":
            doctor.first_name,

        "last_name":
            doctor.last_name,

        "specialization":
            doctor.specialization,

        "phone":
            doctor.phone,

        "email":
            doctor.email,

        "role":
            "doctor"
    }


# =========================================================
# DOCTOR PATIENT LIST
#
# IMPORTANT CHANGE:
#
# Patients are NO LONGER discovered through embryos.
#
# Every patient who registers is now visible here.
# =========================================================

@app.get("/doctors/patients")
def get_doctor_patients(
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

    patients = db.query(
        models.Patient
    ).order_by(
        models.Patient.id.desc()
    ).all()

    results = []

    for patient in patients:

        results.append({

            "patient_id":
                patient.id,

            "first_name":
                patient.first_name,

            "last_name":
                patient.last_name,

            "age":
                calculate_age(patient.dob),

            "dob":
                patient.dob,

            "gender":
                patient.gender,

            "blood_group":
                patient.blood_group,

            "email":
                patient.email,

            "phone":
                patient.phone,

            "country":
                patient.country,

            "state":
                patient.state,

            "city":
                patient.city,

            "medical_history":
                patient.medical_history,

            "current_problems":
                patient.current_problems,

            "previous_surgeries":
                patient.previous_surgeries,

            "chronic_conditions":
                patient.chronic_conditions,

            "allergies":
                patient.allergies,

            "current_medications":
                patient.current_medications,

            "family_medical_history":
                patient.family_medical_history,

            "ongoing_treatments":
                patient.ongoing_treatments,

            "doctor_notes":
                patient.doctor_notes
        })

    return {

        "doctor_id":
            doctor_id,

        "patient_count":
            len(results),

        "patients":
            results
    }


# =========================================================
# SEARCH PATIENTS
# =========================================================

@app.get("/doctors/patients/search")
def search_patients(
    query: str,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    search_text = query.strip().lower()

    patients = db.query(
        models.Patient
    ).all()

    results = []

    for patient in patients:

        full_name = (
            f"{patient.first_name} "
            f"{patient.last_name}"
        ).lower()

        if (
            search_text in full_name
            or search_text in patient.email.lower()
            or search_text in patient.phone.lower()
            or search_text == str(patient.id)
        ):

            results.append({

                "patient_id":
                    patient.id,

                "first_name":
                    patient.first_name,

                "last_name":
                    patient.last_name,

                "age":
                    calculate_age(patient.dob),

                "dob":
                    patient.dob,

                "gender":
                    patient.gender,

                "blood_group":
                    patient.blood_group,

                "email":
                    patient.email,

                "phone":
                    patient.phone,

                "city":
                    patient.city,

                "medical_history":
                    patient.medical_history,

                "ongoing_treatments":
                    patient.ongoing_treatments
            })

    return {

        "patients":
            results
    }


# =========================================================
# GET COMPLETE PATIENT DETAILS - DOCTOR
#
# Doctor can see complete medical information.
# =========================================================

@app.get("/doctors/patients/{patient_id}")
def get_patient(
    patient_id: int,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

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

        "patient_id":
            patient.id,

        "first_name":
            patient.first_name,

        "last_name":
            patient.last_name,

        "age":
            calculate_age(patient.dob),

        "dob":
            patient.dob,

        "gender":
            patient.gender,

        "blood_group":
            patient.blood_group,

        "phone":
            patient.phone,

        "email":
            patient.email,

        "country":
            patient.country,

        "state":
            patient.state,

        "city":
            patient.city,

        "address":
            patient.address,

        "medical_history":
            patient.medical_history,

        "current_problems":
            patient.current_problems,

        "previous_surgeries":
            patient.previous_surgeries,

        "chronic_conditions":
            patient.chronic_conditions,

        "allergies":
            patient.allergies,

        "current_medications":
            patient.current_medications,

        "family_medical_history":
            patient.family_medical_history,

        "ongoing_treatments":
            patient.ongoing_treatments,

        "previous_ivf_history":
            patient.previous_ivf_history,

        "previous_pregnancy_history":
            patient.previous_pregnancy_history,

        "infertility_duration":
            patient.infertility_duration,

        "infertility_cause":
            patient.infertility_cause,

        "menstrual_history":
            patient.menstrual_history,

        "fertility_treatment_history":
            patient.fertility_treatment_history,

        "doctor_notes":
            patient.doctor_notes,

        "emergency_contact_name":
            patient.emergency_contact_name,

        "emergency_contact_phone":
            patient.emergency_contact_phone
    }


# =========================================================
# DOCTOR ADD PATIENT MANUALLY
# =========================================================

@app.post("/doctors/patients")
def create_patient_by_doctor(
    patient: DoctorPatientCreate,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

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

    email = patient.email.strip().lower()

    phone = patient.phone.strip()

    existing_patient = db.query(
        models.Patient
    ).filter(
        models.Patient.email == email
    ).first()

    if existing_patient:

        raise HTTPException(
            status_code=400,
            detail="Patient with this email already exists"
        )

    existing_phone = db.query(
        models.Patient
    ).filter(
        models.Patient.phone == phone
    ).first()

    if existing_phone:

        raise HTTPException(
            status_code=400,
            detail="Patient with this phone number already exists"
        )

    new_patient = models.Patient(

        doctor_id=doctor_id,

        first_name=patient.first_name.strip(),

        last_name=patient.last_name.strip(),

        dob=patient.dob,

        gender=patient.gender.strip(),

        blood_group=patient.blood_group,

        phone=phone,

        email=email,

        country=patient.country,

        state=patient.state,

        city=patient.city,

        address=patient.address,

        medical_history=patient.medical_history,

        current_problems=patient.current_problems,

        previous_surgeries=patient.previous_surgeries,

        chronic_conditions=patient.chronic_conditions,

        allergies=patient.allergies,

        current_medications=patient.current_medications,

        family_medical_history=patient.family_medical_history,

        ongoing_treatments=patient.ongoing_treatments,

        previous_ivf_history=patient.previous_ivf_history,

        previous_pregnancy_history=patient.previous_pregnancy_history,

        infertility_duration=patient.infertility_duration,

        infertility_cause=patient.infertility_cause,

        menstrual_history=patient.menstrual_history,

        fertility_treatment_history=patient.fertility_treatment_history,

        doctor_notes=patient.doctor_notes,

        emergency_contact_name=patient.emergency_contact_name,

        emergency_contact_phone=patient.emergency_contact_phone,

        password=hash_password(
            "Welcome@123"
        )
    )

    try:

        db.add(new_patient)

        db.commit()

        db.refresh(new_patient)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to create patient: {str(error)}"
        )

    return {

        "message":
            "Patient added successfully",

        "patient": {

            "patient_id":
                new_patient.id,

            "first_name":
                new_patient.first_name,

            "last_name":
                new_patient.last_name,

            "age":
                calculate_age(new_patient.dob),

            "email":
                new_patient.email,

            "phone":
                new_patient.phone,

            "medical_history":
                new_patient.medical_history,

            "ongoing_treatments":
                new_patient.ongoing_treatments
        }
    }


# =========================================================
# DOCTOR UPDATE MEDICAL HISTORY + ONGOING TREATMENT
#
# THIS IS THE MAIN DOCTOR PORTAL EDIT API.
# =========================================================

@app.put("/doctors/patients/{patient_id}/medical")
def update_patient_medical_information(
    patient_id: int,
    data: DoctorPatientMedicalUpdate,
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

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

    patient.medical_history = (
        data.medical_history
    )

    patient.ongoing_treatments = (
        data.ongoing_treatments
    )

    patient.current_medications = (
        data.current_medications
    )

    try:

        db.commit()

        db.refresh(patient)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to update patient: {str(error)}"
        )

    return {

        "message":
            "Patient medical information updated successfully",

        "patient": {

            "patient_id":
                patient.id,

            "medical_history":
                patient.medical_history,

            "ongoing_treatments":
                patient.ongoing_treatments,

            "current_medications":
                patient.current_medications
        }
    }


# =========================================================
# PATIENT MEDICAL SUMMARY
#
# IMPORTANT:
#
# This endpoint intentionally returns ONLY:
#
# 1. Medical History
# 2. Ongoing Treatments
#
# NO EMBRYO DATA
# NO EMBRYO GRADE
# NO CONFIDENCE
# NO IMPLANTATION CHANCE
# NO EMBRYO IMAGE
# =========================================================

@app.get("/patients/me/medical-summary")
def patient_medical_summary(
    patient_user: dict = Depends(require_patient),
    db: Session = Depends(get_db)
):

    patient_id = patient_user["user_id"]

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

        "patient_id":
            patient.id,

        "first_name":
            patient.first_name,

        "last_name":
            patient.last_name,

        "medical_history":
            patient.medical_history,

        "ongoing_treatments":
            patient.ongoing_treatments,

        "current_medications":
            patient.current_medications
    }


# =========================================================
# PATIENT PROFILE
#
# NO MEDICAL OR EMBRYO INFORMATION.
# =========================================================

@app.get("/patients/me/profile")
def patient_profile(
    patient_user: dict = Depends(require_patient),
    db: Session = Depends(get_db)
):

    patient = db.query(
        models.Patient
    ).filter(
        models.Patient.id ==
        patient_user["user_id"]
    ).first()

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return {

        "patient_id":
            patient.id,

        "first_name":
            patient.first_name,

        "last_name":
            patient.last_name,

        "email":
            patient.email,

        "phone":
            patient.phone,

        "age":
            calculate_age(patient.dob),

        "dob":
            patient.dob,

        "gender":
            patient.gender,

        "blood_group":
            patient.blood_group,

        "country":
            patient.country,

        "state":
            patient.state,

        "city":
            patient.city,

        "address":
            patient.address,

        "role":
            "patient"
    }


# =========================================================
# GET PATIENT EMBRYOS - DOCTOR ONLY
# =========================================================

@app.get("/doctors/patients/{patient_id}/embryos")
def get_patient_embryos_for_doctor(
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

            "patient_id":
                patient.id,

            "first_name":
                patient.first_name,

            "last_name":
                patient.last_name,

            "email":
                patient.email,

            "phone":
                patient.phone,

            "dob":
                patient.dob,

            "age":
                calculate_age(patient.dob),

            "gender":
                patient.gender,

            "blood_group":
                patient.blood_group,

            "medical_history":
                patient.medical_history,

            "ongoing_treatments":
                patient.ongoing_treatments,

            "current_medications":
                patient.current_medications
        },

        "embryo_count":
            len(embryos),

        "embryos": [

            {

                "embryo_id":
                    embryo.id,

                "image_path":
                    embryo.image_path,

                "status":
                    embryo.status,

                "embryo_grade":
                    embryo.embryo_grade,

                "confidence":
                    embryo.confidence,

                "implantation_chance":
                    embryo.implantation_chance
            }

            for embryo in embryos
        ]
    }


# =========================================================
# EMBRYO UPLOAD
# DOCTOR ONLY
# =========================================================

@app.post("/embryos/upload")
async def upload_embryo(
    patient_id: int,
    file: UploadFile = File(...),
    doctor_user: dict = Depends(require_doctor),
    db: Session = Depends(get_db)
):

    doctor_id = doctor_user["user_id"]

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

    unique_filename = (
        f"{uuid.uuid4()}{extension}"
    )

    file_path = (
        UPLOAD_DIR /
        unique_filename
    )

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

        "message":
            "Embryo image uploaded successfully",

        "embryo_id":
            new_embryo.id,

        "patient_id":
            patient_id,

        "doctor_id":
            doctor_id,

        "filename":
            unique_filename,

        "status":
            "uploaded"
    }


# =========================================================
# ANALYZE EMBRYO
# DOCTOR ONLY
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

    # =====================================================
    # TEMPORARY AI RESULT
    # Replace with trained CNN model later.
    # =====================================================

    embryo.embryo_grade = "4AA"

    embryo.confidence = "92%"

    embryo.implantation_chance = "78%"

    embryo.status = "analyzed"

    db.commit()

    db.refresh(embryo)

    return {

        "message":
            "Embryo analysis completed",

        "embryo_id":
            embryo.id,

        "status":
            embryo.status,

        "embryo_grade":
            embryo.embryo_grade,

        "confidence":
            embryo.confidence,

        "implantation_chance":
            embryo.implantation_chance
    }


# =========================================================
# GET EMBRYO
# DOCTOR ONLY
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

        "embryo_id":
            embryo.id,

        "patient_id":
            embryo.patient_id,

        "doctor_id":
            embryo.doctor_id,

        "image_path":
            embryo.image_path,

        "status":
            embryo.status,

        "embryo_grade":
            embryo.embryo_grade,

        "confidence":
            embryo.confidence,

        "implantation_chance":
            embryo.implantation_chance
    }
