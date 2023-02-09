import { Button, Grid, Stack } from "@mui/material";
import { useState } from "react"
import { CustomSelect, StyledOption } from "../Select/CustomSelect";
import Checkbox from '@mui/material/Checkbox';


const FormFeatureExtraction = ({csvs}) => {
  const [feature, setFeature] = useState('')
  const [checked, setChecked] = useState({beta: false, alpha: false, theta: false, delta: false, gamma: false});


  const handleChange = (event) => {
    setChecked({...checked, [event.target.name]: event.target.checked});
  };

  function renderValue(option, text) {
    if (option == null) {
      return <span>{text}</span>;
    }
  
    return (
      <span>
        {option.label}
      </span>
    );
  }

  const handleClick = () => {
    let msg = {}
    if (feature === 'psd') {
      let text = ''
      if (checked.alpha === true)
        text += 'alpha,'
      if (checked.delta === true)
      text += 'delta,'
      if (checked.theta === true)
        text += 'theta,'
      if (checked.beta === true)
        text += 'beta,'
      if (checked.gamma === true)
      text += 'gamma,'
      
      text = text.slice(0, -1)
    
      msg = {csvs: csvs, feature: text}
      setChecked({beta: false, alpha: false, theta: false, delta: false, gamma: false})

    } else 
      msg = {csvs: csvs, feature: feature}

    window.api.applyFeature(msg)
    setFeature('')
  }



  return (
    <Grid container>
      <Grid item xs={12}>
      <CustomSelect renderValue={o => renderValue(o, 'Feature')} value={feature} onChange={setFeature}>
        <StyledOption value={'nothing'}>Nothing</StyledOption>
        <StyledOption value={'mean'}>Mean</StyledOption>
        <StyledOption value={'variance'}>Variance</StyledOption>
        <StyledOption value={'deviation'}>Standard Deviation</StyledOption>
        <StyledOption value={'psd'}>Power Spectral Density</StyledOption>
      </CustomSelect> 
      </Grid>
      {
        feature === 'psd' && 
        <>
        <Grid item xs={12} sx={{mt:'2vh'}}>
        <Stack direction="row">

          <Checkbox
            name="gamma"
            checked={checked.gamma}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <p style={{fontSize:'1.3rem', color: 'white', letterSpacing: '0.00398em', fontFamily: 'Roboto'}}>Gamma (30-100 Hz)</p>
          </Stack>

          </Grid>
        <Grid item xs={12}>
        <Stack direction="row">

          <Checkbox
            name="beta"
            checked={checked.beta}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <p style={{fontSize:'1.3rem', color: 'white', letterSpacing: '0.00398em', fontFamily: 'Roboto'}}>Beta (12-30 Hz)</p>
          </Stack>

          </Grid>
          <Grid item xs={12}>
          <Stack direction="row" spacing={0}>
          <Checkbox
            name="alpha"
            checked={checked.alpha}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <p style={{fontSize:'1.3rem', color: 'white', letterSpacing: '0.00398em', fontFamily: 'Roboto'}}>Alpha (8-12 Hz)</p>
          </Stack>
          </Grid>
          <Grid item xs={12}>
          <Stack direction="row" spacing={0}>
          <Checkbox
            name="theta"
            
            checked={checked.theta}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <p style={{fontSize:'1.3rem', color: 'white', letterSpacing: '0.00398em', fontFamily: 'Roboto'}}>Theta (4-8 Hz)</p>

          </Stack>

          </Grid>
          <Grid item xs={12}>
          <Stack direction="row" spacing={0}>

          <Checkbox
            name="delta"
            checked={checked.delta}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
           <p style={{fontSize:'1.3rem', color: 'white', letterSpacing: '0.00398em', fontFamily: 'Roboto'}}>Delta (1-4 Hz)</p>
    
          </Stack>

          </Grid>
      </>
      }
      <Grid item xs={12} sx={{mt:'5vh'}}>
        <Button
          variant="contained"
          fullWidth
          disabled={csvs.length === 0 || feature === '' ||
                    (feature === 'psd' && checked.alpha === false && checked.beta === false && checked.delta === false && checked.theta === false && checked.gamma === false)
                  
        }
          onClick={handleClick}
        >
          Apply
        </Button>
      </Grid>

    </Grid>


  )
}
export default FormFeatureExtraction