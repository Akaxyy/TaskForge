# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, Optional

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