import { Button } from "@mui/material";
import PairButton from "./PairButton";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import TableEEG from "./TableEEG"
import { Grid } from "@mui/material";
import DialogStyled from '../Dialog/DialogStyled'
import { useNavigate } from "react-router-dom";
import StimulusReceived from "./StimulusReceived";


import { useState } from "react"
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled";
import SelectStyled from "../Select/SelectStyled";

const CaptureEEG = ({ state }) => {
  const [status, setStatus] = useState(
    { play: false, recording: false, hasRecorded: false, pairDevice: false, time:5, 
      typeDevice:'', nameStimulus:'', pairStimulus: false, portUdp:0, showStimulus: false }
  )
  
  const [protocol, setProtocol] = useState('')
  const [statusDialog, setStatusDialog] = useState({open: false, name:''});
  const navigate = useNavigate()
  
  
 

  
  const handleOpenDialog = () => {
    setStatusDialog({
      ...statusDialog,
      open: true
    })
  }

  const handleCloseDialog = () => {
    setStatusDialog({
      name:'',
      open: false
    })
  }

  const handleName = (e) => {
    setStatusDialog({
      ...statusDialog,
      name: e.target.value
    })
  }

  const handleSave = () => {


    

    window.api.save(statusDialog.name, state.subject_id, state.subjectName, state.experiment.id)
    navigate('/experiment/data', { state: {id: state.experiment.id, sidebar:false}})

  }


  const handleStart = () => {
    setStatus({
      ...status,
      play: true,
    })
    window.api.start()

  }

  const handleStop = () => {
    setStatus({
      ...status,
      play: false
    })
    window.api.stop()
  }


  const handlePairDeviceBtn = () => {

    
    window.api.searchStreams('device', status.typeDevice)
    .then(e => {
      setStatus({
        ...status,
        pairDevice: e,
      })
    })
  }



  const handleUnpairDeviceBtn = () => {
    window.api.closeStream()
    setStatus({
      ...status,
      pairDevice: false,
      play: false
    })
  }


  const handleSelectWindow = (event) => {
    setStatus({
      ...status,
      time: event.target.value
    })

    window.api.changeWindow(event.target.value)
  }

  const handleSelectProtocol = (event) => {
    setProtocol(event.target.value)
  }

  const onChangeInput = (e) => {
    setStatus({
      ...status,
      [e.target.name]: e.target.value
    })
  }

  const getStimulusProtocol = () => {
    switch(protocol) {
  
      case 'udp':
        return (
          <Grid item xs={12} sx={{ml:'2vh'}}>

            <TextFieldStyled
              size="small"
              value={status.portUdp}
              onChange={onChangeInput}
              name="portUdp"
              label="Port"
              disabled={status.play}
              sx={{width:'15vh'}}
              />
          </Grid>
        )
      
      default:
        return
    }
  }

  const handleStartRecording = () => {
    
    if (protocol === 'udp')
      window.api.startStimulusUDPRecording(status.portUdp, state.experiment.stimuli)



    setStatus({
      ...status,
      recording: true,
      hasRecorded: true
    })
  }

  const handleStopRecording = () => {

    if (protocol === 'udp')
      window.api.stopStimulusUDPRecording()
   

    setStatus({
      ...status,
      recording: false
    })
  }

  const handleReset = () => {
    window.api.closeAll()
    setStatus({play: false, recording: false, hasRecorded: false, pairDevice: false, time:5, typeDevice:'', nameStimulus:'', pairStimulus: false, portUdp:0, showStimulus: false })
  }

  const handleClickBack = () => {
    window.api.closeAll()
    navigate('/experiment/data', { state: {id: state.experiment.id, sidebar:false}})

  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sx={{mb:'3vh'}}>
        <Button
          onClick={handleClickBack}
          size="small"
          disabled={status.play}
          variant="contained"
        >
          Back
        </Button>
      </Grid>
      <Grid item xs={6} sx={{ml:2}}>
        <FormControl >
          <InputLabel id="demo-simple-select-label">Window</InputLabel>
            <SelectStyled
              labelId="de-label"
              id="demo-simple-select"
              value={status.time}
              label="Window"
              onChange={handleSelectWindow}
              disabled={!status.pairDevice}
              size="small"
            >
              <MenuItem value={1}>1 sec</MenuItem>
              <MenuItem value={5}>5 sec</MenuItem>
              <MenuItem value={10}>10 sec</MenuItem>
              <MenuItem value={20}>20 sec</MenuItem>

            </SelectStyled>
        </FormControl>
      </Grid>

    <Grid item xs={12}>
      <TableEEG device={state.experiment.device} play={status.play} pair={status.pairDevice}/>
    </Grid>
    <Grid item xs={6}>
    {
        !status.play
        ?
        <Button
          onClick={handleStart}
          variant="contained"
          color="success"
          size="small"
          fullWidth
          disabled={!status.pairDevice || status.hasRecorded}
       >
        Start data stream
      </Button>
      :
      <Button
        onClick={handleStop}
        variant="contained"
        color="error"
        disabled={status.recording}
        fullWidth
        size="small"

      >
        Stop data stream
      </Button>
      }
    </Grid>
    <Grid item xs={6} >
      {
        !status.recording
        ?
        <Button
          onClick={handleStartRecording}
          variant="contained"
          disabled={!status.play || (!status.pairDevice) || (protocol === '') || ( protocol === 'udp' && (isNaN(status.portUdp) || status.portUdp < 1))}
          color="success"
          fullWidth
          size="small"

       >
        Start recording
      </Button>
      :
      <Button
        onClick={handleStopRecording}
        variant="contained"
        color="error"
        fullWidth
        size="small"

      >
       Stop recording
      </Button>
      }
     
    </Grid>

    <Grid item xs={6}>
            
      <Button
        variant="contained"
        color="success"
        fullWidth
        size="small"
        onClick={handleOpenDialog}
        disabled={status.play || !status.hasRecorded}
      >
      Save
    </Button>
      
    </Grid>
    <Grid item xs={6}>
            
      <Button
        variant="contained"
        disabled={status.play}
        color="error"
        fullWidth
        size="small"
        onClick={handleReset}
      >
      Reset
    </Button>

      
    </Grid>
    <Grid item xs={12} sx={{ml:'2vh'}}>
      <h2 style={{color: 'white'}}>Device</h2>

    </Grid>
    <Grid item xs={12}>
      <PairButton disabled={status.play} name="typeDevice" pair={status.pairDevice} valueTextField={status.typeDevice} handlePairBtn={handlePairDeviceBtn} handleUnpairBtn={handleUnpairDeviceBtn} handleOnChange={onChangeInput} text="device"/>    
    </Grid>
    <Grid item xs={12} sx={{ml:'2vh'}}>
      <h2 style={{color: 'white'}}>Stimulus</h2>

    </Grid>
    <Grid item xs={3} sx={{ml:'2vh'}}>
      <FormControl fullWidth >
        <InputLabel id="demo-simpl-label">Protocol</InputLabel>
        <SelectStyled
          labelId="de-"
          id="demo--select"
          value={protocol}
          label="Protocol"
          onChange={handleSelectProtocol}
          size="small"
          sx={{color:'white'}}
          disabled={status.play || status.hasRecorded}
        >
          <MenuItem value={'udp'}>UDP</MenuItem>

        </SelectStyled>
      </FormControl>
    </Grid>
    <Grid item xs={9}>
      {getStimulusProtocol()}
    </Grid>
    <Grid item xs={12} sx={{ml:2, mt:4}}>
      {
        status.showStimulus
        ?
        <Button 
          variant="contained"
          onClick={() => setStatus({...status, showStimulus: false})}
          color="error"
          size="small"
        >
          Hide 
        </Button>
        :
        <Button
        onClick={() => setStatus({...status, showStimulus: true})}
        variant="contained"
        size="small"

      >
        Show stimulus received
      </Button>
      }

    </Grid>
      {status.showStimulus && 
      <StimulusReceived
        recording={status.recording}
      />
    }
    
    <Grid item xs={12}>
        <DialogStyled
          open={statusDialog.open}
          handleClose={handleCloseDialog}
          text={statusDialog.name}
          handleText={handleName}
          handleClick={handleSave}
          loading={false}
          title="Save CSV"
          description="Write a name for the new CSV"
        />
      </Grid>


  </Grid>

  )
}

export default CaptureEEG