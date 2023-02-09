from pydantic import BaseModel
from app.schemas.channel import ChannelPost, ChannelResponse
from app.models.models import NameChannel


class Device(BaseModel):
    name: str
    sample_rate: int
    type: str


class EEGHeadset(Device):
    channels: list[ChannelResponse]
    channels_count: int


class EEGHeadsetPost(Device):
    channels: list[ChannelPost]
    channels_count: int


class EEGHeadsetResponse(EEGHeadset):
    id: int


    class Config:
        orm_mode = True


class DeviceResponse(Device):
    id: int

    class Config:
        orm_mode = True