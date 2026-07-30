from sqlmodel import create_engine, SQLModel, Session
from backend.utils.config import settings
from typing import Generator 

DATABASE_URL = settings.DATABASE_URL.get_secret_value()

engine = create_engine(DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session