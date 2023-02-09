import Box from "@mui/material/Box"
import Grid from '@mui/material/Grid';
import  Container  from "@mui/material/Container"
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled";
import Button from '@mui/material/Button';
import { useState } from "react";
import FormInfoExperiment from './FormInfoExperiment'
import CSVTable from "../CSV/CSVTable";
import ReloadButton from "../ReloadButton/ReloadButton"
import axios from "axios";
import FormPreproccessing from "../Preproccessing/FormPreproccessing";
import FormFeatureExtraction from "../FeatureExtraction/FormFeatureExtraction";
import { properties } from "../../properties";
import DecryptButton from "../EncryptstButton/DecrypButton"
import EncryptButton from "../EncryptstButton/EncryptButton"



const FormExperimentDisabled = ({ data, researchers, handleResearchers, handleExperiments, subjects, handleSubjects, init }) => {
  const [showInfo, setInfo] = useState(false)
  const [csvSelected, setCsvSelected] = useState([])
  const [encrypted, setEncrypted] = useState(true)

  const [form, setForm] = useState({showProccessing: false, showFeatureExtraction: false})


  const handleReload = () => {
    axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${data.id}`,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      
      handleExperiments({
        ...data,
        csvs: response.data
        
      })
      setEncrypted(true)
    })

  }

  const handleDecrypt = () => {
    let a = window.api.decryptSubjects(data.csvs)
    handleExperiments({
      ...data,
      csvs: a
    })
    setEncrypted(false)
    
  }

  const handleEncrypt = () => {
    let a = window.api.encryptSubjects(data.csvs)
    handleExperiments({
      ...data,
      csvs: a
    })

    setEncrypted(true)
  }

  const getForm = () => {
    if(form.showProccessing)
      return (
        <FormPreproccessing csvs={csvSelected}/>
      )
    else if (form.showFeatureExtraction)
    return (
      <FormFeatureExtraction csvs={csvSelected}/>
    )
  }
  const handleShowPreproccessing = () => {
    if (form.showProccessing) {
      setForm({
        ...form,
        showProccessing: false
      })
    } else {
      setForm({
        showProccessing: true,
        showFeatureExtraction: false
      })
    }
  }

  const handleShowFeatureExtraction = () => {
    if (form.showFeatureExtraction) {
      setForm({
        ...form,
        showFeatureExtraction: false
      })
    } else {
      setForm({
        showProccessing: false,
        showFeatureExtraction: true
      })
    }
  }

  return ( 
    <Container maxWidth="lg">
      <Box
        sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      >
      
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextFieldStyled
            fullWidth
            value={Object.keys(data).length === 0 ? '' : data.name}
            name="name"
            label="Name"
            InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldStyled
              fullWidth
              value={Object.keys(data).length === 0 ? '' : data.description}
              name="description"
              maxRows={4}
              
              label="Description"
              sx={{color:'white'}}
              InputLabelProps={{ shrink: true }}

            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              variant="contained"
              size="small"
              onClick={() => setInfo(!showInfo)}
            >
              {showInfo ? 'Hide Info' : 'Show Info'}
            </Button>
  
          </Grid>
        </Grid>
        {
          showInfo && 
          <FormInfoExperiment
            data={data}
            researchers={researchers}
            handleResearchers={handleResearchers}
            handleExperiments={handleExperiments}
            subjects={subjects}
            handleSubjects={handleSubjects}
            init={init}
          />
        }
        <Grid container spacing={1}>
          <Grid item xs={12} sx={{mt:6}}>
            <h2 style={{color: 'white'}}>CSVs</h2>

          </Grid>
          <Grid item xs={12}>
            <CSVTable 
              data={data}
              handleData={handleExperiments}
              sidebar={init}
              rowsSelected={setCsvSelected}
              showPreproccessing={form.showProccessing}
              showFeature={form.showFeatureExtraction}
            />
          </Grid>
          <Grid item xs={12} sx={{mb:'5vh'}}>
            <ReloadButton 
              handleReloadClick={handleReload}
              
            />
            <EncryptButton 
              handleEncryptClick={handleEncrypt}
              disabled={encrypted}
            />
            <DecryptButton 
              handleDecryptClick={handleDecrypt}
              disabled={!encrypted}
            />
          </Grid>
          
          <Grid item xs={6}>
            <Button 
              variant="contained"
              color={form.showProccessing ? 'error': 'info'}
              onClick={handleShowPreproccessing}
              size="small"
              fullWidth

            >
              {form.showProccessing ? 'Hide form Preproccessing' : 'Form Preproccessing'}
            </Button>
          </Grid>
          <Grid item xs={6} >
            <Button 
              variant="contained"
              color={form.showFeatureExtraction  ? 'error': 'secondary'}
              size="small"
              onClick={handleShowFeatureExtraction}
              fullWidth
            >
              {form.showFeatureExtraction ? 'Hide form Feature Extraction' : 'Form Feature Extraction'}
            </Button>

          </Grid>
          <Grid item xs={12} sx={{mt:'5vh'}}>
            {getForm()}
          </Grid>
        </Grid>

      </Box>
    </Container>
    
  )
}
export default FormExperimentDisabled