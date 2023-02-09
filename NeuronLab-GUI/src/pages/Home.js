import Sidebar from "../components/Sidebar/Sidebar"
import LogoUm from '../img/logo_umu.jpeg'
import LogoBrain from '../img/neuronlab_logo2.png'

import  Container  from "@mui/material/Container"
import  Box  from "@mui/material/Box"
import  Grid  from "@mui/material/Grid"


import "../styles/Home.css"
import { useState } from "react"
const Home = () => {
  const [init, setInit] = useState(false)
  return (
    <Sidebar init={init} pos='-1' handleSidebar={setInit}>
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
         <h1 className="title">Welcome to NeuronLab</h1>

        </Box>
        <p className="text">Application to provide researchers to study brain signals obtained from different subjects.</p>
        <p className="text">Implementation of a framework capable of EEG signal acquisition from BCI or other external devices, signal proccessing and ML/DL using trained classifiers.</p>
        <p className="text">This project is part of the End of Degree Project in Computer Engineering at the University of Murcia.</p>

        <Grid container spacing={1}>
          <Grid item xs={6} >
            <img style={{marginTop:'38px'}} className="um" src={LogoUm} alt="logo_um"/>

          </Grid>
          <Grid item xs={6} >

            <img style={{marginLeft: '25vh'}}className="neuronlab" src={LogoBrain} alt="logo_neuronlab"/>

          </Grid>
        </Grid>
                

      </Container>
    </Sidebar>
  )
}

export default Home
