import { useEffect, useState, memo } from "react"
import axios from "axios"
import Table from '../Table/Table';
import { Grid } from "@mui/material";
import { properties } from "../../properties";

const TableOwnFeatureExtraction = memo(({csv}) => {

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (isMounted && csv !== undefined) {
      axios.get(`${properties.protocol}://${properties.url_server}:${properties.port}/csv/${csv}/feature`,
      { headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
       }})
      .then(response => {
        if (response.data !== null) 
          setData([response.data])
        setLoading(false)
      })

    }
    return () => { isMounted = false };
    
  }, [csv])

 

  const columns = [
  

    { field: 'feature', headerName: 'Feature', width: 550, headerAlign: 'center', sortable: false},

  ]


  return (
    <Grid container>
      <Grid item xs={6}>
        <Table columns={columns} rows={data !== undefined ? data : []} loading={loading} height='18vh' rowPerPage={1}/>
      </Grid>


    </Grid>

  )


})
export default TableOwnFeatureExtraction