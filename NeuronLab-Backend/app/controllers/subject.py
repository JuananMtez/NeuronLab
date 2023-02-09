from fastapi import APIRouter, Depends, HTTPException, Response
from ..config.database import get_db
from sqlalchemy.orm import Session
from app.services import subject as subject_service
from starlette.status import HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from app.schemas.subject import SubjectResponse, SubjectPost
from ..config.security import get_current_researcher

subject_controller = APIRouter(
    prefix="/subject",
    tags=["subjects"])


@subject_controller.get("/", response_model=list[SubjectResponse])
async def get_all_subjects(db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    return subject_service.get_all_subjects(db)


@subject_controller.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    subject = subject_service.get_subjects(db, subject_id)
    if subject is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return subject


@subject_controller.post("/", response_model=SubjectResponse)
async def create_subject(subject: SubjectPost, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    s = subject_service.create_subject(db, subject)
    if s is None:
        return Response(status_code=HTTP_400_BAD_REQUEST)
    return s


@subject_controller.delete("/{subject_id}")
async def delete_subject(subject_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    if not subject_service.delete_subject(db, subject_id):
        return Response(status_code=HTTP_404_NOT_FOUND)
    return Response(status_code=HTTP_204_NO_CONTENT)


@subject_controller.get("/not/{experiment_id}", response_model=list[SubjectResponse])
async def get_subjects_not_experiment(experiment_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    subjects = subject_service.get_all_subjects_not_experiment(db, experiment_id)
    if subjects is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return subjects