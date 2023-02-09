import { Button, Grid, Stack, Box, Chip } from "@mui/material"
import { useState } from "react"
import TableCSVPositions from "../DataCSV/TableCSVPositions"
import { CustomSelect, StyledOption } from "../Select/CustomSelect";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled";
import InputAdornment from '@mui/material/InputAdornment';
import DialogStyled from '../Dialog/DialogStyled'



const TrainingForm = ({ csv, experiment }) => {
  const [learning, setLearning] = useState('')
  const [algorithmMachine, setAlgorithmMachine] = useState('')
  const [knnNeigbour, setKnnNreigbour] = useState(0)
  const [randomForest, setRandomeForest] = useState({n_estimators: 0})
  const [svm, setSvm] = useState('')
  const [percent, setPercent] = useState({training_data: 0, testing_data: 0})
  const [name, setName] = useState('')
  const [csvsSelected, setCsvsSelected] = useState([])
  const [open, setOpen] = useState(false)
  const [modelData, setModelData] = useState({optimizer: '', loss: '', epochs: ''})
  const [byDefault, setByDefault] = useState('')
  const [learningRate, setLearningRate] = useState(0)
  const [layers, setLayers] = useState([])
  const [layer, setLayer] = useState({type:'', num_neurons: '', kernel_initializer: '', batch_size:'', input_size: '', activation_func:''})

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleName = (e) => setName(e.target.value)



  const handleTrainingBtn = () => {

    let list = [...csvsSelected, csv.id]


    let data = {name: name, csvs: list, testing_data: percent.testing_data, training_data: percent.training_data, exp_id: experiment.id}
    let algorithm;
    if (learning === 'machine') {
      switch(algorithmMachine){
        case 'KNN':
          algorithm = {n_neighbors: knnNeigbour}
          break
        case 'Random Forest':
          algorithm = {n_estimators: randomForest.n_estimators}
          break
        case 'SVM':
          algorithm = {kernel: svm}
          break
          
        default:
          break

      } 
      window.api.applyTrainingMachine({...data, algorithm: algorithm})


    }
    else if (learning === 'deep') {
      data = {
        ...data,
        optimizer: modelData.optimizer, 
        loss: modelData.loss,
        epochs: modelData.epochs,
        layers: layers
      }

      if (byDefault === 'manual')
        data = {...data, type: 'manual', learning_rate: learningRate}
      else
        data = {...data, type: 'default', learning_rate: 0}

      window.api.applyTrainingDeep(data)

    }
    

    setOpen(false)
    setLearning('')
    setAlgorithmMachine('')
    setKnnNreigbour(0)
    setRandomeForest({n_estimators: 0})
    setSvm('')
    setPercent({training_data: 0, testing_data: 0})
    setName('')
 
    setModelData({optimizer: '', loss: '', epochs: ''})
    setByDefault('')
    setLearningRate(0)
    setLayers([])
    setLayer({type:'', num_neurons: '', kernel_initializer: '', activation_func:'', input_size: '', batch_size: ''})
  }
  const handleDeleteChip = (e, index) => {
    if (index !== 0) {
      let list = [...layers]
      list.splice(index, 1)
      setLayers(list)
      
      if (list.length === 0)
        setLayer({...layer, kernel_initializer: '', batch_size:'', input_size: ''})

      
    } else  {
      setLayers([])
      setLayer({...layer, kernel_initializer: '', batch_size:'', input_size: ''})
    }

  }
  

  function renderValue(option, text) {
    if (option == null) {
      return <span>{text}</span>;
    }
  
    return (
      <span>
        {option.label}
      </span>
    );
  }

  const handleNeighbors = (e) => {
    if (e.target.value > 0)
      setKnnNreigbour(e.target.value)
  }

  const handleRandomForest = (e) => {
    if (e.target.value >= 0)
      setRandomeForest({...randomForest, [e.target.name]: e.target.value})
  } 

  const handlePercent = (e) => {
    if (e.target.value >= 0) {
      setPercent({...percent, [e.target.name]: e.target.value})
    }
  }


  const handleClickAddDeep = () => {
    
    let list = [...layers]

    list.push(layer)
    setLayers(list)
    setLayer({type:'', num_neurons: '', activation_func:''})

  }


  const getFormLearning = () => {
    if (learning === 'machine')
      return (
        <Grid item xs={12} sx={{mt:'2vh'}}>
          <Stack direction="row" spacing={3}>
            <CustomSelect renderValue={o => renderValue(o, 'Algorithm')} value={algorithmMachine} onChange={setAlgorithmMachine}>
              <StyledOption value={'KNN'}>KNN</StyledOption>
              <StyledOption value={'Random Forest'}>Random Forest</StyledOption>
              <StyledOption value={'SVM'}>SVM</StyledOption>
            </CustomSelect>
            {
              algorithmMachine === 'KNN' &&
                <TextFieldStyled
                  value={knnNeigbour}
                  name="neighbors"
                  label="Neighbors"      
                  type="number"
                  onChange={handleNeighbors} 
                />
            } 
            {
              algorithmMachine === 'Random Forest' &&
            <>
            
              <TextFieldStyled
                value={randomForest.n_estimators}
                name="n_estimators"
                label="Number of trees in the forest."      
                type="number"
                onChange={handleRandomForest} 
             />

            </>
            }
            {
              algorithmMachine === 'SVM' &&
              <CustomSelect renderValue={o => renderValue(o, 'Kernel')} value={svm} onChange={setSvm}>
              <StyledOption value={'linear'}>linear</StyledOption>
                <StyledOption value={'poly'}>poly</StyledOption>
                <StyledOption value={'rbf'}>rbf</StyledOption>
             </CustomSelect>
            } 
          </Stack>

        </Grid>
      ) 
      else if (learning === 'deep')
        return(
          <>
          <Grid item xs={12} sx={{mt:'2vh'}}>
            <Stack direction="row">
              <CustomSelect renderValue={o => renderValue(o, 'Optimizers')} value={modelData.optimizer} onChange={(e) => setModelData({...modelData, optimizer: e})}>
              <StyledOption value={'sgd'}>SGD</StyledOption>
                <StyledOption value={'adam'}>Adam</StyledOption>
             </CustomSelect>
             <Box sx={{ml:'2vh'}}></Box>
             <CustomSelect renderValue={o => renderValue(o, 'Loss')} value={modelData.loss} onChange={(e) => setModelData({...modelData, loss: e})}>
              <StyledOption value={'binary_crossentropy'}>Binary Crossentropy</StyledOption>

             </CustomSelect>
             <Box sx={{ml:'2vh'}}></Box>
             <CustomSelect renderValue={o => renderValue(o, 'Learning Rate')} value={byDefault} onChange={setByDefault}>
              <StyledOption value={'default'}>Default</StyledOption>
                <StyledOption value={'manual'}>Manual</StyledOption>
             </CustomSelect>
             
            { byDefault === 'manual' &&
            <>
              <Box sx={{ml:'2vh'}}></Box>

              <TextFieldStyled
                value={learningRate}
                name="rate"
                label="Learning Rate"
                type="number"
                onChange={(e) => setLearningRate(e.target.value)}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}
                


            />

            </>
            }
             <Box sx={{ml:'2vh'}}></Box>

            <TextFieldStyled
            value={modelData.epochs}
            name="epochs"
            label="Epochs"      
            type="number"
            onChange={(e) => setModelData({...modelData, epochs: e.target.value})} 
          />

             </Stack>
          </Grid>
          <Grid item xs={12} sx={{mt:'2vh'}}>
            <h2 style={{color: 'white'}}>Layer</h2>
          </Grid>
          <Grid item xs={12} sx={{mt:'2vh'}}>
          <CustomSelect renderValue={o => renderValue(o, 'Type')} value={layer.type} onChange={(e) => setLayer({...layer, type: e})}>
              <StyledOption value={'dense'}>Dense</StyledOption>
            </CustomSelect>
          </Grid>
          {
            layer.type !== '' &&
        <>
          <Grid item xs={12} sx={{mt:'4vh'}}>
          <Stack direction="row">


            <TextFieldStyled
            value={layer.num_neurons}
            name="num_neurons"
            label="Number of neurons"      
            type="number"
            onChange={(e) => setLayer({...layer, num_neurons: e.target.value})} 
          />
            <Box sx={{ml:'2vh'}}></Box>
            <CustomSelect renderValue={o => renderValue(o, 'Activation Function')} value={layer.activation_func} onChange={(e) => setLayer({...layer, activation_func: e})}>
            <StyledOption value={'softmax'}>Softmax</StyledOption>
              <StyledOption value={'relu'}>Relu</StyledOption>
              <StyledOption value={'sigmoid'}>Sigmoid</StyledOption>

            </CustomSelect>
            {
              layers.length === 0 && 
              <>


              <Box sx={{ml:'2vh'}}></Box>
              <CustomSelect renderValue={o => renderValue(o, 'Kernel Initializer')} value={layer.kernel_initializer} onChange={(e) => setLayer({...layer, kernel_initializer: e})}>
              <StyledOption value={'uniform'}>Uniform</StyledOption>
              <StyledOption value={'random_normal'}>Random_Normal</StyledOption>

            </CustomSelect>
            <Box sx={{ml:'2vh'}}></Box>
            <TextFieldStyled
                value={layer.batch_size}
                name="batch_size"
                label="Batch Size"      
                type="number"
                onChange={(e) => setLayer({...layer, batch_size: e.target.value})} 
              />
             <Box sx={{ml:'2vh'}}></Box>

              <TextFieldStyled
                value={layer.input_size}
                name="batch_size"
                type="number"
                label="Input Size"      
                onChange={(e) => setLayer({...layer, input_size: e.target.value})} 
              />

              </>
            }

          </Stack>
          </Grid>
          {
            layer.input_size === '' && 
            <Grid item xs={12}>
            <p style={{color: "#c9382b", fontSize:'20px'}}>* Input size can be empty</p>

          </Grid>

          }


          </>
          }
          {layers.map((e, index) => (
          <Grid  key={index} item xs={12} sx={{mt:3}}>
            <Chip onDelete={ev => handleDeleteChip(ev, index)}sx={{color:'white'}} label={`${index+1}. ${JSON.stringify(e, null, 4)}`} />
          </Grid>

          ))}
            <Grid item xs={6} sx={{mt:'3vh'}}>
              <Button
                fullWidth
                variant="contained"
                disabled={(layers.length === 0 && (layer.kernel_initializer === '' || layer.batch_size === '' ))
                || layer.activation_func === '' || layer.num_neurons === '' || layer.type === '' 

              }
                onClick={handleClickAddDeep}
              >
                Add
              </Button>  
            </Grid>


          </>

        )
    
  }
  
  
  return (
    <Grid container>
      <Grid item xs={12}>
        <CustomSelect renderValue={o => renderValue(o, 'Learning Method')} value={learning} onChange={setLearning}>
          <StyledOption value={'machine'}>Machine Learning</StyledOption>
          <StyledOption value={'deep'}>Deep Learning</StyledOption>
        </CustomSelect> 
      </Grid>
      {getFormLearning()}
      <Grid item xs={12} sx={{mt:'5vh'}}>
        <Stack direction="row" spacing={2}>
          <TextFieldStyled
            value={percent.training_data}
            name="training_data"
            label="Training data"      
            type="number"
            onChange={handlePercent} 
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">%</InputAdornment>
              )
            }}
          />
          {
          
          <TextFieldStyled
            value={percent.testing_data}
            name="testing_data"
            label="Testing data"      
            type="number"
            onChange={handlePercent} 
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">%</InputAdornment>
              )
            }}
          />    
          }    
 
        </Stack>
      </Grid>
      <Grid item xs={12} sx={{mt:'3vh'}}>
        <h3 style={{color:'white'}}>Selectables CSVs</h3>
      </Grid>
      <Grid item xs={10}>
        <TableCSVPositions csvid={csv.id} csvsSelected={setCsvsSelected}/>  
      </Grid>
      <Grid item xs={12} sx={{mt:'4vh'}}>
        <Button
          variant="contained"
          color="success"
          onClick={handleOpen}
          fullWidth
          disabled={
            learning === '' ||
            (learning === 'deep' && (layers.length === 0 || modelData.optimizer === '' || modelData.loss === '' || modelData.epochs === '' || (byDefault === 'manual' && learningRate === 0))) ||
            (learning === 'machine' && algorithmMachine === '') ||
            (learning === 'machine' && algorithmMachine === 'Random Forest' && (randomForest.n_estimators === 0)) ||
            (learning === 'machine' && algorithmMachine === 'KNN' && knnNeigbour === 0) ||

            (learning === 'machine' && algorithmMachine === 'SVM' && svm === '') ||
            (percent.training_data === '' || percent.testing_data === '' || percent.testing_data === 0) ||
            (( parseInt(percent.training_data) + parseInt(percent.testing_data)  ) !== 100)

          }
          >
            Train
          </Button>
      </Grid>
      <Grid item xs={12}>
        <DialogStyled
          open={open}
          handleClose={handleClose}
          text={name}
          handleText={handleName}
          handleClick={handleTrainingBtn}
          title="Apply IA Algorithm"
          description="Type in a name for the new model"
        />
      </Grid>
    </Grid>
  )
}
export default TrainingForm