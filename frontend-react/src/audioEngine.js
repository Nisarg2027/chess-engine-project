// Creates a connection to the browser's audio hardware
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export function playSynthSound(soundKey, themeName = "Classic Wood") {
  // Browsers require audio context to be resumed after user interaction
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  
  // Split 'capture_q' into action: 'capture', target: 'q'
  const [action, target] = soundKey.split('_'); 

  // Default values
  let type = 'sine';
  let freqStart = 440, freqEnd = 440;
  let duration = 0.1;
  let volStart = 0.2, volEnd = 0.01;

  // --- 1. MIDNIGHT HACKER (Sci-Fi Theme) ---
  if (themeName === "Midnight Hacker") {
    if (action === 'select') { type = 'square'; freqStart = 1200; freqEnd = 2000; duration = 0.05; volStart = 0.05; } // Digital Blip
    else if (action === 'move') { type = 'sawtooth'; freqStart = 300; freqEnd = 100; duration = 0.15; volStart = 0.05; } // Sci-fi Swoosh
    else if (action === 'capture') {
      if (target === 'q' || target === 'k') { 
        type = 'sawtooth'; freqStart = 150; freqEnd = 10; duration = 0.5; volStart = 0.3; // 8-bit Explosion!
      } else { 
        type = 'square'; freqStart = 800; freqEnd = 200; duration = 0.2; volStart = 0.1; // Laser PEW!
      }
    }
    else if (action === 'checkmate') { type = 'sawtooth'; freqStart = 400; freqEnd = 20; duration = 2.0; volStart = 0.2; } // Power Down
  } 
  
  // --- 2. ROYAL MARBLE (Stone/Glass Theme) ---
  else if (themeName === "Royal Marble") {
    if (action === 'select') { type = 'triangle'; freqStart = 1500; freqEnd = 1500; duration = 0.05; volStart = 0.1; } // Glass Tap
    else if (action === 'move') { type = 'sine'; freqStart = 100; freqEnd = 80; duration = 0.2; volStart = 0.3; } // Heavy Slide
    else if (action === 'capture') {
      if (target === 'q' || target === 'k') { 
        type = 'triangle'; freqStart = 600; freqEnd = 100; duration = 0.25; volStart = 0.4; // Heavy Stone Smash
      } else { 
        type = 'triangle'; freqStart = 1200; freqEnd = 400; duration = 0.1; volStart = 0.2; // Sharp Clack
      }
    }
    else if (action === 'checkmate') { type = 'sine'; freqStart = 200; freqEnd = 190; duration = 2.5; volStart = 0.5; } // Resonant Gong
  } 
  
  // --- 3. CLASSIC WOOD (Standard Theme) ---
  else {
    if (action === 'select') { type = 'sine'; freqStart = 600; freqEnd = 800; duration = 0.1; volStart = 0.1; } // Wood Tap
    else if (action === 'move') { type = 'triangle'; freqStart = 150; freqEnd = 50; duration = 0.1; volStart = 0.3; } // Soft Thud
    else if (action === 'capture') {
      if (target === 'q' || target === 'k') { 
        type = 'square'; freqStart = 150; freqEnd = 40; duration = 0.25; volStart = 0.2; // Heavy Wood Crunch
      } else { 
        type = 'square'; freqStart = 200; freqEnd = 50; duration = 0.15; volStart = 0.1; // Wood Snap
      }
    }
    else if (action === 'checkmate') { type = 'sine'; freqStart = 300; freqEnd = 80; duration = 1.5; volStart = 0.4; } // Deep Bell
  }

  // Execute the sound wave calculation
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, now);
  // Math.max prevents the frequency from hitting 0 or negative numbers, which crashes the audio context
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration); 
  
  gainNode.gain.setValueAtTime(volStart, now);
  gainNode.gain.exponentialRampToValueAtTime(volEnd, now + duration);
  
  osc.start(now);
  osc.stop(now + duration);

  // --- ADD HARMONICS FOR CHECKMATE ---
  // If it's a checkmate, we spawn a second audio wave at a "Perfect 5th" musical interval to create a dramatic, echoing chord
  if (action === 'checkmate') {
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.type = type;
    osc2.frequency.setValueAtTime(freqStart * 1.5, now); 
    osc2.frequency.exponentialRampToValueAtTime(Math.max(freqEnd * 1.5, 1), now + duration);
    
    gain2.gain.setValueAtTime(volStart * 0.7, now);
    gain2.gain.exponentialRampToValueAtTime(volEnd, now + duration);
    
    osc2.start(now);
    osc2.stop(now + duration);
  }
}