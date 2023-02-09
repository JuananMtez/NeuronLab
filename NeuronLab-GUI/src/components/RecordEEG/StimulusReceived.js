import { useEffect, useState, useMemo, memo } from "react"
import { Grid } from "@mui/material";
import TableStandard from "../Table/TableStandard";

let interval = 0
const StimulusReceived = memo(({ recording }) => {

  const [stimulus, setStimulus] = useState(window.api.getStimulusReceived())

  const columns = useMemo(
    () => [
      {
        Header: 'Stimulus',
        accessor: 'stimulus',
        maxWidth: 100,
        minWidth: 100,
        width: 150,
        
      },
      {
        Header: 'Timestamp',
        accessor: 'timestamp',
        maxWidth: 100,
        minWidth: 100,
        width: 600,
      }
    ],
    []
  )




  useEffect(() => {
    let isMounted = true
    if(!recording) {
      if (interval > 0)
        clearInterval(interval);
      return
    }

    if (isMounted) 
      interval = setInterval(() => setStimulus(window.api.getStimulusReceived()), 5000)
    
    return () => {
      isMounted = false
      if (interval > 0)
        clearInterval(interval)
    }

  }, [recording])


  return (
    <Grid container sx={{ml:'2vh', mt:'2vh'}}>
     <TableStandard columns={columns} data={stimulus}/>
    </Grid>
    
  )
})

export default StimulusReceived