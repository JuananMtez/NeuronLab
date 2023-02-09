import IconButton from '@mui/material/IconButton';
import { AddBoxSharp } from '@mui/icons-material'


const AddButton = ({ onClick })  => {

  return (
    <IconButton 
      color="primary"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >

      <AddBoxSharp sx={{color:'white', fontSize:'3.5rem', borderColor:'white'}}/>
    </IconButton>
    
  )
}

export default AddButton