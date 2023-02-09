import IconButton from '@mui/material/IconButton';
import KeyOffSharpIcon from '@mui/icons-material/KeyOffSharp';

const ReloadButton = ({ handleDecryptClick, disabled }) => {
  return (
    <IconButton 
      color="primary"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        handleDecryptClick()
      }}
    >

      <KeyOffSharpIcon sx={{color:'white', fontSize:'2.5rem', borderColor:'white', borderRadius:'10px', backgroundColor:'gray'}}/>
    </IconButton>
    
  )
}

export default ReloadButton