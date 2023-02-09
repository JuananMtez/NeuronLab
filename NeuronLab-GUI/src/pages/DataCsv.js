import { useState } from "react"
import Sidebar from "../components/Sidebar/Sidebar"
import { useLocation } from "react-router-dom"
import { Container, Box, Button, Grid, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import PreproccesingCSV from "../components/DataCSV/PreproccesingCSV"
import TrainingForm from "../components/Training/TrainingForm"
import TableOwnTraining from "../components/Training/TableOwnTraining"
import TableOwnFeatureExtraction from "../components/FeatureExtraction/TableOwnFeatureExtraction"
import TextFieldStyled from "../components/TextFieldStyled/TextFieldStyled"
import StaticChart from "../components/DataCSV/StaticChart"
import Prediction from "../components/Training/Prediction"



const DataCsv = () => {

  const { state } = useLocation()
  const [init, setInit] = useState(state.sidebar)
  const { csv, experiment } = state
  const [show, setShow] = useState({showTraining: false, showPrediction: false})
  const navigate = useNavigate()


  const handleClickBack = () => navigate('/experiment/data', { state: {id: experiment.id, sidebar: init}})
  const handleClickTraining = () => {
    if (show.showTraining)
      setShow({...show, showTraining: false})
    else 
      setShow({showTraining: true, showPrediction: false})
  }

  const handleClickPrediction= () => {
    if (show.showPrediction)
      setShow({...show, showPrediction: false})
    else 
      setShow({showPrediction: true, showTraining: false})
  }

  const getComponent = () => {
    if (show.showTraining === true)
    return (
      <TrainingForm csv={csv} experiment={experiment}/>

    )

    else if (show.showPrediction === true)
        return (
          <Prediction csv={csv} />
        )

    else return
  }

  const handleClickBtnEpoch = () => navigate('/csv/epoch', { state: {csv: csv , sidebar: init, experiment: experiment}})
    
  


  return (
    <Sidebar init={init} pos='2' tab={'CSV'} handleSidebar={setInit}>
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        >
          <Grid item container spacing={2} sx={{mt:'3vh'}}>
            <Grid item xs={12}>
              <TextFieldStyled
                fullWidth
                name="name"
                label="Name"
                value={csv.name}
                InputLabelProps={{ shrink: true }}
              />       
            
            </Grid>      
            <Grid item xs={6}>
              <TextFieldStyled
                  fullWidth
                  name="type"
                  label="Type"
                  value={csv.type}
                  InputLabelProps={{ shrink: true }}
                />       
            </Grid>
            <Grid item xs={6}>
            <TextFieldStyled
                fullWidth
                name="subject"
                label="Subject"
                value={csv.subject_name}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sx={{mt:'3vh'}}>
              <h2 style={{color:'white'}}>Epochs</h2>
            </Grid>
            <Grid item xs={1}>
            <TextFieldStyled
                fullWidth
                name="event"
                label="Events"
                value={csv.events}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>      
            <Grid item xs={11}>
            <TextFieldStyled
                fullWidth
                name="epochs"
                label="Epochs"
                value={csv.epochs}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>  
            <Grid item xs={12} sx={{mt:'2vh'}}>
              <Button
                variant="contained"
                size="medium"
                color="secondary"
                disabled={csv.type === 'feature' || csv.type === 'prep | feature'}
                
                onClick={handleClickBtnEpoch}
                >
                  Go to tools
                </Button>
            </Grid>       
            <StaticChart csv={csv} experiment={experiment}/>

          </Grid>


          {csv.type !== 'original' &&

            <Grid container spacing={1} sx={{mt:'3vh'}}>
              <PreproccesingCSV csv={csv} experiment={experiment} sidebar={init}/>

              <Grid item xs={12} sx={{mt:'3vh'}}>
                <h2 style={{color:'white'}}>Feature Extractions</h2>
              </Grid>
              <Grid item xs={12}>
                <TableOwnFeatureExtraction csv={csv.id}/>
              </Grid>
              <Grid item xs={12} sx={{mt:'4vh'}}>
                <h2 style={{color:'white'}}>Classification</h2>
              </Grid>
              <Grid item xs={12}>
                <h3 style={{color: 'white'}}>Models generated</h3>
              </Grid>
              <Grid item xs={12} sx={{mb:'8vh'}}>
                <TableOwnTraining csv={csv.id}/>
              </Grid>
              <Grid item xs={12}>

              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  disabled={csv.type !== 'feature' && csv.type !== 'prep | feature'}
                  fullWidth
                  onClick={handleClickTraining}
                  color={show.showTraining === true ? "error" : "primary"}
                >
                  {show.showTraining === true ? "Hide Training" : "Training"}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={csv.type !== 'feature' && csv.type !== 'prep | feature'}
                  onClick={handleClickPrediction}
                  color={show.showPrediction === true ? "error" : "primary"}

                >
                  {show.showPrediction === true ? "Hide Prediction" : "Prediction"}
                </Button>
              </Grid>
              <Grid item xs={12} sx={{mt:'4vh'}}>
                {getComponent()}
              </Grid>
            </Grid>
          }

       </Box>

      </Container>
    </Sidebar>

  )
}
export default DataCsv