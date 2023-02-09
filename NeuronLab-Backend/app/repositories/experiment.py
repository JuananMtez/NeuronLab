from sqlalchemy.orm import Session
from typing import Optional
from app.models import models
from app.repositories import researcher as researcher_crud


def find_by_id(db: Session, experiment_id: int) -> Optional[models.Experiment]:
    e = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    return e


def save(db: Session, experiment: models.Experiment) -> models.Experiment:
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    return experiment


def find_all(db: Session) -> list[models.Experiment]:
    return db.query(models.Experiment).all()


def exists_by_id(db: Session, experiment_id: int) -> bool:
    return db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first() is not None


def delete(db: Session, experiment: models.Experiment):

    db.delete(experiment)
    db.commit()


