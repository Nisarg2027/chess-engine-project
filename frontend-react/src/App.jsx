import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // Connect to your Spring Boot server
    const socket = new SockJS('http://localhost:8080/chess-socket');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('✅ Connected to Java Backend');
        // Listen for the AI's response
        client.subscribe('/topic/board', (message) => {
          const incomingFen = message.body.replace(/^"|"$/g, '');
          setGame(new Chess(incomingFen));
        });
      },
    });

    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, []);

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) return false;

      setGame(gameCopy);

      // SEND THE MOVE TO SPRING BOOT
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/move',
          body: gameCopy.fen()
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h1>Chess AI Engine</h1>
      <div style={{ width: '500px' }}>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
      </div>
    </div>
  );
}