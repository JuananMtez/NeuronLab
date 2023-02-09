import { forwardRef } from 'react'
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { Container, Grid } from '@mui/material';
import { Box } from '@mui/system';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DialogChart({open, handleClose, accuracy, loss}) {

  return (
    <div>

      <Dialog
        fullScreen
        open={open.open}
        onClose={handleClose}
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            backgroundColor: '#676767',
            color:'white',
            fontWeight:'bold'
          }}}
      >
        <AppBar sx={{ position: 'relative', backgroundColor: '#525558'}}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Training History 
            </Typography>

          </Toolbar>
        </AppBar>
        <List>
        <Container maxWidth="lg">
        <Box
        sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
            <Grid container>
            {
              accuracy !== undefined && 
              <Grid item xs={12} sx={{mt:'2vh'}}>
              <img src={`data:image/jpeg;base64,${accuracy}`} alt={'accuracy'}/>
            </Grid>
            }
            {
              loss !== undefined && loss !== null && 
              <Grid item xs={12} sx={{mt:'2vh'}}>
              <img src={`data:image/jpeg;base64,${loss}`} alt={'loss'}/>
            </Grid>
            }



          
               
            </Grid>
          </Box>
          </Container>
        </List>
      </Dialog>
    </div>
  );
}