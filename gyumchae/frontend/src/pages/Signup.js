import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import './Signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (username.length < 3) {
      setError('아이디는 최소 3자 이상이어야 합니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(username, password);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">회원가입</h1>
        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          <div className="input-group">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="signup-input"
              required
            />
            <div className="input-line"></div>
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="비밀번호 (최소 6자)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signup-input"
              required
            />
            <div className="input-line"></div>
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="signup-input"
              required
            />
            <div className="input-line"></div>
          </div>
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? '가입 중...' : '회원가입 하기'}
          </button>
        </form>
        <div className="signup-links">
          <Link to="/login" className="link-text">이미 계정이 있으신가요? 로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

