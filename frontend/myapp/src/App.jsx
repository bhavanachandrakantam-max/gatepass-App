import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Faculty from './components/Faculty/Faculty';
import Admin from './components/Admin/Admin';
import Security from './components/Security/Security';
import Hod from './components/Hod/Hod';
import Office from './components/Office/Office';
import Clerk from './components/Clerk/Clerk';
import Principal from './components/Principal/Principal';
import Otp from './components/Otp';
import ChangePassword from './components/ChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/faculty-dashboard" element={<Faculty />} />
       <Route path="/admin-dashboard" element={<Admin />} />
       <Route path="/security-dashboard" element={<Security />} />
       <Route path="/hod-dashboard" element={<Hod />} />
       <Route path="/office-dashboard" element={<Office />} />
       <Route path="/clerk-dashboard" element={<Clerk />} />
       <Route path="/principal-dashboard" element={<Principal />} />
       <Route path="/otp" element={<Otp />} />
       <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;
