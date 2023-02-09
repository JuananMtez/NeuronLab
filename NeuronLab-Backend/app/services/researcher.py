from sqlalchemy.orm import Session
from app.repositories import researcher as researcher_crud
from app.models import models
from app.schemas.researcher import ResearcherPost, ResearcherPutPassword, ResearcherLogin
from typing import Optional
import bcrypt


def get_researcher_id(db: Session, researcher_id: int) -> models.Researcher:
    return researcher_crud.find_by_id(db, researcher_id)

def get_researcher_id_name(db: Session, researcher_id, researcher_user):
    return researcher_crud.find_by_id_user(db, researcher_id, researcher_user)

def get_all_researcher(db: Session):
    return researcher_crud.find_all(db)


def create_researcher(db: Session, researcher: ResearcherPost):

    if researcher_crud.exists_by_user_email(db, researcher.email, researcher.user):
        return None

    password = researcher.password.encode('utf-8')
    hashed = bcrypt.hashpw(password, bcrypt.gensalt(10))

    db_researcher = models.Researcher(name=researcher.name,
                                      surname=researcher.surname,
                                      email=researcher.email,
                                      user=researcher.user,
                                      password=hashed)

    return researcher_crud.save(db, db_researcher)


def get_all_researcher_not_experiment(db: Session, experiment_id: int) -> list[models.Researcher]:
    researchers = researcher_crud.find_all(db)
    returned = []

    for r in researchers:
        found = False
        for e in r.experiments:
            if e.id == experiment_id:
                found=True
                break
        if not found:
            returned.append(r)

    return returned


def login(db: Session, username: str, password: str):
    researcher = researcher_crud.find_by_user(db, username)

    if researcher is None:
        return None

    if bcrypt.checkpw(password.encode('utf-8'), bytes(researcher.password, 'utf-8')) and researcher.user == username:
        return researcher

    return None


def change_password(db: Session, researcher_id: int, researcher_put: ResearcherPutPassword):

    r = researcher_crud.find_by_id(db, researcher_id)
    if r is None:
        return None

    r.password = researcher_put.password
    researcher_crud.save_new_password(db, r)
    return True
