import { Grid, Stack } from "@mui/material"
import Chip from '@mui/material/Chip';
import TextFieldStyled from '../TextFieldStyled/TextFieldStyled'
import Table from "../Table/Table";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { DeleteSharp } from "@mui/icons-material";
import axios from "axios";
import PlayCircleFilledWhiteSharpIcon from '@mui/icons-material/PlayCircleFilledWhiteSharp';
import { useNavigate } from "react-router-dom";
import ChannelsEnum from "../ChannelsEnum";
import { properties } from "../../properties";

const Stimuli = ({ data }) => {


  return (
    data.stimuli.map((e, index) => (
      <Grid container spacing={2} key={index}>
        <Grid item xs={2} sx={index > 0 ? {mt:4}: {mt:0}} >
          
          <Chip
            label={e.name}
            key={index}
            sx={{color:'white', mt:1.5}}
          />
        </Grid>
        <Grid item xs={10} sx={index >0 ? {mt:4}: {mt:0}}>
          <TextFieldStyled 
            value={e.description}
            name="description"
            label="Description"
            fullWidth 
          />
        </Grid>
          
      </Grid> 
     )
    )  
  )
}



const FormInfoExperiment = ({ data, researchers, handleResearchers, handleExperiments, subjects, handleSubjects, init }) => {

  const navigate = useNavigate()


  const ShareBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          axios.patch(`${properties.protocol}://${properties.url_server}:${properties.port}/experiment/add/${data.id}/researchers`,{researchers_id: [params.id]},
          { headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
           }})
          .then(response => {
            let research = researchers.find(re => re.id === params.id)
            handleResearchers(researchers.filter(r => r.id !== params.id))
            let a = [...data.researchers]
  
            a.push(research)
  
            handleExperiments({
              ...data,
              researchers: a
            })
          })

          
        }}
      >
        <AddIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
  
    )
  }

  const AddSubjectBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          axios.patch(`${properties.protocol}://${properties.url_server}:${properties.port}/experiment/add/${data.id}/subjects`,{ subjects_id: [params.id]},
          { headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
           }})
          .then(response => {
            let subject = subjects.find(s => s.id === params.id)

            handleSubjects(subjects.filter(s => s.id !== params.id))
  
            let a = [...data.subjects]
  
            a.push(subject)
  
            handleExperiments({
              ...data,
              subjects: a
            })
          })

          
        }}
      >
        <AddIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
  
    )
  }

  const StartExperiment = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          let url = ''
          if (data.device.type === 'eeg_headset')
            url = '../experiment/record_eeg' 
          const subject = data.subjects.filter(s => s.id === params.id)[0]
          navigate(url, { state: { sidebar:init, experiment: data, subject_id: params.id, subjectName: subject.name + ' ' + subject.surname }})
          
          
        }}
      >
        <PlayCircleFilledWhiteSharpIcon sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
  
    )
  }



 /* const DeleteSubjectBtn = (params) => {
    return (
      <IconButton 
        onClick={e => {
          e.stopPropagation()
          
          
        }}
      >
        <DeleteSharp sx={{color:'white', fontSize:'2.5rem'}}/>
      </IconButton>
  
    )
  }
*/
  const DeleteBtn = (params) => {

    if (params.id === data.researcher_creator_id)
      return (        
        <IconButton 
          sx={{visibility:'hidden'}}
          onClick={e => {
            e.stopPropagation()
            if (params.id !== data.researcher_creator_id) {
              axios.patch(`${properties.protocol}://${properties.url_server}:${properties.port}/experiment/delete/${data.id}/researchers`,{researchers_id: [params.id]},
              { headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
               }})
              .then(response => {
                handleResearchers([...researchers, data.researchers.find(re => re.id === params.id)])
                handleExperiments({
                  ...data,
                  researchers: data.researchers.filter(re => re.id !== params.id)
                })
              })

            }
          }}
        >
            <DeleteSharp sx={{color:'white', fontSize:'2.5rem'}}/>          
        </IconButton>
      )
    else 
      return (
        <IconButton 
        onClick={e => {
          e.stopPropagation()
          if (params.id !== data.researcher_creator_id) {
            axios.patch(`${properties.protocol}://${properties.url_server}:${properties.port}/experiment/delete/${data.id}/researchers`,{researchers_id: [params.id]},
            { headers: {
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
             }})
            handleResearchers([...researchers, data.researchers.find(re => re.id === params.id)])
            handleExperiments({
              ...data,
              researchers: data.researchers.filter(re => re.id !== params.id)
            })
          }
        }}
      >
          <DeleteSharp sx={{color:'white', fontSize:'2.5rem'}}/>          
      </IconButton>
      )
  }
  const columnsResearchersShared = [
  
    { field: 'name', headerName: 'Name', width: 170, headerAlign: 'center', sortable: false},
    { field: 'surname', headerName: 'Surname', width: 170, headerAlign: 'center', type: 'number', sortable: false},
    {
      width: 150,
      headerName: 'Delete',
      field: 'delete',
      renderCell: DeleteBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
  ]
  
  const columnsResearchersNotShared = [
    
    { field: 'name', headerName: 'Name', width: 170, headerAlign: 'center', sortable: false},
    { field: 'surname', headerName: 'Surname', width: 170, headerAlign: 'center', type: 'number', sortable: false},
    {
      width: 150,
      headerName: 'Share',
      field: 'share',
      renderCell: ShareBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
  ]

  const columnsSubjectsAdded = [
  
    { field: 'name', headerName: 'Name', width: 170, headerAlign: 'center', sortable: false},
    { field: 'surname', headerName: 'Surname', width: 170, headerAlign: 'center', type: 'number', sortable: false},
    { field: 'age', headerName: 'Age', type: 'number', width: 170, headerAlign: 'center', sortable: false },
    { field: 'gender', headerName: 'Gender', width: 170, headerAlign: 'center', sortable: false },
    {
      width: 150,
      headerName: 'Start',
      field: 'start',
      renderCell: StartExperiment,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },

 
  ]
  const columnsSubjectsNotAdded = [
  
    { field: 'name', headerName: 'Name', width: 170, headerAlign: 'center', sortable: false},
    { field: 'surname', headerName: 'Surname', width: 170, headerAlign: 'center', type: 'number', sortable: false},
    { field: 'age', headerName: 'Age', type: 'number', width: 170, headerAlign: 'center', sortable: false },
    { field: 'gender', headerName: 'Gender', width: 170, headerAlign: 'center', sortable: false },
    {
      width: 150,
      headerName: 'Add',
      field: 'add',
      renderCell: AddSubjectBtn,
      disableClickEventBubbling: true,
      headerAlign: 'center',
      sortable: false
    },
  ]
  
  

  return (
    <Grid container spacing={2}>

      <Grid item xs={12}  sx={{mt:6,}}>
        <h2 style={{color: 'white'}}>Stimulus</h2>
      </Grid>
      <Grid item xs={12} sx={{mb:'10vh'}}>
        <Stimuli data={data}/>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" spacing={2}>
        <TextFieldStyled 
          
          value={data.epoch_start}
          name="epoch_start"
          label="Epoch Start"
        />
                <TextFieldStyled 
          
          value={data.epoch_end}
          name="epoch_end"
          label="Epoch End"
        />
        </Stack>

      </Grid>
 
      <Grid item xs={12} sx={{mt:3}}>
        <h2 style={{color: 'white'}}>Device</h2>
      </Grid>
      {data.device.type==='eeg_headset' &&
        <>
          <Grid item xs={6}>
            <TextFieldStyled 
              fullWidth
              value={data.device.name}
              name="device_name"
              label="Device Name"
            />
          </Grid>
          <Grid item xs={2}>
            <TextFieldStyled 
              fullWidth
              value={data.device.sample_rate}
              name="sample_rate"
              label="Sample Rate"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">Hz</InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={2}>
              <TextFieldStyled
                fullWidth
                value={data.device.channels_count}
                name="channel_count"
                label="Channels"      
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Ch</InputAdornment>
                  )
                }}
              />
          </Grid>
      <Grid item xs={12}/>

      {
        data.device.channels
        .sort((a, b) => { return a.position - b.position })
        .map((e, index) => (
          <Grid item xs={1.5} key={index}>
            <TextFieldStyled 
              fullWidth
              value={ChannelsEnum[data.device.channels[index].channel-1].name}
              name="device_name"
              label={`Channel ${index+1}`}
        />
          </Grid>
        ))  
      }
      </>

      }
 



      <Grid item xs={12} sx={{mt:3}}>
        <h2 style={{color: 'white'}}>Researchers</h2>
      </Grid>
      <Grid item xs={6}>
        <Table columns={columnsResearchersShared} rows={data.researchers} loading={false}  height='41vh' rowPerPage={5}/>
      </Grid>
      <Grid item xs={6}>
        <Table columns={columnsResearchersNotShared} rows={researchers} loading={false}  height='41vh' rowPerPage={5}/>
      </Grid>
      <Grid item xs={12} sx={{mt:3}}>
      <h2 style={{color: 'white'}}>Subjects</h2>
      </Grid>
      <Grid item xs={12}>
        <Table columns={columnsSubjectsAdded} rows={data.subjects} loading={false}  height='41vh' rowPerPage={5}/>
      </Grid>
      <Grid item xs={12}>
        <Table columns={columnsSubjectsNotAdded} rows={subjects} loading={false}  height='41vh' rowPerPage={5}/>
      </Grid>
      


    </Grid>
    
    
     
  
  )
    
}
export default FormInfoExperiment