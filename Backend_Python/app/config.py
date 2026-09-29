import os

class Settings:
    PROJECT_NAME: str = "GovEase Python Intelligence Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "chrome-extension://*",   
        "*"
    ]

settings = Settings()
