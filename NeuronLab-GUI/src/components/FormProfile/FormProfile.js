import Grid from '@mui/material/Grid';
import TextFieldDisabled from "../TextFieldDisabled/TextFieldDisabled"

const FormProfile = () => {

  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextFieldDisabled
            fullWidth
            value={user.name}
            name="name"
            label="Name"/>
          </Grid>
          <Grid item xs={6}>
            <TextFieldDisabled
              fullWidth
              value={user.surname}
              name="surname"
              label="Surname"
            />
          
          </Grid>
          <Grid item xs={12}>
            <TextFieldDisabled
              fullWidth
              name="email"
              label="Email"
              value={user.email}
            />
          
          </Grid>
          <Grid item xs={12}>
            <TextFieldDisabled
              fullWidth
              name="user"
              value={user.user}
              label="User"
            />
          
          </Grid>

        
        </Grid>       

  )
}

export default FormProfile