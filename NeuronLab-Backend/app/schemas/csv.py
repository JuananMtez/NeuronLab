from pydantic import BaseModel
from typing import Union, Optional


class CSVCopy(BaseModel):
    name: str


class CSVFiltering(BaseModel):
    preproccessing: str
    filter_type: str
    filter_method: str
    order: str
    phase: str



class CSVBandpass(CSVFiltering):
    low_freq:  str
    high_freq: str


class CSVNotch(CSVFiltering):
    freq: str


class CSVDownsampling(BaseModel):
    preproccessing: str
    freq_downsampling: str


proccessing = Union[CSVBandpass, CSVNotch, CSVDownsampling]
class CSVFilters(BaseModel):
    csvs: list[int]
    preproccessings: list[proccessing]


class CSVResponse(BaseModel):
    id: int
    name: str
    type: str
    subject_name: str
    date: str
    duraction: int
    events: int
    epochs: str

    class Config:
        orm_mode = True


