from pydantic import BaseModel
from app.schemas.mental_condition import MentalConditionPost, MentalConditionResponse


class SubjectPost(BaseModel):
    name: str
    surname: str
    age: int
    gender: str
    mental_conditions: list[MentalConditionPost]


class SubjectResponse(BaseModel):
    id: int
    name: str
    surname: str
    gender: str
    age: int
    mental_conditions: list[MentalConditionResponse]

    class Config:
        orm_mode = True