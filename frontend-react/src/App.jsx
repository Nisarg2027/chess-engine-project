import { useState, useEffect } from 'react';
import { totalThemes } from './utils';
// Import our isolated hooks
import { useAuth } from './useAuth';
import { useTournaments } from './useTournaments';
import { useChessEngine } from './useChessEngine';

// Import our isolated UI components
import { TutorialModal, AuthModal, Header } from './components';
import { LandingView, ProfileView, LobbyView, TournamentView, BracketView, GameView } from './views';

export default function App() {
  // 1. Navigation & Modal States (RESTORED!)
  const [view, setView] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [theme, setTheme] = useState('standard');


  // 2. Initialize our separated Brains
  const auth = useAuth();
  const tourneys = useTournaments(auth.currentUser, setView);
  const engine = useChessEngine(auth.currentUser, auth.setCurrentUser, setView);

  // 3. Theme State (Saves to Local Storage)
  const [personalTheme, setPersonalTheme] = useState(() => localStorage.getItem('chessTheme') || 'standard');

  useEffect(() => {
    localStorage.setItem('chessTheme', personalTheme);
  }, [personalTheme]);

  // If playing a tournament match, force the tournament theme. Otherwise, use personal preference.
  // If playing a tournament match, force the tournament theme. Otherwise, use personal preference.
  const [currentUser, setCurrentUser] = useState(null);
  const activeThemeName = (engine.activeMatch && engine.activeMatch.matchTheme) ? engine.activeMatch.matchTheme : personalTheme;
  const activeThemeColors = totalThemes[theme] || totalThemes['standard'];  // --- BROWSER HISTORY SYNC (Back/Forward Buttons) ---
  useEffect(() => {
    if (window.history.state?.view !== view) {
      window.history.pushState({ view }, '', `?page=${view}`);
    }
  }, [view]);

  useEffect(() => {
    const handleBrowserNavigation = (event) => {
      const targetView = event.state?.view || 'landing';
      if (view === 'game') engine.resetRoom();
      setView(targetView);
    };
    window.addEventListener('popstate', handleBrowserNavigation);
    return () => window.removeEventListener('popstate', handleBrowserNavigation);
  }, [view, engine]);

  // 4. Orchestrate the global logout event
  function handleFullLogout() {
    auth.logout();
    engine.resetRoom();
    setView('landing');
  }

  return (
    <>
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={auth.setCurrentUser}
      />

      <Header
        currentUser={auth.currentUser}
        isAdmin={auth.isAdmin}
        view={view}
        setView={setView}
        handleLogout={handleFullLogout}
        setIsAuthOpen={setIsAuthOpen}
        leaveGame={engine.leaveGame}
      />

      {view === 'landing' && <LandingView setView={setView} />}

      {view === 'profile' && (
        <ProfileView
          currentUser={auth.currentUser}
          isAdmin={auth.isAdmin}
          setView={setView}
          personalTheme={personalTheme}
          setPersonalTheme={setPersonalTheme}
        />
      )}

      {view === 'lobby' && (
        <LobbyView
          setView={setView}
          handleStartLocalGame={engine.handleStartLocalGame}
          handleCreateRoom={engine.handleCreateRoom}
          joinCodeInput={engine.joinCodeInput}
          setJoinCodeInput={engine.setJoinCodeInput}
          handleJoinRoom={engine.handleJoinRoom}
          fetchTournaments={tourneys.fetchTournaments}
        />
      )}

      {view === 'tournaments' && (
        <TournamentView
          tournaments={tourneys.tournaments}
          isAdmin={auth.isAdmin}
          currentUser={auth.currentUser}
          setView={setView}
          handleCreateTournament={tourneys.handleCreateTournament}
          handleRegisterTournament={tourneys.handleRegisterTournament}
          handleStartTournament={tourneys.handleStartTournament}
          handleViewBracket={tourneys.handleViewBracket}
          handleDeleteTournament={tourneys.handleDeleteTournament}
        />
      )}

      {view === 'bracket' && (
        <BracketView
          currentTournamentName={tourneys.currentTournamentName}
          bracketMatches={tourneys.bracketMatches}
          currentUser={auth.currentUser}
          setView={setView}
          fetchTournaments={tourneys.fetchTournaments}
          handleJoinRoom={engine.handleJoinRoom}
        />
      )}

      {view === 'game' && (
        <GameView
          activeThemeColors={activeThemeColors}
          currentThemeKey={theme}
          onThemeChange={setTheme}

          gameMode={engine.gameMode}
          roomId={engine.roomId}
          playerColor={engine.playerColor}
          gameStatus={engine.gameStatus}
          game={engine.game}
          onDrop={engine.onDrop}
          onSquareClick={engine.onSquareClick}
          movablePieceStyles={engine.movablePieceStyles}
          optionSquares={engine.optionSquares}
          leaveGame={engine.leaveGame}
          handleUndo={engine.handleUndo}
          whiteTime={engine.whiteTime}
          blackTime={engine.blackTime}
          timeOutWinner={engine.timeOutWinner}
        />
      )}
    </>
  );
}