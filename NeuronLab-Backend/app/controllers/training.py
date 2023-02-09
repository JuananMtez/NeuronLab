from fastapi import APIRouter, Depends, Response, HTTPException
from ..config.database import get_db
from starlette.status import HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND
from sqlalchemy.orm import Session
from app.schemas.training import MachineLearningPost, TrainingResponse, DeepLearningPost
from app.services import training as training_service
from app.schemas.csv import CSVResponse
from ..config.security import get_current_researcher

training_controller = APIRouter(
    prefix="/training",
    tags=["trainings"])


@training_controller.post("/machine")
async def create_training_machine(training_post: MachineLearningPost, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    returned = training_service.create_training_machine(db, training_post)

    if type(returned) == str:
        raise HTTPException(status_code=500, detail=returned)

    return Response(status_code=HTTP_204_NO_CONTENT)


@training_controller.post("/deep")
async def create_training_deep(training_post: DeepLearningPost, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    returned = training_service.create_training_deep(db, training_post)

    if type(returned) == str:
        raise HTTPException(status_code=500, detail=returned)
    elif returned is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return Response(status_code=HTTP_204_NO_CONTENT)


@training_controller.delete("/{training_id}")
async def delete_training(training_id:int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    training_service.delete_training(db, training_id)
    return Response(status_code=HTTP_204_NO_CONTENT)

@training_controller.get("/csv/{csv_id}", response_model=list[TrainingResponse])
async def get_trainings_csv(csv_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    trainings = training_service.find_all_csv(db, csv_id)
    if trainings is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return trainings


@training_controller.get("/models/csv/{csv_id}")
async def get_models_predictable(csv_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    trainings = training_service.find_all_predictable(db, csv_id)
    if trainings is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return trainings

@training_controller.get("/{training_id}/predict/csv/{csv_id}")
async def predict(training_id: int, csv_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    obj = training_service.predict(db, training_id, csv_id)
    if obj is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    elif type(obj) == str:
        raise HTTPException(status_code=500, detail=obj)


    return obj


@training_controller.get("/{training_id}/predict/summary")
async def summary(training_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    obj = training_service.get_summary(db, training_id)
    if obj is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    elif type(obj) == str:
        raise HTTPException(status_code=500, detail=obj)


    return obj


@training_controller.get("/{training_id}/csvs", response_model=list[CSVResponse])
async def get_all_csvs(training_id: int, db: Session = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    return training_service.get_all_csvs(db, training_id)


