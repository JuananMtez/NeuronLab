import IconButton from '@mui/material/IconButton';
import { ReplaySharp } from '@mui/icons-material'

const ReloadButton = ({ handleReloadClick }) => {
  return (
    <IconButton 
      color="primary"
      onClick={(e) => {
        e.stopPropagation()
        handleReloadClick()
      }}
    >

      <ReplaySharp sx={{color:'white', fontSize:'2.5rem', borderColor:'white', borderRadius:'10px', backgroundColor:'gray'}}/>
    </IconButton>
    
  )
}

export default ReloadButton