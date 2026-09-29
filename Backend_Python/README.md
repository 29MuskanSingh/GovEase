# GovEase Python Backend Service (`Backend_Python`)

Welcome to the **GovEase Python Intelligence Microservice**. This service powers the **Exam Eligibility Radar**, **Portal Presets Engine**, and **Sarkari Notice Web Scrapers** for GovEase.

---

## 🚀 Quickstart Guide

### Option 1: One-Click Launch (Windows)
Double-click `start.bat`. It will automatically set up the virtual environment, install requirements, and start the server!

### Option 2: Manual Terminal Setup
```bash
# 1. Navigate to directory
cd Backend_Python

# 2. Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server
python main.py
```

The server will start at **`http://127.0.0.1:8000`**.

---

## 📖 Interactive API Documentation

FastAPI automatically generates interactive Swagger documentation:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## 🛠️ API Endpoints Reference

### 1. Portal Presets (`/api/v1/presets`)
- `GET /api/v1/presets` - Fetch photo & signature KB and pixel specifications for UPSC, SSC, IBPS, RRB, NTA.
- `GET /api/v1/presets/{preset_id}` - Fetch preset for a specific portal (e.g., `ssc_cgl`).

### 2. Exam Eligibility Radar (`/api/v1/eligibility/check`)
- `POST /api/v1/eligibility/check` - Send candidate DOB, Category, Gender, Qualification, and Percentage. Returns matching eligible exams with category age relaxation rules applied.

### 3. Active Notices (`/api/v1/notices`)
- `GET /api/v1/notices` - Fetch active exam recruitment notices and application deadline links.

---

## 📁 Package Architecture

```text
Backend_Python/
├── main.py              # Root launcher
├── start.bat            # 1-click Windows launcher
├── requirements.txt     # Dependencies
├── README.md            # Documentation
└── app/
    ├── main.py          # FastAPI application entry & CORS middleware
    ├── config.py        # System configuration & CORS settings
    ├── api/             # API Router Aggregator & Endpoints
    │   └── endpoints/
    │       ├── health.py       # Health check
    │       ├── presets.py      # Presets API
    │       ├── eligibility.py  # Eligibility checker API
    │       └── notices.py      # Notices scraper API
    ├── core/
    │   └── presets_db.py       # Portal image guidelines database
    ├── schemas/         # Pydantic data validation schemas
    └── services/        # Business logic (Eligibility math & scrapers)
```

---
*GovEase Backend Python Module v1.0.0*
