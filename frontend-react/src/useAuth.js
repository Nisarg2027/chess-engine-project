import { useState, useEffect } from 'react';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chessUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const isAdmin = currentUser && currentUser.username.toLowerCase() === 'admin';

  useEffect(() => {
    if (currentUser) localStorage.setItem('chessUser', JSON.stringify(currentUser));
    else localStorage.removeItem('chessUser');
  }, [currentUser]);

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('chessUser');
  }

  return { currentUser, setCurrentUser, isAdmin, logout };
}