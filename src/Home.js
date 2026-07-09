// =============================================================================
// HOME PAGE (/) - Hero, gallery, and contact
// =============================================================================
// The main landing page. The blog now lives on its own page (/blog); the
// sidebar "Blog" menu links there, with nested sub-links that deep-link to a
// specific sub-section via ?tab=.

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { blogSections } from './blogData';

function Home() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // Contact form state - stores user input for name, email, and message
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Submission status state - tracks whether form submission was successful or failed
  const [submitStatus, setSubmitStatus] = useState('');

  // Modal state - tracks which artwork is being viewed in the modal
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sidebar "Blog" dropdown - collapsed by default; toggles its sub-links
  const [blogMenuOpen, setBlogMenuOpen] = useState(false);

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  // Handle contact form submission
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

  // Handle input field changes in the contact form
  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle artwork click - open modal with selected artwork
  const openModal = (artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  // Handle modal close
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArtwork(null), 300); // Delay clearing to allow animation
  };

  // Handle click outside modal (on backdrop)
  const handleModalBackdropClick = (e) => {
    if (e.target.className === 'artwork-modal open') {
      closeModal();
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="portfolio">
      {/* ===================================================================
          HERO SECTION - Introduction and Profile
          =================================================================== */}
      <section className="hero">
        {/* Scrolling Artwork Background */}
        <div className="hero-artwork-scroll">
          <div className="artwork-scroll-track">
            <div className="artwork-scroll-item">
              <img src="/images/Artwork5-2024-Camellya.jpg" alt="Camellya" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork3-2023-Dusk.jpg" alt="Dusk" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork6-2024-Shorekeeper.jpg" alt="Shorekeeper" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork7-2025-Roccia.jpg" alt="Roccia" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork8-2025-Ciaccona.jpg" alt="Ciaccona" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork2-2023-Texas.jpg" alt="Texas" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork4-2024-Youhu.jpg" alt="Youhu" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork9-2025-Dorothy.jpg" alt="Dorothy" />
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="hero-content">
          <div className="hero-profile">
            <img src="/images/profile-pic.jpg" alt="Latte" className="profile-picture" />
          </div>

          <h1>Hello, I'm <span className="highlight">Latte</span></h1>
          <p className="hero-subtitle">Illustrator & Graphic Designer</p>

          <div className="hero-arrow">
            <a href="#gallery" className="scroll-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===================================================================
          GALLERY SECTION - Artwork Display and Navigation
          =================================================================== */}
      <section id="gallery" className="gallery">
        <div className="gallery-layout">
          {/* Left Menu - Navigation and Social Links */}
          <nav className="gallery-menu">
            <div className="menu-logo">
              <h1>LATTE</h1>
            </div>

            <div className="menu-items">
              <a href="#gallery" className="menu-item">
                <span>Gallery</span>
              </a>

              {/* Blog - a dropdown. Clicking toggles the sub-links open;
                  each sub-link deep-links to a section on /blog via ?tab=. */}
              <div className={`menu-group ${blogMenuOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="menu-item menu-dropdown-toggle"
                  aria-expanded={blogMenuOpen}
                  onClick={() => setBlogMenuOpen((open) => !open)}
                >
                  <span>Blog</span>
                  <svg className="menu-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {/* Always rendered so it can ease open AND closed; visibility
                    is driven by the .open class on .menu-group (see CSS). */}
                <div className="menu-subitems">
                  {blogSections.map((section) => (
                    <Link
                      key={section.id}
                      to={`/blog?tab=${section.id}`}
                      className="menu-subitem"
                      tabIndex={blogMenuOpen ? 0 : -1}
                    >
                      <span>{section.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/projects" className="menu-item">
                <span>Projects</span>
              </Link>

              <a href="#contact" className="menu-item">
                <span>Contact</span>
              </a>
              <a href="https://x.com/huihualaji" target="_blank" rel="noopener noreferrer" className="menu-item">
                <span>Twitter</span>
              </a>
            </div>
          </nav>

          {/* Gallery Content - Artwork Grid */}
          <div className="gallery-content">
            <h2>Gallery</h2>

            <div className="gallery-container">
              <div className="gallery-grid">
                {/* Phrolova - Landscape artwork - 2025 */}
                <div className="artwork-card horizontal" onClick={() => openModal({ title: 'Phrolova', year: '2025', image: '/images/Artwork10-2025-Phrolova.jpg' })}>
                  <img src="/images/Artwork10-2025-Phrolova.jpg" alt="Phrolova" className="artwork-img phrolova" />
                  <div className="artwork-content">
                    <h3>Phrolova</h3>
                    <p>2025</p>
                  </div>
                </div>

                {/* Dorothy - Portrait artwork - 2025 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Dorothy', year: '2025', image: '/images/Artwork9-2025-Dorothy.jpg' })}>
                  <img src="/images/Artwork9-2025-Dorothy.jpg" alt="Dorothy" className="artwork-img dorothy" />
                  <div className="artwork-content">
                    <h3>Dorothy</h3>
                    <p>2025</p>
                  </div>
                </div>

                {/* Ciaccona - Portrait artwork - 2025 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Ciaccona', year: '2025', image: '/images/Artwork8-2025-Ciaccona.jpg' })}>
                  <img src="/images/Artwork8-2025-Ciaccona.jpg" alt="Ciaccona" className="artwork-img ciaccona" />
                  <div className="artwork-content">
                    <h3>Ciaccona</h3>
                    <p>2025</p>
                  </div>
                </div>

                {/* Roccia - Portrait artwork - 2025 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Roccia', year: '2025', image: '/images/Artwork7-2025-Roccia.jpg' })}>
                  <img src="/images/Artwork7-2025-Roccia.jpg" alt="Roccia" className="artwork-img roccia" />
                  <div className="artwork-content">
                    <h3>Roccia</h3>
                    <p>2025</p>
                  </div>
                </div>

                {/* Shorekeeper - Portrait artwork - 2024 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Shorekeeper', year: '2024', image: '/images/Artwork6-2024-Shorekeeper.jpg' })}>
                  <img src="/images/Artwork6-2024-Shorekeeper.jpg" alt="Shorekeeper" className="artwork-img shorekeeper" />
                  <div className="artwork-content">
                    <h3>Shorekeeper</h3>
                    <p>2024</p>
                  </div>
                </div>

                {/* Camellya - Portrait artwork - 2024 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Camellya', year: '2024', image: '/images/Artwork5-2024-Camellya.jpg' })}>
                  <img src="/images/Artwork5-2024-Camellya.jpg" alt="Camellya" className="artwork-img camellya" />
                  <div className="artwork-content">
                    <h3>Camellya</h3>
                    <p>2024</p>
                  </div>
                </div>

                {/* Youhu - Portrait artwork - 2024 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Youhu', year: '2024', image: '/images/Artwork4-2024-Youhu.jpg' })}>
                  <img src="/images/Artwork4-2024-Youhu.jpg" alt="Youhu" className="artwork-img youhu" />
                  <div className="artwork-content">
                    <h3>Youhu</h3>
                    <p>2024</p>
                  </div>
                </div>

                {/* Dusk - Portrait artwork - 2023 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Dusk', year: '2023', image: '/images/Artwork3-2023-Dusk.jpg' })}>
                  <img src="/images/Artwork3-2023-Dusk.jpg" alt="Dusk" className="artwork-img dusk" />
                  <div className="artwork-content">
                    <h3>Dusk</h3>
                    <p>2023</p>
                  </div>
                </div>

                {/* Texas - Portrait artwork - 2023 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Texas', year: '2023', image: '/images/Artwork2-2023-Texas.jpg' })}>
                  <img src="/images/Artwork2-2023-Texas.jpg" alt="Texas" className="artwork-img texas" />
                  <div className="artwork-content">
                    <h3>Texas</h3>
                    <p>2023</p>
                  </div>
                </div>

                {/* Corrin - Portrait artwork - 2023 */}
                <div className="artwork-card" onClick={() => openModal({ title: 'Corrin', year: '2023', image: '/images/Artwork1-2023-Corrin.jpg' })}>
                  <img src="/images/Artwork1-2023-Corrin.jpg" alt="Corrin" className="artwork-img corrin" />
                  <div className="artwork-content">
                    <h3>Corrin</h3>
                    <p>2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          CONTACT SECTION - Contact Form
          =================================================================== */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <p className="contact-intro">
            Interested in commissioning a piece or purchasing artwork?
            I'd love to hear from you! Send me a message and I'll get back to you as soon as possible.
          </p>

          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Tell me about your vision - commission details, artwork inquiries, or just say hello!"
                  rows="5"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>

            {submitStatus === 'success' && (
              <div className="status-message success">
                <p>Thank you for your message! I'll get back to you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="status-message error">
                <p>Sorry, there was an error sending your message. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================
          FOOTER SECTION
          =================================================================== */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Latte. All rights reserved.</p>
        </div>
      </footer>

      {/* Decorative white triangle in the bottom-right corner. It's absolutely
          positioned inside .portfolio, so it scrolls with the page content
          instead of staying fixed to the viewport. */}
      <div className="corner-triangle" aria-hidden="true" />

      {/* ===================================================================
          ARTWORK MODAL - Full Image Popup
          =================================================================== */}
      {selectedArtwork && (
        <div
          className={`artwork-modal ${isModalOpen ? 'open' : ''}`}
          onClick={handleModalBackdropClick}
        >
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <img
              src={selectedArtwork.image}
              alt={selectedArtwork.title}
              className="modal-image"
            />
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
