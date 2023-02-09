import { styled } from '@mui/material/styles';
import Select from '@mui/material/Select';
;


const SelectStyled = styled(Select)({
   
  color:'white',
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: '#26ace2',
  },
  '& .MuiInputLabel-root':{
    color:'red,'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#26ace2',
  },
  '& .MuiOutlinedInput-notchedOutline:after': {
    borderColor: '#26ace2',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#26ace2',
  },
  "&:hover .MuiInputLabel-root": {
    color: "red"
  },
  
  });

export default SelectStyled;