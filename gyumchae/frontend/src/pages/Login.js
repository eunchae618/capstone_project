import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(username, password);
      navigate('/');
      window.location.reload(); // 헤더 업데이트를 위해 새로고침
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">로그인</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
            />
            <div className="input-line"></div>
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <div className="input-line"></div>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인 하기'}
          </button>
        </form>
        <div className="login-links">
          <Link to="/" className="link-text">아이디 / 비밀번호 찾기</Link>
          <Link to="/signup" className="link-text">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

