import Box from "@mui/material/Box"
import Grid from '@mui/material/Grid';
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
import { Button } from "@mui/material";
import  Container  from "@mui/material/Container"
import Chip from '@mui/material/Chip';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import { properties } from "../../properties";

import { useState } from "react";
import SelectStyled from "../Select/SelectStyled";



const FormSubject = ({ init }) => {
  const [value, setValue] = useState({name: '', surname: '', age: '', gender:'', mental_conditions: []})
  const [condition, setCondition] = useState('')
  const [conditionSelected, setConditionSelected] = useState([])
  const [selected, setSelected] = useState(false)
  const navigate = useNavigate()



  let disabled = value.name === '' || value.surname === '' || value.gender === '' || value.age === '' || (selected && value.mental_conditions.length < 1) 


  const handleChange = (e) => {
    if (e.target.name === 'mentalCondition')
      setCondition(e.target.value)
    else
      setValue({
        ...value,
        [e.target.name]: e.target.value
      })

  }


  const conditionArray = ['Hyperactivity', 'Attention deficit', 'Disorder']


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (condition === '') 
        return
      setConditionSelected([...conditionSelected, condition])

      const c = {condition: condition}
      let list = [...value.mental_conditions]
      list.push(c)
      setValue({
        ...value,
        mental_conditions: list
      })
      
      setCondition('')
    }
  }

  const handleDelete = (e, v) => {
    e.preventDefault()
    let list = [...value.mental_conditions]    
    setConditionSelected([...conditionSelected].filter(e => e !== v))
    
    
    setValue({
      ...value,
      mental_conditions: list.filter(c => c.condition !== v)
    })
  }

  const handleSubmit = () => {

    let data = {...value}
    
    
    if (!selected)
      data = {...value, mental_conditions:[{condition: 'No'}]}
    
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/subject/`, data,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => navigate('../subjects', { state: { sidebar: init }}))
  
  }

  const handleBacklBtn = () => {
    navigate('../subjects', { state: { sidebar: init} })
  }  
  return ( 
    <Container maxWidth="lg">
      <Box
        sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      

      <Grid container spacing={2}>
      <Grid item xs={12}>
          <Button
            onClick={handleBacklBtn}
            size="small"
            variant="contained"
          >
            Back
          </Button>
          
        </Grid>
        <Grid item xs={6} sx={{mt:'3vh'}}>
          <TextFieldStyled 
          fullWidth
          required
          value={value.name}
          onChange={handleChange}
          name="name"
          label="Name"/>
        </Grid>
        <Grid item xs={6} sx={{mt:'3vh'}}>
          <TextFieldStyled 
            fullWidth
            required
            value={value.surname}
            onChange={handleChange}
            name="surname"
            label="Surname"
          />
        
        </Grid>
        <Grid item xs={6}>
          <TextFieldStyled 
            fullWidth
            required
            name="age"
            label="Age"
            value={value.age}
            onChange={handleChange}
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
        
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel required id="demo-simple-select-label">Gender</InputLabel>
            <SelectStyled
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={value.gender}
              label="Gender"
              onChange={handleChange}
              name="gender"
              variant="outlined"

            >
              <MenuItem value={'Male'}>Male</MenuItem>
              <MenuItem value={'Female'}>Female</MenuItem>
              <MenuItem value={'Diverse'}>Diverse</MenuItem>
            </SelectStyled>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <h2 style={{color:'white'}}>Mental Condition</h2>
          <Switch
            checked={selected}
            onChange={e => setSelected(e.target.checked)}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Grid>

        { selected &&
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel required id="demo-simple-select-label">Mental Condition</InputLabel>
              <SelectStyled
                
                labelId="demo-select-label"
                id="simple-select"
                value={condition}
                label="Mental Condition"
                onChange={handleChange}
                name="mentalCondition"
                
              >
                {conditionArray.filter(e => !conditionSelected.includes(e)).map((e, index) => (
                  <MenuItem onKeyDown={handleKeyDown} key={index} value={e}>{e}</MenuItem>
                ))}
      
              </SelectStyled>
            </FormControl>

          </Grid>        
        }
 
      </Grid>
      {selected && value.mental_conditions.length === 0 &&
        <p style={{color: "#c9382b", fontSize:'20px'}}>* Press enter two times to add a mental condition</p>
      }
      { selected && 
        <Stack spacing={3} direction="row" sx={{mt:3}}>
          {value.mental_conditions.map((e, index) => (
           
              
              <Chip
                label={e.condition}
                onDelete={ev => handleDelete(ev, e.condition)}
                key={index}
                sx={{color:'white'}}
              />
          ))}

        </Stack>
      }


      
      <Button
        size="large"
        type="submit"
        fullWidth
        disabled={disabled}
        onClick={handleSubmit}
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Add
      </Button>
    </Box>
    </Container>
    
  )
    
}

export default FormSubject