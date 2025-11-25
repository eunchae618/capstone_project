import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: '안녕하세요! 한림대 주변 상권 AI 상담사입니다. 무엇을 도와드릴까요? 😊'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 메시지 추가 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Markdown 제거 함수
  const removeMarkdown = (text) => {
    if (!text) return text;
    let cleaned = text;
    // **bold** 제거
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
    // *italic* 제거
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
    // # 헤더 제거
    cleaned = cleaned.replace(/^#+\s+/gm, '');
    // - 리스트 제거
    cleaned = cleaned.replace(/^-\s+/gm, '');
    // `코드` 제거
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    // 링크 [text](url) 제거
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    return cleaned;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // 사용자 메시지 추가
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: '서버 오류가 발생했습니다.' }));
        throw new Error(errorData.detail || `서버 오류 (${response.status})`);
      }

      const data = await response.json();
      // Markdown 제거 후 메시지 추가
      const cleanedResponse = removeMarkdown(data.response);
      setMessages(prev => [...prev, { type: 'ai', text: cleanedResponse }]);
    } catch (error) {
      console.error('AI 채팅 오류:', error);
      const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
      setMessages(prev => [...prev, {
        type: 'ai',
        text: `죄송합니다. 오류가 발생했습니다: ${errorMessage}\n\n확인 사항:\n1. 백엔드 서버가 실행 중인지 확인\n2. .env 파일에 GEMINI_API_KEY가 설정되어 있는지 확인\n3. 브라우저 콘솔에서 상세 오류 확인`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aichat-page">
      <div className="aichat-container">
        <div className="chat-header">
          <h2 className="chat-title">한림대 상권 AI 상담사</h2>
        </div>
        
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-bubble">
                <div className="message-text">
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="chat-send-btn" disabled={loading || !inputValue.trim()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;

