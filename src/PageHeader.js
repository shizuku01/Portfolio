// =============================================================================
// PAGE HEADER - shared top nav for standalone pages (/blog, /projects)
// =============================================================================
// Keeps a consistent header + navigation across every non-home page. The "Blog"
// item is a dropdown that lists the blog sub-sections and deep-links into them.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogSections } from './blogData';

function PageHeader() {
  // Blog dropdown open/closed
  const [blogOpen, setBlogOpen] = useState(false);

  return (
    <header className="page-header">
      <Link to="/" className="page-brand">LATTE</Link>
      <nav className="page-nav">
        <Link to="/">Home</Link>
        <a href="/#gallery">Gallery</a>

        {/* Blog - dropdown listing the sub-sections */}
        <div className={`page-nav-dropdown ${blogOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="page-nav-dropdown-toggle"
            aria-expanded={blogOpen}
            onClick={() => setBlogOpen((open) => !open)}
          >
            Blog
            <svg className="page-nav-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <div className="page-nav-menu">
            {blogSections.map((section) => (
              <Link
                key={section.id}
                to={`/blog?tab=${section.id}`}
                className="page-nav-menu-item"
                onClick={() => setBlogOpen(false)}
              >
                {section.label}
              </Link>
            ))}
          </div>
        </div>

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
