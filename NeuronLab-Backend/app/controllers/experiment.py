from fastapi import APIRouter, Depends, HTTPException, Response
from app.schemas.experiment import ExperimentResponse, ExperimentResearchers, ExperimentSubjects, ExperimentsListResponse
from ..config.database import get_db
from sqlalchemy.orm import Session
from app.services import experiment as experiment_service
from app.schemas.experiment import ExperimentPost
from starlette.status import HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND
from ..config.security import get_current_researcher

experiment_controller = APIRouter(
    prefix="/experiment",
    tags=["experiments"])


@experiment_controller.get("/", response_model=list[ExperimentResponse])
async def get_all_experiments(db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    return experiment_service.get_all_experiments(db)


@experiment_controller.get("/{experiment_id}", response_model=ExperimentResponse)
async def get_experiment_id(experiment_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    e = experiment_service.get_experiment_by_id(db, experiment_id)
    if e is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return e


@experiment_controller.post("/", response_model=ExperimentResponse)
async def create_experiment(experiment: ExperimentPost, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    e = experiment_service.create_experiment(db, experiment)
    if e is None:
        return Response(status_code=HTTP_400_BAD_REQUEST)
    return e


@experiment_controller.delete("/{experiment_id}")
async def delete_experiment(experiment_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    if not experiment_service.delete_experiment(db, experiment_id):
        raise HTTPException(status_code=404, detail="Experiment not found")

    return Response(status_code=HTTP_204_NO_CONTENT)


@experiment_controller.patch("/add/{experiment_id}/researchers")
async def add_researcher(experiment_id: int, researchers: ExperimentResearchers, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    if not experiment_service.add_researchers(db, experiment_id, researchers):
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Response(status_code=HTTP_204_NO_CONTENT)


@experiment_controller.patch("/delete/{experiment_id}/researchers")
async def delete_researcher(experiment_id: int, researchers: ExperimentResearchers, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    if not experiment_service.delete_researchers(db, experiment_id, researchers):
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Response(status_code=HTTP_204_NO_CONTENT)


@experiment_controller.patch("/add/{experiment_id}/subjects")
async def add_subjects(experiment_id: int, subjects: ExperimentSubjects, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    if not experiment_service.add_subject(db, experiment_id, subjects):
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Response(status_code=HTTP_204_NO_CONTENT)


@experiment_controller.patch("/delete/{experiment_id}/subjects")
async def add_subjects(experiment_id: int, subjects: ExperimentSubjects, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    if not experiment_service.delete_subjects(db, experiment_id, subjects):
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Response(status_code=HTTP_204_NO_CONTENT)


@experiment_controller.get("/filter/researcher/{researcher_id}", response_model=list[ExperimentsListResponse])
async def get_all_experiments_researcher(researcher_id: int, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    experiments = experiment_service.get_all_experiments_researcher(db, researcher_id)
    if experiments is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return experiments




