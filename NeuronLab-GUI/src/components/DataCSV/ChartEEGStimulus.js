import { LineChart, Line, ReferenceLine } from 'recharts';


const ChartEEGStimulus = ({ items, color, stimulus, width}) => {
  return (

    <LineChart 
      width={width} 
      height={50} 
      data={items}
    >

      {
        stimulus.map((el, index)=> <ReferenceLine key={index} x={el.x} stroke="black" label={{ value: el.stim, fill: 'white', fontWeight: 'bold', fontSize:'24px'}} />)
      }
      <Line type="monotone" dataKey="pv" isAnimationActive={false} stroke={color} dot={false}/>
    </LineChart>

  )
}

export default ChartEEGStimulus