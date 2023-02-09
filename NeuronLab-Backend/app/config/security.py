from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
from jose import JWTError, jwt
import os
import configparser
from datetime import datetime, timedelta
from .database import get_db
from ..services import researcher as researcher_service
from sqlalchemy.orm import Session

thisfolder = os.path.dirname(os.path.abspath(__file__))
initfile = os.path.join(thisfolder, 'properties.ini')
config = configparser.ConfigParser()
config.read(initfile)

def get_current_researcher(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.get("SECURITY", "secret_key"), algorithms=config.get("SECURITY", "algorithm"))
        id: str = payload.get("id")
        user: str = payload.get("user")
        expires = payload.get("exp")
        if id is None or user is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    if expires is None:
        raise credentials_exception

    return researcher_service.get_researcher_id_name(db, id, user) is not None


def create_access_token(researcher):
    data = {"id": researcher.id, "user": researcher.user}
    to_encode = data.copy()
    expires_delta = timedelta(minutes=float(config.get("SECURITY", "access_token_expire_minute")))


    expire = datetime.utcnow() + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.get("SECURITY", "secret_key"), algorithm=config.get("SECURITY", "algorithm"))
    return encoded_jwt