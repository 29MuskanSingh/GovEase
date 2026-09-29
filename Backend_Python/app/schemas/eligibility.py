from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class CategoryEnum(str, Enum):
    GENERAL = "GENERAL"
    OBC = "OBC"
    SC = "SC"
    ST = "ST"
    EWS = "EWS"

class GenderEnum(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    TRANSGENDER = "TRANSGENDER"

class QualificationEnum(str, Enum):
    TENTH = "10TH"
    TWELFTH = "12TH"
    DIPLOMA = "DIPLOMA"
    BACHELORS = "BACHELORS"
    MASTERS = "MASTERS"

class EligibilityCheckRequest(BaseModel):
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format", example="2001-08-15")
    category: CategoryEnum = Field(CategoryEnum.GENERAL, description="Social Category")
    gender: GenderEnum = Field(GenderEnum.MALE, description="Gender")
    qualification: QualificationEnum = Field(QualificationEnum.BACHELORS, description="Highest Qualification Level")
    percentage: float = Field(..., ge=0.0, le=100.0, description="Marks Percentage", example=68.5)
    state: str = Field(..., description="State of Domicile", example="Maharashtra")
    isPwD: bool = Field(False, description="Person with Benchmark Disability status")
    pwdCategory: Optional[str] = Field(None, description="Disability Type if applicable")

class EligibleExamItem(BaseModel):
    examCode: str
    title: str
    portalName: str
    status: str  # "ELIGIBLE", "AGE_RELAXED_ELIGIBLE", "QUALIFICATION_MISMATCH", "AGE_EXCEEDED"
    calculatedAge: float
    maxAgeLimit: int
    relaxationGrantedYears: int
    reason: str
    applyUrl: str
    deadline: str

class EligibilityCheckResponse(BaseModel):
    status: str
    candidateAgeYears: float
    totalExamsEvaluated: int
    eligibleCount: int
    results: List[EligibleExamItem]
