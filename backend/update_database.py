from sqlalchemy import text
from database import engine

columns = [
    ("medical_history", "TEXT"),
    ("current_problems", "TEXT"),
    ("previous_surgeries", "TEXT"),
    ("chronic_conditions", "TEXT"),
    ("allergies", "TEXT"),
    ("current_medications", "TEXT"),
    ("family_medical_history", "TEXT"),
    ("ongoing_treatments", "TEXT"),
    ("previous_ivf_history", "TEXT"),
    ("previous_pregnancy_history", "TEXT"),
    ("infertility_duration", "VARCHAR(100)"),
    ("infertility_cause", "TEXT"),
    ("menstrual_history", "TEXT"),
    ("fertility_treatment_history", "TEXT"),
    ("doctor_notes", "TEXT"),
    ("emergency_contact_name", "VARCHAR(150)"),
    ("emergency_contact_phone", "VARCHAR(30)")
]

with engine.begin() as connection:

    for column_name, column_type in columns:

        sql = text(
            f"""
            ALTER TABLE patients
            ADD COLUMN IF NOT EXISTS
            {column_name} {column_type}
            """
        )

        connection.execute(sql)

        print(f"Added/verified: {column_name}")

print()
print("Database update completed successfully.")