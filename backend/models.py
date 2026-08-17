from sqlalchemy import Column, Integer, String, Date, Text
from database import Base


# =========================================================
# PATIENT
# =========================================================

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    # =====================================================
    # BASIC INFORMATION
    # =====================================================

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    dob = Column(Date, nullable=False)
    gender = Column(String(20), nullable=False)
    blood_group = Column(String(10))

    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)

    country = Column(String(100))
    state = Column(String(100))
    city = Column(String(100))
    address = Column(Text)

    # =====================================================
    # MEDICAL HISTORY
    # =====================================================

    medical_history = Column(Text, nullable=True)

    current_problems = Column(Text, nullable=True)

    previous_surgeries = Column(Text, nullable=True)

    chronic_conditions = Column(Text, nullable=True)

    allergies = Column(Text, nullable=True)

    current_medications = Column(Text, nullable=True)

    family_medical_history = Column(Text, nullable=True)

    # =====================================================
    # IVF / FERTILITY HISTORY
    # =====================================================

    previous_ivf_history = Column(Text, nullable=True)

    previous_pregnancy_history = Column(Text, nullable=True)

    infertility_duration = Column(String(100), nullable=True)

    infertility_cause = Column(Text, nullable=True)

    menstrual_history = Column(Text, nullable=True)

    fertility_treatment_history = Column(Text, nullable=True)

    # =====================================================
    # DOCTOR NOTES
    # =====================================================

    doctor_notes = Column(Text, nullable=True)

    # =====================================================
    # EMERGENCY CONTACT
    # =====================================================

    emergency_contact_name = Column(String(150), nullable=True)

    emergency_contact_phone = Column(String(30), nullable=True)

    # =====================================================
    # LOGIN
    # =====================================================

    password = Column(String(255), nullable=False)


# =========================================================
# DOCTOR
# =========================================================

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    specialization = Column(String(150))

    phone = Column(String(20), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)

    password = Column(String(255), nullable=False)


# =========================================================
# EMBRYO
# =========================================================

class Embryo(Base):
    __tablename__ = "embryos"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)

    image_path = Column(String(500), nullable=False)

    status = Column(String(50), default="uploaded")

    embryo_grade = Column(String(50), nullable=True)

    confidence = Column(String(50), nullable=True)

    implantation_chance = Column(String(50), nullable=True)