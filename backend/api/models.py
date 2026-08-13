from sqlalchemy import Column, Integer, String, Date, Text

from database import Base


# =========================================================
# PATIENT
# =========================================================

class Patient(Base):

    __tablename__ = "patients"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    first_name = Column(
        String(100),
        nullable=False
    )

    last_name = Column(
        String(100),
        nullable=False
    )

    dob = Column(
        Date,
        nullable=False
    )

    gender = Column(
        String(20),
        nullable=False
    )

    blood_group = Column(
        String(10)
    )

    phone = Column(
        String(20),
        unique=True,
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    country = Column(
        String(100)
    )

    state = Column(
        String(100)
    )

    city = Column(
        String(100)
    )

    address = Column(
        Text
    )

    password = Column(
        String(255),
        nullable=False
    )


# =========================================================
# DOCTOR
# =========================================================

class Doctor(Base):

    __tablename__ = "doctors"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    first_name = Column(
        String(100),
        nullable=False
    )

    last_name = Column(
        String(100),
        nullable=False
    )

    specialization = Column(
        String(150)
    )

    phone = Column(
        String(20),
        unique=True,
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )


# =========================================================
# EMBRYO
# =========================================================

class Embryo(Base):

    __tablename__ = "embryos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        Integer,
        nullable=False
    )

    doctor_id = Column(
        Integer,
        nullable=False
    )

    image_path = Column(
        String(500),
        nullable=False
    )

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