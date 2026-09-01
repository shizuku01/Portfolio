// =============================================================================
// PAGE HEADER - shared top nav for every page
// =============================================================================
// Simpler nav than before: Gallery and Projects are merged into one "Work"
// hub, so there's no separate link for each. Sticky - stays onscreen while
// scrolling.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function PageHeader() {
  const { pathname } = useLocation();

  const isHome = pathname === '/';
  const isWork = pathname.startsWith('/work');
  const isJournal = pathname.startsWith('/journal');

  return (
    <header className="page-header">
      <div className="page-header-inner">
        <Link to="/" className="page-brand">Latte</Link>
        <nav className="page-nav">
          <Link to="/" className={isHome ? 'active' : ''}>Home</Link>
          <Link to="/work" className={isWork ? 'active' : ''}>Work</Link>
          <Link to="/journal" className={isJournal ? 'active' : ''}>Journal</Link>
          <a href="https://x.com/huihualaji" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="page-nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-7L11 15.3 4.8 22H1.6l8.1-9.3L1 2h7.2l5.4 6.1L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z"/></svg>
          </a>
        </nav>
      </div>
    </header>
  );
}

export default PageHeader;
