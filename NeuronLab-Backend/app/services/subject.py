from sqlalchemy.orm import Session
from app.schemas.subject import SubjectResponse, SubjectPost
from app.models import models
from app.repositories import subject as subject_crud
from typing import Optional
from app.repositories import experiment as experiment_crud


def get_all_subjects(db:Session) -> list[SubjectResponse]:
    return subject_crud.find_all(db)


def get_subjects(db:Session, subject_id: int) -> Optional[SubjectResponse]:
    return subject_crud.find_by_id(db, subject_id)


def create_subject(db: Session, subject: SubjectPost) -> models.Subject:

    db_subject = models.Subject(name=subject.name,
                                surname=subject.surname,
                                age=subject.age,
                                gender=subject.gender)

    for x in subject.mental_conditions:
        condition = models.MentalCondition(condition=x.condition)
        db_subject.mental_conditions.append(condition)

    return subject_crud.save(db, db_subject)


def delete_subject(db: Session, subject_id: int) -> bool:
    subject = subject_crud.find_by_id(db, subject_id)
    if subject is None:
        return False;

    subject_crud.delete(db, subject)
    return True


def get_all_subjects_not_experiment(db: Session, experiment_id: int) -> Optional[list[models.Subject]]:
    experiment = experiment_crud.find_by_id(db, experiment_id)
    if experiment is None:
        return None

    subjects = subject_crud.find_all(db)

    returned = []
    for s in subjects:
        found = False
        for t in experiment.subjects:
            if s.id == t.id:
                found = True
                break
        if not found:
            returned.append(s)

    return returned