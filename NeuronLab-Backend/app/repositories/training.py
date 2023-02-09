from sqlalchemy.orm import Session
from app.models import models


def find_by_id(db: Session, training_id: int) -> models.Training:
    return db.query(models.Training).filter(models.Training.id == training_id).first()


def save(db: Session, training: models.Training) -> models.Training:

    db.add(training)
    db.commit()
    db.refresh(training)
    return training


def delete(db: Session, training: models.Training):
    db.delete(training)
    db.commit()


