import { Grid } from "@mui/material"
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
const FilterSubject = () => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <TextFieldStyled 
          fullWidth
          name="name"
          label="Name"
        />
      </Grid>
      <Grid item xs={6}>
        <TextFieldStyled 
          fullWidth 
          name="surname"
          label="Surname"
        />
      </Grid>
    </Grid>
  )
}

export default FilterSubject