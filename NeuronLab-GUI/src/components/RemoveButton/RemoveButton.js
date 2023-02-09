import { DeleteSharp } from "@mui/icons-material"
import IconButton from '@mui/material/IconButton';

const RemoveButton = () => {
  return (
    <IconButton color="primary" aria-label="add to shopping cart">
      <DeleteSharp sx={{color:'white', fontSize:'3.5rem', borderColor:'white'}}/>
    </IconButton>
  )
}

export default RemoveButton