import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/login';
import Faculty from './components/Faculty/Faculty';
import SuperAdmin from './components/SuperAdmin/SuperAdmin';
import Security from './components/Security/Security';
import Hod from './components/Hod/Hod';
import Office from './components/Office/Office';
import Admin from './components/Admin/Admin';
import Principal from './components/Principal/Principal';
import Otp from './components/Otp/Otp';
import ChangePassword from './components/ChangePassword/ChangePassword';
import RequestForm from './components/RequestForm/RequestForm';
import Cp from './components/Admin/ChangePassword1';
import Oa from './components/Admin/otp1';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/request-form" element={<RequestForm/>}/>
        <Route path="/faculty-dashboard" element={<Faculty />} />
        <Route path="/superAdmin-dashboard" element={<SuperAdmin />} />
        <Route path="/security-dashboard" element={<Security />} />
        <Route path="/hod-dashboard" element={<Hod />} />
        <Route path="/office-dashboard" element={<Office />} />
        <Route path="/admin-dashboard" element={<Admin />} />
        <Route path="/principal-dashboard" element={<Principal />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* CORRECTED: Use /otp1 (not /admin/otp1) */}
        <Route path="/otp1" element={<Oa />} />
        
        {/* CORRECTED: Use /change-password1 (not /admin/change-password1) */}
        <Route path="/change-password1" element={<Cp />} />
      </Routes>
    </Router>
  );
}

export default App;