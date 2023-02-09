from fastapi import APIRouter, Depends, Response, File, UploadFile, Form, HTTPException
from ..config.database import get_db
from starlette.status import HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND
from app.schemas.csv import CSVResponse, CSVCopy, CSVFilters
from app.schemas.preproccessing import PreproccessingResponse, ICAMethod, ICAExclude
from app.schemas.epoch import EpochPlot, EpochAverage, EpochCompare, EpochActivity, EpochPSD
from app.schemas.feature_extraction import FeaturesResponse, FeaturePost
from app.services import csv as csv_service
from fastapi.responses import FileResponse
from ..config.security import get_current_researcher



csv_controller = APIRouter(
    prefix="/csv",
    tags=["csvs"])


@csv_controller.get("/{experiment_id}", response_model=list[CSVResponse])
async def get_all_csv(experiment_id: int, db = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    csvs = csv_service.get_all_csv_experiment(db, experiment_id)
    if csvs is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return csvs


@csv_controller.get("/{csv_id}/preproccessing", response_model=list[PreproccessingResponse])
async def get_all_preproccessing(csv_id: int, db = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    preproccessings = csv_service.get_all_csv_preproccessing(db, csv_id)
    if preproccessings is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return preproccessings


@csv_controller.get("/{csv_id}/feature", response_model=FeaturesResponse)
async def get_feature(csv_id: int, db = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    return csv_service.get_csv_feature(db, csv_id)




@csv_controller.post("/", response_model=CSVResponse)
async def create_csv(name: str, subject_id: int, subject_name_cypher: str, experiment_id: int, time_correction: float, files: list[UploadFile], db = Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    c = csv_service.create_csv(db, name, subject_id, subject_name_cypher, experiment_id, time_correction, files)
    if c is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return c


@csv_controller.delete("/{csv_id}")
async def delete_csv(csv_id: int, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    if csv_service.delete_csv(db, csv_id) is False:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return Response(status_code=HTTP_204_NO_CONTENT)


@csv_controller.post("/{csv_id}", response_model=CSVResponse)
async def copy_csv(csv_id: int, csv_copy: CSVCopy, db =Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    c = csv_service.csv_copy(db, csv_id, csv_copy)
    if c is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return c


@csv_controller.patch("/{csv_id}", response_model=CSVResponse)
async def change_name(csv_id: int, csv_copy: CSVCopy, db =Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    c = csv_service.change_name(db, csv_id, csv_copy)
    if c is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return c


@csv_controller.post("/preproccessing/list")
async def apply_preproccessing(csv_filters: CSVFilters, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    text = csv_service.apply_preproccessing(db, csv_filters)

    return text


@csv_controller.post("/feature/list")
async def apply_feature(feature_post: FeaturePost, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):

    text = csv_service.apply_feature(db, feature_post)

    return text

@csv_controller.post("/{csv_id}/ica/plot/components")
async def plot_components_ica(csv_id: int, ica_method: ICAMethod, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    object = csv_service.plot_components_ica(db, csv_id, ica_method)
    if object is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return object


@csv_controller.post("/{csv_id}/ica/plot/properties")
async def plot_properties_ica(csv_id: int, ica_method: ICAMethod, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    images = csv_service.plot_properties_ica(db, csv_id, ica_method)
    if images is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return images

@csv_controller.post("/{csv_id}/ica/apply")
async def exclude_components(csv_id: int, arg: ICAExclude, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    text = csv_service.components_exclude_ica(db, csv_id, arg)
    if text is not None:
        raise HTTPException(status_code=500, detail=text)
    return Response(status_code=HTTP_204_NO_CONTENT)

@csv_controller.get("/{csv_id}/download")
async def download_csv(csv_id: int, db=Depends(get_db)):
    csv = csv_service.get_csv_by_id(db, csv_id)
    if csv is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return FileResponse(csv.path, filename=csv.name+".csv")


@csv_controller.get("/{csv_id}/same_feature", response_model=list[CSVResponse])
async def same_feature(csv_id: int, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    csvs = csv_service.get_csvs_same_features(db, csv_id)
    if csvs is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return csvs


@csv_controller.get("/{csv_id}/plot/chart")
async def plot_chart(csv_id: int, beginning: int, duraction: int, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    data = csv_service.plot_chart(db, csv_id, beginning, duraction)
    if data is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    return data

@csv_controller.post("/{csv_id}/epoch/plot")
async def plot_epoch(csv_id: int, epoch_plot: EpochPlot, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    img = csv_service.plot_epochs(db, csv_id, epoch_plot)
    if img is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return img


@csv_controller.post("/{csv_id}/epoch/average/plot")
async def plot_average(csv_id: int, epoch_average: EpochAverage, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    img = csv_service.plot_average_epoch(db, csv_id, epoch_average)
    if img is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return img


@csv_controller.post("/{csv_id}/epoch/compare/plot")
async def plot_compare(csv_id: int, epoch_compare: EpochCompare, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    img = csv_service.plot_compare(db, csv_id, epoch_compare)
    if img is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return img


@csv_controller.post("/{csv_id}/epoch/activity/plot")
async def plot_activity_brain(csv_id: int, epoch_activity: EpochActivity, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    img = csv_service.plot_activity_brain(db, csv_id, epoch_activity)
    if img is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return img


@csv_controller.get("/{csv_id}/psd/topomap/plot")
async def plot_psd_topomap(csv_id: int, db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    img = csv_service.plot_psd_topomap(db, csv_id)
    if img is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return img


@csv_controller.post("/{csv_id}/psd/plot")
async def plot_psd(csv_id: int, psd_chart: EpochPSD,db=Depends(get_db), exists_current_researcher = Depends(get_current_researcher)):
    img = csv_service.plot_psd_chart(db, csv_id, psd_chart)
    if img is None:
        return Response(status_code=HTTP_404_NOT_FOUND)

    return img
