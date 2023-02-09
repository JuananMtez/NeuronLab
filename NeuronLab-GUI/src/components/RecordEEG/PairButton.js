import { Stack } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import { useState } from "react"
import Radio from '@mui/material/Radio';
import { Button } from "@mui/material";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled";



const PairButton = ({ disabled, name, valueTextField, pair, handlePairBtn, handleUnpairBtn, text, handleOnChange }) => {

  return (
    <Stack direction="row" spacing={2} sx={{ml:2}}>
      <TextFieldStyled 
        size="small"
        value={valueTextField}
        onChange={handleOnChange}
        name={name}
        disabled={disabled}
        label={text === 'device' ? "Type": 'Name'}
        sx={{width:'15vh'}}
      />

      {!pair 
      ?
        <LoadingButton
          size="small"
          onClick={handlePairBtn}
          variant="contained"
          disabled={valueTextField === ''}
        >
          Pair {text}
        </LoadingButton>
      :
        <Button
          size="small"
          onClick={handleUnpairBtn}
          disabled={disabled}
          variant="contained"
          color="error"
        >
          Unpair {text}
        </Button>
    }
    <Radio
      checked={pair}
      name="radio-buttons"
    />

  </Stack>
  )
}
export default PairButton