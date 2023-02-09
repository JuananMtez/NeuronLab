from pydantic import BaseModel


class EpochPlot(BaseModel):
    n_events: int


class EpochAverage(BaseModel):
    channel: str
    stimulus: str


class EpochCompare(BaseModel):
    stimulus: str


class EpochPSD(BaseModel):
    f_min: float
    f_max: float
    average: bool

class EpochActivity(BaseModel):
    stimulus: str
    times: list[float]
    extrapolate: str