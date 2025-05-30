# backend/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
import json

# Configuração do banco de dados
SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/task.db"
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
except:
    SQLALCHEMY_DATABASE_URL.replace("./backend/", "")
    print("NEW SQLALCHEMY_DATABASE_URL::", SQLALCHEMY_DATABASE_URL)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo do banco de dados
class TaskDB(Base):
    __tablename__ = "task"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    tipo = Column(String, nullable=False)
    parametros = Column(JSON)
    horario_execucao = Column(DateTime, nullable=False)
    status = Column(String, default="pendente")
    criado = Column(DateTime, default=datetime.now())
    atualizado = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    log = Column(Text)

Base.metadata.create_all(bind=engine)

class TaskCreate(BaseModel):
    nome: str
    tipo: str
    parametros: Dict[str, Any] 
    horario_execucao: datetime

class TaskUpdate(BaseModel):
    id: int
    nome: str
    tipo: str
    parametros: Dict[str, Any]
    horario_execucao: datetime
    status: str


class TaskResponse(BaseModel):
    id: int
    nome: str
    tipo: str
    parametros: Dict[str, Any]
    horario_execucao: datetime
    status: str
    criado: datetime
    atualizado: datetime
    log: Optional[str] = None

    class Config:
        from_attributes = True

# Dependecy DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI app
app = FastAPI(title="Task Scheduler API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Rever isso,
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Endpoints
@app.get("/")
def read_root():
    return {"message": "Task Schedule API is runnings"}

@app.post("/task", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session =  Depends(get_db)):
    """Criar uma nova tarefa"""
    db_task = TaskDB(
        nome=task.nome,
        tipo=task.tipo,
        parametros=task.parametros,
        horario_execucao=task.horario_execucao
    )
    db.add(db_task) ; db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/task", response_model=list[TaskResponse])
def list_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listar todas as tarefas"""
    task = db.query(TaskDB).offset(skip).limit(limit).all()
    return task

@app.get("/task/{taskid}", response_model=TaskResponse)
def get_task(taskid: int, db: Session = Depends(get_db)):
    """Obtem uma tarefa específica"""
    task = db.query(TaskDB).filter(TaskDB.id == taskid).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task

if __name__ == "__main__":
    # BASH ? uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)