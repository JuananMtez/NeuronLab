import AddButton from "../components/AddButton/AddButton"
import Sidebar from "../components/Sidebar/Sidebar"
import SubjectsTable from "../components/SubjectsTable/SubjectsTable"
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const Subjects = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [init, setInit] = useState(state === null ? true : state.sidebar)

  const handleAddSubject = () => {
    navigate('/subject/add', { state: init })
  }

  return (
    
    <Sidebar init={init} pos='1' tab={'Subjects'} handleSidebar={setInit}>
      <SubjectsTable sidebar={init}/>
      <AddButton onClick={handleAddSubject} sidebar={init}/>
    </Sidebar>
  )
}


export default Subjects