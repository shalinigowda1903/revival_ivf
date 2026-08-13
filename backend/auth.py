from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from fastapi import Depends, HTTPException, status

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)


# =========================================================
# JWT SETTINGS
# =========================================================

SECRET_KEY = "REVIVAL_IVF_SECRET_KEY_2026"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 120


# =========================================================
# SECURITY
# =========================================================

security = HTTPBearer()


# =========================================================
# CREATE ACCESS TOKEN
# =========================================================

def create_access_token(user_id: int, role: str):

    now = datetime.now(timezone.utc)

    expire = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        role = payload.get("role")

        if user_id is None:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID missing from token"
            )

        if role not in ["doctor", "patient"]:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user role"
            )

        return {
            "user_id": int(user_id),
            "role": role
        }

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID"
        )


# =========================================================
# DOCTOR ONLY
# =========================================================

def require_doctor(
    current_user: dict = Depends(get_current_user)
):

    if current_user["role"] != "doctor":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctor access required"
        )

    return current_user


# =========================================================
# PATIENT ONLY
# =========================================================

def require_patient(
    current_user: dict = Depends(get_current_user)
):

    if current_user["role"] != "patient":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patient access required"
        )

    return current_user