import FormProfile from "../components/FormProfile/FormProfile"
import Sidebar from "../components/Sidebar/Sidebar"
import { useState } from "react"

const Profile = () => {
  const [init, setInit] = useState(true)
  return (
    <Sidebar init={init} pos='0' tab={'Profile'} handleSidebar={setInit}>
        <FormProfile/>
    </Sidebar>
  )
}


export default Profile