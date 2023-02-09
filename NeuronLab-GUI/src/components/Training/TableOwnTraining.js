import { useEffect, useState, memo } from "react"
import axios from "axios"
import Table from '../Table/Table';
import { DeleteSharp } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { Grid } from "@mui/material";
import ReloadButton from "../ReloadButton/ReloadButton";
import DialogDescription from "../Dialog/DialogDescription";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DialogChart from '../Dialog/DialogChart'
import { properties } from "../../properties";

const TableOwnTraining = memo(({csv}) => {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDes, setOpenDes] = useState({open: false, description: ''})
  const [openChart, setOpenChart] = useState({open: false, accuracy: '', loss: ''})
  
  
  const handleClickOpenDes = (e, id) => {
    let c = data.find(d => d.id === id)
    setOpenDes({open: true, description: c.description})
  }
  const handleClickCloseDes = (e, description) => {
    setOpenDes({open: false, description: ''})
  }

  const handleClickOpenVal = (e, id) => {
    let c = data.find(d => d.id === id)
    setOpenDes({open: true, description: c.validation})
  }

  const handleClickOpenChart = (e, id) => {
    let c = data.find(d => d.id === id)
    setOpenChart({open: true, accuracy: c.path_accuracy, loss: c.path_loss})
  }
  const handleClickCloseChart = () => {
    setOpenChart({open: false, accuracy: '', loss: ''})
  }



  useEffect(() => {
    let isMounted = true
    if (isMounted && csv !== undefined) {
      axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/training/csv/${csv}`,
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

  const DeleteBtn = (params) => {
    return (
      <IconButton 
      onClick={e => {
        e.stopPropagation() 
        axios.delete(`${properties.protocol}://${properties.url_server}:${properties.port}/training/${params.id}`,
        { headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
         }})
        .then(response => {
          let model = data.find(m => m.id = params.id)
          setData(data.filter(d => model.id !== d.id))

        })
      }}
    >
      <DeleteSharp sx={{color:'white', fontSize:'2.5rem'}}/>
    </IconButton>
    )
  }

  const handleReload = () => {
    axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/training/csv/${csv}`,
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      setData(response.data)
    })

  }

  const OpenBtn = (params) => {
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

  const ValidationBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          handleClickOpenVal(e, params.id)

        }}
      >
        <ExpandLessIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
    )
  }

  const CurveBtn = (params) => {
    let training = data.find(d => d.id === params.id)
    return (
      <IconButton 
        sx={training !== undefined && training.type !== 'Deep Learning' ? {visibility: 'hidden'}: {}}
        onClick={e => {
          e.stopPropagation()
          handleClickOpenChart(e, params.id)

        }}
      >
        <ExpandLessIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
    )
  }

  const columns = [
  

    { field: 'name', headerName: 'Name', width: 250, headerAlign: 'center', sortable: false},
    { field: 'type', headerName: 'Type', width: 200, headerAlign: 'center', sortable: false},

    {
      width: 150,
      headerName: 'Description',
      field: 'open',
      renderCell: OpenBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },

    {
      width: 150,
      headerName: 'Validation',
      field: 'validation',
      renderCell: ValidationBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
    {
      width: 125,
      headerName: 'History',
      field: 'history',
      renderCell: CurveBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },

    {
      width: 125,
      headerName: 'Delete',
      field: 'delete',
      renderCell: DeleteBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },

  ]


  return (
    <Grid container>
      <Grid item xs={12}>
        <Table columns={columns} rows={data !== undefined ? data : []} loading={loading} height='29vh' rowPerPage={3}/>
      </Grid>
      <Grid item xs={12} sx={{mt:'2vh'}}>
       <ReloadButton
          handleReloadClick={handleReload}
        />
      </Grid>
      <DialogDescription open={openDes} handleClose={handleClickCloseDes} />
      <DialogChart open={openChart} handleClose={handleClickCloseChart} accuracy={openChart.accuracy} loss={openChart.loss}/>

    </Grid>

  )


})
export default TableOwnTraining