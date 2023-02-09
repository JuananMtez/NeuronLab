import Sidebar from "../components/Sidebar/Sidebar"
import { useLocation } from "react-router-dom"
import { Container, Grid } from "@mui/material";
import CaptureEEG from "../components/RecordEEG/CaptureEEG.js";


const RecordEEG = () => {
  
  const { state } = useLocation()

  const handleFinished = (e) => {
  }


  return (
    <Sidebar init={false} pos='2' tab={'Record EEG'} handleSidebar={handleFinished}>
      <Container maxWidth="xl">
        <Grid container>
          <CaptureEEG state={state}/>
        </Grid>
      </Container>
    </Sidebar>
  )
}

export default RecordEEG