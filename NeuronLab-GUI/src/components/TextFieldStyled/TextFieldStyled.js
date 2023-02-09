import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';


const TextFieldStyled = styled(TextField)({
   
    input: {
        color: 'white',

    },
    label: {
        color:'#d9d9d9',
    },
    '& label.Mui-focused': {
      color: '#26ace2',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#26ace2',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#26ace2',
      },
      '&:hover fieldset': {
        borderColor: '#26ace2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#26ace2',
      },
      '& .MuiOutlinedInput-input': {
        color: 'white'
      }
  
    },
  });

export default TextFieldStyled;