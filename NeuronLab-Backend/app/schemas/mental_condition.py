from pydantic import BaseModel


class MentalConditionPost(BaseModel):
    condition: str


class MentalConditionResponse(BaseModel):
    id: int
    condition: str

    class Config:
        orm_mode = True