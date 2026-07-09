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
        <p className="blog-empty">Nothing here yet — check back soon. ✨</p>
      </div>
    );
  }

  return (
    <div className="blog-panel" role="tabpanel">
      {section.intro && <p className="devlog-intro">{section.intro}</p>}

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Which tab is active: read from ?tab= in the URL, falling back to the first
  // section if the param is missing or points at a section that no longer exists.
  const requested = searchParams.get('tab');
  const activeId = blogSections.some((s) => s.id === requested)
    ? requested
    : blogSections[0].id;
  const activeSection =
    blogSections.find((s) => s.id === activeId) || blogSections[0];

  // Switch tab by updating the URL (keeps it linkable + back-button friendly)
  const selectTab = (id) => setSearchParams({ tab: id });

  return (
    <div className="blog-page">
      <PageHeader />

      <section className="blog">
        <div className="container">
          <h2>Blog</h2>
          <p className="blog-intro">
            Different threads of what I'm working on — pick a topic below.
          </p>

          {/* Tab bar (generated from blogSections) */}
          <div className="blog-tabs" role="tablist">
            {blogSections.map((section) => (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={activeId === section.id}
                className={`blog-tab ${activeId === section.id ? 'active' : ''}`}
                onClick={() => selectTab(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Active sub-section */}
          <Timeline section={activeSection} />
        </div>
      </section>
    </div>
  );
}

export default BlogPage;
