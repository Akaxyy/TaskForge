# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from datetime import datetime
from .database import Base

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
