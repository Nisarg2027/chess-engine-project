import { useState } from 'react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export function TutorialModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#242424', color: 'white', padding: '30px', borderRadius: '10px', width: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'sans-serif', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        <h2 style={{ marginTop: 0, color: '#f5b800' }}>How to Play Chess</h2>
        <p><strong>Goal:</strong> Trap the opponent's King so it cannot escape.</p>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Pawn:</strong> Moves forward one square. Captures diagonally.</li>
          <li><strong>Knight:</strong> Moves in an 'L' shape. Can jump over pieces.</li>
          <li><strong>Bishop:</strong> Moves diagonally.</li>
          <li><strong>Rook:</strong> Moves horizontally or vertically.</li>
          <li><strong>Queen:</strong> Moves horizontally, vertically, or diagonally.</li>
          <li><strong>King:</strong> Moves one square in any direction. Must be protected.</li>
        </ul>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#f5b800', color: '#000', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>Got it!</button>
      </div>
    </div>
  );
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        if (isLogin) {
          const userData = await response.json();
          onLoginSuccess(userData);
          onClose();
        } else {
          alert("Registration successful! You can now log in.");
          setIsLogin(true); 
        }
      } else { setErrorMsg(isLogin ? "Invalid credentials" : "Username already exists"); }
    } catch (err) { setErrorMsg("Failed to connect to server"); }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#141414', color: 'white', padding: '30px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', position: 'relative', textAlign: 'center', fontFamily: 'sans-serif', border: '1px solid #2a2a2a' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        <h2 style={{ color: '#f5b800', marginTop: '0' }}>{isLogin ? 'Login to Play' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: 'white' }} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: 'white' }} />
          {errorMsg && <p style={{ color: '#ff4c4c', margin: '0', fontSize: '14px' }}>{errorMsg}</p>}
          <button type="submit" style={{ padding: '12px', backgroundColor: '#f5b800', color: '#000', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#f5b800', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
}

export function Header({ currentUser, isAdmin, view, setView, handleLogout, setIsAuthOpen, leaveGame }) {

  function handleBack() {
    if (view === 'game') {
      leaveGame(); 
    } else if (view === 'bracket') {
      setView('tournaments');
    } else if (view === 'tournaments' || view === 'profile') {
      setView('lobby');
    } else if (view === 'lobby') {
      setView('landing');
    }
  }

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px', backgroundColor: 'rgba(18, 18, 18, 0.95)', borderBottom: '1px solid #2a2a2a', zIndex: 100, fontFamily: 'sans-serif' }}>
      
      {/* Logo & Back Button Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        

        {/* Logo */}
        <div onClick={() => setView('landing')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <span style={{ fontSize: '30px', color: '#f5b800' }}>♔</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '1px' }}>GrandMaster</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', gap: '40px', color: '#aaa', fontWeight: '600', fontSize: '15px' }}>
        <span onClick={() => setView('landing')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#aaa'}>🏠 Home</span>
        <span onClick={() => setView('lobby')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#aaa'}>⚔️ Play</span>
        <span onClick={() => setView('tournaments')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#aaa'}>🏆 Tournaments</span>
      </nav>

      {/* Auth / Profile */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
              <div style={{ color: isAdmin ? '#f5b800' : 'white', fontWeight: 'bold' }}>{isAdmin ? '👑 ' : '👤 '} {currentUser.username}</div>
              <div style={{ color: '#aaa', fontSize: '12px' }}>Elo: {currentUser.eloRating}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setView('profile')} style={{ background: '#1a1a1a', color: 'white', border: '1px solid #333', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Profile</button>
              <button onClick={handleLogout} style={{ background: 'transparent', color: '#ff4c4c', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Logout</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAuthOpen(true)} style={{ padding: '10px 28px', backgroundColor: '#f5b800', color: '#000', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.1s' }} onMouseDown={e => e.target.style.transform='scale(0.95)'} onMouseUp={e => e.target.style.transform='scale(1)'}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}