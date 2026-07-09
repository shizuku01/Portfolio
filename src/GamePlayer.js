// =============================================================================
// GAME PLAYER - embeds a Unity WebGL build inline (Unity Development tab)
// =============================================================================
// The Unity WebGL build is served as static files from public/game/ (which
// becomes /game/ in production). We embed its index.html in an <iframe> so the
// game's scripts/canvas stay isolated from the React app.
//
// Until the real build is in place, `game.ready` is false and we show a
// placeholder instead of the iframe — this avoids loading a broken/missing URL.

import React, { useRef } from 'react';

function GamePlayer({ game }) {
  const wrapRef = useRef(null);

  if (!game) return null;

  // No build wired up yet → friendly placeholder with drop-in instructions.
  if (!game.ready) {
    return (
      <div className="game-embed">
        <div className="game-placeholder">
          <p className="game-placeholder-title">🎮 Playable demo coming soon</p>
          <p>
            Drop the Unity WebGL build into <code>public/game/</code>, then set{' '}
            <code>ready: true</code> on this section in <code>src/blogData.js</code>.
          </p>
        </div>
      </div>
    );
  }

  // Fullscreen the whole player wrapper (so the Unity canvas fills the screen).
  const goFullscreen = () => {
    const el = wrapRef.current;
    if (el && el.requestFullscreen) el.requestFullscreen();
  };

  const width = game.width || 960;
  const height = game.height || 600;

  return (
    <div className="game-embed">
      <div className="game-header">
        <h3>{game.title || 'Playable Demo'}</h3>
        <button type="button" className="game-fullscreen-btn" onClick={goFullscreen}>
          Fullscreen
        </button>
      </div>

      <div
        className="game-frame-wrap"
        ref={wrapRef}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <iframe
          src={game.src}
          title={game.title || 'Unity demo'}
          className="game-frame"
          allow="fullscreen; autoplay; gamepad"
          allowFullScreen
        />
      </div>

      <p className="game-note">
        Best played on desktop. Click the game to start it; use Fullscreen for the
        full experience.
      </p>
    </div>
  );
}

export default GamePlayer;
