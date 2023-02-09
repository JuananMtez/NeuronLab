from fastapi import FastAPI, Depends, HTTPException, status
from .controllers import researcher, experiment, subject, csv, training
from .config.database import engine, get_db
from .models import models
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from .services import researcher as researcher_service
from sqlalchemy.orm import Session
from .config.security import create_access_token
from .schemas.researcher import ResearcherLogin, ResearcherResponseToken

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/token", response_model=ResearcherResponseToken)
async def login(researcher_post: ResearcherLogin, db: Session = Depends(get_db)):
    researcher = researcher_service.login(db, researcher_post.user, researcher_post.password)
    if researcher is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"})

    access_token = create_access_token(researcher)

    return {"token": {"access_token": access_token, "token_type": "bearer"}, "user": researcher}


app.include_router(researcher.researcher_controller)
app.include_router(experiment.experiment_controller)
app.include_router(subject.subject_controller)
app.include_router(csv.csv_controller)
app.include_router(training.training_controller)


