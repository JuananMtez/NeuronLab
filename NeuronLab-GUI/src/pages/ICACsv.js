import { useState } from "react"
import Sidebar from "../components/Sidebar/Sidebar"
import { useLocation } from "react-router-dom"
import { Container, Box, Button, Grid, Stack } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { CustomSelect, StyledOption } from "../components/Select/CustomSelect";
import LoadingButton from '@mui/lab/LoadingButton';
import axios from "axios"
import Checkbox from '@mui/material/Checkbox';
import { properties } from "../properties"


const ICACsv = () => {
  const { state } = useLocation()
  const [init, setInit] = useState(state.sidebar)
  const { csv, experiment } = state
  const navigate = useNavigate()
  const [icaMethod, setIcaMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProp, setLoadingProp] = useState(false)
  const [png, setPng] = useState('')
  const [pngProperties, setPngProperties] = useState([])
  const [error, setError] = useState(false)
  const [numComponents, setNumComponents] = useState([])
  const [checked, setChecked] = useState([])
  const handleClickBack = () =>   navigate('/csv/data', { state: {csv: csv , sidebar: init, experiment: experiment}})
  const handleReset = () => {
    setPng('')
    setIcaMethod('')
    setPngProperties([])
  }


  const handleOnChangeSelect = (e) => {
    if (png === '')
      setIcaMethod(e)
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
  const handleChecked = (ev, i) => {
    setChecked(checked.map((e, index) => index === i ? ev.target.checked : e))
  }

  const getMultiSelect = () => {
    return (
      <Grid item xs={12}>
          {
            numComponents.map((e,index) => (
              <Stack direction="row" key={index}>
                <h3 style={{color:'white'}}>{index}</h3>
                <Checkbox
                  checked={checked[index] === undefined ? false : checked[index]}
                  onChange={ev => handleChecked(ev, index)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </Stack>
              
            ))
          }
      </Grid>
    )
  }

  const handlePlotComponents = () => {
    setLoading(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/ica/plot/components`, {method:icaMethod},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      setPng(response.data.img)
      setNumComponents([...Array(response.data.components).keys()])
      setChecked([...Array(response.data.components).fill(false)])
      setLoading(false)
    }).catch(error => setLoading(false))
  }



  const handlePlotPropierties = () => {
    setLoadingProp(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/ica/plot/properties`, {method:icaMethod},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      setPngProperties(response.data)
      setLoadingProp(false)
    }).catch(error => {
      setLoadingProp(false)
      setError(true)
      window.alert('No events produced')
    })  
  }

  const handleExclude = () => {
    let list = []
    for (let i = 0; i < checked.length; i++){
      if (checked[i]) 
        list.push(i)
    }
    let msg = {components: list, method: icaMethod}
    window.api.applyIca(csv.id, msg)
    handleClickBack()

  }


  return (
    <Sidebar init={init} pos='2' tab={'ICA'} handleSidebar={setInit}>

      <Button
        onClick={handleClickBack}
        size="small"
        variant="contained"
      >
        Back
      </Button>

      <Container maxWidth="lg">

        <Box
          sx={{
          marginTop:'10vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        >
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <CustomSelect renderValue={o => renderValue(o, 'ICA Method')} value={icaMethod} onChange={(e) => handleOnChangeSelect(e)}>
                <StyledOption value={'fastica'}>Fastica</StyledOption>
                <StyledOption value={'picard'}>Picard</StyledOption>
                <StyledOption value={'infomax'}>Infomax</StyledOption>
              </CustomSelect>
              <LoadingButton
                loading={loading}
                onClick={handlePlotComponents}
                variant="contained"
                size="small"
                color="success"
                disabled={icaMethod === ''}
              >
              Plot Components
              </LoadingButton>
              <Button
                variant="contained"
                color="error"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Stack>

          </Grid>
          {png !== '' && 
            <Grid item xs={12} sx={{mt:'5vh'}}>
              <img src={`data:image/jpeg;base64,${png}`} alt={'components_ica'}/>
            </Grid>
          }
          {png !== '' &&
          
            <Grid item xs={12} sx={{mt:'5vh'}}>
              <LoadingButton
                loading={loadingProp}
                onClick={handlePlotPropierties}
                variant="contained"
                color="success"
                disabled={error}
              >
              Plot Properties
              </LoadingButton>
            </Grid>
          }
          {
            png !== '' &&
            pngProperties.map((el, index) => (
              <Grid item xs={12} key={index}>
                <img src={`data:image/jpeg;base64,${el}`} alt={'components_ica'}/>
              </Grid>
              
            ))
            
          }
          {
            png !== '' &&
            <Grid item xs={12} sx={{mt: '5vh'}}>
              <h2 style={{color: 'white'}}>Exclude Components</h2>
            </Grid>

          }
          {
            png !== '' &&
            
            getMultiSelect()
          }
          {
            png !== '' &&
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                disabled={checked.filter(e => e === true).length === 0}
                onClick={handleExclude}
              >
                Exclude
              </Button>
            </Grid>
            }

        </Grid>
        </Container>
    </Sidebar>
  )
}
export default ICACsv