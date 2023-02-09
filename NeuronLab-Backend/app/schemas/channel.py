from pydantic import BaseModel
from app.models.models import NameChannel


class ChannelPost(BaseModel):
    channel: NameChannel
    position: int


class ChannelResponse(BaseModel):
    channel: NameChannel
    position: int

    class Config:
        orm_mode = True