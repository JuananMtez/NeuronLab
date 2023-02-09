from pydantic import BaseModel


class StimulusPost(BaseModel):
    name: str
    description: str


class StimulusResponse(BaseModel):
    name: str
    description: str

    class Config:
        orm_mode = True