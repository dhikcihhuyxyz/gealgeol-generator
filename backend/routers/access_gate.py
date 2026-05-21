from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(
    prefix="/access",
    tags=["Access Gate"],
)


class AccessVerifyRequest(BaseModel):
    access_code: str


def get_valid_access_codes():
    single_code = os.getenv("DASHBOARD_ACCESS_CODE", "")
    multiple_codes = os.getenv("DASHBOARD_ACCESS_CODES", "")

    codes = []

    if single_code.strip():
        codes.append(single_code.strip())

    if multiple_codes.strip():
        codes.extend(
            [
                code.strip()
                for code in multiple_codes.split(",")
                if code.strip()
            ]
        )

    return set(codes)


@router.post("/verify")
def verify_access(request: AccessVerifyRequest):
    access_code = request.access_code.strip()
    valid_codes = get_valid_access_codes()

    if not valid_codes:
        raise HTTPException(
            status_code=500,
            detail="DASHBOARD_ACCESS_CODE belum di-set di file .env",
        )

    if not access_code:
        raise HTTPException(
            status_code=400,
            detail="Access code wajib diisi",
        )

    if access_code not in valid_codes:
        raise HTTPException(
            status_code=401,
            detail="Access code salah atau tidak aktif",
        )

    return {
        "success": True,
        "message": "Access granted",
    }