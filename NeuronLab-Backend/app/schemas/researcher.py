from pydantic import BaseModel


class ResearcherPost(BaseModel):
    name: str
    surname: str
    email: str
    user: str
    password: str


class ResearcherLogin(BaseModel):
    user: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str



class ResearcherPutPassword(BaseModel):
    password: str


class ResearcherResponse(BaseModel):
    id: int
    name: str
    surname: str
    email: str
    user: str

    class Config:
        orm_mode = True


class ResearcherResponseToken(BaseModel):
    token: Token
    user: ResearcherResponse