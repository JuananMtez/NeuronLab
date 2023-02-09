import Grid from '@mui/material/Grid';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DialogStyled from '../Dialog/DialogStyled'
import axios from 'axios';
import { DeleteSharp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { OpenInNewSharp } from '@mui/icons-material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';
import TableCsvCustom from '../Table/TableCsvCustom';
import { properties } from '../../properties';



const CSVTable = ({ data, handleData, sidebar, rowsSelected, showPreproccessing, showFeature }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('')
  const [openChange, setOpenChange] = useState(false)
  const [idCSV, setIdCSV] = useState('')
  const [loadingCopy, setLoadingCopy] = useState(false)
  const navigate = useNavigate()




  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setName('')
    setIdCSV('')
  }

  const handleOpenChange = () => setOpenChange(true)
  const handleCloseChange = () => {
    setOpenChange(false)
    setName('')
    setIdCSV('')
  }
  const createCopy = () => {
    setLoadingCopy(true)
    axios.post(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${idCSV}`, {name: name},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...data.csvs]
      a.push(response.data)
      handleData({
        ...data,
        csvs: a
      })
      setLoadingCopy(false)
      setOpen(false)
      setName('')
      setIdCSV('')

    }).catch(e => {
      setLoadingCopy(false)
      setOpen(false)
      setName('')
      setIdCSV('')
    })
  }

  const DownloadBtn = (params) => {
    return (
    <IconButton 
    onClick={e => {
      e.stopPropagation()
      window.api.downloadCSV(params.id)
    }}
  >
    <DownloadIcon sx={{color:'white', fontSize:'2.5rem'}}/>
  </IconButton>
    )
  }

  const changeName = () => {
    axios.patch(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${idCSV}`, {name: name},
    { headers: {
      'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
     }})
    .then(response => {
      let a = [...data.csvs]


      handleData({
        ...data,
        csvs: a.map(el => el.id === idCSV ? {...el, name: response.data.name} : el)
      })
      setOpenChange(false)
      setName('')
      setIdCSV('')

    })
  }

  const OpenBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          let csv = data.csvs.find(e => e.id === params.id)
          navigate('/csv/data', { state: {csv: csv , sidebar:sidebar, experiment: data}})
        }}
      >
        <OpenInNewSharp sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
    )
  }
 
  const handleName = (e) => 
    setName(e.target.value)


  const DeleteBtn = (params) => {

    let csv = data.csvs.find(c => c.id === params.id)
    if (csv.type === 'original')
      return (
        
        <IconButton sx={{visibility:'hidden'}}>
          <ContentCopyIcon sx={{color:'white', fontSize:'2.5rem'}}/>
        </IconButton>
      )
    else 
        
      return (
        <IconButton 
        onClick={e => {
          e.stopPropagation() 
          axios.delete(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${params.id}`,
          { headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
           }})
          .then(response => {
            handleData({
              ...data,
              csvs: data.csvs.filter(c => c.id !== params.id)
            })

          })
        }}
      >
        <DeleteSharp sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
      )
  }

  const CopyBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          setIdCSV(params.id)        

          handleOpen()
        }}
      >
        <ContentCopyIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
  
    )
  }

  const ModifyBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          setIdCSV(params.id)        

          handleOpenChange()


        }}
      >
        <AutoFixHighIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
  
    )
  }


  const columns = [
  
    { field: 'name', headerName: 'Name', width: 200, headerAlign: 'center', sortable: false},
    { field: 'date', headerName: 'Date', width: 215, headerAlign: 'center', sortable: true},
    
    { field: 'subject_name', headerName: 'Subject', width: 250, headerAlign: 'center', sortable: true},
    { field: 'type', headerName: 'Type', width: 150, headerAlign: 'center', sortable: false},     


    {
      width: 125,
      headerName: 'Open',
      field: 'open',
      renderCell: OpenBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
    {
      width: 125,
      headerName: 'Rename',
      field: 'rename',
      renderCell: ModifyBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
    {
      width: 125,
      headerName: 'Copy',
      field: 'copy',
      renderCell: CopyBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },

    {
      width: 125,
      headerName: 'Download',
      field: 'download',
      renderCell: DownloadBtn,
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
  ];
 


  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <DialogStyled
          open={open}
          handleClose={handleClose}
          text={name}
          handleText={handleName}
          handleClick={createCopy}
          title="Copy CSV"
          loading={loadingCopy}
          description="Type in a name for the new CSV"
        />
      </Grid>
      <Grid item xs={12}>
        <DialogStyled
          open={openChange}
          handleClose={handleCloseChange}
          text={name}
          handleText={handleName}
          handleClick={changeName}
          title="Modify CSV"
          description="Type in a new name"
        />
      </Grid>
    <Grid item xs={12}>
      <TableCsvCustom 
        columns={columns} 
        rowsSelected={rowsSelected} 
        rows={data.csvs !== undefined ? data.csvs : []} 
        loading={false} 
        showPreproccessing={showPreproccessing} 
        showFeature={showFeature} 
        height='70.5vh' 
        rowPerPage={10}
      />
    </Grid>
  </Grid>

  )
}
export default CSVTable