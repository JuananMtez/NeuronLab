from pydantic import BaseModel


class PreproccessingResponse(BaseModel):
    id: int
    position: int
    preproccessing: str
    description: str

    class Config:
        orm_mode = True


class ICAMethod(BaseModel):
    method: str

class ICAExclude(BaseModel):
    components: list[int]
    method: str
