import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/login';
import Faculty from './components/Faculty/Faculty';
import SuperAdmin from './components/SuperAdmin/SuperAdmin';
import Security from './components/Security/Security';
import Hod from './components/Hod/Hod';
import Admin from './components/Admin/Admin';
import Principal from './components/Principal/Principal';
import Otp from './components/Otp/Otp';
import ChangePassword from './components/ChangePassword/ChangePassword';
import RequestForm from './components/RequestForm/RequestForm';
import Cp from './components/Admin/ChangePassword1';
import Oa from './components/Admin/otp1';
import Fc from './components/Faculty/fChangePassword';
import Fo from './components/Faculty/fotp';
import Ho from './components/Hod/hotp';
import Hc from './components/Hod/hChangePassword';
import Po from './components/Principal/potp';
import Pc from './components/Principal/pChangePassword';
import So from './components/Security/sotp';
import Sc from './components/Security/sChangePassword';
import SAo from './components/SuperAdmin/SAotp';
import SAc from './components/SuperAdmin/SAChangePassword';
import Ar from './components/Admin/Reports';
import Hr from './components/Hod/hReports';
import Pr from './components/Principal/pReports';
import SAr from './components/SuperAdmin/saReports';

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
        <Route path="/admin-dashboard" element={<Admin />} />
        <Route path="/principal-dashboard" element={<Principal />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* CORRECTED: Use /otp1 (not /admin/otp1) */}
        <Route path="/otp1" element={<Oa />} />
        {/* CORRECTED: Use /change-password1 (not /admin/change-password1) */}
        <Route path="/change-password1" element={<Cp />} />
        <Route path="/admin-reports" element={< Ar />} />

        <Route path="/fchange-password" element={<Fc />} />
        <Route path="/fotp" element={<Fo />} />

        <Route path="/hchange-password" element={<Hc />} />
        <Route path="/hotp" element={<Ho />} />
        <Route path="/hod-reports" element={<Hr />} />

        <Route path="/pchange-password" element={<Pc />} />
        <Route path="/potp" element={<Po />} />
        <Route path="/Pr" element={<Pr />} />

        <Route path="/schange-password" element={<Sc />} />
        <Route path="/sotp" element={<So />} />

        <Route path="/sachange-password" element={<SAc />} />
        <Route path="/saotp" element={<SAo />} />
        <Route path="/SAr" element={<SAr />} />


      </Routes>
    </Router>
  );
}

export default App;