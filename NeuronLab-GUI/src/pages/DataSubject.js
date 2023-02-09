import { useLocation } from "react-router-dom"
import FormSubjectDisabled from "../components/FormSubject/FormSubjectDisabled"
import Sidebar from "../components/Sidebar/Sidebar"
import { useState } from "react"
const DataSubject = () => {

  const { state } = useLocation()
  const [init, setInit] = useState(state.sidebar)

  return (
    <Sidebar init={init} pos='1' tab={'Subject data'} handleSidebar={setInit}>
      <FormSubjectDisabled data={state} init={init}/>
    </Sidebar>
  )
}

export default DataSubject