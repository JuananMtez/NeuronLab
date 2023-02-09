import Grid from '@mui/material/Grid';
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';
import Table from "../Table/Table";
import SelectStyled from '../Select/SelectStyled';



const FormEEG = ({ device, handleDevice, columnsEEG, rows, channels, handleChannel }) => {

  return (
    <Grid container spacing={1}>

          <Grid item xs={6} sx={{mt: 10}}>
          <FormControl fullWidth>
              <InputLabel id="demo-simple-select">Device Name</InputLabel>
                <SelectStyled

                  labelId="demo-simple-label"
                  id="demo-select"
                  value={device.name}
                  label="Device Name"
                  name="device_name"
                  onChange={handleDevice}
                  sx ={{ color: 'white'}}
                >
                <MenuItem value={'OpenBCI Cyton Board'}>OpenBCI Cyton Board</MenuItem>
                <MenuItem value={'OpenBCI Cyton + Daisy Board'}>OpenBCI Cyton + Daisy Board</MenuItem>
 
              </SelectStyled>
            </FormControl>

          </Grid>
          <Grid item xs={3} sx={{mt: 10}}>
            <TextFieldStyled
              
              value={device.sample_rate}
              name="sample_rate"
              label="Sample Rate"
              fullWidth      
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Hz</InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={3} sx={{mt: 10}}>
            <TextFieldStyled
              
              value={device.channels_count}
              name="channel_count"
              label="Channels"
              fullWidth      
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Ch</InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sx={{mt:2}}>
            <h2 style={{color: 'white'}}>Channels</h2>
          </Grid>
          <Grid item xs={4} sx={{mt:0}}>
            <Table columns={columnsEEG} rows={rows} loading={false} rowsSelected={handleChannel} showCheck={true} height='58vh' rowPerPage={8}/>
          </Grid>
          <Grid item xs={8} />

          {channels.map((e, index) => { return (
              <Grid item xs={2} key={index} sx={{mt:3}}>
                <TextFieldStyled 
                  value={rows[channels[index]-1].name}
                  label={`Channel ${index +1}`}
                  fullWidth 
                />
              </Grid>
            )}
            )}
          
        </Grid>

      )
   }
 
 
export default FormEEG