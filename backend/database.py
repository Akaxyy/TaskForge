# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

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

# Dependecy DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
