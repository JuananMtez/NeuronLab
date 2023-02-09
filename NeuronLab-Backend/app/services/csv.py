from typing import Optional, Any

from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models import models
from app.repositories import csv as csv_crud
from app.repositories import experiment as experiment_crud
from app.repositories import subject as subject_crud
import random
from datetime import datetime, timedelta
import os
from app.schemas.csv import CSVCopy, CSVFilters
from app.schemas.preproccessing import ICAMethod, ICAExclude
from app.schemas.feature_extraction import FeaturePost
import json
import numpy as np
import pandas as pd
from mne.io import RawArray
import mne
import base64
import app.repositories.training as training_crud
from app.schemas.epoch import EpochPlot, EpochAverage, EpochCompare, EpochActivity, EpochPSD
import matplotlib.pyplot as plt
import math
import shutil
from scipy.integrate import simps
from cryptography.fernet import Fernet
import os
import configparser
import random

thisfolder = os.path.dirname(os.path.abspath(__file__))
initfile = os.path.join(thisfolder, '../config/properties.ini')
config = configparser.ConfigParser()
config.read(initfile)


def get_csv_by_id(db: Session, csv_id: int) -> Optional[models.CSV]:
    csv = csv_crud.find_by_id(db, csv_id)
    return csv


def get_all_csv_preproccessing(db: Session, csv_id: int) -> Optional[list[models.Preproccessing]]:
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    return csv.preproccessing_list


def get_csv_feature(db: Session, csv_id: int) -> Optional[models.FeatureExtraction]:
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    return csv.feature


def get_all_csv_experiment(db: Session, experiment_id: int) -> Optional[list[models.Experiment]]:
    e = experiment_crud.find_by_id(db, experiment_id)
    '''
    fernet = Fernet(str.encode(config.get("SECURITY", "key")))

    for csv in e.csvs:
        csv.subject_name = fernet.decrypt(str.encode(csv.subject_name)).decode()
    '''

    if e is None:
        return None
    return e.csvs


def create_csv(db: Session, name: str, subject_id: int, subject_name: str, experiment_id: int,
               time_correction: float, files: list[UploadFile]) -> Optional[models.CSV]:
    exp = experiment_crud.find_by_id(db, experiment_id)
    subject = subject_crud.find_by_id(db, subject_id)
    if exp is None or subject is None:
        return None

    object = {
        "dataInput": [],
        "timestamp": [],
        "stimuli": []
    }

    for file in files:
        aux = json.loads(file.file.read())
        object["dataInput"].extend(aux["dataInput"])
        object["timestamp"].extend(aux["timestamp"])
        object["stimuli"].extend(aux["stimuli"])

        for stimulus in object["stimuli"]:
            cont = 0
            for stim in exp.stimuli:
                if stimulus[0][0] != int(stim.name):
                    cont += 1
            if cont == len(exp.stimuli):
                return None

    name_file = generate_name_csv(db)
    df = None
    if exp.device.type == 'eeg_headset':
        df = create_csv_eegheadset(object, exp, name_file, time_correction)

    rawdata = load_raw(df, exp)

    events = mne.find_events(rawdata, shortest_event=1)
    event_id = {}
    for stimulus in exp.stimuli:
        event_id[stimulus.description] = int(stimulus.name)

    epochs = mne.Epochs(rawdata, events=events, event_id=event_id, tmin=exp.epoch_start, tmax=exp.epoch_end, on_missing='ignore')

    str_epoch_list = str(epochs).split(',')
    str_epoch = str_epoch_list[len(str_epoch_list)-1].replace('\n', '').replace('\'', '')
    str_epoch = str_epoch[1:]
    str_epoch = str_epoch[:-1]
    '''
    fernet = Fernet(str.encode(config.get("SECURITY", "key")))
    subject_encrypted = fernet.encrypt(str(subject.name + ' ' + subject.surname).encode())
    '''


    db_csv = models.CSV(name=name,
                        subject_name=subject_name,
                        type='original',
                        experiment_id=experiment_id,
                        path=name_file,
                        date=name_file[12:31],
                        duraction=int(df.shape[0]/exp.device.sample_rate),
                        events=len(events),
                        epochs=str_epoch)

    subject_crud.save(db, subject)

    return csv_crud.save(db, db_csv)


def delete_csv(db: Session, csv_id: int) -> bool:
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return False
    try:
        os.remove(csv.path)
    except FileNotFoundError:
        pass

    for training in csv.trainings:
        try:
            os.remove(training.path)
        except:
            pass


        if training.type == 'Deep Learning':
            try:
                os.remove(training.path_accuracy)
            except:
                pass
            try:
                os.remove(training.path_loss)
            except:
                pass

        if len(training.csvs) == 1:
            training_crud.delete(db, training)

    csv_crud.delete(db, csv)
    return True


def csv_copy(db: Session, csv_id: int, csv_copy: CSVCopy) -> Optional[models.CSV]:

    csv_original = csv_crud.find_by_id(db, csv_id)

    if csv_original is None:
        return None

    name_file = generate_name_csv(db)
    try:
        shutil.copyfile(csv_original.path, name_file)

        db_csv = models.CSV(name=csv_copy.name,
                            subject_name=csv_original.subject_name,
                            type='copied',
                            experiment_id=csv_original.experiment_id,
                            path=name_file,
                            date=name_file[12:31],
                            duraction=csv_original.duraction,
                            epochs=csv_original.epochs,
                            events=csv_original.events)

        for x in csv_original.preproccessing_list:
            db_preproccessing = models.Preproccessing(
                position=x.position,
                preproccessing=x.preproccessing,
                csv_id=db_csv.id,
                description=x.description)
            db_csv.preproccessing_list.append(db_preproccessing)
        return csv_crud.save(db, db_csv)

    except:
        return None


def change_name(db: Session, csv_id: int, csv_copy: CSVCopy) -> Optional[models.CSV]:
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    csv.name = csv_copy.name
    return csv_crud.save(db, csv)


def apply_preproccessing(db: Session, csv_filters: CSVFilters):
    exp = None
    text = ""
    for csv_id in csv_filters.csvs:
        csv = csv_crud.find_by_id(db, csv_id)
        if csv is not None:
            try:
                if exp is None:
                    exp = experiment_crud.find_by_id(db, csv.experiment_id)
                df = pd.read_csv(csv.path)
                rawdata = load_raw(df, exp)
                del df
                if rawdata is not None:
                    for prep in csv_filters.preproccessings:
                        if prep.__class__.__name__ == 'CSVBandpass':
                            rawdata = apply_bandpass(prep, rawdata, csv)
                        elif prep.__class__.__name__ == 'CSVNotch':
                            rawdata = apply_notch(prep, rawdata, csv)
                        elif prep.__class__.__name__ == 'CSVDownsampling':
                            rawdata = apply_downsampling(prep, rawdata, csv)
                    try:
                        os.remove(csv.path)
                    except FileNotFoundError:
                        pass
                    csv.path = generate_name_csv(db)
                    csv.date = csv.path[12:31]
                    csv.type = 'prep'

                    ch_names = []
                    for x in exp.device.channels:
                        ch_names.append(x.channel.name)
                    data = convert_to_df(rawdata, ch_names)

                    data.to_csv(csv.path, index=False)
                    csv.duraction = data.shape[0]/exp.device.sample_rate
                    csv_crud.save(db, csv)
                    text += csv.name + ": Preproccessing applied\n"


            except ValueError:
                text += csv.name + ": Check frequency values\n"
            except np.linalg.LinAlgError:
                text += csv.name + ": Array must not contain infs or NaNs\n"

    return text

def load_raw(df, experiment):

    if experiment.device.type == 'eeg_headset':

        ch_names = list(df.columns)[0:experiment.device.channels_count] + ['Stim']
        ch_types = ['eeg'] * experiment.device.channels_count + ['stim']

        ch_ind = []
        for x in range(0, experiment.device.channels_count):
            ch_ind.append(x)

        data = df.values[:, ch_ind + [experiment.device.channels_count]].T

        info = mne.create_info(ch_names=ch_names, ch_types=ch_types, sfreq=experiment.device.sample_rate)
        raw = RawArray(data=data, info=info)
        raw.set_montage('standard_1020')
        return raw

    return None


def apply_feature(db: Session, feature_post: FeaturePost):
    exp = None
    new_df = None
    text = ""
    for csv_id in feature_post.csvs:
        csv = csv_crud.find_by_id(db, csv_id)
        if csv is None:
            break
        if exp is None:
            exp = experiment_crud.find_by_id(db, csv.experiment_id)
        try:

            if feature_post.feature == 'nothing':
                new_df = pd.read_csv(csv.path)


                db_f = models.FeatureExtraction(
                    csv_id=csv.id,
                    feature="Nothing")
                csv.feature = db_f

            else:

                df = pd.read_csv(csv.path)

                rawdata = load_raw(df, exp)
                epochs = get_epoch(rawdata, exp)


                if feature_post.feature == 'mean':
                    data_epochs = epochs.get_data()
                    del rawdata
                    del df
                    del epochs

                    new_df = apply_mean(exp, data_epochs)
                    db_f = models.FeatureExtraction(
                        csv_id=csv.id,
                        feature="Mean")
                    csv.feature= db_f

                elif feature_post.feature == 'variance':
                    data_epochs = epochs.get_data()
                    del rawdata
                    del df
                    del epochs
                    new_df = apply_variance(exp, data_epochs)
                    db_f = models.FeatureExtraction(
                        csv_id=csv.id,
                        feature="Variance")
                    csv.feature = db_f

                elif feature_post.feature == 'deviation':
                    data_epochs = epochs.get_data()
                    del rawdata
                    del df
                    del epochs
                    new_df = apply_standard_deviation(exp, data_epochs)
                    db_f = models.FeatureExtraction(
                        csv_id=csv.id,
                        feature="Standard Deviation")
                    csv.feature = db_f

                else: #Always is PSD
                    del rawdata
                    del df
                    new_df = apply_psd(exp, epochs, feature_post.feature)
                    bands = feature_post.feature.split(',')
                    band_text = ""
                    for band in bands:
                        band_text += band + ", "
                    band_text = band_text[:-2]
                    db_f = models.FeatureExtraction(
                        csv_id=csv.id,
                        feature="Power Spectral Density (" + band_text + ")")
                    csv.feature = db_f

            os.remove(csv.path)
            csv.path = generate_name_csv(db)
            csv.date = csv.path[12:31]
            new_df.to_csv(csv.path, index=False)

            csv.duraction = 0

            if csv.type == 'prep':
                csv.type = 'prep | feature'
            else:
                csv.type = 'feature'

            csv_crud.save(db, csv)
            text += csv.name + ": Extraction applied\n"

        except:
            text += csv.name + ": An error has ocurred\n"
    return text


def generate_name_csv(db: Session):

    now = datetime.now()
    name_file = "csvs/record_{}.csv".format(now.strftime("%d-%m-%Y-%H-%M-%S"))
    while csv_crud.find_by_path(db, name_file):
        now = datetime.now() + timedelta(seconds=1)
        name_file = "csvs/record_{}.csv".format(now.strftime("%d-%m-%Y-%H-%M-%S"))

    return name_file


def generate_name_tmp():
    now = datetime.now()
    return "tmp/record_{}.png".format(now.strftime("%d-%m-%Y-%H-%M-%S"))


def create_csv_eegheadset(obj: Any, exp: models.Experiment,
                          name_file: str, time_correction: float):
    ch_names = []
    for x in exp.device.channels:
        ch_names.append(x.channel.name)

    obj["dataInput"] = np.concatenate(obj["dataInput"], axis=0)
    if len(ch_names) > 8:
        obj["dataInput"] = obj["dataInput"][:, :8]

    obj["timestamp"] = np.array(obj["timestamp"]) + time_correction
    data = pd.DataFrame(data=obj["dataInput"], columns= ch_names)

    if len(obj["stimuli"]) != 0:
        data.loc[:, 'Stimulus'] = 0
        for estim in obj["stimuli"]:
            abs = np.abs(estim[1] - obj["timestamp"])
            ix = np.argmin(abs)
            data.loc[ix, 'Stimulus'] = estim[0][0]

    data.to_csv(name_file, index=False)

    return data


def apply_bandpass(prep, rawdata, new_csv):
    l_freq = None
    h_freq = None
    text = ''

    if prep.low_freq != '':
        l_freq = float(prep.low_freq)
        text = text + 'Low Frequency: ' + prep.low_freq + 'Hz '

    if prep.high_freq != '':
        h_freq = float(prep.high_freq)
        text = text + 'High Frequency: ' + prep.high_freq + 'Hz '

    if prep.filter_method == 'fir':
        db_preproccessing = models.Preproccessing(
                                position=len(new_csv.preproccessing_list) + 1,
                                preproccessing='Bandpass',
                                csv_id=new_csv.id,
                                description='Method: FIR, ' + 'Phase: ' + prep.phase + ', ' + text)
        new_csv.preproccessing_list.append(db_preproccessing)

        return rawdata.copy().filter(l_freq=l_freq, h_freq=h_freq,
                                      method='fir', fir_design='firwin', phase=prep.phase)

    elif prep.filter_method == 'iir':
        if prep.order == '1':
            ordinal = 'st'
        elif prep.order == '2':
            ordinal = 'nd'
        else:
             ordinal = 'th'

        db_preproccessing = models.Preproccessing(
                                position=len(new_csv.preproccessing_list) + 1,
                                preproccessing='Bandpass',
                                csv_id=new_csv.id,
                                description='Method: IIR, ' + prep.order + ordinal + '-order Butterworth filter, ' + text)
        new_csv.preproccessing_list.append(db_preproccessing)

        iir_params = dict(order=int(prep.order), ftype='butter')
        return rawdata.copy().filter(l_freq=l_freq, h_freq=h_freq,
                                      method='iir', iir_params=iir_params)


def apply_notch(prep, rawdata, new_csv):

    if prep.filter_method == 'fir':
        db_preproccessing = models.Preproccessing(
                                position=len(new_csv.preproccessing_list) + 1,
                                preproccessing='Notch',
                                csv_id=new_csv.id,
                                description='Method: FIR, ' + 'Phase: ' + prep.phase + ', ' + 'Frequency: ' + prep.freq + 'Hz')
        new_csv.preproccessing_list.append(db_preproccessing)

        return rawdata.copy().notch_filter(freqs=float(prep.freq), method='fir', fir_design='firwin', phase=prep.phase)

    elif prep.filter_method == 'iir':
        if prep.order == '1':
            ordinal = 'st'
        elif prep.order == '2':
            ordinal = 'nd'
        else:
             ordinal = 'th'

        db_preproccessing = models.Preproccessing(
            position=len(new_csv.preproccessing_list) + 1,
            preproccessing='Notch',
            csv_id=new_csv.id,
            description='Method: IIR, ' + prep.order + ordinal + '-order Butterworth filter, ' + 'Frequency: ' + prep.freq + 'Hz')
        new_csv.preproccessing_list.append(db_preproccessing)

        iir_params = dict(order=int(prep.order), ftype='butter')
        return rawdata.copy().notch_filter(freqs=float(prep.freq), method='iir', iir_params=iir_params)


def apply_downsampling(prep, rawdata, new_csv):
    db_preproccessing = models.Preproccessing(
        position=len(new_csv.preproccessing_list) + 1,
        preproccessing='Downsampling',
        csv_id=new_csv.id,
        description='Sample rate: ' + prep.freq_downsampling + ' Hz')
    new_csv.preproccessing_list.append(db_preproccessing)

    return rawdata.copy().resample(prep.freq_downsampling, npad="auto")


def convert_to_df(rawdata, ch_names) -> pd.DataFrame:
    return pd.DataFrame(data=rawdata.get_data().T, columns=ch_names + ['Stimulus'])


def plot_properties_ica(db: Session, csv_id, ica_method: ICAMethod):
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)
    del df
    fit_params = None
    if ica_method.method == 'picard':
        fit_params = dict(ortho=True, extended=True)
    elif ica_method.method == 'infomax':
        fit_params = dict(extended=True)

    ica = mne.preprocessing.ICA(random_state=97, method=ica_method.method, fit_params=fit_params)
    ica.fit(rawdata)
    shape = ica.get_components()
    picks = []
    for x in range(0, shape.shape[1]):
        picks.append(x)

    figures = ica.plot_properties(rawdata.copy(), picks=picks)
    returned = []
    for x in figures:
        name_tmp = generate_name_tmp()
        x.savefig(name_tmp)
        with open(name_tmp, 'rb') as f:
            returned.append(base64.b64encode(f.read()))
            os.remove(name_tmp)

    return returned


def plot_components_ica(db: Session, csv_id: int, ica_method: ICAMethod):
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)
    del df
    fit_params = None
    if ica_method.method == 'picard':
        fit_params = dict(ortho=True, extended=True)
    elif ica_method.method == 'infomax':
        fit_params = dict(extended=True)

    ica = mne.preprocessing.ICA(random_state=97, method=ica_method.method, fit_params=fit_params)
    ica.fit(rawdata)
    figure = ica.plot_components()

    name_tmp = generate_name_tmp()
    figure[0].savefig(name_tmp)
    shape = ica.get_components()
    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    returned = {"img": base64image, "components": shape.shape[1]}
    return returned


def components_exclude_ica(db: Session, csv_id: int, arg: ICAExclude):
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)
    del df
    fit_params = None
    if arg.method == 'picard':
        fit_params = dict(ortho=True, extended=True)
    elif arg.method == 'infomax':
        fit_params = dict(extended=True)

    ica = mne.preprocessing.ICA(random_state=97, method=arg.method, fit_params=fit_params)
    ica.fit(rawdata)

    ica.exclude = arg.components
    ica.apply(rawdata.copy())


    text = 'Components removed: '
    for x in arg.components:
        text = text + str(x) + ", "

    text = text[:-1]
    text = text[:-1]

    db_preproccessing = models.Preproccessing(
        position=len(csv.preproccessing_list) + 1,
        preproccessing='ICA',
        csv_id=csv.id,
        description=text)
    csv.preproccessing_list.append(db_preproccessing)


    ch_names = []
    for x in exp.device.channels:
        ch_names.append(x.channel.name)
    data = convert_to_df(rawdata, ch_names)

    os.remove(csv.path)
    csv.path = generate_name_csv(db)
    csv.date = csv.path[12:31]
    csv.type = 'prep'
    csv.duraction = data.shape[0]/exp.device.sample_rate

    data.to_csv(csv.path, index=False)

    csv_crud.save(db, csv)


def get_csvs_same_features(db: Session, csv_id: int)-> Optional[list[models.CSV]]:
    csv = csv_crud.find_by_id(db, csv_id)
    if csv is None:
        return None
    all_csv = csv_crud.find_all_by_experiment(db, csv.experiment_id)
    returned = []

    for c in all_csv:
        if c.id != csv.id and c.feature is not None and c.feature.feature == csv.feature.feature:
            returned.append(c)

    return returned


def apply_mean(exp, data_epochs):


    array = []

    for estim in (range(len(data_epochs))):
        value_estim = 0
        row = []
        for x in (range(len(data_epochs[estim]) - 1) ):
            sum = 0
            for y in (range(len(data_epochs[estim][x]))):
                sum = sum + data_epochs[estim][x][y]
                if data_epochs[estim][len(data_epochs[estim]) - 1][y] != 0:
                    value_estim = data_epochs[estim][len(data_epochs[estim]) - 1][y]
            row.append(sum/len(data_epochs[estim][x]))
        row.append(value_estim)
        array.append(row)

    ch_names = []
    for x in exp.device.channels:
        ch_names.append(x.channel.name + '_mean')
    return pd.DataFrame(array, columns=ch_names + ['Stimulus'])



def apply_variance(exp, data_epochs):


    array = []

    for estim in (range(len(data_epochs))):
        value_estim = 0
        row = []
        for x in (range(len(data_epochs[estim]) - 1)):

            sum = 0
            var = 0

            for y in (range(len(data_epochs[estim][x]))):
                sum = sum + data_epochs[estim][x][y]
                if data_epochs[estim][len(data_epochs[estim]) - 1][y] != 0:
                    value_estim = data_epochs[estim][len(data_epochs[estim]) - 1][y]
            mean = (sum / len(data_epochs[estim][x]))

            for y2 in (range(len(data_epochs[estim][x]))):
                var = (data_epochs[estim][x][y2] - mean)**2
            row.append(var/len(data_epochs[estim][x]))

        row.append(value_estim)
        array.append(row)

    ch_names = []
    for x in exp.device.channels:
        ch_names.append(x.channel.name + '_variance')
    return pd.DataFrame(array, columns=ch_names + ['Stimulus'])


def apply_standard_deviation (exp, data_epochs):

    array = []

    for estim in (range(len(data_epochs))):
        value_estim = 0
        row = []
        for x in (range(len(data_epochs[estim]) - 1)):

            sum = 0
            var = 0

            for y in (range(len(data_epochs[estim][x]))):
                sum = sum + data_epochs[estim][x][y]
                if data_epochs[estim][len(data_epochs[estim]) - 1][y] != 0:
                    value_estim = data_epochs[estim][len(data_epochs[estim]) - 1][y]
            mean = (sum / len(data_epochs[estim][x]))

            for y2 in (range(len(data_epochs[estim][x]))):
                var = (data_epochs[estim][x][y2] - mean) ** 2
            row.append(math.sqrt(var / len(data_epochs[estim][x])))

        row.append(value_estim)
        array.append(row)

    ch_names = []
    for x in exp.device.channels:
        ch_names.append(x.channel.name + '_deviation_standard')
    return pd.DataFrame(array, columns=ch_names + ['Stimulus'])


def apply_psd(exp, epochs, bands):
    bands_array = bands.split(',')

    psds, freqs = mne.time_frequency.psd_welch(epochs, n_per_seg=256, picks='eeg')
    freq_result = freqs[1] - freqs[0]
    ch_names = []

    result = []
    for i in range(len(psds)): # Epoch
        epoch = []

        for band in bands_array:
            low = 0
            high = 0
            if band == 'gamma':
                low = 30
                high = 100
            elif band == 'beta':
                low = 12
                high = 30
            elif band == 'alpha':
                low = 8
                high = 12
            elif band == 'theta':
                low = 4
                high = 8
            elif band == 'delta':
                low = 1
                high = 4
            idx_band = np.logical_and(freqs >= low, high <= freqs)
            for j in range(len(psds[i])): # Channel
                bp = simps(psds[i][j][idx_band], dx=freq_result)
                epoch.append(bp)

        z = 0
        stim = -1
        epochs_data = epochs.get_data()
        while (z < len(epochs_data[i][len(epochs_data[i]) -1]) and stim == -1):
            if epochs_data[i][len(epochs_data[i]) -1][z] != 0:
                stim = epochs_data[i][len(epochs_data[i]) -1][z]
            z = z +1

        if stim != -1:
            epoch.append(stim)
        result.append(epoch)

    for band in bands_array:
        for ch in exp.device.channels:
            ch_names.append(ch.channel.name + '_' + band)

    return pd.DataFrame(result, columns=ch_names + ['Stimulus'])


def plot_chart(db: Session, csv_id: int, beginning:int, duraction:int):

    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)

    file = pd.read_csv(csv.path)

    values = file.iloc[int(beginning * exp.device.sample_rate): int((beginning * exp.device.sample_rate) + (duraction * exp.device.sample_rate))].transpose().values.tolist()
    del file



    returned = []


    for i in (range(len(values) - 1)):
        unidimensional = []
        for j in (range(len(values[i]))):
            dict = {"pv": values[i][j] }
            unidimensional.append(dict)
        returned.append(unidimensional)


    stimulus = []
    for i in (range(len(values[len(values)-1]))):
        if values[len(values)-1][i] != 0:
            stimulus.append({"x": i, "stim": values[len(values)-1][i]})

    returned.append(stimulus)
    return returned


def plot_epochs(db: Session, csv_id: int, epoch_plot: EpochPlot):

    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)
    epochs = get_epoch(rawdata, exp)

    del df
    del rawdata


    figure = epochs.plot(n_epochs=epoch_plot.n_events, scalings='auto', block=True)
    figure.set_size_inches(11.5, 7.5)

    name_tmp = generate_name_tmp()
    figure.savefig(name_tmp)

    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    return base64image


def plot_average_epoch(db: Session, csv_id: int, epoch_average: EpochAverage):

    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)

    epochs = get_epoch(rawdata, exp)

    del df
    del rawdata

    average = epochs[epoch_average.stimulus].average()
    name_tmp = generate_name_tmp()
    figure = average.plot(picks=epoch_average.channel, titles=dict(eeg='Channel ' + epoch_average.channel + ', Stimulus: ' + epoch_average.stimulus))
    figure.set_size_inches(11.5, 5)

    figure.savefig(name_tmp)

    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    return base64image


def plot_compare(db: Session, csv_id: int, epoch_compare: EpochCompare):

    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)

    epochs = get_epoch(rawdata, exp)

    del df
    del rawdata

    average = epochs[epoch_compare.stimulus].average()
    name_tmp = generate_name_tmp()

    figure, ax = plt.subplots()

    mne.viz.plot_compare_evokeds(dict(target=average), axes=ax, title='Stimulus: ' + epoch_compare.stimulus,
                                show_sensors='upper right')
    figure.set_size_inches(11.5, 5)

    figure.savefig(name_tmp)

    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    return base64image


def plot_activity_brain(db: Session, csv_id: int, epoch_activity: EpochActivity):

    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)
    rawdata = load_raw(df, exp)

    epochs = get_epoch(rawdata, exp)
    del df
    del rawdata
    average = epochs[epoch_activity.stimulus].average()
    name_tmp = generate_name_tmp()

    figure = average.plot_topomap(times=epoch_activity.times, ch_type='eeg', extrapolate=epoch_activity.extrapolate)

    figure.set_size_inches(11.5, 5)

    figure.savefig(name_tmp)

    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    return base64image


def get_epoch(rawdata, exp):

    events = mne.find_events(rawdata, shortest_event=1)
    event_id = {}
    for stimulus in exp.stimuli:
        event_id[stimulus.description] = int(stimulus.name)

    return mne.Epochs(rawdata, events=events, event_id=event_id, tmin=exp.epoch_start, tmax=exp.epoch_end,
                        preload=True, on_missing='ignore')


def plot_psd_topomap(db: Session, csv_id: int):
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)

    epochs = get_epoch(rawdata, exp)

    figure = epochs.plot_psd_topomap(ch_type='eeg', normalize=False)

    del df
    del rawdata
    name_tmp = generate_name_tmp()


    figure.set_size_inches(11.5, 3)

    figure.savefig(name_tmp)

    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    return base64image


def plot_psd_chart(db: Session, csv_id: int, psd_chart: EpochPSD):
    csv = csv_crud.find_by_id(db, csv_id)

    if csv is None:
        return None

    exp = experiment_crud.find_by_id(db, csv.experiment_id)
    if exp is None:
        return None

    df = pd.read_csv(csv.path)

    rawdata = load_raw(df, exp)

    epochs = get_epoch(rawdata, exp)

    figure = epochs.plot_psd(fmin=psd_chart.f_min, fmax=psd_chart.f_max, average=psd_chart.average, spatial_colors=False)

    del df
    del rawdata
    name_tmp = generate_name_tmp()


    figure.set_size_inches(11.5, 3)

    figure.savefig(name_tmp)

    with open(name_tmp, 'rb') as f:
        base64image = base64.b64encode(f.read())
    os.remove(name_tmp)
    return base64image
