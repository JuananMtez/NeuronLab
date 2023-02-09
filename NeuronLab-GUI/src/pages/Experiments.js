import { useState } from "react"
import Sidebar from "../components/Sidebar/Sidebar"
import { useLocation, useNavigate } from "react-router-dom"
import ExperimentsTable from "../components/ExperimentsTable/ExperimentsTable"
import AddButton from "../components/AddButton/AddButton"

const Experiments = () => {
  const { state } = useLocation()
  const [init, setInit] = useState(state === null ? true : state.sidebar)
  const navigate = useNavigate()

  const handleAddExperiment = () => {
    navigate('/experiment/add', { state: init })

  }
  return (
    
    <Sidebar init={init} pos='2' tab={'Experiments'} handleSidebar={setInit}>
      <ExperimentsTable init={init}/>
      <AddButton sidebar={init} onClick={handleAddExperiment}/>
    </Sidebar>
  )
}

export default Experiments