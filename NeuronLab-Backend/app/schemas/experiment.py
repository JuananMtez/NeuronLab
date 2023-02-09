from pydantic import BaseModel
from app.schemas.researcher import ResearcherResponse
from app.schemas.stimulus import StimulusPost, StimulusResponse
from app.schemas.device import EEGHeadsetResponse, DeviceResponse, EEGHeadsetPost
from app.schemas.subject import SubjectResponse
from app.schemas.csv import CSVResponse
from typing import Union
from decimal import Decimal


device_post = Union[EEGHeadsetPost]


class ExperimentPost(BaseModel):
    name: str
    description: str
    researcher_creator_id: int
    stimuli: list[StimulusPost]
    device: device_post
    subjects: list[int]
    epoch_start: float
    epoch_end: float


class ExperimentResearchers(BaseModel):
    researchers_id: list[int]


class ExperimentSubjects(BaseModel):
    subjects_id: list[int]


device_response = Union[EEGHeadsetResponse, DeviceResponse]


class ExperimentsListResponse(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        orm_mode = True


class ExperimentResponse(BaseModel):
    id: int
    name: str
    description: str
    researcher_creator_id: int
    researchers: list[ResearcherResponse] = []
    stimuli: list[StimulusResponse] = []
    device: device_response
    subjects: list[SubjectResponse] = []
    csvs: list[CSVResponse] = []
    epoch_start: float
    epoch_end: float

    class Config:
        orm_mode = True

