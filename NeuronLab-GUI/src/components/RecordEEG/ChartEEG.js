import { LineChart, Line } from 'recharts';


const ChartEEG = ({ items, color }) => {
  return (

    <LineChart 
      width={1175} 
      height={50} 
      data={items}
    >
      <Line type="monotone" dataKey="pv" isAnimationActive={false} stroke={color} dot={false}/>
    </LineChart>
  )
}

export default ChartEEG