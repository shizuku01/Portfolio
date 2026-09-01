// =============================================================================
// HOME PAGE (/) - a tight landing page, not the full archive
// =============================================================================
// Deliberately short: a full-bleed hero, a small curated "Featured" pull
// (mixing illustration and client work), and contact. Everything else - the
// full gallery, every project - lives on /work.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PageHeader from './PageHeader';
import Footer from './Footer';
import { artworks } from './artworkData';
import { projects } from './projectsData';

const HERO_BAND = ['Ciaccona', 'Shorekeeper', 'Corrin', 'Dorothy', 'Roccia', 'Texas']
  .map((title) => artworks.find((a) => a.title === title));

// A small, hand-picked mix of art and client work - not the whole archive.
// Update the title list below whenever you want to change which pieces show
// up here.
const featuredArt = ['Shu', 'Qiuyuan', 'Dorothy', 'Muelsyse']
  .map((title) => artworks.find((a) => a.title === title))
  .filter(Boolean);

const featuredProjects = ['elysium', 'finbin']
  .map((id) => projects.find((p) => p.id === id))
  .filter(Boolean);

const FEATURED = [
  { kind: 'art', ...featuredArt[0] },
  { kind: 'project', ...featuredProjects[0] },
  { kind: 'art', ...featuredArt[1] },
  { kind: 'art', ...featuredArt[2] },
  { kind: 'project', ...featuredProjects[1] },
  { kind: 'art', ...featuredArt[3] },
];

function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState('');

  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contact', contactForm);
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      console.error('Contact form error:', error);
    }
  };

  const handleInputChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

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

  return (
    <div className="home-page">
      <PageHeader />

      {/* ===================================================================
          HERO - full viewport, sliding artwork band, serif headline
          =================================================================== */}
      <section className="hero-v2">
        <div className="hero-v2-glow" aria-hidden="true"></div>

        <div className="hero-v2-band" aria-hidden="true">
          <div className="hero-v2-band-track">
            {[...HERO_BAND, ...HERO_BAND].map((art, i) => (
              <img key={`${art.title}-${i}`} src={art.image} alt="" />
            ))}
          </div>
        </div>
        <div className="hero-v2-band-fade" aria-hidden="true"></div>

        <div className="hero-v2-inner container">
          <div className="hero-v2-copy">
            <div className="eyebrow">Illustrator &amp; Graphic Designer</div>
            <h1>
              Hello, I&rsquo;m <em>Latte</em>.
            </h1>
            <p className="hero-v2-bio">
              Character illustration and brand design &mdash; mostly for games, and the people who love them.
            </p>
            <div className="hero-v2-cta-row">
              <Link to="/work" className="btn-accent">See my work</Link>
              <a
                href="https://x.com/huihualaji"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hero-v2-twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-7L11 15.3 4.8 22H1.6l8.1-9.3L1 2h7.2l5.4 6.1L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z"/></svg>
              </a>
            </div>
          </div>
          <div className="hero-v2-portrait">
            <img src="/images/profile-pic.jpg" alt="Latte" className="hero-v2-portrait-photo" />
          </div>
        </div>
      </section>

      {/* ===================================================================
          FEATURED - a small mix of art and client work, not the whole archive
          =================================================================== */}
      <section className="featured">
        {/* The heading uses the same full-bleed bounds as the grid below
            (not .container) so its left AND right edges line up exactly
            with the first and last cards. */}
        <div className="featured-heading-row">
          <div className="section-heading">
            <div className="eyebrow">Featured</div>
            <h2>Recent Updates</h2>
          </div>
        </div>

        <div className="featured-grid">
          {FEATURED.map((item) =>
              item.kind === 'art' ? (
                <button
                  type="button"
                  className="featured-card"
                  key={item.title}
                  onClick={() => openModal(item)}
                >
                  <div className="featured-card-thumb">
                    <img src={item.image} alt={item.title} loading="lazy" />
                  </div>
                  <div className="featured-card-info">
                    <span className="featured-card-tag">Illustration</span>
                    <h3>{item.title}</h3>
                  </div>
                </button>
              ) : (
                <Link className="featured-card" to={`/work/${item.id}`} key={item.id}>
                  <div className="featured-card-thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.title} loading="lazy" />
                    ) : (
                      <span className="featured-card-thumb-placeholder">{item.title.charAt(0)}</span>
                    )}
                  </div>
                  <div className="featured-card-info">
                    <span className="featured-card-tag">Case Study</span>
                    <h3>{item.title}</h3>
                  </div>
                </Link>
              )
            )}
        </div>

        <div className="container">
          <Link to="/work" className="link-underline featured-see-all">
            See everything &rarr;
          </Link>
        </div>
      </section>

      {/* ===================================================================
          CONTACT
          =================================================================== */}
      <section id="contact" className="contact-v2">
        <div className="container">
          <div className="contact-v2-header">
            <div className="eyebrow">Let&rsquo;s Talk</div>
            <h2>Get In Touch</h2>
            <p>
              Interested in commissioning a piece or purchasing artwork? I&rsquo;d love to
              discuss your vision and create something meaningful together.
            </p>
          </div>

          <div className="contact-v2-body">
            <div className="contact-v2-info">
              <div className="contact-v2-info-row">
                <div className="contact-v2-info-label">Email</div>
                <div>likaiwen2014@gmail.com</div>
              </div>
              <div className="contact-v2-info-row">
                <div className="contact-v2-info-label">Location</div>
                <div>Ontario, CA</div>
              </div>
              <div className="contact-v2-info-row">
                <div className="contact-v2-info-label">Social</div>
                <div className="contact-v2-info-social">
                  <a href="https://x.com/huihualaji" target="_blank" rel="noopener noreferrer">Twitter</a>
                </div>
              </div>
            </div>

            <form className="contact-v2-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="message"
                placeholder="Tell me about your vision&#8230;"
                rows="4"
                value={contactForm.message}
                onChange={handleInputChange}
                required
              ></textarea>
              <button type="submit" className="btn-accent contact-v2-submit">Send Message</button>
              {submitStatus === 'success' && (
                <p className="form-success">Thank you! Your message has been sent.</p>
              )}
              {submitStatus === 'error' && (
                <p className="form-error">Sorry, there was an error sending your message.</p>
              )}
            </form>
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

export default Home;
