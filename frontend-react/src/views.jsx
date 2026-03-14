import { lobbyBtnStyle, featureCardStyle, getPlayerTitle, getRankColor, totalThemes } from './utils';
import CustomBoard from './CustomBoard';
import { playSound } from './utils'; // Make sure totalThemes is imported!
export function LandingView({ setView }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '160px', fontFamily: 'sans-serif', color: 'white', textAlign: 'center', padding: '160px 20px 40px', minHeight: '100vh', backgroundColor: '#121212', boxSizing: 'border-box' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(245, 184, 0, 0.4)', color: '#f5b800', padding: '6px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', marginBottom: '30px', backgroundColor: 'rgba(245, 184, 0, 0.05)' }}>
                ✨ Free to Play
            </div>
            <h1 style={{ fontSize: '5.5rem', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1.1', letterSpacing: '-1px' }}>
                Master the Art of <br />
                <span style={{ color: '#f5b800' }}>Chess</span>
            </h1>
            <p style={{ fontSize: '1.3rem', color: '#9ca3af', maxWidth: '650px', marginBottom: '40px', lineHeight: '1.6' }}>
                Play against AI, challenge friends, or compete in tournaments. Your next brilliant move starts here.
            </p>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '120px' }}>
                <button onClick={() => setView('lobby')} style={{ padding: '16px 45px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '8px', border: 'none', backgroundColor: '#f5b800', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(245, 184, 0, 0.2)' }}>
                    ⚔️ Play Now
                </button>
                <button onClick={() => setView('tournaments')} style={{ padding: '16px 45px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🏆 Tournaments
                </button>
            </div>
            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', textAlign: 'left', paddingBottom: '80px' }}>
                <h2 style={{ fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '900' }}>Everything You Need to <span style={{ color: '#f5b800' }}>Play</span></h2>
                <p style={{ color: '#9ca3af', fontSize: '1.2rem', marginBottom: '50px' }}>A complete chess experience built for players of all skill levels.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
                    <FeatureCard icon="🧠" title="Smart Engine" desc="Challenge our AI from beginner to grandmaster level" onClick={() => setView('lobby')} />
                    <FeatureCard icon="👥" title="Multiplayer" desc="Play friends online with real-time moves" onClick={() => setView('lobby')} />
                    <FeatureCard icon="🏆" title="Tournaments" desc="Compete in brackets and climb the leaderboard" onClick={() => setView('tournaments')} />
                    <FeatureCard icon="📈" title="Analysis" desc="Review games with move-by-move breakdown" onClick={() => alert("Analysis board coming soon!")} />
                    <FeatureCard icon="⚡" title="Instant Play" desc="No downloads — play directly in your browser" onClick={() => setView('lobby')} />
                    <FeatureCard icon="🖥️" title="Local Games" desc="Pass-and-play with a friend on one screen" onClick={() => setView('lobby')} />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{ backgroundColor: '#141414', padding: '32px', borderRadius: '12px', border: '1px solid #262626', transition: 'all 0.2s ease', cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}
            onMouseOver={e => { if (onClick) { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.borderColor = '#333333'; } }}
            onMouseOut={e => { if (onClick) { e.currentTarget.style.backgroundColor = '#141414'; e.currentTarget.style.borderColor = '#262626'; } }}
        >
            <div style={{ backgroundColor: '#262015', border: '1px solid #3d3120', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', marginBottom: '20px' }}>
                {icon}
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: '#ffffff', fontWeight: '600', letterSpacing: '-0.3px' }}>{title}</h3>
            <p style={{ margin: 0, color: '#a3a3a3', fontSize: '0.95rem', lineHeight: '1.5' }}>{desc}</p>
        </div>
    );
}

export function ProfileView({ currentUser, isAdmin, setView, personalTheme, setPersonalTheme }) {
    if (!currentUser) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '120px', fontFamily: 'sans-serif', color: 'white' }}>
            <div style={{ width: '600px', backgroundColor: '#161616', padding: '40px', borderRadius: '15px', border: '1px solid #2a2a2a', textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '10px' }}>{isAdmin ? '👑' : '♟️'}</div>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '3rem' }}>{currentUser.username}</h1>
                <div style={{ display: 'inline-block', backgroundColor: '#1a1a1a', padding: '8px 20px', borderRadius: '50px', marginBottom: '30px', border: `1px solid ${getRankColor(currentUser.eloRating)}` }}>
                    <span style={{ color: getRankColor(currentUser.eloRating), fontWeight: 'bold', fontSize: '1.2rem' }}>{getPlayerTitle(currentUser.eloRating)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #2a2a2a' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#aaa', fontSize: '1.2rem' }}>Current Elo Rating</h3>
                        <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '10px 0 0 0', color: '#f5b800' }}>{currentUser.eloRating}</p>
                    </div>
                </div>
                <h3 style={{ borderBottom: '1px solid #2a2a2a', paddingBottom: '10px', marginBottom: '20px' }}>🎨 Personal Board Theme</h3>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Object.entries(totalThemes).map(([key, data]) => (
                        <button key={key} onClick={() => setPersonalTheme(key)} style={{ padding: '10px 15px', borderRadius: '8px', border: personalTheme === key ? '2px solid #f5b800' : '2px solid transparent', backgroundColor: data.board.dark, color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                            {data.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function LobbyView({ setView, handleStartLocalGame, handleCreateRoom, joinCodeInput, setJoinCodeInput, handleJoinRoom }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '120px', fontFamily: 'sans-serif', color: '#fff' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '40px' }}>Game <span style={{ color: '#f5b800' }}>Lobby</span></h1>
            <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ backgroundColor: '#161616', padding: '30px', borderRadius: '12px', width: '250px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
                    <h3>Play vs Computer</h3>
                    <button onClick={() => handleStartLocalGame('easy')} style={lobbyBtnStyle('#1a1a1a', 'white')}>Easy</button>
                    <button onClick={() => handleStartLocalGame('medium')} style={lobbyBtnStyle('#1a1a1a', 'white')}>Medium</button>
                    <button onClick={() => handleStartLocalGame('hard')} style={lobbyBtnStyle('#1a1a1a', 'white')}>Hard (Neural Net)</button>
                </div>
                <div style={{ backgroundColor: '#161616', padding: '30px', borderRadius: '12px', width: '250px', textAlign: 'center', border: '1px solid #2a2a2a' }}>
                    <h3>Global Multiplayer</h3>
                    <button onClick={() => setView('tournaments')} style={lobbyBtnStyle('#1a1a1a', 'white')}>🏆 Tournament Hub</button>
                    <button onClick={handleCreateRoom} style={lobbyBtnStyle('#f5b800', 'black')}>Create Custom Room</button>
                    <hr style={{ borderColor: '#2a2a2a', margin: '20px 0' }} />
                    <input type="text" placeholder="Enter 4-Letter Code" maxLength="4" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())} style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #333', backgroundColor: '#1a1a1a', color: 'white', textAlign: 'center', fontWeight: 'bold' }} />
                    <button onClick={() => handleJoinRoom(null, null, null)} style={lobbyBtnStyle('#4caf50', 'white')}>Join Room</button>
                </div>
            </div>
            <button onClick={() => handleStartLocalGame('practice')} style={{ marginTop: '30px', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Or Practice Locally (2-Player Same Screen)
            </button>
        </div>
    );
}

export function TournamentView({ tournaments, isAdmin, currentUser, handleCreateTournament, handleRegisterTournament, handleStartTournament, handleViewBracket, handleDeleteTournament }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '120px', paddingBottom: '60px', fontFamily: 'sans-serif', color: '#fff', width: '100%', maxWidth: '900px', margin: '0 auto', minHeight: '100vh', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: '2.5rem', fontWeight: '900' }}>Live <span style={{ color: '#f5b800' }}>Tournaments</span></h1>
            </div>
            {isAdmin && (
                <button onClick={handleCreateTournament} style={{ padding: '16px 30px', backgroundColor: 'rgba(245, 184, 0, 0.1)', color: '#f5b800', border: '1px solid rgba(245, 184, 0, 0.4)', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '40px', width: '100%' }}>
                    ➕ Create Knockout Tournament (Admin)
                </button>
            )}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {tournaments.length === 0 ? <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '1.2rem' }}>No tournaments available right now.</p> : null}
                {tournaments.map(t => {
                    const players = t.registeredPlayers ? t.registeredPlayers.split(',').filter(p => p !== '') : [];
                    const isRegistered = currentUser && players.includes(currentUser.username);
                    const isFull = players.length >= 2;
                    const isLive = t.status === 'IN_PROGRESS' || t.status.includes('COMPLETED');
                    return (
                        <div key={t.id} style={{ backgroundColor: '#161616', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #2a2a2a', borderLeft: isLive ? '4px solid #4caf50' : '4px solid #f5b800', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                            <div>
                                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{t.name} <span style={{ fontSize: '12px', color: isLive ? '#4caf50' : '#f5b800', fontWeight: 'bold', border: `1px solid ${isLive ? '#4caf50' : '#f5b800'}`, padding: '2px 8px', borderRadius: '50px', marginLeft: '10px' }}>{t.status}</span></h2>
                                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem' }}>👥 Players Registered: <strong style={{ color: 'white' }}>{players.length}</strong></p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {t.status === 'PENDING' && !isAdmin && !isRegistered && !isFull && (
                                    <button onClick={() => handleRegisterTournament(t.id)} style={{ padding: '10px 20px', backgroundColor: '#f5b800', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Register Now</button>
                                )}
                                {t.status === 'PENDING' && !isAdmin && isRegistered && <span style={{ color: '#4caf50', fontWeight: 'bold', padding: '10px' }}>✅ Registered</span>}
                                {t.status === 'PENDING' && isAdmin && (
                                    <button onClick={() => handleStartTournament(t.id)} disabled={!isFull} style={{ padding: '10px 20px', backgroundColor: isFull ? '#4caf50' : '#333', color: isFull ? 'white' : '#777', border: 'none', borderRadius: '6px', cursor: isFull ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                                        {isFull ? 'Start Bracket' : 'Waiting...'}
                                    </button>
                                )}
                                {isLive && <button onClick={() => handleViewBracket(t)} style={{ padding: '10px 20px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #4caf50', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>View Brackets</button>}
                                {isAdmin && <button onClick={() => handleDeleteTournament(t.id)} style={{ padding: '10px 15px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function BracketView({ currentTournamentName, bracketMatches, currentUser, handleJoinRoom }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '120px', fontFamily: 'sans-serif', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#f5b800', margin: 0 }}>{currentTournamentName} - Brackets</h1>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '80%' }}>
                {bracketMatches.map((m) => {
                    const isWhite = currentUser && currentUser.username === m.playerWhite;
                    const isBlack = currentUser && currentUser.username === m.playerBlack;
                    const isMyMatch = isWhite || isBlack;

                    return (
                        <div key={m.id} style={{ backgroundColor: '#161616', padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', border: isMyMatch ? '2px solid #4caf50' : '1px solid #2a2a2a' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#aaa' }}>Round {m.roundNumber} Match</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontWeight: isWhite ? 'bold' : 'normal', color: m.winner === m.playerWhite ? '#f5b800' : (isWhite ? '#4caf50' : '#fff') }}>⚪ {m.playerWhite}</span>
                                <span style={{ color: '#ff4c4c', fontWeight: 'bold' }}>VS</span>
                                <span style={{ fontWeight: isBlack ? 'bold' : 'normal', color: m.winner === m.playerBlack ? '#f5b800' : (isBlack ? '#4caf50' : '#fff') }}>⚫ {m.playerBlack}</span>
                            </div>
                            {m.winner ? (
                                <p style={{ color: '#f5b800', fontWeight: 'bold', marginTop: '15px' }}>Winner: {m.winner}</p>
                            ) : isMyMatch ? (
                                <button onClick={() => handleJoinRoom(m.matchRoomCode, isWhite ? 'w' : 'b', m)} style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Join Your Match!</button>
                            ) : (
                                <p style={{ color: '#666', fontSize: '14px', marginTop: '15px' }}>Match in progress...</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// FORMATS THE UI CLOCKS 
export function GameView({ 
    activeThemeColors, 
    currentThemeKey,    // <-- NEW PROP
    onThemeChange,      // <-- NEW PROP
    gameMode, roomId, playerColor, gameStatus, game, onDrop, onSquareClick, movablePieceStyles, optionSquares, leaveGame, handleUndo, setIsTutorialOpen, Chessboard, whiteTime, blackTime, timeOutWinner 
}) {

    // Format 600s -> "10:00"
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    const topTime = playerColor === 'w' ? blackTime : whiteTime;
    const bottomTime = playerColor === 'w' ? whiteTime : blackTime;
    const topColorName = playerColor === 'w' ? 'Black' : 'White';
    const bottomColorName = playerColor === 'w' ? 'White' : 'Black';

    return (
        // Increased top padding from 100px to 120px to ensure it clears your header safely!
        <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0 40px', minHeight: '100vh', gap: '40px', fontFamily: 'sans-serif' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '500px' }}>

                {/* --- NEW THEME SELECTOR --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px', backgroundColor: '#1a1a1a', padding: '12px 20px', borderRadius: '8px', border: `1px solid #333`, boxSizing: 'border-box' }}>
                    <span style={{ fontWeight: '600', color: '#9ca3af' }}>Board Theme</span>
                    <select 
                        value={currentThemeKey || 'standard'} 
                        onChange={(e) => onThemeChange(e.target.value)}
                        style={{ 
                            backgroundColor: '#000', 
                            color: 'white', 
                            border: '1px solid #333',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {Object.entries(totalThemes).map(([key, themeObj]) => (
                            <option key={key} value={key}>{themeObj.name}</option>
                        ))}
                    </select>
                </div>
                {/* --------------------------- */}

                {gameMode === 'multiplayer' && (
                    <div style={{ backgroundColor: 'rgba(245, 184, 0, 0.1)', color: '#f5b800', border: '1px solid rgba(245, 184, 0, 0.4)', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '1rem', width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
                        Room Code: {roomId}
                    </div>
                )}

                <h3 style={{ color: (game.isGameOver() || timeOutWinner) ? '#ff4c4c' : 'white', margin: '0 0 20px 0', fontSize: '1.4rem' }}>{gameStatus}</h3>

                {/* TOP CLOCK */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '10px', backgroundColor: '#1a1a1a', padding: '12px 20px', borderRadius: '8px', border: `1px solid #333`, boxSizing: 'border-box' }}>
                    <span style={{ fontWeight: '600', color: '#9ca3af' }}>Opponent ({topColorName})</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 'bold', color: topTime <= 60 ? '#ef4444' : 'white', backgroundColor: '#000', padding: '4px 12px', borderRadius: '6px' }}>
                        {formatTime(topTime)}
                    </span>
                </div>

                {/* CHESS BOARD - Added explicit 500px height here! */}
                <div style={{ width: '500px', height: '500px', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', borderRadius: '4px', position: 'relative' }}>

                    {timeOutWinner && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', cursor: 'not-allowed' }}></div>}

                    <CustomBoard
                        game={game}
                        onDrop={onDrop}
                        onSquareClick={onSquareClick}
                        movablePieceStyles={movablePieceStyles}
                        activeTheme={activeThemeColors}
                        playerColor={gameMode === 'multiplayer' ? playerColor : 'w'}
                        optionSquares={optionSquares}
                    />
                </div>

                {/* BOTTOM CLOCK */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '10px', backgroundColor: '#1a1a1a', padding: '12px 20px', borderRadius: '8px', border: `1px solid #333`, boxSizing: 'border-box' }}>
                    <span style={{ fontWeight: '600', color: '#9ca3af' }}>You ({bottomColorName})</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 'bold', color: bottomTime <= 60 ? '#ef4444' : 'white', backgroundColor: '#000', padding: '4px 12px', borderRadius: '6px' }}>
                        {formatTime(bottomTime)}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '30px', width: '100%' }}>
                    <button onClick={leaveGame} style={{ flex: 1, padding: '12px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#1a1a1a', color: 'white', border: `1px solid #333`, borderRadius: '6px', fontWeight: 'bold' }}>Leave Game</button>
                    {gameMode === 'practice' && <button onClick={handleUndo} style={{ flex: 1, padding: '12px', fontSize: '1rem', cursor: 'pointer', backgroundColor: 'transparent', color: '#f5b800', border: '1px solid rgba(245, 184, 0, 0.4)', borderRadius: '6px', fontWeight: 'bold' }}>↩ Undo Move</button>}
                </div>
            </div>

            <div style={{ width: '280px', backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '12px', border: `1px solid #2a2a2a`, height: '620px', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, borderBottom: `1px solid #2a2a2a`, paddingBottom: '15px', color: 'white', fontSize: '1.2rem' }}>Match History</h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#9ca3af', fontWeight: '500' }}>
                    {game.history().map((move, index) => <li key={index}><span style={{ color: 'white' }}>{move}</span></li>)}
                </ol>
            </div>
        </div>
    );
}