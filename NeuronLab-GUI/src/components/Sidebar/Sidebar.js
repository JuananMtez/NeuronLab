import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { AccountBoxSharp, GroupSharp, LogoutSharp, PsychologySharp } from '@mui/icons-material'
import { Link } from "react-router-dom";
import Typography from '@mui/material/Typography';

const drawerWidth = 240;


const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const getIcon = (index, style) => {
  switch(index) {
    case 0:
      return (<AccountBoxSharp sx={style}/>)
    case 1:
      return (<GroupSharp sx={style}/>)
    default:
      return (<PsychologySharp sx={style}/>)
   }
};


const Sidebar = ({ children, init, pos, tab, handleSidebar }) => {
  const theme = useTheme();

  const handleDrawerOpen = () => {
    handleSidebar(true);
  };

  const handleDrawerClose = () => {
    handleSidebar(false);
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={init} sx={{backgroundColor: '#525558'}}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{mr: 2, ...(init && { display: 'none' }) }}
          >
          
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
            {tab}
          </Typography>  





        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          variant: 'persistent',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#525558'
          },
        }}
        variant="persistent"
        anchor="left"
        open={init}
      >
        <DrawerHeader>
          <IconButton             
            onClick={handleDrawerClose}
            color="inherit"
            sx={{
              color: "white"
            }}
          >
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Profile', 'Subjects', 'Experiments'].map((text, index) => (
            <ListItem button component={Link} to={`/${text.toLowerCase()}`} selected={pos === index.toString()}key={text}>
              {getIcon(index, {color:'white', fontSize:'2.5rem', marginRight:'1rem'})}
              <ListItemText primary={text} disableTypography sx={{color:'white', fontWeight: 'bold'}} />
            </ListItem>
          ))}
        </List>
        <Divider />
          <List>
            {['Disconnect'].map((text) => (
              <ListItem button component={Link} to="/login" key={text}>
                  <LogoutSharp sx={{color:'red', fontSize:'2.5rem', marginRight:'1rem'}}/>
                  <ListItemText primary={text} disableTypography sx={{color:'red', fontWeight: 'bold'}} />

              </ListItem>
            ))}
          </List>
      </Drawer>
      <Main open={init}>
        <DrawerHeader />
        {children}

      </Main>
    </Box>
  );
}

export default Sidebar