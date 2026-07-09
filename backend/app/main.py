from fastapi import FastAPI

app = FastAPI(
    title="EVOLVE API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "name": "EVOLVE API",
        "status": "online",
        "version": "1.0.0"
    }