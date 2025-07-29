import { useEffect, useState } from 'react';
import {  Routes, Route,} from 'react-router-dom';
import Login from '../pages/Login/Login.jsx';
import Logs from '../pages/Logs/Logs.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import { useNavigate } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const Navigate=useNavigate()
  useEffect(() => {
    const checkCookie = async () => {
      try {
        const res = await fetch('/user/verify', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          setIsLoggedIn(true);
          Navigate("/dashboard")
        } else {
          throw new Error();
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    if (isLoggedIn==false){
      Navigate("/login")
    }
    checkCookie(); 
  }, []);

  return(
    <div>
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/profile" element={<Profile setIsLoggedIn={setIsLoggedIn}/>} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>


  ) 
  
  

}

export default App;
