import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import Sidebar from "../components/Sidebar/Sidebar"
import { Button, Container, Grid, Stack, Chip } from "@mui/material"
import { Box } from "@mui/system"
import { LoadingButton } from "@mui/lab"
import { CustomSelect, StyledOption } from "../components/Select/CustomSelect";
import axios from "axios"
import ChannelsEnum from '../components/ChannelsEnum'
import TextFieldStyled from '../components/TextFieldStyled/TextFieldStyled'
import { properties } from "../properties"

const EpochData = () => {
  const { state } = useLocation()
  const { csv, experiment } = state
  const navigate = useNavigate()

  const [init, setInit] = useState(state.sidebar)
  const [loadingPlotEpoch, setLoadingPlotEpoch] = useState(false)
  const [loadingPlotAverage, setLoadingPlotAverage] = useState(false)
  const [loadingCompare, setLoadingCompare] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [loadingPlotPsd, setLoadingPlotPsd] = useState(false)
  const [loadingPlotPsdChart, setLoadingPlotPsdChart] = useState(false)



  const [valueEpoch, setValueEpoch] = useState('')
  const [nEpochs, setNEpochs] = useState([...Array(csv.events).keys()])

  const [chart, setChart] = useState({channel: '', stimulus: ''})

  const [stimulusCompare, setStimulusCompare] = useState('')
  const [stimulusBrain, setStimulusBrain] = useState('')
  const [extrapolate, setExtrapolate] = useState('')
  const [plotChart, setPlotChart] = useState({f_min: 0, f_max: 0, average: ''})
  const [time, setTime] = useState('')
  const [times, setTimes]  = useState([])

  const [imgsPlot, setImgsPlot] = useState([]) 
  const [imgsAverage, setImgsAverage] = useState([])
  const [imgsCompare, setImgsCompare] = useState([])
  const [imgsActivity, setImgsActivity] = useState([])
  const [imgPsdTop, setImgPsdTop] = useState('')
  const [imgsPsdChart, setImgsPsdChart] = useState([])


  const handleClickBack = () =>   navigate('/csv/data', { state: {csv: csv , sidebar:state.sidebar, experiment: experiment}})
  
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
  const handleClickPlotEpoch = () => {
    setLoadingPlotEpoch(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/epoch/plot`, { n_events: valueEpoch},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...imgsPlot]
      a.push(response.data)

      setImgsPlot(a)
      setLoadingPlotEpoch(false)
      setValueEpoch('')
    })
    .catch(error => {
      setLoadingPlotEpoch(false)
      setValueEpoch('')
    })
  }


  const handleClickPlotPsdTop = () => {
    setLoadingPlotPsd(true)
    axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/psd/topomap/plot`,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      setImgPsdTop(response.data)

    }).finally(()=> {
      setLoadingPlotPsd(false)
    })
  }

  const handleClickPlotPsdChart = () => {
    setLoadingPlotPsdChart(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/psd/plot`, {f_min: plotChart.f_min, f_max: plotChart.f_max, average: plotChart.average},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...imgsPsdChart]
      a.push(response.data)

      setImgsPsdChart(a)

    }).finally(()=> {
      setPlotChart({f_min: 0, f_max: 0, average: ''})
      setLoadingPlotPsdChart(false)
    })
  }



  const handleClickAveragePlot = () => {
    setLoadingPlotAverage(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/epoch/average/plot`, { channel: chart.channel, stimulus: chart.stimulus},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...imgsAverage]
      a.push(response.data)

      setImgsAverage(a)
      setLoadingPlotAverage(false)
      setChart({channel: '', stimulus: ''})
    })
    .catch(error => {
      setLoadingPlotAverage(false)
      setChart({channel: '', stimulus: ''})
    })
  }

  const handleClickCompare = () => {
    setLoadingCompare(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/epoch/compare/plot`, { stimulus: stimulusCompare},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...imgsCompare]
      a.push(response.data)

      setImgsCompare(a)
      setLoadingCompare(false)
      setStimulusCompare('')
    })
    .catch(error => {
      setLoadingCompare(false)
      setStimulusCompare('')
    })
  }


  const handleClickActivity = () => {
    setLoadingActivity(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/epoch/activity/plot`, { stimulus: stimulusBrain, times: times, extrapolate: extrapolate},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...imgsActivity]
      a.push(response.data)

      setImgsActivity(a)
      setLoadingActivity(false)
      setStimulusBrain('')
      setExtrapolate('')
      setTimes([])
      setTime('')
    })
    .catch(error => {
      setLoadingActivity(false)
      setStimulusBrain('')
      setExtrapolate('')
      setTimes([])
      setTime('')
    })
  }

  const handleKeyDown = (event) => {

    if (event.key === 'Enter' && times.filter(t => t >= time).length === 0) {

      if (time >= experiment.epoch_start && time <= experiment.epoch_end) {
        let list = [...times]

        list.push(time)
  
  
        setTimes(list)
        setTime('')
  
      } else {
        window.alert('Type in values between start epoch and end epoch')

      } 

    } else if (event.key === 'Enter'){
      window.alert('Type in values in ascendent order')

    }
  }


  const handleDelete = (e, time) => {
    e.preventDefault()
    setTimes(times.filter(t => t !== time))

  }



  return (
    <Sidebar init={init} pos='2' tab={'Epochs'} handleSidebar={setInit}>

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
          marginTop:'4vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        >
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <h2 style={{color: 'white'}}>Epochs chart</h2>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
            <CustomSelect renderValue={o => renderValue(o, 'Epochs number')} value={valueEpoch} onChange={setValueEpoch}>
              {
                nEpochs.map(v => (
                  <StyledOption key={v} value={`${v+1}`}>{v + 1}</StyledOption>                
                ))
              }
            </CustomSelect> 
            
            <LoadingButton 
              color="error"
              size="small"
              variant="contained"
              disabled={valueEpoch === '' }
              loading={loadingPlotEpoch}
              onClick={handleClickPlotEpoch}
              >
                Plot
              </LoadingButton>
              <Button 
              color="secondary"
              size="small"
              variant="contained"
              disabled={imgsPlot.length === 0}
              onClick={() => setImgsPlot([])}
              >
                Clean
              </Button>
            </Stack>

          </Grid>

          {
            imgsPlot.map((img, index) => (
              <Grid item xs={12} key={index} sx={{mt:'2vh'}}>
                <img src={`data:image/jpeg;base64,${img}`} alt={'plot_epoch'}/>
              </Grid>
            ))
          }

          <Grid item xs={12} sx={{mt:'3vh'}}>
            <h2 style={{color: 'white'}}>Average over epoch chart</h2>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row">
              <CustomSelect renderValue={o => renderValue(o, 'Channel')} value={chart.channel} onChange={(e) => setChart({...chart, channel: e})}>
              {
                experiment.device.channels.map((ch, index) => (
                  <StyledOption key={index} value={ChannelsEnum[ch.channel-1].name}>{ChannelsEnum[ch.channel-1].name}</StyledOption>
                ))
              }
              </CustomSelect>
              <Box sx={{ml:'2vh'}}></Box>
              <CustomSelect renderValue={o => renderValue(o, 'Stimulus')} value={chart.stimulus} onChange={(e) => setChart({...chart, stimulus: e})}>
              {
                experiment.stimuli.map((l, index) => (
                  <StyledOption key={index} value={l.description}>{l.description}</StyledOption>

                
                ))
              }
              </CustomSelect>
              <Box sx={{ml:'2vh'}}></Box>
              <LoadingButton 
              color="error"
              size="small"
              variant="contained"
              disabled={chart.channel === '' || chart.stimulus === ''}
              loading={loadingPlotAverage}
              onClick={handleClickAveragePlot}
              >
                Plot
              </LoadingButton>
              <Box sx={{ml:'2vh'}}></Box>

              <Button 
              color="secondary"
              size="small"
              variant="contained"
              disabled={imgsAverage.length === 0}
              onClick={() => setImgsAverage([])}
              >
                Clean
              </Button>

            </Stack>
           

          </Grid>
         
          {
            imgsAverage.map((img, index) => (
              <Grid item xs={12} key={index} sx={{mt:'2vh'}}>
                <img src={`data:image/jpeg;base64,${img}`} alt={'plot_average'}/>
              </Grid>
            ))
          }

          <Grid item xs={12} sx={{mt:'3vh'}}>
            <h2 style={{color:'white'}}>Compare epochs</h2>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row">

            <CustomSelect renderValue={o => renderValue(o, 'Stimulus')} value={stimulusCompare} onChange={setStimulusCompare}>
              {
                experiment.stimuli.map((l, index) => (
                  <StyledOption key={index} value={l.description}>{l.description}</StyledOption>
                ))
              }
              </CustomSelect>

            <Box sx={{ml:'2vh'}}></Box>
              <LoadingButton 
              color="error"
              size="small"
              variant="contained"
              disabled={stimulusCompare === ''}
              loading={loadingCompare}
              onClick={handleClickCompare}
              >
                Plot
              </LoadingButton>
              <Box sx={{ml:'2vh'}}></Box>

              <Button 
              color="secondary"
              size="small"
              variant="contained"
              disabled={imgsCompare.length === 0}
              onClick={() => setImgsCompare([])}
              >
                Clean
              </Button>
            </Stack>

          </Grid>
          {
            imgsCompare.map((img, index) => (
              <Grid item xs={12} key={index} sx={{mt:'2vh'}}>
                <img src={`data:image/jpeg;base64,${img}`} alt={'plot_compare'}/>
              </Grid>
            ))
          }

          <Grid item xs={12} sx={{mt:'3vh'}}>
            <h2 style={{color:'white'}}>Brain Activity</h2>
          </Grid>
          <Grid item xs={12}>
           <Stack direction="row">
            <CustomSelect renderValue={o => renderValue(o, 'Stimulus')} value={stimulusBrain} onChange={setStimulusBrain}>
              {
                experiment.stimuli.map((l, index) => (
                  <StyledOption key={index} value={l.description}>{l.description}</StyledOption>
                ))
              }
              </CustomSelect>
              <Box sx={{ml: '2vh'}}></Box>
            <CustomSelect renderValue={o => renderValue(o, 'Extrapolate')} value={extrapolate} onChange={setExtrapolate}>
              
              <StyledOption value={'box'}>Box</StyledOption>
              <StyledOption value={'local'}>Local</StyledOption>
              <StyledOption value={'head'}>Head</StyledOption>

          
            </CustomSelect>
              <Box sx={{ml:'2vh'}}></Box>
              <TextFieldStyled
              
              value={time}
              name="time"
              label="Time"
              onKeyDown={handleKeyDown}
              type="number"
              onChange={(e) => setTime(e.target.value)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}

            />

            <Box sx={{ml:'2vh'}}></Box>

            <LoadingButton 
              color="error"
              size="small"
              variant="contained"
              disabled={stimulusBrain === '' || times.length === 0 || extrapolate === ''}
              loading={loadingActivity}
              onClick={handleClickActivity}
              >
                Plot
              </LoadingButton>
              <Box sx={{ml:'2vh'}}></Box>

              <Button 
              color="secondary"
              size="small"
              variant="contained"
              disabled={imgsActivity.length === 0}
              onClick={() => setImgsActivity([])}
              >
                Clean
              </Button>
            </Stack>

          </Grid>
          <Grid item xs={12}>
            {
              times.length === 0 &&
              <p style={{color: "#c9382b", fontSize:'20px'}}>* Press enter to add a time</p>
              

            }
          
            <Stack direction="row" spacing={2}>
              {
                times.map((t, index) => (
                  <Chip
                    sx={{color: 'white'}}
                    label={t}
                    onDelete={ev => handleDelete(ev, t)}

                    key={index}
                  />
                ))
              }
          
            </Stack>
          </Grid>

          {
            imgsActivity.map((img, index) => (
              <Grid item xs={12} key={index} sx={{mt:'2vh'}}>
                <img src={`data:image/jpeg;base64,${img}`} alt={'plot_activity'}/>
              </Grid>
            ))
          }

          <Grid item xs={12} sx={{mt:'3vh'}}>
            <h2 style={{color:'white'}}>PSD Topomap</h2>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row">
            <LoadingButton 
              color="error"
              variant="contained"
              disabled={imgPsdTop !== ''}
              loading={loadingPlotPsd}
              onClick={handleClickPlotPsdTop}
              >
                Plot
              </LoadingButton>
              <Box sx={{ml:'2vh'}}></Box>

              <Button 
              color="secondary"
              variant="contained"
              disabled={imgPsdTop === ''}
              onClick={() => setImgPsdTop('')}
              >
                Clean
              </Button>
            </Stack>
          </Grid>
          {
            imgPsdTop !== '' &&
            <Grid item xs={12} sx={{mt:'2vh'}}>
              <img src={`data:image/jpeg;base64,${imgPsdTop}`} alt={'plot_psd'}/>
            </Grid>
          }

          <Grid item xs={12} sx={{mt:'3vh'}}>
            <h2 style={{color:'white'}}>PSD Chart</h2>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row">
            <TextFieldStyled
              
              value={plotChart.f_min}
              name="f_min"
              label="Minimum frequency"
              type="number"
              onChange={(e) => setPlotChart({...plotChart, f_min: e.target.value})}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}

            />
                          <Box sx={{ml:'2vh'}}></Box>

            <TextFieldStyled
              
              value={plotChart.f_max}
              name="f_max"
              label="Maximum frequency"
              type="number"
              onChange={(e) => setPlotChart({...plotChart, f_max: e.target.value})}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}

            />
                          <Box sx={{ml:'2vh'}}></Box>

              <CustomSelect renderValue={o => renderValue(o, 'Average')} value={plotChart.average} onChange={(e) => setPlotChart({...plotChart, average: e})}>
              
                <StyledOption value={true}>True</StyledOption>
                <StyledOption value={false}>False</StyledOption>                
             
            </CustomSelect> 
            <Box sx={{ml:'2vh'}}></Box>

            <LoadingButton 
              color="error"
              variant="contained"
              disabled={plotChart.f_max === '' || plotChart.f_min ===  '' || plotChart.average === ''}
              loading={loadingPlotPsdChart}
              onClick={handleClickPlotPsdChart}
              >
                Plot
              </LoadingButton>
              <Box sx={{ml:'2vh'}}></Box>

              <Button 
              color="secondary"
              variant="contained"
              disabled={imgsPsdChart.length === 0}
              onClick={() => setImgsPsdChart([])}
              >
                Clean
              </Button>
            </Stack>
          </Grid>
          {
            imgsPsdChart.map((img, index) => (
              <Grid key={index} item xs={12} sx={{mt:'2vh'}}>
              <img src={`data:image/jpeg;base64,${img}`} alt={'psd_chart'}/>
              </Grid>
            ))

          }
        </Grid>

        </Container>
    </Sidebar>
  )
}

export default EpochData