from sqlalchemy import Column, Integer, String, ForeignKey, Float, Enum, Table, Boolean, Text
from sqlalchemy.orm import relationship
from app.config.database import Base
import enum


class NameChannel(enum.Enum):
    Fp1 = 1
    Fpz = 2
    Fp2 = 3
    AF9 = 4
    AF7 = 5
    AF5 = 6
    AF3 = 7
    AF1 = 8
    AFz = 9
    AF2 = 10
    AF4 = 11
    AF6 = 12
    AF8 = 13
    AF10 = 14
    F9 = 15
    F7 = 16
    F5 = 17
    F3 = 18
    F1 = 19
    Fz = 20
    F2 = 21
    F4 = 22
    F6 = 23
    F8 = 24
    F10 = 25
    FT9 = 26
    FT7 = 27
    FC5 = 28
    FC3 = 29
    FC1 = 30
    FCz = 31
    FC2 = 32
    FC4 = 33
    FC6 = 34
    FT8 = 35
    FT10 = 36
    T9 = 37
    T7 = 38
    C5 = 39
    C3 = 40
    C1 = 41
    Cz = 42
    C2 = 43
    C4 = 44
    C6 = 45
    T8 = 46
    T10 = 47
    TP9 = 48
    TP7 = 49
    CP5 = 50
    CP3 = 51
    CP1 = 52
    CPz = 53
    CP2 = 54
    CP4 = 55
    CP6 = 56
    TP8 = 57
    TP10 = 58
    P9 = 59
    P7 = 60
    P5 = 61
    P3 = 62
    P1 = 63
    Pz = 64
    P2 = 65
    P4 = 66
    P6 = 67
    P8 = 68
    P10 = 69
    PO9 = 70
    PO7 = 71
    PO5 = 72
    PO3 = 73
    PO1 = 74
    POZ = 75
    PO2 = 76
    PO4 = 77
    PO6 = 78
    PO8 = 79
    PO10 = 80
    O1 = 81
    Oz = 82
    O2 = 83
    O9 = 84
    Iz = 85
    O10 = 86
    T3 = 87
    T5 = 88
    T4 = 89
    T6 = 90
    M1 = 91
    M2 = 92
    A1 = 93
    A2 = 94



Researcher_Experiment = Table('researcher_experiment', Base.metadata,
                              Column('researcher_id', ForeignKey('researcher.id'), primary_key=True),
                              Column('experiment_id', ForeignKey('experiment.id'), primary_key=True))

Experiment_Subject = Table('experiment_subject', Base.metadata,
                           Column('experiment_id', ForeignKey('experiment.id'), primary_key=True),
                           Column('subject_id', ForeignKey('subject.id'), primary_key=True))


class Researcher(Base):
    __tablename__ = 'researcher'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    surname = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    user = Column(String(255), unique=True, index=True)
    password = Column(String(255), index=True)

    experiments = relationship(
        "Experiment",
        secondary=Researcher_Experiment,
        back_populates="researchers")


class Experiment(Base):
    __tablename__ = 'experiment'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(String(255))
    researcher_creator_id = Column(Integer)
    epoch_start = Column(Float)
    epoch_end = Column(Float)

    stimuli = relationship("Stimulus", cascade="save-update, delete")

    device = relationship("Device", back_populates="experiment", uselist=False, cascade="save-update, delete")

    researchers = relationship(
        "Researcher",
        secondary=Researcher_Experiment,
        back_populates="experiments")

    subjects = relationship(
        "Subject",
        secondary=Experiment_Subject,
        back_populates="experiments")

    csvs = relationship("CSV", cascade="save-update, delete")

    trainings = relationship("Training", cascade="save-update, delete")


class Stimulus(Base):
    __tablename__ = 'stimulus'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(String(255))
    experiment_id = Column(Integer, ForeignKey('experiment.id'))


class Device(Base):
    __tablename__ = 'device'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    sample_rate = Column(Float)

    experiment_id = Column(Integer, ForeignKey('experiment.id'))
    experiment = relationship("Experiment", back_populates="device")

    type = Column(String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'device',
        'polymorphic_on': type
    }


class EEGHeadset(Device):
    __tablename__ = 'eeg_headset'

    id = Column(Integer, ForeignKey('device.id'), primary_key=True, index=True)
    channels = relationship("Channel", cascade="save-update, delete")
    channels_count = Column(Integer)

    __mapper_args__ = {
        'polymorphic_identity': 'eeg_headset',
    }


class Channel(Base):
    __tablename__ = 'channel'

    id = Column(Integer, primary_key=True, index=True)
    channel = Column("channel", Enum(NameChannel))
    position = Column(Integer)

    eeg_headset_id = Column(Integer, ForeignKey('eeg_headset.id'))


class Subject(Base):
    __tablename__ = 'subject'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    surname = Column(String(255))
    gender = Column(String(10))
    age = Column(Integer)


    mental_conditions = relationship("MentalCondition", cascade="save-update, delete")
    experiments = relationship(
        "Experiment",
        secondary=Experiment_Subject,
        back_populates="subjects")


class MentalCondition(Base):
    __tablename__ = 'mental_condition'

    id = Column(Integer, primary_key=True, index=True)
    condition = Column(String(255), index=True)
    subject_id = Column(Integer, ForeignKey('subject.id'))


CSV_Training = Table('csv_training', Base.metadata,
         Column('csv_id', ForeignKey('csv.id'), primary_key=True),
         Column('training_id', ForeignKey('training.id'), primary_key=True))


class CSV(Base):
    __tablename__ = 'csv'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    path = Column(String(255), unique=True)
    type = Column(String(255), index=True)
    subject_name = Column(String(255), index=True)
    date = Column(String(255), unique=True)
    duraction = Column(Integer)

    epochs = Column(String(255))
    events = Column(Integer)



    experiment_id = Column(Integer, ForeignKey('experiment.id'))

    preproccessing_list = relationship("Preproccessing", cascade="save-update, delete")
    feature = relationship("FeatureExtraction", back_populates="csv", uselist=False, cascade="save-update, delete")




    trainings = relationship(
        "Training",
        secondary=CSV_Training,
        back_populates="csvs")


class Preproccessing(Base):
    __tablename__ = 'preproccessing'

    id = Column(Integer, primary_key=True, index=True)
    position = Column(Integer, index=True)
    preproccessing = Column(String(255))
    description = Column(String(255))
    csv_id = Column(Integer, ForeignKey('csv.id'))


class FeatureExtraction(Base):
    __tablename__ = 'feature_extraction'

    id = Column(Integer, primary_key=True, index=True)
    feature = Column(String(255))
    csv_id = Column(Integer, ForeignKey('csv.id'), nullable=True)
    csv = relationship("CSV", back_populates="feature")


class Training(Base):
    __tablename__ = 'training'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    description = Column(Text())
    feature = Column(String(50))
    path = Column(String(255), unique=True)
    experiment_id = Column(Integer, ForeignKey('experiment.id'))
    type = Column(String(50))
    validation = Column(Text())
    path_accuracy = Column(String(255), nullable=True)
    path_loss = Column(String(255), unique=True, nullable=True)



    csvs = relationship(
        "CSV",
        secondary=CSV_Training,
        back_populates="trainings")
