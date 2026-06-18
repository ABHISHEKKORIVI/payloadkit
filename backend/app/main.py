from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.python_runner import router as python_runner_router

app = FastAPI(title="PayloadKit API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(python_runner_router, prefix="/api")
