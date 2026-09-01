// =============================================================================
// PROJECT DETAIL PAGE (/work/:id) - full write-up for one project
// =============================================================================
// Reached by clicking a Case Study card on /work. Content comes from the
// matching entry's `detail` field in src/projectsData.js — see that file for
// the shape. A project with no `detail` still gets a page (just the cover
// image, title, and card description) so every card is always clickable.

import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import PageHeader from './PageHeader';
import Footer from './Footer';
import GamePlayer from './GamePlayer';
import SitePreview from './SitePreview';
import { projects } from './projectsData';

function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  // Unknown id (bad link, typo, old bookmark) -> back to the work list
  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const { detail } = project;

  return (
    <div className="project-detail-page">
      <PageHeader />

      <section className="project-detail">
        <div className="container">
          <Link to="/work" className="project-back-link">
            &larr; Back to Work
          </Link>

          {project.image && (
            <div className="project-detail-hero">
              <img src={project.image} alt={project.title} />
            </div>
          )}

          <div className="project-detail-heading">
            <h1>{project.title}</h1>
            <span className="project-year">{project.year}</span>
          </div>

          {detail?.meta && detail.meta.length > 0 && (
            <div className="project-detail-meta">
              {detail.meta.map((row) => (
                <div className="project-detail-meta-row" key={row.label}>
                  <span className="project-detail-meta-label">{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          <p className="project-detail-summary">{project.description}</p>

          {detail?.game && (
            <div className="project-detail-embed">
              <GamePlayer game={detail.game} />
            </div>
          )}

          {detail?.embed && (
            <div className="project-detail-embed">
              <SitePreview embed={detail.embed} />
            </div>
          )}

          {detail?.sections?.map((section) => (
            <div className="project-detail-section" key={section.heading}>
              {section.date && <span className="project-detail-section-date">{section.date}</span>}
              <h2>{section.heading}</h2>
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              {section.image && (
                <figure className="project-detail-figure">
                  <img
                    src={section.image}
                    alt={section.imageAlt || section.heading}
                    loading="lazy"
                  />
                  {section.caption && <figcaption>{section.caption}</figcaption>}
                </figure>
              )}

              {section.images && section.images.length > 0 && (
                <div className="project-detail-figure-group">
                  {section.images.map((img) => (
                    <figure className="project-detail-figure" key={img.src}>
                      <img src={img.src} alt={img.alt || section.heading} loading="lazy" />
                      {img.caption && <figcaption>{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ProjectDetail;
