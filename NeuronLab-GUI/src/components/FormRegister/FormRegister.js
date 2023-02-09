import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import Grid from '@mui/material/Grid';
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled";
import Logo from "../Logo/Logo";
import { Button } from "@mui/material";
import { useState } from 'react'
import BackButton from "../BackButton/BackButton"
import axios from "axios";
import "./FormRegister.css"
import { useNavigate } from "react-router-dom";
import { properties } from "../../properties";

const FormRegister = () => {


  const [value, setValue] = useState({ name: '', surname: '', email: '', user: '', password: '' })
  const [showError, setShowError] = useState(false)
  const [showErrorEmail, setShowErrorEmail] = useState(true)
  const [showErrorPassword, setShowErrorPassword] = useState(true)
  const navigate = useNavigate()

  const handleChange = (e) => {
    if (e.target.name === 'email') {
      setShowErrorEmail(!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e.target.value))
    }
    else if (e.target.name === 'password') {
      setShowErrorPassword(e.target.value.length < 5)
    }
    setValue({
      ...value,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = () => {

    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/researcher/`, value)
    .then(response => navigate('../login'))
    .catch(error => {
      if (error.response.status === 409) {
        setShowError(true)
        setValue({
          ...value,
          'email': '',
          'user': ''
        })
      }
    })
  }

  let disabled = true

  if (value.name !== '' && value.surname !== '' && !showErrorEmail && value.user !== '' && !showErrorPassword)
    disabled = false

  return (
    
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '10vh',
        }}
      >
        <Logo/>

        <Box
          sx={{
            mt: '7vh'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextFieldStyled 
              fullWidth
              required
              value={value.name}
              onChange={handleChange}
              name="name"
              label="Name"/>
            </Grid>
            <Grid item xs={6}>
              <TextFieldStyled 
                fullWidth
                required
                value={value.surname}
                onChange={handleChange}
                name="surname"
                label="Surname"
              />
            
            </Grid>
            <Grid item xs={12}>
              <TextFieldStyled 
                fullWidth
                required
                value={value.email}
                onChange={handleChange}
                name="email"
                label="Email"
              />
            
            </Grid>
            {showErrorEmail &&
              <Box sx={{ml:'2vh'}}>
                <p className="errorRegister">* Insert a valid email</p>

              </Box>
              
            }
            <Grid item xs={12}>
              <TextFieldStyled 
                required
                fullWidth
                name="user"
                value={value.user}
                onChange={handleChange}
                label="User"
              />
            
            </Grid>
            <Grid item xs={12}>
              <TextFieldStyled 
                required
                fullWidth
                onChange={handleChange}
                name="password"
                label="Password"
                value={value.password}
                type="password"
              />
            
            </Grid>

          </Grid>
          {
            showErrorPassword &&
            <p className="errorRegister">* Password must be at least 6 characters </p>
          }
          {
          showError && 
          <p className="errorRegister">* User or email already registered</p>
          }
          <Button
            size="large"
            type="submit"
            disabled={disabled}
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign up
          </Button>
        </Box>
      </Box>        
      <BackButton url="../login"/>
    </Container>

  )
}

export default FormRegister