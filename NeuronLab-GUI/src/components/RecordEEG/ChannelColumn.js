const ChannelColumn = ({name, status}) => {
  if (status)
    return (<h3 style={{color:'white', fontWeight:'bold', fontSize:'16px'}}>{name}</h3>)

  return (<p style={{color:'white', fontWeight:'bold'}}>{name}</p>)
}
export default ChannelColumn