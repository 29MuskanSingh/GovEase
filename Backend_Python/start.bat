@echo off
echo Starting GovEase Python Backend Service...
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
echo Running Uvicorn server on http://127.0.0.1:8000 ...
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
