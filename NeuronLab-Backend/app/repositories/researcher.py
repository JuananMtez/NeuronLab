from sqlalchemy.orm import Session
from app.models import models


def find_by_id(db: Session, researcher_id: int) -> models.Researcher:
    return db.query(models.Researcher).filter(models.Researcher.id == researcher_id).first()

def find_by_id_user(db: Session, id: str, user: str) -> models.Researcher:
    return db.query(models.Researcher).filter(models.Researcher.id == id, models.Researcher.user == user).first()

def save(db: Session, researcher: models.Researcher) -> models.Researcher:

    db.add(researcher)
    db.commit()
    db.refresh(researcher)
    return researcher


def find_by_user_password(db: Session, user: str, password: str) -> models.Researcher:
    return db.query(models.Researcher).filter(models.Researcher.user == user, models.Researcher.password == password).first()


def find_by_user(db: Session, user: str) -> models.Researcher:
    return db.query(models.Researcher).filter(models.Researcher.user == user).first()


def find_all(db: Session) -> list[models.Researcher]:
    return db.query(models.Researcher).all()


def exists_by_user_email(db: Session, email: str, user: str) -> bool:
    return db.query(models.Researcher).filter(
        models.Researcher.email == email
        or models.Researcher.user == user).first() is not None


def exists_by_id(db: Session, researcher_id: int) -> bool:
    return db.query(models.Researcher).filter(
        models.Researcher.id == researcher_id).first() is not None


def save_new_password(db: Session, researcher: models.Researcher):
    db.add(researcher)
    db.commit()
