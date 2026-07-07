// =============================================================================
// LATTE'S PORTFOLIO - REACT FRONTEND APPLICATION
// =============================================================================
// This is the main React component that renders the entire portfolio website
// It includes the hero section, gallery, contact form, and all interactive elements

import React, { useState } from 'react';
import axios from 'axios';

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
function App() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  
  // Contact form state - stores user input for name, email, and message
  // useState is a React Hook that lets you add state to functional components
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  
  // Submission status state - tracks whether form submission was successful or failed
  // Used to show success/error messages to the user
  const [submitStatus, setSubmitStatus] = useState('');


  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  // Handle contact form submission
  // This function runs when the user submits the contact form
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior (page refresh)
    e.preventDefault();
    
    try {
      // Send POST request to the backend API with form data
      // The axios library makes HTTP requests easy
      await axios.post('/api/contact', contactForm);
      
      // If successful, show success message and clear the form
      setSubmitStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      
    } catch (error) {
      // If there's an error, show error message
      setSubmitStatus('error');
      console.error('Contact form error:', error);
    }
  };

  // Handle input field changes in the contact form
  // Updates the state whenever user types in any form field
  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm, // Keep existing form data
      [e.target.name]: e.target.value // Update the specific field that changed
    });
  };


  // =========================================================================
  // RENDER METHOD
  // =========================================================================
  // This returns the JSX (JavaScript XML) that describes what the UI should look like
  
  return (
    <div className="portfolio">
      {/* ===================================================================
          HERO SECTION - Introduction and Profile
          ===================================================================
          This is the first section visitors see - includes profile picture,
          name, title, and scroll arrow to navigate to gallery
      */}
      <section className="hero">
        {/* Scrolling Artwork Background */}
        <div className="hero-artwork-scroll">
          <div className="artwork-scroll-track">
            {/* Portrait images only - explicitly listed to avoid including profile pics */}
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
            <div className="artwork-scroll-item">
              <img src="/images/Artwork1-2023-Corrin.jpg" alt="Corrin" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork8-2025-Ciaccona.jpg" alt="Ciaccona" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork1-2023-Corrin.jpg" alt="Corrin" />
            </div>
            <div className="artwork-scroll-item">
              <img src="/images/Artwork4-2024-Youhu.jpg" alt="Youhu" />
            </div>
          </div>
        </div>
        
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


      {/* Gallery Section */}
      <section id="gallery" className="gallery">
        <div className="gallery-layout">
          {/* Left Menu */}
          <nav className="gallery-menu">
            <div className="menu-logo">
              <h1>LATTE</h1>
            </div>
            <div className="menu-items">
              <a href="#gallery" className="menu-item">
                <span>Gallery</span>
              </a>
              <a href="#contact" className="menu-item">
                <span>Contact</span>
              </a>
              <a href="https://x.com/huihualaji" target="_blank" rel="noopener noreferrer" className="menu-item">
                <span>Twitter</span>
              </a>
              <a href="https://www.pixiv.net/en/users/86953982" target="_blank" rel="noopener noreferrer" className="menu-item">
                <span>Pixiv</span>
              </a>
            </div>
          </nav>

          {/* Gallery Content */}
          <div className="gallery-content">
            <h2>Gallery</h2>
        <div className="gallery-container">
          <div className="gallery-grid">
            {/* Only artwork images are included - profile pics and other files are excluded */}
            <div className="artwork-card horizontal">
              <img src="/images/Artwork10-2025-Phrolova.jpg" alt="Phrolova" className="artwork-img phrolova" />
              <div className="artwork-content">
                <h3>Phrolova</h3>
                <p>2025</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork9-2025-Dorothy.jpg" alt="Dorothy" className="artwork-img dorothy" />
              <div className="artwork-content">
                <h3>Dorothy</h3>
                <p>2025</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork8-2025-Ciaccona.jpg" alt="Ciaccona" className="artwork-img ciaccona" />
              <div className="artwork-content">
                <h3>Ciaccona</h3>
                <p>2025</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork7-2025-Roccia.jpg" alt="Roccia" className="artwork-img roccia" />
              <div className="artwork-content">
                <h3>Roccia</h3>
                <p>2025</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork6-2024-Shorekeeper.jpg" alt="Shorekeeper" className="artwork-img shorekeeper" />
              <div className="artwork-content">
                <h3>Shorekeeper</h3>
                <p>2024</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork5-2024-Camellya.jpg" alt="Camellya" className="artwork-img camellya" />
              <div className="artwork-content">
                <h3>Camellya</h3>
                <p>2024</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork4-2024-Youhu.jpg" alt="Youhu" className="artwork-img youhu" />
              <div className="artwork-content">
                <h3>Youhu</h3>
                <p>2024</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork3-2023-Dusk.jpg" alt="Dusk" className="artwork-img dusk" />
              <div className="artwork-content">
                <h3>Dusk</h3>
                <p>2023</p>
              </div>
            </div>

            <div className="artwork-card">
              <img src="/images/Artwork2-2023-Texas.jpg" alt="Texas" className="artwork-img texas" />
              <div className="artwork-content">
                <h3>Texas</h3>
                <p>2023</p>
              </div>
            </div>

            <div className="artwork-card">
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

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <p className="contact-intro">
            Interested in commissioning a piece or purchasing artwork? 
            I'd love to discuss your vision and create something meaningful together.
          </p>
          
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <h3>Email</h3>
                <p>likaiwen2014@gmail.com</p>
              </div>
              <div className="contact-item">
                <h3>Location</h3>
                <p>Ontario, USA</p>
              </div>
              <div className="contact-item">
                <h3>Social</h3>
                 <div className="social-links">
                   <a href="https://x.com/huihualaji" target="_blank" rel="noopener noreferrer">Twitter</a>
                   <a href="https://www.pixiv.net/en/users/86953982" target="_blank" rel="noopener noreferrer">Pixiv</a>
                 </div>
              </div>
        </div>

            <form className="contact-form" onSubmit={handleSubmit}>
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
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Latte. All rights reserved.</p>
      </div>
      </footer>
    </div>
  );
}

export default App;
