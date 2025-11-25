import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Apply from './pages/Apply';
import Event from './pages/Event';
import Event1 from './pages/Event1';
import Event2 from './pages/Event2';
import Community from './pages/Community';
import Community2 from './pages/Community2';
import PostDetail from './pages/PostDetail';
import AIChat from './pages/AIChat';
import Map from './pages/Map';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/event" element={<Event />} />
          <Route path="/event/roulette" element={<Event1 />} />
          <Route path="/event/scratch" element={<Event2 />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/posts/:postId" element={<PostDetail />} />
          <Route path="/community/reviews" element={<Community2 />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
