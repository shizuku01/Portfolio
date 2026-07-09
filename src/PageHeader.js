// =============================================================================
// PAGE HEADER - shared top nav for standalone pages (/blog, /projects)
// =============================================================================
// Keeps a consistent header + navigation across every non-home page so there's
// always a clear way back to the main site.

import React from 'react';
import { Link } from 'react-router-dom';

function PageHeader() {
  return (
    <header className="page-header">
      <Link to="/" className="page-brand">LATTE</Link>
      <nav className="page-nav">
        <Link to="/">Home</Link>
        <a href="/#gallery">Gallery</a>
        <Link to="/blog">Blog</Link>
        <Link to="/projects">Projects</Link>
        <a href="/#contact">Contact</a>
        <a href="https://x.com/huihualaji" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
      </nav>
    </header>
  );
}

export default PageHeader;
