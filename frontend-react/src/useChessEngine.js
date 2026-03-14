import { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { playSound } from './utils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export function useChessEngine(currentUser, setCurrentUser, setView) {
  const [game, setGame] = useState(new Chess());
  const [stompClient, setStompClient] = useState(null);
  const [gameMode, setGameMode] = useState('hard'); 

  const [roomId, setRoomId] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const roomSubscriptionRef = useRef(null);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [optionSquares, setOptionSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState(null); 
  const [playerColor, setPlayerColor] = useState('w'); 
  const [activeMatch, setActiveMatch] = useState(null); 

  const initialTime = 600; 
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [timeOutWinner, setTimeOutWinner] = useState(null);

  // --- NEW: USER NAMESPACE HELPER ---
  // This ensures User A never sees User B's saved games on the same computer!
  const getStorageKey = (key) => {
    const prefix = currentUser ? `${currentUser.username}_` : 'guest_';
    return `${prefix}${key}`;
  };

 // --- ROBUST WEBSOCKET CONNECTION ---
  useEffect(() => {
    const socket = new SockJS(`${BACKEND_URL}/chess-socket`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("WebSocket Connected!");
        
        // 1. Subscribe to AI Board
        client.subscribe('/topic/board', (message) => {
          setGameMode((currentMode) => {
            if (currentMode !== 'multiplayer') {
              try {
                const data = JSON.parse(message.body);
                setGame((currentGame) => {
                  const gameCopy = new Chess();
                  gameCopy.loadPgn(currentGame.pgn()); 
                  if (data.move) {
                    gameCopy.move({ from: data.move.substring(0, 2), to: data.move.substring(2, 4), promotion: data.move.length > 4 ? data.move[4] : 'q' });
                  } else { gameCopy.load(data.fen); }
                  return gameCopy;
                });
              } catch (e) { setGame(new Chess(message.body.replace(/^"|"$/g, ''))); }
              setIsAiThinking(false);
            }
            return currentMode;
          });
        });

        // 2. THE FIX: Subscribe to Multiplayer Room IMMEDIATELY upon connection
        const savedRoom = localStorage.getItem(getStorageKey('activeRoom'));
        const savedMode = localStorage.getItem(getStorageKey('gameMode'));
        
        if (savedRoom && savedMode === 'multiplayer') {
          console.log("Auto-subscribing to active room:", savedRoom);
          if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
          roomSubscriptionRef.current = client.subscribe(`/topic/room/${savedRoom}`, subscribeToRoom);
        }
      },
    });
    
    client.activate();
    setStompClient(client);
    
    return () => client.deactivate();
  }, [currentUser?.username]); // Re-run if the user logs out/in

  // --- BULLETPROOF PGN RECOVERY ON REFRESH ---
  // Notice we added currentUser?.username to the dependencies so this re-runs on login/logout!
  useEffect(() => {
    const savedRoom = localStorage.getItem(getStorageKey('activeRoom'));
    const savedColor = localStorage.getItem(getStorageKey('playerColor'));
    const savedMode = localStorage.getItem(getStorageKey('gameMode'));
    const savedPgn = localStorage.getItem(getStorageKey('matchPgn')); 

    if (savedRoom && savedMode === 'multiplayer') {
      console.log(`Recovering match for user: ${currentUser?.username || 'Guest'}...`);
      
      if (savedPgn) {
        const recoveredGame = new Chess();
        recoveredGame.loadPgn(savedPgn);
        setGame(recoveredGame);
      }

      setRoomId(savedRoom);
      setPlayerColor(savedColor);
      setGameMode(savedMode);
      setView('game');

      if (stompClient && stompClient.connected) {
        if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = stompClient.subscribe(`/topic/room/${savedRoom}`, subscribeToRoom);
      }
    } else {
      // Safely check the current view using a functional update so we don't need the 'view' variable in scope!
      setView((currentView) => {
        if (currentView === 'game') return 'lobby';
        return currentView;
      });
    }
  }, [stompClient, currentUser?.username]); 

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (game.history().length > 0 && !game.isGameOver() && !timeOutWinner) {
      interval = setInterval(() => {
        if (game.turn() === 'w') {
          setWhiteTime(prev => { if (prev <= 1) { setTimeOutWinner('Black'); return 0; } return prev - 1; });
        } else {
          setBlackTime(prev => { if (prev <= 1) { setTimeOutWinner('White'); return 0; } return prev - 1; });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [game.fen(), timeOutWinner]);


  function resetRoom() {
    setRoomId(''); setGame(new Chess()); setPlayerColor('w');
    setWhiteTime(initialTime); setBlackTime(initialTime); setTimeOutWinner(null);
    if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe(); 
  }

  async function handleCreateRoom() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, { method: 'POST' });
      const newRoomId = await response.text();
      
      try {
        const roomRoles = JSON.parse(localStorage.getItem(getStorageKey('roomRoles')) || '{}');
        roomRoles[newRoomId] = 'w'; 
        localStorage.setItem(getStorageKey('roomRoles'), JSON.stringify(roomRoles));
      } catch(e) {}

      localStorage.setItem(getStorageKey('activeRoom'), newRoomId);
      localStorage.setItem(getStorageKey('playerColor'), 'w');
      localStorage.setItem(getStorageKey('gameMode'), 'multiplayer');

      setRoomId(newRoomId); setGameMode('multiplayer'); setPlayerColor('w'); 
      setGame(new Chess()); setView('game');
      setWhiteTime(initialTime); setBlackTime(initialTime); setTimeOutWinner(null);
      
      if (stompClient && stompClient.connected) {
        if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = stompClient.subscribe(`/topic/room/${newRoomId}`, subscribeToRoom);
      }
    } catch (error) { alert("Failed to connect."); }
  }

  async function handleJoinRoom(codeOverride, colorOverride, matchObj = null) {
    setActiveMatch(matchObj);
    const code = (codeOverride || joinCodeInput).trim().toUpperCase();
    if (code.length !== 4) return alert("Room code must be 4 characters!");

    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/${code}`);
      const newGame = new Chess(); 
      
      if (!response.ok) {
        if (matchObj) {
          console.log("Initializing fresh tournament room...");
        } else {
          alert("Room not found! It may have expired or the server restarted.");
          return; 
        }
      } else {
        const currentData = await response.text();
        let boardData = currentData;
        try {
          const parsed = JSON.parse(currentData);
          if (typeof parsed === 'object' && parsed !== null) boardData = parsed.fen || parsed.board || currentData;
          else if (typeof parsed === 'string') boardData = parsed;
        } catch(e) {}

        boardData = boardData.replace(/^"|"$/g, '').trim();
        try { newGame.loadPgn(atob(boardData)); } 
        catch (e) {
          try {
            if (boardData.includes("1.") || boardData.includes("[")) newGame.loadPgn(boardData.replace(/\\n/g, '\n').replace(/\\"/g, '"'));
            else newGame.load(boardData); 
          } catch(err) {}
        }
      } 
      
      // --- SUPER STRICT TOURNAMENT ROLE DETECTION ---
      let myColor = 'b'; // Default assumption

      if (matchObj && currentUser) {
        // Safely extract the names whether Spring Boot sent flat strings OR nested User objects!
        const wName = matchObj.whiteUsername || matchObj.whitePlayer?.username || matchObj.playerWhite || "";
        const bName = matchObj.blackUsername || matchObj.blackPlayer?.username || matchObj.playerBlack || "";
        const myName = currentUser.username || "";

        console.log(`Tournament Role Check -> White: [${wName}], Black: [${bName}], Me: [${myName}]`);

        // Use case-insensitive comparison just to be completely safe
        if (wName.toLowerCase() === myName.toLowerCase()) {
          myColor = 'w';
        } else if (bName.toLowerCase() === myName.toLowerCase()) {
          myColor = 'b';
        } else {
          console.warn("Could not match your username to this tournament bracket! Defaulting to Black.");
        }
      } else if (colorOverride) {
        myColor = colorOverride;
      } else {
        try {
          const memoryRoles = JSON.parse(localStorage.getItem(getStorageKey('roomRoles')) || '{}');
          if (memoryRoles[code]) {
            myColor = memoryRoles[code]; 
          }
        } catch(e) {}
      }

      console.log(`Assigned Player Color: ${myColor === 'w' ? 'White' : 'Black'}`);

      try {
        const memoryRoles = JSON.parse(localStorage.getItem(getStorageKey('roomRoles')) || '{}');
        memoryRoles[code] = myColor;
        localStorage.setItem(getStorageKey('roomRoles'), JSON.stringify(memoryRoles));
      } catch(e) {}
      // ----------------------------------------------

      localStorage.setItem(getStorageKey('activeRoom'), code);
      localStorage.setItem(getStorageKey('playerColor'), myColor);
      localStorage.setItem(getStorageKey('gameMode'), 'multiplayer');
      localStorage.setItem(getStorageKey('matchPgn'), newGame.pgn());

      setRoomId(code); setGameMode('multiplayer'); setPlayerColor(myColor); 
      setGame(newGame); setView('game');
      setWhiteTime(initialTime); setBlackTime(initialTime); setTimeOutWinner(null);
      
      if (stompClient && stompClient.connected) {
        if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = stompClient.subscribe(`/topic/room/${code}`, subscribeToRoom);
      }
    } catch (error) {}
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
      try { newGame.loadPgn(atob(boardData)); } 
      catch (e) {
        try {
          if (boardData.includes("1.") || boardData.includes("[")) newGame.loadPgn(boardData.replace(/\\n/g, '\n').replace(/\\"/g, '"'));
          else newGame.load(boardData); 
        } catch(err) { return currentGame; }
      }
      
      localStorage.setItem(getStorageKey('matchPgn'), newGame.pgn());
      return newGame;
    });
  }

  function handleStartLocalGame(mode) {
    setGameMode(mode); setPlayerColor('w'); setGame(new Chess()); setRoomId(''); setView('game');
    setMoveFrom(null); setOptionSquares({});
    setWhiteTime(initialTime); setBlackTime(initialTime); setTimeOutWinner(null);
    if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
  }

  function leaveGame() {
    localStorage.removeItem(getStorageKey('activeRoom'));
    localStorage.removeItem(getStorageKey('playerColor'));
    localStorage.removeItem(getStorageKey('gameMode'));
    localStorage.removeItem(getStorageKey('matchPgn')); 
    
    setView('lobby');
    if (roomSubscriptionRef.current) roomSubscriptionRef.current.unsubscribe();
  }

  function handleUndo() {
    if (gameMode !== 'practice') return;
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    gameCopy.undo(); 
    setGame(gameCopy); setOptionSquares({}); setMoveFrom(null);
  }

  function getMoveOptions(square) {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) { setOptionSquares({}); return false; }
    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)' : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',  
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = { background: 'rgba(245, 184, 0, 0.4)' };
    setOptionSquares(newSquares);
    return true;
  }

  const movablePieceStyles = useMemo(() => {
    const styles = {};
    if (game.isGameOver() || isAiThinking || timeOutWinner) return styles;
    if (gameMode === 'multiplayer' && game.turn() !== playerColor) return styles;
    const allValidMoves = game.moves({ verbose: true });
    allValidMoves.forEach(move => {
      styles[move.from] = { boxShadow: 'inset 0 0 0 3px rgba(100, 108, 255, 0.6)', cursor: 'pointer' };
    });
    return styles;
  }, [game.fen(), gameMode, playerColor, isAiThinking, timeOutWinner]);

  function makeMove(sourceSquare, targetSquare, activeTheme) {
    if (game.isGameOver() || isAiThinking || timeOutWinner) return false;
    if (gameMode === 'multiplayer' && game.turn() !== playerColor) return false; 
    
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn()); 
    
    try {
      const move = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move === null) return false;
      
      if (gameCopy.isCheckmate()) {
        playSound(activeTheme, 'checkmate');
      } else if (move.captured) {
        playSound(activeTheme, `capture_${move.captured}`); 
      } else {
        playSound(activeTheme, 'move');
      }

      setGame(gameCopy); setOptionSquares({}); setMoveFrom(null); 
      
      localStorage.setItem(getStorageKey('matchPgn'), gameCopy.pgn());
      
      if (gameCopy.isGameOver() && currentUser) {
        localStorage.removeItem(getStorageKey('activeRoom'));
        localStorage.removeItem(getStorageKey('playerColor'));
        localStorage.removeItem(getStorageKey('gameMode'));
        localStorage.removeItem(getStorageKey('matchPgn'));

        let outcome = 'draw';
        let winnerUsername = null;
        if (gameCopy.isCheckmate()) {
          outcome = 'win';
          winnerUsername = currentUser.username; 
        }
        
        fetch(`${BACKEND_URL}/api/users/update-rating`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser.username, outcome: outcome })
        })
        .then(res => res.json())
        .then(updatedUser => setCurrentUser(updatedUser)) 
        .catch(err => console.error("Failed to update Elo:", err));

        if (activeMatch && winnerUsername === currentUser.username) {
          fetch(`${BACKEND_URL}/api/tournaments/match/${roomId}/result`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winner: winnerUsername })
          });
        }
      }

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

  function onSquareClick(square, activeTheme) { 
    if (isAiThinking || game.isGameOver() || timeOutWinner) return;
    if (gameMode === 'multiplayer' && game.get(square) && game.get(square).color !== playerColor && !moveFrom) return; 

    if (moveFrom) {
      const moveSuccess = makeMove(moveFrom, square, activeTheme);
      if (!moveSuccess) {
        if (game.get(square) && game.get(square).color === game.turn()) {
          setMoveFrom(square);
          getMoveOptions(square);
          playSound(activeTheme, 'select');
        } else {
          setMoveFrom(null);
          setOptionSquares({});
        }
      }
    } else {
      if (game.get(square) && game.get(square).color === game.turn()) {
        const hasMoves = getMoveOptions(square);
        if (hasMoves) {
          setMoveFrom(square);
          playSound(activeTheme, 'select');
        }
      }
    }
  }

  function onDrop(sourceSquare, targetSquare, activeTheme) { return makeMove(sourceSquare, targetSquare, activeTheme); }

  let gameStatus = "Game in Progress";
  if (timeOutWinner) gameStatus = `⏰ Time's up! ${timeOutWinner} wins!`;
  else if (game.isCheckmate()) gameStatus = "🏆 Checkmate!";
  else if (game.isDraw()) gameStatus = "🤝 Draw!";
  else if (isAiThinking) gameStatus = "🤔 AI is calculating...";
  else if (gameMode === 'practice') gameStatus = "Practice Mode (Local Play)";
  else if (gameMode === 'multiplayer') gameStatus = game.turn() === playerColor ? "Your turn!" : "Waiting for opponent...";
  else gameStatus = "Your turn (White)";

  return {
    game, gameMode, roomId, joinCodeInput, setJoinCodeInput,
    optionSquares, playerColor, gameStatus, movablePieceStyles,
    handleCreateRoom, handleJoinRoom, handleStartLocalGame, leaveGame, 
    handleUndo, onSquareClick, onDrop, resetRoom,
    whiteTime, blackTime, timeOutWinner 
  };
}