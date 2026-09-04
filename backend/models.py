from sqlalchemy import Column, Integer, String, Date, Text
from database import Base
class Patient(Base):
    __tablename__ = "patients"

    # -----------------------------------------------------
    # BASIC INFORMATION
    # -----------------------------------------------------

    id = Column(Integer, primary_key=True, index=True)

    # Set when a doctor creates the patient from the doctor portal.
    # Self-registered patients can remain unassigned.
    doctor_id = Column(Integer, nullable=True, index=True)

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

    password = Column(String(255), nullable=False)

    # =====================================================
    # MEDICAL HISTORY
    # =====================================================

    medical_history = Column(Text)

    current_problems = Column(Text)

    previous_surgeries = Column(Text)

    chronic_conditions = Column(Text)

    allergies = Column(Text)

    current_medications = Column(Text)

    family_medical_history = Column(Text)

    ongoing_treatments = Column(Text)

    # =====================================================
    # IVF / FERTILITY HISTORY
    # =====================================================

    previous_ivf_history = Column(Text)

    previous_pregnancy_history = Column(Text)

    infertility_duration = Column(String(100))

    infertility_cause = Column(Text)

    menstrual_history = Column(Text)

    fertility_treatment_history = Column(Text)

    # =====================================================
    # DOCTOR NOTES
    # =====================================================

    doctor_notes = Column(Text)

    # =====================================================
    # EMERGENCY CONTACT
    # =====================================================

    emergency_contact_name = Column(String(150))

    emergency_contact_phone = Column(String(30))


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

    status = Column(
        String(50),
        default="uploaded"
    )

    embryo_grade = Column(
        String(50),
        nullable=True
    )

    confidence = Column(
        String(50),
        nullable=True
    )

    implantation_chance = Column(
        String(50),
        nullable=True
    )
