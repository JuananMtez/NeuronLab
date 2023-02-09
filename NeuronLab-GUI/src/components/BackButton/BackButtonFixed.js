import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import { useNavigate } from "react-router-dom";

const BackButtonFixed = ({ url, init, fixed, metadata, disabled }) => {

  const navigate = useNavigate()
  const handleBacklBtn = () => {
    navigate(url, { state: { sidebar: init, id: metadata} })
  }

  if (fixed)
    return (
      <Box 
      sx={{
        position: 'fixed',
        bottom: '5vh',
        maxHeight: '10vh'

      }}>
      <Button size="large" variant="outlined" onClick={handleBacklBtn}>Back</Button>

    </Box>
    )
  return (
    <Button disabled={disabled} size="large" variant="outlined" onClick={handleBacklBtn}>Back</Button>

  )
}

export default BackButtonFixed