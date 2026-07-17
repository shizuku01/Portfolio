// =============================================================================
// SITE PREVIEW - embeds a static site/prototype inline (any blog sub-section)
// =============================================================================
// Same idea as GamePlayer, but for web work instead of a Unity build: the pages
// are served as static files out of public/<folder>/ (which becomes /<folder>/
// in production) and embedded in an <iframe> so their CSS/JS stay isolated from
// the React app.
//
// Drive it from src/blogData.js by adding an `embed` object to a sub-section:
//   embed: {
//     title  - heading shown above the frame
//     src    - path to the entry page, e.g. '/lingyue/index.html'
//     height - frame height in px (default 720)
//     note   - optional one-line caption under the frame
//     ready  - flip to true ONCE the files are actually in public/<folder>/,
//              so this shows the site instead of the placeholder.
//   }

import React, { useRef } from 'react';

function SitePreview({ embed }) {
  const wrapRef = useRef(null);

  if (!embed) return null;

  // Files not in place yet → placeholder with drop-in instructions.
  if (!embed.ready) {
    return (
      <div className="game-embed">
        <div className="game-placeholder">
          <p className="game-placeholder-title">🖼️ Preview coming soon</p>
          <p>
            Drop the site's files into <code>public/</code>, then set{' '}
            <code>ready: true</code> on this section in <code>src/blogData.js</code>.
          </p>
        </div>
      </div>
    );
  }

  const goFullscreen = () => {
    const el = wrapRef.current;
    if (el && el.requestFullscreen) el.requestFullscreen();
  };

  const height = embed.height || 720;

  return (
    <div className="game-embed">
      <div className="game-header">
        <h3>{embed.title || 'Live preview'}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            className="game-fullscreen-btn"
            href={embed.src}
            target="_blank"
            rel="noreferrer"
          >
            Open in new tab
          </a>
          <button type="button" className="game-fullscreen-btn" onClick={goFullscreen}>
            Fullscreen
          </button>
        </div>
      </div>

      <div className="game-frame-wrap" ref={wrapRef} style={{ height: `${height}px` }}>
        <iframe
          src={embed.src}
          title={embed.title || 'Site preview'}
          className="game-frame"
          allow="fullscreen"
          allowFullScreen
        />
      </div>

      {embed.note && <p className="game-note">{embed.note}</p>}
    </div>
  );
}

export default SitePreview;
