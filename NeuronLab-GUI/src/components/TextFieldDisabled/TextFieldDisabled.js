import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';


const TextFieldDisabled = styled(TextField)({
   
    input: {
        color: 'white',
        fontSize: '20px'

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
  
    },
  });

export default TextFieldDisabled;