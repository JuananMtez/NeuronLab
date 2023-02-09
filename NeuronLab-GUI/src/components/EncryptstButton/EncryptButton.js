import IconButton from '@mui/material/IconButton';
import KeySharpIcon from '@mui/icons-material/KeySharp';

const ReloadButton = ({ handleEncryptClick, disabled }) => {
  return (
    <IconButton 
      color="primary"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        handleEncryptClick()
      }}
    >

      <KeySharpIcon sx={{color:'white', fontSize:'2.5rem', borderColor:'white', borderRadius:'10px', backgroundColor:'gray'}}/>
    </IconButton>
    
  )
}

export default ReloadButton