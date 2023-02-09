import { useEffect, forwardRef, useState } from 'react'
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import axios from 'axios';
import { properties } from '../../properties';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DialogCSV({open, handleClose}) {
  const [csvs, setCsvs] = useState([])

  useEffect(() => {
    if (open.id !== undefined && open.id !== 0)
    axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/training/${open.id}/csvs`,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      setCsvs(response.data)
    })

  }, [open.id])
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
              CSVS
            </Typography>

          </Toolbar>
        </AppBar>
        <List>
          {
            csvs.map((c, index) => (
              <>
              <ListItem button key={index}>
              <ListItemText primary={<Typography type="h1" style={{ color: '#FFFFFF', fontSize: '30px' }}>{c.name}</Typography>} secondary={<Typography type="h1" style={{ color: '#FFFFFF', fontSize: '15px' }}>{c.subject_name}</Typography>} />
            </ListItem>
            <Divider/>
            </>
            ))
          }
        </List>
      </Dialog>
    </div>
  );
}