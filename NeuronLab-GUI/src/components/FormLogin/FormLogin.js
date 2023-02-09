import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import axios from "axios";
import "./FormLogin.css"
import { properties } from '../../properties';

const FormLogin = () => {

  let navigate = useNavigate()
  const [value, setValue] = useState({ username: '', password: '', privateKey: '' })
  const [showError, setShowError] = useState(false)


  let disabled = true

  
  const handleChange = (e) => {
    setValue(
      { 
        ...value,
        [e.target.name]: e.target.value })
  }

  if (value.user !== '' && value.password !== '' && value.privateKey !== '')
    disabled = false


  const handleRegister = () => {
    navigate('../register')
  }

  const onKeyDown = (event) => {
    if (!disabled && event.key === 'Enter' )
      handleLogin()
  }

  const handleLogin = () => {
    const bodyFormData = new FormData()

    bodyFormData.append('grant_type', '')
    bodyFormData.append('username', value.username)

    bodyFormData.append('password', value.password)
    bodyFormData.append('scope', '')
    bodyFormData.append('client_id', '')
    bodyFormData.append('client_secret', '')

    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/token`, value)
    .then(response => {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token.access_token));
      localStorage.setItem("privateKey", JSON.stringify(value.privateKey))
      navigate('../home')
    }).catch(error => {
      if (error.response.status === 404 || error.response.status === 401) {
        setShowError(true)
        setValue({ user: '', password: '', privateKey: ''})
      }
    })
  }

  return (
    <Box sx={{mt:'7vh'}}>
      <TextFieldStyled 
        fullWidth 
        margin="normal" 
        label="User" 
        value={value.user}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        id="user"
        name="user"
      />
      <TextFieldStyled 
        fullWidth 
        margin="normal" 
        label="Password" 
        type="password" 
        value={value.password}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        name="password"
        id="password"
      />
      <TextFieldStyled 
        fullWidth 
        margin="normal" 
        label="Private Key" 
        type="password" 
        value={value.privateKey}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        name="privateKey"
        id="privateKey"
      />
      {showError && 
        <p className="textError">* User or password incorrect</p>
      }
      
      <Button
        type="submit"
        fullWidth
        size="large"
        disabled={disabled}
        onClick={handleLogin}
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Sign In
      </Button>

      <Box sx={{textAlign: 'center'}}>
        <Button 
          variant="text"
          onClick={handleRegister}
          
        >
          Don't have an account? Sign Up
        </Button>
      </Box>
    </Box>
          
      
  )
}

export default FormLogin;