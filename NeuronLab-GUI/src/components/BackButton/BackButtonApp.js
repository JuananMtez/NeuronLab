import { Button } from "@mui/material"

const BackButtonApp = (handleClick, disabled, size) => {

  return (    
    <Button disabled={disabled} size={size} variant="outlined" onClick={handleClick}>Back</Button>
  )
}

export default BackButtonApp