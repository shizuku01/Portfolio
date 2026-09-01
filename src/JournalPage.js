// =============================================================================
// JOURNAL PAGE (/journal) - a single running list of posts
// =============================================================================

import React from 'react';
import PageHeader from './PageHeader';
import Footer from './Footer';
import SpiralLine from './SpiralLine';
import { blogPosts } from './blogData';

function JournalPage() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="journal-page">
      <PageHeader />
      <SpiralLine />

      <section className="journal-v2">
        <div className="container">
          <div className="page-intro">
            <div className="eyebrow">Notes</div>
            <h1>Journal</h1>
            <p>Updates on this site, and whatever else is worth writing down.</p>
          </div>

          {posts.length === 0 ? (
            <p className="blog-empty">Nothing here yet — check back soon. ✨</p>
          ) : (
            <div className="devlog-timeline">
              {posts.map((post, index) => (
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default JournalPage;
