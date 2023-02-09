import Box from "@mui/material/Box"
import Grid from '@mui/material/Grid';
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
import { Button, Stack } from "@mui/material";
import  Container  from "@mui/material/Container"
import Chip from '@mui/material/Chip';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Table from "../Table/Table";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import FormControl from '@mui/material/FormControl';
import FormEEG from "./FormEEG";
import SelectStyled from "../Select/SelectStyled";
import ChannelsEnum from "../ChannelsEnum";
import { properties } from "../../properties";



const FormExperiment = ({ init }) => {

  const user = JSON.parse(localStorage.getItem('user'))
  const [value, setValue] = useState({name: '', description: '', stimuli: []})
  const [stimulus, setStimulus] = useState('')
  const [subjects, setSubjects] = useState([])
  const [subjectsSelected, setSubjectsSelected] = useState([])
  const [device, setDevice] = useState('')
  const [valueDevice, setValueDevice] = useState({name: '', sample_rate: '', channels_count: ''})
  const [channels, setChannels] = useState([])
  const [epoch, setEpoch] = useState({start_epoch:'', end_epoch:''})
  const navigate = useNavigate()

  let disabled = value.name === '' || value.description === ''  || epoch.start_epoch === '' || epoch.end_epoch === ''
              || channels.length !== valueDevice.channels_count  || valueDevice.name === '' || (value.stimuli.filter(e => e.description === '' ).length > 0)

  useEffect(() => {
    let isMounted = true;  
    axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/subject/`,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      if (isMounted) {
        setSubjects(response.data)
      }
      return () => { isMounted = false };

    })
  }, [])



  const columns = [
  
    { field: 'name', headerName: 'Name', width: 200, headerAlign: 'center', sortable: false},
    { field: 'surname', headerName: 'Surname', width: 200, headerAlign: 'center', type: 'number', sortable: false},
    { field: 'age', headerName: 'Age', type: 'number', width: 200, headerAlign: 'center', sortable: false },
    { field: 'gender', headerName: 'Gender', width: 200, headerAlign: 'center', sortable: false },

  ]

  const columnsEEG = [
    { field: 'name', headerName: 'Name', width: 250, headerAlign: 'center', sortable: false },    
  ];

  

  const handleChangeStimulus = (ev, index) => {
    ev.preventDefault()

    if (!ev.target.value.includes(' ')) {
      let list = value.stimuli
      list[index]={...list[index], description: ev.target.value}
      setValue({
        ...value,
        stimulis: list
      })
    }


  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.name === 'description' && e.target.value.length > 255)
      return
    else if (e.target.name === 'device'){
      setDevice(e.target.value)
      return

    }
    
    else if (e.target.name === 'device_name'){
      let sample_rate = 0
      let channel_count = 0
      if (e.target.value === 'OpenBCI Cyton Board') {
        sample_rate = 250
        channel_count = 8
      }
      else if (e.target.value === 'OpenBCI Cyton + Daisy Board') {
        sample_rate = 125
        channel_count = 16
      }

      setValueDevice({
        name: e.target.value,
        sample_rate: sample_rate,
        channels_count: channel_count
      })
      return
    }

    setValue({
      ...value,
      [e.target.name]: e.target.value
    })

  }


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (stimulus === '') 
        return
      const l = {name: stimulus, description: ''}
      let list = [...value.stimuli]
      list.push(l)
      setValue({
        ...value,
        stimuli: list
      })
      setStimulus('')
      
    }
  }

  const handleDelete = (e, v) => {
    e.preventDefault()
    let list = [...value.stimuli]    
    
    setValue({
      ...value,
      stimuli: list.filter(l => l.name !== v)
    })       
  }

  const handleSubmit = () => {

    let c = []

    for (let i = 0; i < channels.length; i++) {
      const object = {channel: channels[i], position: i+1}
      c.push(object)
    }

    const experiment = { 
      name: value.name, 
      description: value.description, 
      researcher_creator_id: user.id, 
      epoch_start: epoch.start_epoch,
      epoch_end: epoch.end_epoch,
      stimuli: value.stimuli, 
      device: {
        name: valueDevice.name, 
        sample_rate: valueDevice.sample_rate, 
        channels_count: valueDevice.channels_count,
        type:'eeg_headset', 
        channels: c
      },
      subjects: subjectsSelected
    } 

    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/experiment/`, experiment,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => navigate('../experiments', { state: { sidebar: init} }))
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
          value={value.name}
          onChange={handleChange}
          name="name"
          label="Name"/>
        </Grid>
        <Grid item xs={12}>
          <TextFieldStyled 
            fullWidth
            
            name="description"
            label="Description"
            maxRows={4}
            value={value.description}
            multiline
            onChange={handleChange}

          />
        
        </Grid>
        <Grid item xs={12}>
          <TextFieldStyled
            
            onKeyDown={handleKeyDown}
            onChange={(e) => setStimulus(e.target.value)}
            value={stimulus}
            name="stimulus"
            label="Stimulus"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth        
          />

        </Grid>
       
      </Grid>
      {value.stimuli.length === 0 &&
        <p style={{color: "#c9382b", fontSize:'20px'}}>* Press enter to add a stimulus</p>
      }
      
      {value.stimuli.map((e, index) => (
      <Grid container spacing={1} sx={{mt:3}} key={index}>
        <Grid item xs={2} sx={{mt:2}} >
          
              <Chip
                label={e.name}
                onDelete={ev => handleDelete(ev, e.name)}
                key={index}
                sx={{color:'white', mt:1.5}}
              />
            </Grid>
            <Grid item xs={10} sx={{mt:2}}>
              <TextFieldStyled 
                
                onChange={ev => handleChangeStimulus(ev, index)}
                value={e.description}
                name="description"
                label="Description"
                fullWidth 
              />
            </Grid>
          
            </Grid> 
        ))}


 
      <Grid container spacing={1} sx={{mt:'10vh'}}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
          <TextFieldStyled 
          
          
          value={epoch.start_epoch}
          onChange={(e) => setEpoch({...epoch, [e.target.name]: e.target.value})}
          name="start_epoch"
          type="number"
          label="Epoch Start"

          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}
           />
                   <TextFieldStyled 
          
          
          value={epoch.end_epoch}
          type="number"
          onChange={(e) => setEpoch({...epoch, [e.target.name]: e.target.value})}          
          name="end_epoch"
          label="Epoch End"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}
          />
          </Stack>

        </Grid>


        <Grid item xs={12} sx={{mt:5}}>
          <h2 style={{color: 'white'}}>Subjects</h2>
        </Grid>
        <Grid item xs={10}>
          <Table columns={columns} rows={subjects} loading={false}  rowsSelected={setSubjectsSelected} showCheck={true} height='41vh' rowPerPage={5}/>

        </Grid>
      </Grid>


      <FormControl fullWidth sx={{mt:7}}>
        <InputLabel id="demo-simple-select-label">Device</InputLabel>

        <SelectStyled
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={device}
          label="Device"
          onChange={handleChange}
          name="device"
          sx={{color: 'white'}}
        >
          <MenuItem value={1}>EEG_Headset</MenuItem>

        </SelectStyled>
      </FormControl>
      
      { device === 1 && 
          
        <FormEEG 
          device={valueDevice}
          handleDevice={handleChange}
          columnsEEG={columnsEEG}
          rows={ChannelsEnum}
          channels={channels}
          handleChannel={setChannels}
        />
             
      }



      <Button
        size="large"
        type="submit"
        fullWidth
        onClick={handleSubmit}
        variant="contained"
        disabled={disabled}
        sx={{ mt: '15vh'}}
      >
        Add
      </Button>
    </Box>
    </Container>
    
  )
    
}

export default FormExperiment