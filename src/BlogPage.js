// =============================================================================
// BLOG PAGE (/blog) - Tabbed sub-sections
// =============================================================================
// A standalone page (its own route) that shows the blog. Each sub-section is a
// tab; content for all of them lives in src/blogData.js. The active tab is kept
// in the URL (?tab=unity) so tabs are linkable/shareable and the home-page
// sidebar can deep-link straight to a section.

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from './PageHeader';
import GamePlayer from './GamePlayer';
import { blogSections } from './blogData';

// -----------------------------------------------------------------------------
// Timeline - renders a sub-section's posts newest-first (shared by every tab)
// -----------------------------------------------------------------------------
function Timeline({ section }) {
  // Empty sub-section → friendly "coming soon" placeholder
  if (!section.posts.length) {
    return (
      <div className="blog-panel" role="tabpanel">
        {section.intro && <p className="devlog-intro">{section.intro}</p>}
        {section.game && <GamePlayer game={section.game} />}
        <p className="blog-empty">Nothing here yet — check back soon. ✨</p>
      </div>
    );
  }

  return (
    <div className="blog-panel" role="tabpanel">
      {section.intro && <p className="devlog-intro">{section.intro}</p>}

      {section.game && <GamePlayer game={section.game} />}

      <div className="devlog-timeline">
        {/* Sort a copy newest-first so posts can be added in any order */}
        {[...section.posts]
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((post, index) => (
            <article className="devlog-entry" key={`${post.date}-${index}`}>
              <div className="devlog-meta">
                <time className="devlog-date">{post.date}</time>
                {post.tag && <span className="devlog-game">{post.tag}</span>}
              </div>
              <h3 className="devlog-title">{post.title}</h3>
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="devlog-image"
                  loading="lazy"
                />
              )}
              <div className="devlog-body">
                {post.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// BlogPage - header nav + tab bar + active sub-section
// -----------------------------------------------------------------------------
function BlogPage() {
  const [searchParams] = useSearchParams();

  // Which sub-section is active: read from ?tab= in the URL, falling back to the
  // first section if the param is missing or points at one that no longer exists.
  // Navigation between sub-sections now happens via the Blog dropdown in the top bar.
  const requested = searchParams.get('tab');
  const activeId = blogSections.some((s) => s.id === requested)
    ? requested
    : blogSections[0].id;
  const activeSection =
    blogSections.find((s) => s.id === activeId) || blogSections[0];

  return (
    <div className="blog-page">
      <PageHeader />

      <section className="blog">
        <div className="container">
          {/* Just the current sub-section name, as a lime pill, top-left */}
          <h2 className="blog-section-title">{activeSection.label}</h2>

          {/* Active sub-section content */}
          <Timeline section={activeSection} />
        </div>
      </section>
    </div>
  );
}

export default BlogPage;
