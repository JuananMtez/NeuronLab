
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register'
import Home from './pages/Home';
import Profile from './pages/Profile';
import Subjects from './pages/Subjects';
import Experiments from './pages/Experiments';
import AddSubject from './pages/AddSubject';
import DataSubject from './pages/DataSubject';
import AddExperiment from './pages/AddExperiment'
import DataExperiment from './pages/DataExperiment'
import RecordEEG from './pages/RecordEEG';
import DataCsv from './pages/DataCsv';
import ICACsv from './pages/ICACsv';
import EpochData from './pages/EpochData';



function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />}/>
      <Route path="login" element={<Login/>}/>
      <Route path="register" element={<Register/>}/>
      <Route path="home" element={<Home/>}/>
      <Route path="profile" element={<Profile/>}/>
      <Route path="subjects" element={<Subjects/>}/>
      <Route path="experiments" element={<Experiments/>}/>
      <Route path="subject/add" element={<AddSubject/>}/>
      <Route path="subject/data" element={<DataSubject/>}/>
      <Route path="experiment/add" element={<AddExperiment/>}/>
      <Route path="experiment/data" element={<DataExperiment/>}/>
      <Route path="experiment/record_eeg" element={<RecordEEG/>}/>
      <Route path="csv/data" element={<DataCsv/>}/>
      <Route path="csv/ica" element={<ICACsv/>}/>
      <Route path="csv/epoch" element={<EpochData/>}/>





    </Routes>
  );
}

export default App;
