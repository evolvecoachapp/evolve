from fastapi import FastAPI

from app.api.v1 import api_router

app = FastAPI(
    title="EVOLVE API",
    version="1.0.0"
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "name": "EVOLVE API",
        "status": "online",
        "version": "1.0.0"
    }