import { useLocation } from "react-router-dom"
import Sidebar from "../components/Sidebar/Sidebar"
import { useState } from "react"
import FormExperiment from "../components/FormExperiment/FormExperiment"

const AddExperiment = () => {
  const { state } = useLocation()
  const [init, setInit] = useState(state)

  return (
    <Sidebar init={init} pos='2' tab={'Add Experiment'} handleSidebar={setInit}>
      <FormExperiment init={init}/>
    </Sidebar>
  )
}
export default AddExperiment