import { forwardRef } from 'react'
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { Grid } from '@mui/material';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DialogDescription({open, handleClose}) {

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
              Description
            </Typography>

          </Toolbar>
        </AppBar>
        <List>
          {
            <Grid container>
              <Grid item xs={12}>
                <textarea defaultValue={open.description} name="Text1" style={{width:'100%', fontSize: '18px', fontWeight:'bold', color:'white', outline:'none', resize:'none', backgroundColor: 'transparent', border:'none'}} rows={50}/>

              </Grid>
            </Grid>
          }
        </List>
      </Dialog>
    </div>
  );
}