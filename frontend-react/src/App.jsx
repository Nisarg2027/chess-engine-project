const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// --- TUTORIAL & AUTH MODALS (Unchanged) ---
function TutorialModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#242424', color: 'white', padding: '30px', borderRadius: '10px', width: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'sans-serif', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        <h2 style={{ marginTop: 0, color: '#646cff' }}>How to Play Chess</h2>
        <p><strong>Goal:</strong> Trap the opponent's King so it cannot escape (Checkmate).</p>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Pawn:</strong> Moves forward one square. Captures diagonally.</li>
          <li><strong>Knight:</strong> Moves in an 'L' shape. Can jump over pieces.</li>
          <li><strong>Bishop:</strong> Moves diagonally.</li>
          <li><strong>Rook:</strong> Moves horizontally or vertically.</li>
          <li><strong>Queen:</strong> Moves horizontally, vertically, or diagonally.</li>
          <li><strong>King:</strong> Moves one square in any direction. Must be protected.</li>
        </ul>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>Got it!</button>
      </div>
    </div>
  );
}

function AuthModal({ isOpen, onClose, onLoginSuccess }) {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
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
      } else {
        setErrorMsg(isLogin ? "Invalid credentials" : "Username already exists");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to server");
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#242424', color: 'white', padding: '30px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', position: 'relative', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        <h2 style={{ color: '#646cff', marginTop: '0' }}>{isLogin ? 'Login to Play' : 'Create Account'}</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#333', color: 'white' }} />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#333', color: 'white' }} />
          {errorMsg && <p style={{ color: '#ff4c4c', margin: '0', fontSize: '14px' }}>{errorMsg}</p>}
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#aaa' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [game, setGame] = useState(new Chess());
  const [stompClient, setStompClient] = useState(null);
  
  const [view, setView] = useState('lobby'); // 'lobby', 'game', or 'tournaments'
  const [gameMode, setGameMode] = useState('hard'); 
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const [roomId, setRoomId] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const roomSubscriptionRef = useRef(null);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState(null); 
  const [playerColor, setPlayerColor] = useState('w'); 

  // Tournament State
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const socket = new SockJS(`${BACKEND_URL}/chess-socket`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('✅ Connected to Java Backend');
        client.subscribe('/topic/board', (message) => {
          setGameMode((currentMode) => {
            if (currentMode !== 'multiplayer') {
              try {
                const data = JSON.parse(message.body);
                setGame((currentGame) => {
                  const gameCopy = new Chess();
                  gameCopy.loadPgn(currentGame.pgn()); 
                  if (data.move) {
                    gameCopy.move({
                      from: data.move.substring(0, 2),
                      to: data.move.substring(2, 4),
                      promotion: data.move.length > 4 ? data.move[4] : 'q'
                    });
                  } else {
                    gameCopy.load(data.fen); 
                  }
                  return gameCopy;
                });
              } catch (e) {
                setGame(new Chess(message.body.replace(/^"|"$/g, '')));
              }
              setIsAiThinking(false);
            }
            return currentMode;
          });
        });
      },
    });

    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, []);

  // --- TOURNAMENT API CALLS ---
  async function fetchTournaments() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/`);
      if (res.ok) setTournaments(await res.json());
    } catch (err) { console.error("Failed to fetch tournaments"); }
  }

  async function handleCreateTournament() {
    const name = prompt("Enter Tournament Name:");
    if (!name) return;
    try {
      await fetch(`${BACKEND_URL}/api/tournaments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      fetchTournaments();
    } catch (err) { alert("Failed to create tournament."); }
  }

  async function handleRegisterTournament(id) {
    if (!currentUser) return alert("You must log in to register!");
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
      });
      if (res.ok) {
        alert("Registered successfully!");
        fetchTournaments();
      } else {
        alert(await res.text());
      }
    } catch (err) { alert("Failed to register."); }
  }

  async function handleStartTournament(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}/start`, { method: 'POST' });
      if (res.ok) {
        alert("Tournament Started! Brackets generated.");
        fetchTournaments();
      } else {
        alert(await res.text());
      }
    } catch (err) { alert("Failed to start tournament."); }
  }

  // --- MULTIPLAYER ROOM LOGIC ---
  async function handleCreateRoom() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, { method: 'POST' });
      const newRoomId = await response.text();
      setRoomId(newRoomId);
      setGameMode('multiplayer');
      setPlayerColor('w'); 
      setGame(new Chess()); 
      setView('game');

      if (stompClient && stompClient.connected) {
        if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = stompClient.subscribe(`/topic/room/${newRoomId}`, subscribeToRoom);
      }
    } catch (error) { alert("Failed to connect to server."); }
  }

  async function handleJoinRoom(codeOverride) {
    const code = (codeOverride || joinCodeInput).trim().toUpperCase();
    if (code.length !== 4) return alert("Room code must be 4 characters!");

    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/${code}`);
      if (response.ok) {
        const currentData = await response.text();
        let boardData = currentData;
        try {
          const parsed = JSON.parse(currentData);
          if (typeof parsed === 'object' && parsed !== null) boardData = parsed.fen || parsed.board || currentData;
          else if (typeof parsed === 'string') boardData = parsed;
        } catch(e) {}

        boardData = boardData.replace(/^"|"$/g, '').trim();

        setRoomId(code);
        setGameMode('multiplayer');
        setPlayerColor('b'); 
        
        const newGame = new Chess();
        try {
          newGame.loadPgn(atob(boardData));
        } catch (e) {
          try {
            if (boardData.includes("1.") || boardData.includes("[")) newGame.loadPgn(boardData.replace(/\\n/g, '\n').replace(/\\"/g, '"'));
            else newGame.load(boardData); 
          } catch(err) {}
        }
        
        setGame(newGame); 
        setView('game');

        if (stompClient && stompClient.connected) {
          if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
          roomSubscriptionRef.current = stompClient.subscribe(`/topic/room/${code}`, subscribeToRoom);
        }
      } else { alert("Room not found!"); }
    } catch (error) { console.error("Failed to join room:", error); }
  }

  function subscribeToRoom(message) {
    let boardData = message.body;
    try {
      const parsed = JSON.parse(message.body);
      if (typeof parsed === 'object' && parsed !== null) boardData = parsed.fen || parsed.board || message.body;
      else if (typeof parsed === 'string') boardData = parsed;
    } catch(e) {}
    
    boardData = boardData.replace(/^"|"$/g, '').trim();
    
    setGame((currentGame) => {
      const newGame = new Chess();
      try {
        newGame.loadPgn(atob(boardData));
      } catch (e) {
        try {
          if (boardData.includes("1.") || boardData.includes("[")) newGame.loadPgn(boardData.replace(/\\n/g, '\n').replace(/\\"/g, '"'));
          else newGame.load(boardData); 
        } catch(err) { return currentGame; }
      }
      return newGame;
    });
  }

  function handleStartLocalGame(mode) {
    setGameMode(mode);
    setPlayerColor('w'); 
    setGame(new Chess());
    setRoomId('');
    setView('game');
    setMoveFrom(null);
    setOptionSquares({});
    if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
  }

  function leaveGame() {
    setView('lobby');
    if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
  }

  function handleUndo() {
    if (gameMode !== 'practice') return;
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    gameCopy.undo(); 
    setGame(gameCopy);
    setOptionSquares({});
    setMoveFrom(null);
  }

  function getMoveOptions(square) {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) { 
      setOptionSquares({}); 
      return false; 
    }
    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)' : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',  
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = { background: 'rgba(255, 255, 0, 0.4)' };
    setOptionSquares(newSquares);
    return true;
  }

  function makeMove(sourceSquare, targetSquare) {
    if (game.isGameOver() || isAiThinking) return false;
    if (gameMode === 'multiplayer' && game.turn() !== playerColor) return false; 
    
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn()); 
    
    try {
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move === null) return false;
      
      setGame(gameCopy);
      setOptionSquares({}); 
      setMoveFrom(null); 

      if (gameMode === 'multiplayer') {
        if (stompClient && stompClient.connected) {
          const safeHistory = btoa(gameCopy.pgn());
          stompClient.publish({ destination: '/app/room/move', body: JSON.stringify({ roomId: roomId, fen: safeHistory }) });
        }
      } else if (gameMode !== 'practice') {
        setIsAiThinking(true);
        if (stompClient && stompClient.connected) {
          stompClient.publish({ destination: '/app/move', body: JSON.stringify({ fen: gameCopy.fen(), difficulty: gameMode }) });
        }
      }
      return true;
    } catch (error) { return false; }
  }

  function onSquareClick(square) { 
    if (isAiThinking || game.isGameOver()) return;
    if (gameMode === 'multiplayer' && game.get(square) && game.get(square).color !== playerColor && !moveFrom) return; 

    if (moveFrom) {
      const moveSuccess = makeMove(moveFrom, square);
      if (!moveSuccess) {
        if (game.get(square) && game.get(square).color === game.turn()) {
          setMoveFrom(square);
          getMoveOptions(square);
        } else {
          setMoveFrom(null);
          setOptionSquares({});
        }
      }
    } else {
      if (game.get(square) && game.get(square).color === game.turn()) {
        const hasMoves = getMoveOptions(square);
        if (hasMoves) setMoveFrom(square);
      }
    }
  }

  function onDrop(sourceSquare, targetSquare) {
    return makeMove(sourceSquare, targetSquare);
  }

  let gameStatus = "Game in Progress";
  if (game.isCheckmate()) gameStatus = "🏆 Checkmate!";
  else if (game.isDraw()) gameStatus = "🤝 Draw!";
  else if (isAiThinking) gameStatus = "🤔 AI is calculating...";
  else if (gameMode === 'practice') gameStatus = "Practice Mode (Local Play)";
  else if (gameMode === 'multiplayer') gameStatus = game.turn() === playerColor ? "Your turn!" : "Waiting for opponent...";
  else gameStatus = "Your turn (White)";

  const isAdmin = currentUser && currentUser.username.toLowerCase() === 'admin';

  // --- RENDER ---
  return (
    <>
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setCurrentUser} />

      {/* HEADER BAR */}
      <div style={{ position: 'absolute', top: '20px', right: '30px', textAlign: 'right', fontFamily: 'sans-serif', zIndex: 10 }}>
        {currentUser ? (
          <div style={{ backgroundColor: '#1a1a1a', padding: '10px 20px', borderRadius: '8px', border: isAdmin ? '2px solid #ffd700' : '1px solid #4caf50' }}>
            <h3 style={{ margin: '0 0 5px 0', color: isAdmin ? '#ffd700' : '#4caf50' }}>
              {isAdmin ? '👑 ' : '👤 '} {currentUser.username}
            </h3>
            <p style={{ margin: 0, color: '#aaa' }}>🏆 Elo: <strong>{currentUser.eloRating}</strong></p>
            <button onClick={() => setCurrentUser(null)} style={{ background: 'transparent', color: '#ff4c4c', border: 'none', cursor: 'pointer', marginTop: '5px', textDecoration: 'underline' }}>Logout</button>
          </div>
        ) : (
          <button onClick={() => setIsAuthOpen(true)} style={{ padding: '10px 20px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login / Register
          </button>
        )}
      </div>

      {/* VIEW ROUTING */}
      {view === 'lobby' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px', fontFamily: 'sans-serif', color: '#fff' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '40px' }}>♟️ Universal Chess</h1>
          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '10px', width: '250px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
              <h3>Play vs Computer</h3>
              <button onClick={() => handleStartLocalGame('easy')} style={lobbyBtnStyle('#646cff')}>Easy</button>
              <button onClick={() => handleStartLocalGame('medium')} style={lobbyBtnStyle('#646cff')}>Medium</button>
              <button onClick={() => handleStartLocalGame('hard')} style={lobbyBtnStyle('#646cff')}>Hard (Neural Net)</button>
            </div>
            <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '10px', width: '250px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
              <h3>Global Multiplayer</h3>
              <button onClick={() => { setView('tournaments'); fetchTournaments(); }} style={lobbyBtnStyle('#ffd700', 'black')}>🏆 Tournament Hub</button>
              <button onClick={handleCreateRoom} style={lobbyBtnStyle('#ff4c4c')}>Create Custom Room</button>
              <hr style={{ borderColor: '#333', margin: '20px 0' }}/>
              <input type="text" placeholder="Enter 4-Letter Code" maxLength="4" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())} style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#333', color: 'white', textAlign: 'center', fontWeight: 'bold' }} />
              <button onClick={() => handleJoinRoom()} style={lobbyBtnStyle('#4caf50')}>Join Room</button>
            </div>
          </div>
        </div>
      )}

      {view === 'tournaments' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '80px', fontFamily: 'sans-serif', color: '#fff', width: '80%', margin: '80px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#ffd700', margin: 0 }}>🏆 Live Tournaments</h1>
            <button onClick={() => setView('lobby')} style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>← Back to Lobby</button>
          </div>

          {isAdmin && (
            <button onClick={handleCreateTournament} style={{ padding: '15px 30px', backgroundColor: '#ff4c4c', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '30px', width: '100%' }}>
              ➕ Create 8-Player Knockout Tournament (Admin)
            </button>
          )}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tournaments.length === 0 ? <p style={{ textAlign: 'center', color: '#aaa' }}>No tournaments available right now.</p> : null}
            
            {tournaments.map(t => {
              const players = t.registeredPlayers ? t.registeredPlayers.split(',').filter(p => p !== '') : [];
              const isRegistered = currentUser && players.includes(currentUser.username);
              const isFull = players.length >= 8;

              return (
                <div key={t.id} style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: t.status === 'IN_PROGRESS' ? '5px solid #4caf50' : '5px solid #ffd700' }}>
                  <div>
                    <h2 style={{ margin: '0 0 10px 0' }}>{t.name} <span style={{ fontSize: '14px', color: '#aaa', fontWeight: 'normal' }}>({t.status})</span></h2>
                    <p style={{ margin: 0, color: '#ddd' }}>👥 Players: <strong>{players.length} / 8</strong></p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>{players.join(', ') || 'No players yet'}</p>
                  </div>
                  
                  <div>
                    {t.status === 'PENDING' && !isAdmin && !isRegistered && !isFull && (
                      <button onClick={() => handleRegisterTournament(t.id)} style={{ padding: '10px 20px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Register Now</button>
                    )}
                    {t.status === 'PENDING' && !isAdmin && isRegistered && (
                      <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✅ You are registered. Waiting for Admin to start...</span>
                    )}
                    {t.status === 'PENDING' && isAdmin && (
                      <button onClick={() => handleStartTournament(t.id)} disabled={!isFull} style={{ padding: '10px 20px', backgroundColor: isFull ? '#4caf50' : '#555', color: 'white', border: 'none', borderRadius: '5px', cursor: isFull ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                        {isFull ? 'Start Tournament (Generate Brackets)' : 'Waiting for 8 Players...'}
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && (
                       <p style={{ color: '#4caf50', fontWeight: 'bold', margin: 0 }}>Tournament is live! (Check matches below)</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'game' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '40px', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {gameMode === 'multiplayer' && (
              <div style={{ backgroundColor: '#ff4c4c', color: 'white', padding: '10px 20px', borderRadius: '8px', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(255, 76, 76, 0.3)' }}>
                Room Code: {roomId} (You are {playerColor === 'w' ? 'White' : 'Black'})
              </div>
            )}
            <h3 style={{ color: game.isGameOver() ? '#ff4c4c' : '#4caf50', margin: '10px 0' }}>{gameStatus}</h3>
            <div style={{ width: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              <Chessboard 
                position={game.fen()} 
                onPieceDrop={onDrop} 
                onSquareClick={onSquareClick} 
                customSquareStyles={optionSquares} 
                boardOrientation={gameMode === 'multiplayer' && playerColor === 'b' ? 'black' : 'white'} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={leaveGame} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>← Back</button>
              {gameMode === 'practice' && <button onClick={handleUndo} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#ffa500', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>↩ Undo</button>}
              <button onClick={() => setIsTutorialOpen(true)} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px' }}>How to Play 📖</button>
            </div>
          </div>
          <div style={{ width: '250px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', color: 'white', height: '520px', overflowY: 'auto', marginTop: gameMode === 'multiplayer' ? '70px' : '30px' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>Move History</h3>
            <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              {game.history().map((move, index) => <li key={index}>{move}</li>)}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}

function lobbyBtnStyle(bg, text = 'white') {
  return { display: 'block', width: '100%', padding: '12px', margin: '10px 0', backgroundColor: bg, color: text, border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' };
}