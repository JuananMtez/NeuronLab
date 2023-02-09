import { Button, Grid } from "@mui/material";
import Table from '../Table/Table';
import { useEffect, useState } from "react"
import axios from "axios";
import { LoadingButton } from "@mui/lab";
import DialogCSV from "../Dialog/DialogCSV";
import DialogDescription from "../Dialog/DialogDescription";
import IconButton from '@mui/material/IconButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { properties } from "../../properties";
const Prediction = ({ csv }) => {

  const [loading, setLoading] = useState(true)
  const [loadingPredict, setLoadingPredict] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [data, setData] = useState([])
  const [text, setText] = useState({text: '', n_jumps: 0})
  const [open, setOpen] = useState({open: false, id: 0});
  const [openDes, setOpenDes] = useState({open: false, description: ''})

  const handleClickOpen = (e, id) => {
    setOpen({open: true, id: id});
  };

  const handleClose = () => {
    setOpen({open: false, id: 0});
  };

  const handleClickOpenDes = (e, id) => {
    let c = data.find(d => d.id === id)
    setOpenDes({open: true, description: c.description})
  }
  const handleClickCloseDes = (e, description) => {
    setOpenDes({open: false, description: ''})
  }
  useEffect(() => {
    let isMounted = true
    if (isMounted && csv !== undefined) {
      axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/training/models/csv/${csv.id}`,
      { headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
       }})
      .then(response => {
        setData(response.data)
        setLoading(false)
      })

    }
    return () => { isMounted = false };
    
  }, [csv])


  const ShowCSVBtn = (params) => {
    return (
      <Button 
        variant="contained" 
        size="small" 
        onClick={(e) => handleClickOpen(e, params.id)}>
      CSV Files
    </Button>
    )
  }

  const PredictBtn = (params) => {
    return (
      <LoadingButton
      size="small"
      loading={loadingPredict}
      variant="contained"
      disabled={loadingSummary}
      color="secondary"
      onClick={e => {
        e.stopPropagation() 
        setLoadingPredict(true)
        setText({text: '', n_jumps: 0})
        axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/training/${params.id}/predict/csv/${csv.id}`,
        { headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
         }})
        .then(response => {
          setText(response.data)
        })
        .catch(error => error.response.data !== undefined ? window.alert(error.response.data.detail) : window.alert('An internal server error has occured'))
        .finally(() =>setLoadingPredict(false))
        
      }}

      >
        Predict
      </LoadingButton>
    )
  }


const SummaryBtn = (params) => {
  let training = data.find(t => t.id === params.id)
  if (training.type === 'Deep Learning')
    return (
      <LoadingButton
      size="small"
      loading={loadingSummary}
      variant="contained"
      color="error"
      disabled={loadingPredict}
      onClick={e => {
        e.stopPropagation() 
        setLoadingSummary(true)
        setText({text: '', n_jumps: 0})
        axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/training/${params.id}/predict/summary`,
        { headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
         }})
        .then(response => {
          setText(response.data)
        })
        .catch(error => window.alert(error.response.data.detail))
        .finally(() =>setLoadingSummary(false))
        
      }}

      >
        Summary
      </LoadingButton>
    )
  else 
      return null
  }

  const DescriptionBtn = (params) => {
    return (
      <IconButton 
        
        onClick={e => {
          e.stopPropagation()
          handleClickOpenDes(e, params.id)

        }}
      >
        <ExpandLessIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
    )
  }


  const columns = [
  
    { field: 'name', headerName: 'Name', width: 250, headerAlign: 'center', sortable: false},
    { field: 'type', headerName: 'Type', width: 225, headerAlign: 'center', sortable: false},


    {
      width: 150,
      headerName: 'Description',
      field: 'description',
      renderCell: DescriptionBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
    {
      width: 125,
      headerName: '',
      field: 'predict',
      renderCell: PredictBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
    {
      width: 125,
      headerName: '',
      field: 'summary',
      renderCell: SummaryBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
    {
      width: 125,
      headerName: '',
      field: 'CSVS',
      renderCell: ShowCSVBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
  ]

  return (
    <Grid container>
      <Grid item xs={12} sx={{mb:'3vh'}}>
        <h2 style={{color:'white'}}>Models selectables</h2>
      </Grid>
      <Grid item xs={11}>
        <Table columns={columns} rows={data !== undefined ? data : []} loading={loading} height='29vh' rowPerPage={3}/>
      </Grid>
    
      <Grid item xs={12} sx={{mt:'3vh'}}>
        <textarea defaultValue={text.text} name="Text1" style={{width:'100%', fontSize: '17px', fontWeight:'bold', color:'white', outline:'none', resize:'none', backgroundColor: 'transparent', border:'none'}} rows={text.n_jumps}></textarea>

      </Grid>
        

      
      <DialogCSV open={open} handleClose={handleClose}/>
      <DialogDescription open={openDes} handleClose={handleClickCloseDes} />

    </Grid>  
    )
}

export default Prediction