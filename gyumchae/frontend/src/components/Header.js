import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, authAPI, removeToken } from '../utils/api';
import './Header.css';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (token) {
      try {
        const user = await authAPI.getMe();
        setIsLoggedIn(true);
        setUsername(user.username);
      } catch (error) {
        removeToken();
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsLoggedIn(false);
    setUsername('');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          GYEOMCHAE
        </Link>
        <nav className="nav-menu">
          <Link to="/apply" className="nav-item">APPLY</Link>
          <Link to="/map" className="nav-item">MAP</Link>
          <Link to="/event" className="nav-item">EVENT</Link>
          <Link to="/ai-chat" className="nav-item">AI CHAT</Link>
          <Link to="/community" className="nav-item">COMMUNITY</Link>
          {isLoggedIn ? (
            <>
              <span className="nav-item user-name">{username}님</span>
              <button onClick={handleLogout} className="nav-item logout-btn">LOGOUT</button>
            </>
          ) : (
            <Link to="/login" className="nav-item">LOGIN</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

