import { playSound } from './utils';

export default function CustomBoard({ game, onDrop, onSquareClick, activeTheme, playerColor, customPieces, optionSquares, movablePieceStyles }) {

  let boardState = game.board();
  const isFlipped = playerColor === 'b';

  const squares = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const visualRow = isFlipped ? 7 - row : row;
      const visualCol = isFlipped ? 7 - col : col;

      const file = String.fromCharCode(97 + visualCol);
      const rank = 8 - visualRow;
      const squareId = `${file}${rank}`;

      const isDark = (row + col) % 2 !== 0;
      const piece = boardState[visualRow][visualCol];

      squares.push({ id: squareId, isDark, piece });
    }
  }

  // --- BULLETPROOF DRAG & DROP ---
  const handleDragStart = (e, squareId) => {
    e.dataTransfer.setData('sourceSquare', squareId);
    e.dataTransfer.effectAllowed = "move";
    if (onSquareClick) onSquareClick(squareId, activeTheme);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, targetSquareId) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceSquareId = e.dataTransfer.getData('sourceSquare');
    if (sourceSquareId && sourceSquareId !== targetSquareId) {
      onDrop(sourceSquareId, targetSquareId, activeTheme);
    }
  };

  // --- PREMIUM PIECE RENDERER ---
  // --- CSS SPRITE SHEET RENDERER ---
  // --- FLAWLESS CSS SPRITE SHEET RENDERER ---
  // --- THE BULLETPROOF DIRECT URL RENDERER ---
  const renderPiece = (piece) => {
    if (!piece) return null;

    // A dictionary linking every piece to its official Wikipedia transparent SVG!
    const pieceUrls = {
      'wk': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
      'wq': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
      'wr': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
      'wb': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
      'wn': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
      'wp': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
      'bk': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
      'bq': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
      'br': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
      'bb': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
      'bn': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
      'bp': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    };

    // Construct the key (e.g., 'w' + 'k' = 'wk')
    const pieceKey = `${piece.color}${piece.type}`;
    const pieceUrl = pieceUrls[pieceKey];

    return (
      <img
        src={pieceUrl}
        alt={pieceKey}
        style={{
          width: '90%',
          height: '90%',
          pointerEvents: 'none', // Critical so drag-and-drop works
          userSelect: 'none',
          // Optional: A soft shadow so the pieces stand out from the board!
          filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))'
        }}
      />
    );
  };

  const darkColor = activeTheme?.board?.dark || activeTheme?.dark || '#b58863';
  const lightColor = activeTheme?.board?.light || activeTheme?.light || '#f0d9b5';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      gridTemplateRows: 'repeat(8, 1fr)',
      width: '100%',
      height: '100%',
      aspectRatio: '1 / 1',
      border: `2px solid ${darkColor}`,
      borderRadius: '4px',
      overflow: 'hidden',
      boxSizing: 'border-box',
      fontFamily: activeTheme?.layout?.font || 'sans-serif'
    }}>
      {squares.map((sq) => {
        const squareOption = optionSquares && optionSquares[sq.id];
        const isMovable = movablePieceStyles && movablePieceStyles[sq.id];

        return (
          <div
            key={sq.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, sq.id)}
            onClick={() => { if (onSquareClick) onSquareClick(sq.id, activeTheme); }}
            style={{
              backgroundColor: sq.isDark ? darkColor : lightColor,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              boxShadow: isMovable ? isMovable.boxShadow : 'none',
              cursor: sq.piece && sq.piece.color === game.turn() ? 'grab' : 'pointer'
            }}
          >
            {/* Red glow for King in check */}
            {sq.piece && sq.piece.type === 'k' && sq.piece.color === game.turn() && game.inCheck() && (
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, transparent 70%)', pointerEvents: 'none' }} />
            )}

            {/* Legal Move Highlight Dots */}
            {squareOption && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: squareOption.background,
                borderRadius: squareOption.borderRadius || '0',
                pointerEvents: 'none',
                zIndex: 5
              }} />
            )}

            {/* Draggable Piece */}
            {sq.piece && (
              <div
                draggable={sq.piece.color === game.turn()}
                onDragStart={(e) => handleDragStart(e, sq.id)}
                style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}
              >
                {renderPiece(sq.piece)}
              </div>
            )}

            {/* Coordinate Labels */}
            {sq.id.includes('1') && !isFlipped && <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px', fontWeight: 'bold', color: sq.isDark ? lightColor : darkColor, pointerEvents: 'none' }}>{sq.id[0]}</span>}
            {sq.id.includes('8') && isFlipped && <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px', fontWeight: 'bold', color: sq.isDark ? lightColor : darkColor, pointerEvents: 'none' }}>{sq.id[0]}</span>}
            {sq.id.startsWith('a') && !isFlipped && <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', fontWeight: 'bold', color: sq.isDark ? lightColor : darkColor, pointerEvents: 'none' }}>{sq.id[1]}</span>}
            {sq.id.startsWith('h') && isFlipped && <span style={{ position: 'absolute', top: '2px', left: '4px', fontSize: '10px', fontWeight: 'bold', color: sq.isDark ? lightColor : darkColor, pointerEvents: 'none' }}>{sq.id[1]}</span>}
          </div>
        );
      })}
    </div>
  );
}