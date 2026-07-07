// =============================================================================
// LATTE'S PORTFOLIO - BACKEND SERVER
// =============================================================================
// This file creates an Express.js server that handles API requests for the portfolio
// It includes endpoints for health checks, contact form submissions, and serves static files

// =============================================================================
// DEPENDENCIES AND SETUP
// =============================================================================

// Express.js - Web application framework for Node.js
const express = require('express');

// CORS - Cross-Origin Resource Sharing middleware
// Allows the React frontend to make requests to this backend
const cors = require('cors');

// Helmet - Security middleware that sets various HTTP headers
// Helps protect against common web vulnerabilities
const helmet = require('helmet');

// Morgan - HTTP request logger middleware
// Logs all incoming requests to the console for debugging
const morgan = require('morgan');

// Nodemailer - Email sending library
// Used to send contact form submissions via email
const nodemailer = require('nodemailer');

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

// Create Express application instance
const app = express();

// Set the port - use environment variable if available, otherwise default to 5000
// Frontend runs on port 3000, backend on port 5000
const PORT = process.env.PORT || 5000;

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// Helmet: Security middleware that sets various HTTP headers
// Helps protect against common web vulnerabilities like XSS, clickjacking, etc.
app.use(helmet());

// CORS: Cross-Origin Resource Sharing
// Allows the React frontend (running on port 3000) to make requests to this backend (port 5000)
app.use(cors());

// Morgan: HTTP request logger
// Logs all incoming requests to the console in 'combined' format
// This helps with debugging and monitoring server activity
app.use(morgan('combined'));

// Express built-in middleware for parsing JSON bodies
// Converts incoming JSON data into JavaScript objects that can be accessed via req.body
app.use(express.json());

// Express built-in middleware for parsing URL-encoded bodies
// Handles form data sent with 'application/x-www-form-urlencoded'
// The 'extended: true' option allows for rich objects and arrays to be encoded
app.use(express.urlencoded({ extended: true }));

// =============================================================================
// EMAIL CONFIGURATION
// =============================================================================

// Configure nodemailer transporter using Gmail
// This creates an email transport that will send emails through Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'likaiwen2014@gmail.com',
    pass: process.env.EMAIL_PASSWORD || '' // App password from Gmail (not regular password)
  }
});

// =============================================================================
// API ROUTES
// =============================================================================

// Health Check Endpoint
// This endpoint is useful for monitoring and debugging
// Returns server status information including uptime and timestamp
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running successfully!',
    timestamp: new Date().toISOString(), // Current date/time in ISO format
    uptime: process.uptime() // How long the server has been running (in seconds)
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Website Backend API',
    version: '1.0.0',
    description: 'A modern REST API built with Express.js',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform
  });
});

// Artist portfolio data endpoints
app.get('/api/portfolio/profile', (req, res) => {
  const profile = {
    name: 'Latte',
    title: 'Visual Artist & Creative Designer',
    bio: 'I\'m a passionate visual artist with over 8 years of experience creating meaningful artwork that speaks to the soul. My work explores themes of nature, emotion, and the human experience. Each piece is carefully crafted to evoke feelings and tell stories that words cannot capture.',
    location: 'Ontario, USA',
    email: 'likaiwen2014@gmail.com',
    social: {
      instagram: '#',
      twitter: 'https://x.com/huihualaji',
      pixiv: 'https://www.pixiv.net/en/users/86953982'
    }
  };
  
  res.json({
    status: 'success',
    data: profile
  });
});

app.get('/api/portfolio/mediums', (req, res) => {
  const mediums = {
    painting: ['Oil Paint', 'Acrylic', 'Watercolor', 'Mixed Media', 'Encaustic'],
    drawing: ['Charcoal', 'Graphite', 'Ink', 'Pastels', 'Colored Pencil'],
    digital: ['Digital Art', 'Photography', 'Printmaking', 'Screen Printing', 'Lithography']
  };
  
  res.json({
    status: 'success',
    data: mediums
  });
});

app.get('/api/portfolio/gallery', (req, res) => {
  const artworks = [
    {
      id: 1,
      title: 'Sunset Dreams',
      medium: 'Oil on canvas',
      dimensions: '24" x 36"',
      year: '2024',
      description: 'A vibrant landscape capturing the ethereal beauty of a mountain sunset, painted during my residency in the Rockies.',
      status: 'Available',
      price: '$2,800',
      image: '/api/images/artwork1.jpg'
    },
    {
      id: 2,
      title: 'Ocean Whispers',
      medium: 'Watercolor on paper',
      dimensions: '18" x 24"',
      year: '2024',
      description: 'An intimate study of wave patterns and light reflection, exploring the meditative quality of water.',
      status: 'Sold',
      price: '$1,200',
      image: '/api/images/artwork2.jpg'
    },
    {
      id: 3,
      title: 'Urban Bloom',
      medium: 'Mixed media on wood',
      dimensions: '30" x 40"',
      year: '2023',
      description: 'A contemporary piece blending urban textures with organic forms, representing growth in unexpected places.',
      status: 'Available',
      price: '$3,500',
      image: '/api/images/artwork3.jpg'
    },
    {
      id: 4,
      title: 'Portrait Study #7',
      medium: 'Charcoal on paper',
      dimensions: '16" x 20"',
      year: '2023',
      description: 'A detailed portrait exploring the complexity of human emotion through dramatic lighting and shadow.',
      status: 'Commission',
      price: '$800',
      image: '/api/images/artwork4.jpg'
    },
    {
      id: 5,
      title: 'Lunar Dance',
      medium: 'Digital art print',
      dimensions: '24" x 36"',
      year: '2024',
      description: 'An abstract interpretation of lunar phases, created digitally and available as limited edition prints.',
      status: 'Print Available',
      price: '$150',
      image: '/api/images/artwork5.jpg'
    },
    {
      id: 6,
      title: 'Nature\'s Symphony',
      medium: 'Acrylic on canvas',
      dimensions: '20" x 30"',
      year: '2023',
      description: 'A celebration of biodiversity, featuring intricate details of forest life in a harmonious composition.',
      status: 'Available',
      price: '$2,200',
      image: '/api/images/artwork6.jpg'
    }
  ];
  
  res.json({
    status: 'success',
    data: artworks
  });
});

app.get('/api/data', (req, res) => {
  const sampleData = {
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
    ],
    stats: {
      totalUsers: 3,
      activeUsers: 2,
      lastUpdated: new Date().toISOString()
    }
  };
  
  res.json({
    status: 'success',
    data: sampleData
  });
});

// Contact Form Submission Endpoint
// Handles POST requests from the contact form on the website
// This is where the React frontend sends form data when users submit the contact form
app.post('/api/contact', async (req, res) => {
  // Extract form data from the request body
  // The frontend sends JSON data with name, email, and message fields
  const { name, email, message } = req.body;
  
  // Basic validation - ensure all required fields are present
  if (!name || !email || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, email, and message are required'
    });
  }
  
  // Log the submission to console
  console.log('Contact form submission:', { name, email, message });
  
  // Configure the email to be sent
  const mailOptions = {
    from: `"${name}" <likaiwen2014@gmail.com>`, // Sender's name with Gmail address
    to: 'likaiwen2014@gmail.com', // Your email address
    replyTo: email, // Reply will go to the person who submitted the form
    subject: `Portfolio Contact: Message from ${name}`,
    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">New Portfolio Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Message:</h3>
          <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">This email was sent from your portfolio website contact form.</p>
      </div>
    `
  };
  
  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    
    // Send success response back to the frontend
    res.json({
      status: 'success',
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
    console.log(`✅ Email sent successfully to likaiwen2014@gmail.com from ${email}`);
  } catch (error) {
    // If email sending fails, log the error and send error response
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'There was an error sending your message. Please try again later or email directly.'
    });
  }
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access the API at http://localhost:${PORT}/api`);
});

module.exports = app;
