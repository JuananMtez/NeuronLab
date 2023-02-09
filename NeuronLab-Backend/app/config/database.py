from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import configparser

thisfolder = os.path.dirname(os.path.abspath(__file__))
initfile = os.path.join(thisfolder, 'properties.ini')
config = configparser.ConfigParser()
config.read(initfile)


SQLALCHEMY_DATABASE_URL = "mysql+pymysql://" \
                          + config.get("DATABASE", "user") + ":" \
                          + config.get("DATABASE", "password") + "@" \
                          + config.get("DATABASE", "host") + "/" \
                          + config.get("DATABASE", "database")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

