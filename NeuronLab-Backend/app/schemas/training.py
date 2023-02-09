from pydantic import BaseModel
from typing import Union, Optional




class KNN(BaseModel):
    n_neighbors: int


class RandomForest(BaseModel):
    n_estimators: int



class SVM(BaseModel):
    kernel: str


algorithm_machine = Union[KNN, RandomForest, SVM]

class LayerPost(BaseModel):
    num_neurons: int
    activation_func: str
    type: str

class LayerFirstPost(LayerPost):
    kernel_initializer: str
    batch_size: str
    input_size: str

layer = Union[LayerFirstPost, LayerPost]

class DeepLearningPost(BaseModel):
    csvs: list[int]
    name: str
    training_data: float
    testing_data: float

    exp_id: int
    optimizer: str
    learning_rate: float
    type: str
    layers: list[layer]
    loss: str
    epochs: int


class MachineLearningPost(BaseModel):
    csvs: list[int]
    name: str
    testing_data: float
    training_data: float
    algorithm: algorithm_machine
    exp_id: int

class TrainingResponse(BaseModel):
    id: int
    name: str
    description: str
    type: str
    validation: str
    path_accuracy: Optional[str]
    path_loss: Optional[str]

    class Config:
        orm_mode = True

class PredictResponse(BaseModel):
    text: str
