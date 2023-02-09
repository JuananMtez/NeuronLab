from typing import Optional

from sqlalchemy.orm import Session
from app.repositories import experiment as experiment_crud, researcher as researcher_crud
from app.models.models import Experiment
from app.schemas.experiment import ExperimentPost, ExperimentResearchers, ExperimentSubjects
from app.models import models
from app.schemas.stimulus import StimulusPost
from app.repositories import subject as subject_crud
import os
import configparser
from cryptography.fernet import Fernet

thisfolder = os.path.dirname(os.path.abspath(__file__))
initfile = os.path.join(thisfolder, '../config/properties.ini')
config = configparser.ConfigParser()
config.read(initfile)

def get_experiment_by_id(db: Session, experiment_id: int) -> models.Experiment:
    e = experiment_crud.find_by_id(db, experiment_id)
    '''
        fernet = Fernet(str.encode(config.get("SECURITY", "key")))
        for csv in e.csvs:
        csv.subject_name = fernet.decrypt(str.encode(csv.subject_name)).decode()
    '''




    return experiment_crud.find_by_id(db, experiment_id)


def get_all_experiments(db: Session) -> list[models.Experiment]:
    e = experiment_crud.find_all(db)
    return e


def create_experiment(db: Session, experiment: ExperimentPost) -> Optional[Experiment]:
    researcher = researcher_crud.find_by_id(db, experiment.researcher_creator_id)
    if researcher is None or is_stimulus_duplicated(experiment.stimuli) or not valid_device(experiment.device.type):
        return None

    db_experiment = models.Experiment(name=experiment.name,
                                      description=experiment.description,
                                      researcher_creator_id=experiment.researcher_creator_id,
                                      epoch_start=experiment.epoch_start,
                                      epoch_end=experiment.epoch_end)

    for x in experiment.stimuli:
        db_experiment.stimuli.append(models.Stimulus(name=x.name,
                                                 description=x.description))

    db_experiment.researchers.append(researcher)

    for subject_id in experiment.subjects:
        subject = subject_crud.find_by_id(db, subject_id)
        if subject is not None:
            db_experiment.subjects.append(subject)

    if experiment.device.type == 'eeg_headset':
        device = models.EEGHeadset(name=experiment.device.name,
                                   sample_rate=experiment.device.sample_rate,
                                   channels_count=experiment.device.channels_count)

        for x in experiment.device.channels:
            channel = models.Channel(channel=x.channel,
                                     position=x.position)
            device.channels.append(channel)

        db_experiment.device = device

    return experiment_crud.save(db, db_experiment)


def delete_experiment(db: Session, experiment_id: int) -> bool:
    experiment = experiment_crud.find_by_id(db, experiment_id)
    if experiment is None:
        return False

    for c in experiment.csvs:
        try:
            os.remove(c.path)
        except:
            pass
    for t in experiment.trainings:
        try:
            os.remove(t.path)
        except:
            pass


        if t.type == 'Deep Learning':
            try:
                os.remove(t.path_accuracy)
            except:
                pass
            try:
                os.remove(t.path_loss)
            except:
                pass

    experiment_crud.delete(db, experiment)
    return True


def add_researchers(db: Session, experiment_id, researchers: ExperimentResearchers) -> bool:
    e = experiment_crud.find_by_id(db, experiment_id)

    if e is None:
        return False

    for researcher_id in researchers.researchers_id:
        r = researcher_crud.find_by_id(db, researcher_id)
        if r is not None:
            e.researchers.append(r)

    experiment_crud.save(db, e)
    return True


def delete_researchers(db: Session, experiment_id, researchers: ExperimentResearchers) -> bool:
    e = experiment_crud.find_by_id(db, experiment_id)

    if e is None:
        return False

    researchers_copy = e.researchers.copy()

    for x in researchers_copy:
        if x.id in researchers.researchers_id:
            e.researchers.remove(x)

    experiment_crud.save(db, e)
    return True


def add_subject(db: Session, experiment_id: int, subjects: ExperimentSubjects) -> bool:
    e = experiment_crud.find_by_id(db, experiment_id)

    if e is None:
        return False

    for subject_id in subjects.subjects_id:
        subject = subject_crud.find_by_id(db, subject_id)
        if subject is not None:
            e.subjects.append(subject)

    experiment_crud.save(db, e)
    return True


def delete_subjects(db: Session, experiment_id, subjects: ExperimentSubjects) -> bool:
    e = experiment_crud.find_by_id(db, experiment_id)

    if e is None:
        return False

    subjects_copy = e.subjects.copy()

    for x in subjects_copy:
        if x.id in subjects.subjects_id:
            e.subjects.remove(x)

    experiment_crud.save(db, e)
    return True


def get_all_experiments_researcher(db: Session, researcher_id: int) -> Optional[list[models.Experiment]]:

    researcher = researcher_crud.find_by_id(db, researcher_id)
    if researcher is None:
        return None

    return researcher.experiments


def is_stimulus_duplicated(stimuli: list[StimulusPost]) -> bool:
    for x in stimuli:
        count = 0
        for y in stimuli:
            if x.name == y.name:
                count = count + 1
        if count > 1:
            return True
    return False


def valid_device(type: str) -> bool:
    if type == 'eeg_headset':
        return True
    return False;




