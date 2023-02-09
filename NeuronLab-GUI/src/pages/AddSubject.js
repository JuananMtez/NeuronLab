import { useLocation } from "react-router-dom"
import FormSubject from "../components/FormSubject/FormSubject"
import Sidebar from "../components/Sidebar/Sidebar"
import { useState } from "react"

const AddSubject = () => {
  const { state } = useLocation()
  const [init, setInit] = useState(state)

  return (
    <Sidebar init={init} pos='1' tab={'Add Subject'} handleSidebar={setInit}>
      <FormSubject init={init}/>
    </Sidebar>
  )
}

export default AddSubject