# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import Base, engine
from .routers import task
import os

app = FastAPI(title="Task Scheduler API", version="1.0.1")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Create DB tables
Base.metadata.create_all(bind=engine)

# Routes
app.include_router(task.router, prefix="/api")

@app.get("/api")
def read_root():
    return {"message": "Task Schedule API is running"}

frontend_path = r"V:\Thiago\CRM\frontend"
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

    # Servir o index.html na raiz
    @app.get("/")
    async def serve_frontend():
        return FileResponse(os.path.join(frontend_path, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
