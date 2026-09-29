from datetime import datetime
from dateutil.relativedelta import relativedelta
from app.schemas.eligibility import EligibilityCheckRequest, EligibilityCheckResponse, EligibleExamItem

# Exam Rules Master Catalog
EXAM_RULES_CATALOG = [
    {
        "examCode": "SSC_CGL_2026",
        "title": "SSC Combined Graduate Level Examination 2026",
        "portalName": "Staff Selection Commission (SSC)",
        "minQualification": "BACHELORS",
        "minPercentage": 0.0,
        "baseMinAge": 18,
        "baseMaxAge": 27,
        "cutoffDate": "2026-08-01",
        "applyUrl": "https://ssc.gov.in",
        "deadline": "2026-10-31"
    },
    {
        "examCode": "UPSC_CSE_2026",
        "title": "UPSC Civil Services Examination (IAS/IPS) 2026",
        "portalName": "Union Public Service Commission (UPSC)",
        "minQualification": "BACHELORS",
        "minPercentage": 0.0,
        "baseMinAge": 21,
        "baseMaxAge": 32,
        "cutoffDate": "2026-08-01",
        "applyUrl": "https://upsc.gov.in",
        "deadline": "2026-11-15"
    },
    {
        "examCode": "IBPS_PO_2026",
        "title": "IBPS Probationary Officer (PO/MT) XIV",
        "portalName": "Institute of Banking Personnel Selection (IBPS)",
        "minQualification": "BACHELORS",
        "minPercentage": 50.0,
        "baseMinAge": 20,
        "baseMaxAge": 30,
        "cutoffDate": "2026-09-01",
        "applyUrl": "https://ibps.in",
        "deadline": "2026-10-25"
    },
    {
        "examCode": "RRB_NTPC_2026",
        "title": "RRB NTPC Undergraduate Posts (Clerk/Typist)",
        "portalName": "Railway Recruitment Board (RRB)",
        "minQualification": "12TH",
        "minPercentage": 50.0,
        "baseMinAge": 18,
        "baseMaxAge": 30,
        "cutoffDate": "2026-07-01",
        "applyUrl": "https://rrbapply.gov.in",
        "deadline": "2026-11-05"
    }
]

QUALIFICATION_HIERARCHY = {
    "10TH": 1,
    "12TH": 2,
    "DIPLOMA": 2,
    "BACHELORS": 3,
    "MASTERS": 4
}

def calculate_age(dob_str: str, cutoff_date_str: str) -> float:
    dob = datetime.strptime(dob_str, "%Y-%m-%d")
    cutoff = datetime.strptime(cutoff_date_str, "%Y-%m-%d")
    delta = relativedelta(cutoff, dob)
    return round(delta.years + (delta.months / 12.0) + (delta.days / 365.25), 2)

def get_age_relaxation(category: str, is_pwd: bool) -> int:
    relaxation = 0
    if category == "OBC":
        relaxation += 3
    elif category in ["SC", "ST"]:
        relaxation += 5
    
    if is_pwd:
        relaxation += 10
        
    return relaxation

def evaluate_eligibility(payload: EligibilityCheckRequest) -> EligibilityCheckResponse:
    results = []
    eligible_count = 0

    for exam in EXAM_RULES_CATALOG:
        cand_age = calculate_age(payload.dob, exam["cutoffDate"])
        relaxation = get_age_relaxation(payload.category, payload.isPwD)
        max_allowed_age = exam["baseMaxAge"] + relaxation

        cand_qual_rank = QUALIFICATION_HIERARCHY.get(payload.qualification, 0)
        exam_qual_rank = QUALIFICATION_HIERARCHY.get(exam["minQualification"], 0)

        # Check qualification level
        if cand_qual_rank < exam_qual_rank:
            status = "QUALIFICATION_MISMATCH"
            reason = f"Requires minimum {exam['minQualification']}. Candidate has {payload.qualification}."
        # Check percentage if applicable
        elif payload.percentage < exam["minPercentage"]:
            status = "QUALIFICATION_MISMATCH"
            reason = f"Requires minimum {exam['minPercentage']}% marks. Candidate scored {payload.percentage}%."
        # Check minimum age
        elif cand_age < exam["baseMinAge"]:
            status = "AGE_EXCEEDED" # Below minimum age
            reason = f"Candidate age ({cand_age} yrs) is below minimum required age of {exam['baseMinAge']} yrs as of {exam['cutoffDate']}."
        # Check maximum age
        elif cand_age > max_allowed_age:
            status = "AGE_EXCEEDED"
            reason = f"Candidate age ({cand_age} yrs) exceeds max limit of {max_allowed_age} yrs (Base: {exam['baseMaxAge']} + {relaxation} yrs relaxation)."
        else:
            status = "ELIGIBLE" if relaxation == 0 else "AGE_RELAXED_ELIGIBLE"
            reason = f"Eligible! Age ({cand_age} yrs) is within allowed limit of {max_allowed_age} yrs. Qualification criteria met."
            eligible_count += 1

        results.append(EligibleExamItem(
            examCode=exam["examCode"],
            title=exam["title"],
            portalName=exam["portalName"],
            status=status,
            calculatedAge=cand_age,
            maxAgeLimit=max_allowed_age,
            relaxationGrantedYears=relaxation,
            reason=reason,
            applyUrl=exam["applyUrl"],
            deadline=exam["deadline"]
        ))

    avg_age = results[0].calculatedAge if results else 0.0

    return EligibilityCheckResponse(
        status="success",
        candidateAgeYears=avg_age,
        totalExamsEvaluated=len(EXAM_RULES_CATALOG),
        eligibleCount=eligible_count,
        results=results
    )
