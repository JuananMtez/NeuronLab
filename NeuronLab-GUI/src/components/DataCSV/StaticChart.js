import { Grid, Stack } from "@mui/material"
import Slider from '@mui/material/Slider';
import { useState, useMemo, memo } from "react";
import TextFieldStyled from "../TextFieldStyled/TextFieldStyled";
import InputAdornment from '@mui/material/InputAdornment';
import axios from "axios";
import { LoadingButton } from "@mui/lab";
import ChannelColumn from "../RecordEEG/ChannelColumn";
import ChannelsEnum from "../ChannelsEnum";
import ChartEEGStimulus from "./ChartEEGStimulus";
import IconButton from '@mui/material/IconButton';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TableScroll from "../Table/TableScroll";
import { properties } from "../../properties";

const minDistance = 1

const getColor = (i) => {
  switch(i) {
    case '0':
      return '#f15e3e'
    case '1':
      return '#f1c33e' 
    case '2':
      return '#e6ee3f'
    case '3':
      return '#6cee3f'
    case '4':
      return '#3feede'
    case '5':
      return '#3f44ee'
    case '6':
      return '#d13fee'
     default:
       return '#ee3fb1'
  }
}

const StaticChart = memo(({ csv, experiment }) => {
  const [slide, setSlide] = useState([0, csv.duraction]);
  const [status, setStatus] = useState({ data: {}, loading: false})
  const [width, setWidth] = useState(1130)

  const handleChange2 = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setSlide([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setSlide([clamped - minDistance, clamped]);
      }
    } else {
      setSlide(newValue);
    }
  };

  const handlePlot = () => {
    setStatus({
      data: {},
      loading: true
    })
    axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv.id}/plot/chart?beginning=${slide[0]}&duraction=${slide[1]}`,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      setStatus({
        data: response.data,
        loading: false
      })
    })
    .catch(error => {
      setStatus({
        ...status,
        loading:false
      })
      window.alert('An internal error has ocurred')
    
    })
  }

  const columns = useMemo(
    () => [
      {
        Header: () => null,
        maxWidth: 80,
        minWidth: 30,
        width: 60,
        id: 'channel',
        display: 'table-cell',
        Cell: ({ row }) => {
          return (
            <ChannelColumn name={ChannelsEnum[experiment.device.channels[row.id].channel-1].name} status={true} />
          )
        }
      },
      {
        Header: () => null,
        id: 'chart',       
        maxWidth: 1130,
        minWidth: 1130,
        width: 1130,
        display: 'block',
        overflow: 'auto',


        Cell: ({ row }) => {
          return (<ChartEEGStimulus items={status.data[row.id]} color={getColor(row.id)} stimulus={status.data[status.data.length - 1]} width={width}/>)
        }
      }

    ], [experiment, status.data, width])

   

    const row = useMemo (
      () => {
         return experiment.device.channels
        .sort((a, b) => { return a.position - b.position })
        .map((e, index)=> (
          {}
        ))


      }, [experiment])
    

  return (
    <>
    <Grid item container>
      <Grid item xs={12} sx={{mt:'2vh'}}>
        <h2 style={{color:'white'}}>Chart</h2>
      </Grid>
      <Grid item xs={12}>
        <h3 style={{color:'white'}}>Duraction to plot</h3>
      </Grid>
      <Grid item xs={12}>
        <Slider
          value={slide}
          onChange={handleChange2}
          valueLabelDisplay="auto"
          step={1}
          max={csv.duraction}
          disableSwap
          disabled={csv.type === 'feature' || csv.type === 'prep | feature'}
          />
      </Grid>
      <Grid item xs={12} sx={{mt:'3vh'}}>
        <Stack direction="row" spacing={2}>
          <TextFieldStyled
            name="begin"
            label="From"
            value={slide[0]}
            sx={{width: '10%'}}
            onChange={null}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">sec</InputAdornment>
              )
            }}
          />
          <TextFieldStyled
            name="duraction"
            label="Duraction"
            value={slide[1] - slide[0]}
            onChange={null}
            sx={{width: '10%'}}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">sec</InputAdornment>
              )
            }}
          />
        </Stack>

      </Grid>
      {
        (slide[1] - slide[0]) > 30 &&
      
      <Grid item xs={12}>
        <p style={{color: "#c9382b", fontSize:'20px'}}>Duraction must be inferior than 30 seconds</p>

      </Grid>

      }
      <Grid item xs={12} sx={{mt:'4vh'}}>
        <LoadingButton 
          variant="contained"
          size="small"
          onClick={handlePlot}
          color="error"
          loading={status.loading}
          disabled={(slide[1] - slide[0]) > 30 ||  csv.type === 'feature' || csv.type === 'prep | feature'} 

          >
            Plot
        </LoadingButton>
      </Grid>

    </Grid>
    { Object.keys(status.data).length !== 0 && 
      <>
        <Grid item xs={12} sx={{mt:'2vh'}}></Grid>
        <TableScroll  columns={columns} data={row}/>
        <Grid item xs={12}>
          <Stack direction="row">

          <IconButton 
            color="primary"
            onClick={(e) => {
              e.stopPropagation()
              setWidth(width + 250)
            }}
           >
            <ZoomInIcon sx={{color:'white', fontSize:'3.5rem', borderColor:'white'}}/>
            </IconButton>
            <IconButton 
            color="primary"
            onClick={(e) => {
              e.stopPropagation()
  
                if ((width - 400) < 1130)
                  setWidth(1130)
                else
                  setWidth(width - 250)
          }}
            
           >
            <ZoomOutIcon sx={{color:'white', fontSize:'3.5rem', borderColor:'white'}}/>
            </IconButton>
            <IconButton 
            color="primary"
            onClick={(e) => {
              e.stopPropagation()
              if (width !== 1130)
                setWidth(1130)
          }}
            
           >
            <RestartAltIcon sx={{color:'white', fontSize:'3.5rem', borderColor:'white'}}/>
            </IconButton>
          </Stack>
        </Grid>

        </>
      }
    </>
  )
})

export default StaticChart