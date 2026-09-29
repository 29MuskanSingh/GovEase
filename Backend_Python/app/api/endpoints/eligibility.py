from fastapi import APIRouter
from app.schemas.eligibility import EligibilityCheckRequest, EligibilityCheckResponse
from app.services.eligibility_service import evaluate_eligibility

router = APIRouter()

@router.post("/eligibility/check", response_model=EligibilityCheckResponse, tags=["Eligibility Engine"])
def check_eligibility(payload: EligibilityCheckRequest):
    """
    Evaluates candidate DOB, Category, Qualification, and Percentage against active competitive exams.
    Calculates category-based age relaxation rules and returns matching eligible exams.
    """
    return evaluate_eligibility(payload)
