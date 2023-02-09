
import { memo, useEffect, useMemo, useState } from "react"
import ChannelsEnum from '../ChannelsEnum';
import TableStandard from '../Table/TableStandard';
import ChannelColumn from './ChannelColumn';
import ChartEEG from "./ChartEEG";



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

const initArray = () => {
  let volts = []
  for (let i = 0; i < 8; i++) {
      let channel = Array(250*5).fill({pv:0})
      volts.push(channel)
  }
  return volts
}

let interval = 0
const TableEEG = memo(({ device, play, pair}) => {
  const [items, setItems] = useState(initArray)



  useEffect(() => {
    let isMounted = true
    if(!play) {
      if (interval > 0)
        clearInterval(interval);
      return
    }

    if (isMounted) 
      interval = setInterval(() => {setItems(window.api.getVolts())}, 100)
    
    return () => {
      isMounted = false
      if (interval > 0)
        clearInterval(interval)
    }

  }, [play, pair])



  const columns = useMemo(
    () => [
      {
        Header: () => null,
        maxWidth: 100,
        minWidth: 60,
        width: 60,
        id: 'channel',
        Cell: ({ row }) => {
          return (
            <ChannelColumn name={ChannelsEnum[device.channels[row.id].channel-1].name} status={true} />
          )
        }
      },
      {
        Header: () => null,
        id: 'chart',       
        maxWidth: 300,
        minWidth: 300,
        width: 300,

        Cell: ({ row }) => {
          return (<ChartEEG items={items[row.id]} color={getColor(row.id)}/>)
        }
      },
      {
        Header: () => null,
        maxWidth: 200,
        minWidth: 175,
        width: 140,
        id: 'lastVolt',  
        Cell: ({ row }) => {
          return (<p style={{color:'white', fontSize:'15px'} }>{items[row.id][items[row.id].length -1 ].pv.toFixed(2)} uVrms</p>)
        }     

      }
    ], [device, items])

   

    const data = useMemo (
      () => {
         return device.channels
        .sort((a, b) => { return a.position - b.position })
        .map((e, index)=> (
          {}
        ))


      }, [device])


  return (
    
    <TableStandard  columns={columns} data={data}/>

    
  )
})

export default TableEEG