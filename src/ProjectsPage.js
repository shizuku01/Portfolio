// =============================================================================
// PROJECTS PAGE (/projects) - past client / collaborative work
// =============================================================================
// A standalone page showing project cards (image, title + year, description).
// Content lives in src/projectsData.js. This is kept separate from the Gallery,
// which is for personal artwork.

import React from 'react';
import PageHeader from './PageHeader';
import { projects } from './projectsData';

function ProjectsPage() {
  return (
    <div className="projects-page">
      <PageHeader />

      <section className="projects">
        <div className="container">
          <h2>Projects</h2>
          <p className="blog-intro">
            Selected past projects — client and collaborative work, separate from
            my personal art.
          </p>

          {projects.length === 0 ? (
            <p className="blog-empty">Nothing here yet — check back soon. ✨</p>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-thumb">
                    {project.image ? (
                      <img src={project.image} alt={project.title} loading="lazy" />
                    ) : (
                      // Fallback tile when a project has no cover image yet
                      <span className="project-thumb-placeholder">
                        {project.title.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="project-info">
                    <div className="project-meta">
                      <h3>{project.title}</h3>
                      <span className="project-year">{project.year}</span>
                    </div>
                    <p className="project-desc">{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProjectsPage;
