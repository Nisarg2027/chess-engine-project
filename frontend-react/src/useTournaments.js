import { useState, useEffect } from 'react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export function useTournaments(currentUser, setView) {
  const [tournaments, setTournaments] = useState([]);
  const [bracketMatches, setBracketMatches] = useState([]);
  const [currentTournamentName, setCurrentTournamentName] = useState('');

  // BUG FIX: Fetch immediately, and then auto-refresh every 3 seconds
  useEffect(() => {
    fetchTournaments();
    const interval = setInterval(() => {
      fetchTournaments();
    }, 3000); 
    return () => clearInterval(interval);
  }, []);

  async function fetchTournaments() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/`);
      if (res.ok) setTournaments(await res.json());
    } catch (err) {}
  }

  async function handleCreateTournament() {
    const name = prompt("Enter Tournament Name:");
    if (!name) return;
    const themeChoice = prompt("Choose board theme (standard, midnight, royal):", "standard");
    const theme = themeChoice ? themeChoice.toLowerCase().trim() : "standard";

    try {
      await fetch(`${BACKEND_URL}/api/tournaments/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, theme })
      });
      fetchTournaments();
    } catch (err) { alert("Failed to create tournament."); }
  }

  async function handleRegisterTournament(id) {
    if (!currentUser) return alert("You must log in to register!");
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: currentUser.username })
      });
      if (res.ok) { alert("Registered successfully!"); fetchTournaments(); } 
      else { alert(await res.text()); }
    } catch (err) {}
  }

  async function handleStartTournament(id) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}/start`, { method: 'POST' });
      if (res.ok) { alert("Tournament Started! Brackets generated."); fetchTournaments(); } 
      else { alert(await res.text()); }
    } catch (err) {}
  }

  async function handleDeleteTournament(id) {
    if (!window.confirm("Are you sure you want to delete this tournament?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTournaments();
      else alert(await res.text());
    } catch (err) { alert("Failed to delete tournament."); }
  }

  async function handleViewBracket(tournament) {
    setCurrentTournamentName(tournament.name);
    try {
      const res = await fetch(`${BACKEND_URL}/api/tournaments/${tournament.id}/matches`);
      if (res.ok) { setBracketMatches(await res.json()); setView('bracket'); }
    } catch (err) {}
  }

  return {
    tournaments, bracketMatches, currentTournamentName,
    fetchTournaments, handleCreateTournament, handleRegisterTournament,
    handleStartTournament, handleViewBracket, handleDeleteTournament
  };
}