import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import { useNavigate } from "react-router-dom";


const BackButton = ({ url }) => {

  const navigate = useNavigate()
  const handleBacklBtn = () => {
    navigate(url)
  }

  return (
    <Box 
    sx={{
      position: 'fixed',
      bottom: '5vh',
      left: '5vh',
      maxHeight: '10vh'

    }}>
    <Button size="large" variant="outlined" onClick={handleBacklBtn}>Back</Button>

  </Box>
  )
}

export default BackButton