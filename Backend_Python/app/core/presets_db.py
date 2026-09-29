"""
Portal Presets Database Module
Contains explicit file size, dimension, and aspect ratio guidelines for Indian competitive examination portals.
"""

PORTAL_PRESETS = {
    "ssc_cgl": {
        "id": "ssc_cgl",
        "portalName": "Staff Selection Commission (SSC)",
        "examTitle": "SSC Combined Graduate Level (CGL)",
        "photo": {
            "minKB": 20,
            "maxKB": 50,
            "widthPx": 200,
            "heightPx": 230,
            "aspectRatio": "3.5cm x 4.5cm",
            "format": "JPEG",
            "instructions": "Recent passport size photograph with light background. Face must cover 70-80% area."
        },
        "signature": {
            "minKB": 10,
            "maxKB": 20,
            "widthPx": 140,
            "heightPx": 60,
            "format": "JPEG",
            "instructions": "Black ink signature on white paper."
        }
    },
    "upsc_otr": {
        "id": "upsc_otr",
        "portalName": "Union Public Service Commission (UPSC)",
        "examTitle": "UPSC One-Time Registration & Civil Services (CSE)",
        "photo": {
            "minKB": 20,
            "maxKB": 300,
            "widthPx": 350,
            "heightPx": 350,
            "aspectRatio": "1:1 Square",
            "format": "JPEG",
            "instructions": "Photograph must show candidate's name and date on which photo was taken at the bottom."
        },
        "signature": {
            "minKB": 20,
            "maxKB": 300,
            "widthPx": 350,
            "heightPx": 350,
            "format": "JPEG",
            "instructions": "Signature in black ink on white paper."
        }
    },
    "ibps_po": {
        "id": "ibps_po",
        "portalName": "Institute of Banking Personnel Selection (IBPS)",
        "examTitle": "IBPS PO / Clerk Recruitment",
        "photo": {
            "minKB": 20,
            "maxKB": 50,
            "widthPx": 200,
            "heightPx": 230,
            "aspectRatio": "4.5cm x 3.5cm",
            "format": "JPEG",
            "instructions": "Recent passport photo with clear background."
        },
        "signature": {
            "minKB": 10,
            "maxKB": 20,
            "widthPx": 140,
            "heightPx": 60,
            "format": "JPEG",
            "instructions": "Signature in black ink. Capital letters signature is NOT allowed."
        }
    },
    "rrb_ntpc": {
        "id": "rrb_ntpc",
        "portalName": "Railway Recruitment Board (RRB)",
        "examTitle": "RRB Non-Technical Popular Categories (NTPC)",
        "photo": {
            "minKB": 20,
            "maxKB": 50,
            "widthPx": 320,
            "heightPx": 240,
            "aspectRatio": "4:3",
            "format": "JPEG",
            "instructions": "Plain white background without caps/goggles."
        },
        "signature": {
            "minKB": 10,
            "maxKB": 20,
            "widthPx": 140,
            "heightPx": 60,
            "format": "JPEG",
            "instructions": "Running handwriting signature."
        }
    },
    "nta_neet": {
        "id": "nta_neet",
        "portalName": "National Testing Agency (NTA)",
        "examTitle": "NEET / JEE Main Entrance",
        "photo": {
            "minKB": 10,
            "maxKB": 200,
            "widthPx": 400,
            "heightPx": 400,
            "aspectRatio": "1:1",
            "format": "JPEG",
            "instructions": "White background with 80% face coverage showing ears clearly."
        },
        "signature": {
            "minKB": 4,
            "maxKB": 30,
            "widthPx": 140,
            "heightPx": 60,
            "format": "JPEG",
            "instructions": "Signature in black ink on white background."
        }
    }
}
