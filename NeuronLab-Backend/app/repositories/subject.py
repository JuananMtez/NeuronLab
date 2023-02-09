from sqlalchemy.orm import Session
from app.models import models


def find_by_id(db: Session, subject_id: int) -> models.Subject:
    return db.query(models.Subject).filter(models.Subject.id == subject_id).first()


def save(db: Session, subject: models.Subject) -> models.Subject:

    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


def find_all(db: Session) -> list[models.Subject]:
    return db.query(models.Subject).all()


def delete(db: Session, subject: models.Subject):

    db.delete(subject)
    db.commit()
