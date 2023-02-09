import { Button } from "@mui/material";
import PairButton from "./PairButton";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TableEEG from "./TableEEG"
import { Grid } from "@mui/material";


import { useState } from "react"

const TestEEG = ({ state }) => {

  const [status, setStatus] = useState({play: false, pair: false, time:5, type:''})

  const handleStart = () => {
    setStatus({
      ...status,
      play: true
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


  const handlePairBtn = () => {
    
    window.api.searchStreams('device', status.type)
    .then(e => {
      setStatus({
        ...status,
        pair: e,
        play: false
      })

    })
    

  }

  const handleUnpairBtn= () => {
    window.api.closeStream()
    setStatus({
      ...status,
      pair: false,
      play: false
    })
    

  }

  const handleSelect = (event) => {
    setStatus({
      ...status,
      time: event.target.value
    })

    window.api.changeWindow(event.target.value)
  }

  const onChangeLslType = (e) => {
    setStatus({
      ...status,
      type: e.target.value
    })
  }

  return (
    <Grid container spacing={2} sx={{mt:3}}>
      <Grid item xs={6} sx={{ml:2}}>
        <FormControl >
          <InputLabel id="demo-simple-select-label">Window</InputLabel>
            <Select
              labelId="de-label"
              id="demo-simple-select"
              value={status.time}
              label="Window"
              onChange={handleSelect}
              disabled={!status.pair}
              size="small"
            >
              <MenuItem value={1}>1 sec</MenuItem>
              <MenuItem value={5}>5 sec</MenuItem>
              <MenuItem value={10}>10 sec</MenuItem>
              <MenuItem value={20}>20 sec</MenuItem>

            </Select>
        </FormControl>
      </Grid>

    <Grid item xs={12}>
      <TableEEG device={state.experiment.device} play={status.play} pair={status.pair}/>
    </Grid>
  
    
    <Grid item xs={12}>
      <PairButton disabled={status.play} name="type" pair={status.pair} valueTextField={status.type} handlePairBtn={handlePairBtn} handleUnpairBtn={handleUnpairBtn} handleOnChange={onChangeLslType} text="device"/>
    </Grid>
    <Grid item xs={12} sx={{ml:2}}>
      {
        !status.play || !status.pair
        ?
        <Button
          onClick={handleStart}
          variant="contained"
          disabled={!status.pair}
          color="success"
          fullWidth
       >
        Start data stream
      </Button>
      :
      <Button
      onClick={handleStop}
      variant="contained"
      color="error"
      fullWidth
    >
      Stop data stream
    </Button>
      }
     
    </Grid>

    <Grid item xs={12}>
      <Grid 
      container 
      direction="row-reverse"
      justifyContent="flex-start"
      alignItems="center"
      >
    </Grid>
    </Grid>
  </Grid>

  )
}
export default TestEEG