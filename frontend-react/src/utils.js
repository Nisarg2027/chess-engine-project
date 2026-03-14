
// THE ULTIMATE THEME ENGINE

import { playSynthSound } from './audioEngine';
export const totalThemes = {
  standard: { 
    name: "Classic Wood",
    board: { light: '#f0d9b5', dark: '#b58863' }, 
    layout: { background: '#121212', panel: '#1a1a1a', text: '#ffffff', font: 'sans-serif' },
    pieces: { type: 'unicode' }, // Uses text symbols
    sounds: {
      move: '/sounds/standard/move.mp3',
      capture: '/sounds/standard/capture.mp3', // Generic capture
      checkmate: '/sounds/standard/checkmate.mp3',
      select: '/sounds/standard/select.mp3'
    }
  },
  midnight: { 
    name: "Midnight Hacker",
    board: { light: '#cbd5e1', dark: '#334155' }, 
    layout: { background: '#020617', panel: '#0f172a', text: '#38bdf8', font: '"Courier New", monospace' },
    pieces: { type: 'images', folder: 'midnight' }, // Will look in public/pieces/midnight/
    sounds: {
      move: '/sounds/cyber/move.mp3',
      capture_q: '/sounds/cyber/explosion.mp3', // Special sound for killing a Queen!
      capture: '/sounds/cyber/capture.mp3',
      checkmate: '/sounds/cyber/gameover.mp3',
      select: '/sounds/cyber/blip.mp3'
    }
  },
  royal: { 
    name: "Royal Marble",
    board: { light: '#e2e8f0', dark: '#94a3b8' }, 
    layout: { background: '#f8fafc', panel: '#ffffff', text: '#0f172a', font: 'Georgia, serif' },
    pieces: { type: 'images', folder: 'royal' }, 
    sounds: {
      move: '/sounds/royal/slide.mp3',
      capture: '/sounds/royal/strike.mp3',
      checkmate: '/sounds/royal/gong.mp3',
      select: '/sounds/royal/tap.mp3'
    }
  }
};

// --- GLOBAL SOUND PLAYER ---
export function playSound(theme, soundKey) {
  if (!theme) return;
  
  // We pass the exact soundKey (e.g. 'capture_q') AND the name of the theme 
  // so the synth knows whether to play a laser or a wooden snap!
  playSynthSound(soundKey, theme.name);
}

// ... keep your lobbyBtnStyle, getPlayerTitle, getRankColor functions below ...

// ... keep your lobbyBtnStyle, getPlayerTitle, getRankColor etc. down here!
export function lobbyBtnStyle(bg, text = 'white') {
  return { display: 'block', width: '100%', padding: '12px', margin: '10px 0', backgroundColor: bg, color: text, border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' };
}

export const featureCardStyle = {
  backgroundColor: '#1a1a1a',
  padding: '30px',
  borderRadius: '10px',
  width: '200px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
  borderTop: '4px solid #646cff'
};

export function getPlayerTitle(elo) {
  if (elo < 1200) return "Beginner";
  if (elo < 1400) return "Novice";
  if (elo < 1600) return "Intermediate";
  if (elo < 1800) return "Advanced";
  if (elo < 2000) return "Expert";
  if (elo < 2200) return "Master";
  return "Grandmaster";
}

export function getRankColor(elo) {
  if (elo < 1400) return '#aaa'; 
  if (elo < 1800) return '#4caf50'; 
  if (elo < 2200) return '#646cff'; 
  return '#ffd700'; 
}
export const boardThemes = {
  standard: { light: '#f0d9b5', dark: '#b58863', name: "Standard Wood" },
  emerald: { light: '#ffffdd', dark: '#86a666', name: "Emerald Green" },
  ocean: { light: '#dee3e6', dark: '#8ca2ad', name: "Ocean Blue" },
  midnight: { light: '#d8d8d8', dark: '#3b434c', name: "Midnight Ash" },
  coral: { light: '#fcecb6', dark: '#e07b6b', name: "Sunset Coral" }
};