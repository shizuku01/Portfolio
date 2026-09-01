// =============================================================================
// WORK PAGE (/work) - illustration and client projects, one hub
// =============================================================================
// The old site kept a home-page Gallery and a separate /projects page. Here
// they're merged into one page with a filter, since to a visitor they're
// both just "things Latte made" - the filter is for people who specifically
// want one or the other.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from './PageHeader';
import Footer from './Footer';
import { artworks } from './artworkData';
import { projects } from './projectsData';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'projects', label: 'Case Studies' },
  { id: 'art', label: 'Illustration' },
];

function WorkPage() {
  const [filter, setFilter] = useState('all');

  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArtwork(null), 300);
  };

  const handleModalBackdropClick = (e) => {
    if (e.target.className === 'artwork-modal open') {
      closeModal();
    }
  };

  const showProjects = filter === 'all' || filter === 'projects';
  const showArt = filter === 'all' || filter === 'art';

  return (
    <div className="work-page">
      <PageHeader />

      <section className="work-v2">
        <div className="container">
          {/* Sidebar now spans the full column, starting at the very top
              of the page - level with "Work", not just with the sections
              below it. */}
          <div className="work-layout">
            <aside className="work-sidebar">
              <div className="work-filters">
                {FILTERS.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    className={`work-filter ${filter === f.id ? 'active' : ''}`}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="work-main">
              <div className="page-intro">
                <div className="eyebrow">Everything</div>
                <h1>Work</h1>
              </div>

              {showProjects && (
                <div className="work-section">
                  <h2 className="work-section-title">Case Studies</h2>
                  {/* Same card style as Illustration below (.gallery-v2-card)
                      but its own grid: auto-fit instead of a fixed column
                      count, so a handful of case studies never strands one
                      alone in its own row the way a fixed 4-up grid would
                      with 5 items. */}
                  <div className="work-projects-grid">
                    {projects.map((project) => {
                      // External work (e.g. a live client site) links straight
                      // out in a new tab instead of to an internal /work/:id.
                      const CardTag = project.externalUrl ? 'a' : Link;
                      const cardProps = project.externalUrl
                        ? { href: project.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
                        : { to: `/work/${project.id}` };

                      return (
                        <CardTag className="gallery-v2-card" key={project.id} {...cardProps}>
                          {project.image ? (
                            <img src={project.image} alt={project.title} loading="lazy" />
                          ) : (
                            <span className="gallery-v2-card-placeholder">{project.title.charAt(0)}</span>
                          )}
                          <div className="gallery-v2-card-overlay">
                            <span className="gallery-v2-card-title">{project.shortTitle || project.title}</span>
                            <span className="gallery-v2-card-year">{project.year}</span>
                          </div>
                        </CardTag>
                      );
                    })}
                  </div>
                </div>
              )}

              {showArt && (
                <div className="work-section">
                  <h2 className="work-section-title">Illustration</h2>
                  <div className="gallery-v2-grid">
                    {artworks.map((art) => (
                      <button
                        type="button"
                        className={`gallery-v2-card${art.landscape ? ' gallery-v2-card-landscape' : ''}`}
                        key={art.title}
                        onClick={() => openModal(art)}
                      >
                        <img src={art.image} alt={art.title} loading="lazy" />
                        <div className="gallery-v2-card-overlay">
                          <span className="gallery-v2-card-title">{art.title}</span>
                          <span className="gallery-v2-card-year">{art.year}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {selectedArtwork && (
        <div
          className={`artwork-modal ${isModalOpen ? 'open' : ''}`}
          onClick={handleModalBackdropClick}
        >
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <img src={selectedArtwork.image} alt={selectedArtwork.title} className="modal-image" />
            <div className="modal-info">
              <h3>{selectedArtwork.title}</h3>
              <p>{selectedArtwork.year}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkPage;
