# backend/routers/task.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas, database

router = APIRouter(prefix="/task", tags=["Tasks"])

@router.post("", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db)):
    db_task = models.TaskDB(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("", response_model=list[schemas.TaskResponse])
def list_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.TaskDB).offset(skip).limit(limit).all()

@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task(task_id: int, db: Session = Depends(database.get_db)):
    """Obter uma tarefa pelo id"""
    task = db.query(models.TaskDB).filter(models.TaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(database.get_db)):
    """Atualizar uma tarefa"""
    task = db.query(models.TaskDB).filter(models.TaskDB.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, value in task_update.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

        task.atualizado = datetime.now()
        db.commit()
        db.refresh(task)
        return task
    
@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(database.get_db)):
    """Deletar uma tarefa"""
    task = db.query(models.TaskDB).filter(models.TaskDB.id == task_id).first()
    return task