import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar.jsx';
import './Profile.css';

const baseUrl = import.meta.env.VITE_BASE_URL;

function Profile({ setIsLoggedIn }) {
  const [userName, setUserName] = useState('');
  const [Joined, setJoined] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState("");
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseUrl}/user/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setIsLoggedIn(false);
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await fetch(`${baseUrl}/user/userInfoProfile`, {
        method: "GET",
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setUserName(data.email);
        const dateObj = new Date(data.createdAt);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setJoined(formattedDate);
      }
    } catch (error) {
      console.error("Error getting User details: ", error);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername) return;
    try {
      const response = await fetch(`${baseUrl}/user/updateUsername`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername })
      });
      if (response.ok) {
        setUserName(newUsername);
        setShowUsernameModal(false);
        setNewUsername('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const response = await fetch(`${baseUrl}/user/updatePassword`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
      }
    } catch (error) {
      console.error("Updating password went wrong :", error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <div className="Page">
      <div className="PageSection">
        <div className="navbar">
          <Navbar />
        </div>
        <div className="PageContentParent">
          <div className="profile-container">
            {/* User Avatar Initial */}
            {/* <div className="user-avatar">
              {userName ? userName.charAt(0).toUpperCase() : "?"}
            </div> */}

            <h1 className="profile-title">Account Settings</h1>

            <div className="info-grid">
              <div className="info-box">
                <span className="info-label">Name</span>
                <span className="info-value">{userName || 'Loading...'}</span>
              </div>
              <div className="info-box">
                <span className="info-label">Member Since</span>
                <span className="info-value">{Joined || 'Loading...'}</span>
              </div>
            </div>

            <div className="profile-actions-stack">
              <button className="primary-action-btn" onClick={() => setShowUsernameModal(true)}>
                Update Username
              </button>
              <button className="primary-action-btn" onClick={() => setShowPasswordModal(true)}>
                Update Password
              </button>
              <button className="danger-action-btn" onClick={handleLogout}>
                Logout Account
              </button>
            </div>
          </div>

          {/* Modals */}
          {showUsernameModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3>Update Username</h3>
                <input
                  type="text"
                  placeholder="Enter new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowUsernameModal(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleUpdateUsername}>Save Changes</button>
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
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                  <button className="save-btn" onClick={handleUpdatePassword}>Update</button>
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