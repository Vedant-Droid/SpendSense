import { useEffect,useState } from 'react';
import {useNavigate} from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './Profile.css';

function Profile({setIsLoggedIn}){

  const [userName, setUserName] = useState('');
  const [Joined, setJoined] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [oldPassword,setOldPassword]=useState("")
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/user/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsLoggedIn(false);
        navigate('/login');
      } else {
        console.error('Logout failed.');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getUserInfo=async()=>{

    try {
      const response=await fetch("/user/userInfoProfile",{
        method:"GET",
        credentials:"include",
        headers:{
          'Content-Type': 'application/json',
        },
      })
      const data=await response.json();
      if (response.ok) {
        setUserName(data.email);
        setJoined(data.createdAt);
        console.log(Joined)
      } else {
        console.error('Failed to fetch user info');
      }
    }catch(error) {
      console.error("Error getting User deatails: ",error)
    }




  }

  const handleUpdateUsername=async()=>{
    setShowUsernameModal(false)
    try {
      const response = await fetch("/user/updateUsername",{
        method:"PUT",
        credentials:"include",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({newUsername})
      })
      if(response.ok){
        setUserName(newUsername)
        console.log("username has been changes successfully")
      }
    } catch (error) {
      console.error(error)
    }


  }


  const handleUpdatePassword=async()=>{
    setShowPasswordModal(false)
    try {
      const response=await fetch("/user/updatePassword",{
        method:"PUT",
        credentials:"include",
        body:JSON.stringify({oldPassword,newPassword}),
        headers:{
          'Content-Type': 'application/json',
          
    }})

    if(response.ok){
      console.log("Password has been updated")
      setOldPassword("")
      setNewPassword("")
    }
    } catch (error) {
      console.error("Updating password went wrong :",error)  
    }

  }


  useEffect(() => {
    getUserInfo();
    handleUpdateUsername()
  }, []);


  return (
    <div className="Page">
  <div className="PageSection">
    <div className="navbar">
      <Navbar />
    </div>
    <div className="PageContentParent">
      <div className="profile-container">
        <h1 className="profile-title">Your Profile</h1>

        <div className="profile-card">
          <div className="profile-details">
            <div className="detail-row">
              <span className="label">Name:</span>
              <span className="value">{userName || 'Loading...'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Joined:</span>
              <span className="value">{Joined || '2025-01-01'}</span>
            </div>
          </div>
          <div className="profile-actions">
            <button className="action-btn" onClick={() => setShowUsernameModal(true)}>
              Change Username
            </button>
            <button className="action-btn" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
          </div>

        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {showUsernameModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Username</h3>
            <input
              type="text"
              placeholder="New username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowUsernameModal(false)}>Cancel</button>
              <button className="save-btn" onClick={() => handleUpdateUsername()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Update Password</h3>
            <input
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="save-btn" onClick={() => handleUpdatePassword()}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
</div>

  );
}

export default Profile;
