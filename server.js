// =============================================================================
// LATTE'S PORTFOLIO WEBSITE - COMBINED SERVER
// =============================================================================
// This file combines both the backend API and serves the React frontend
// It handles contact form submissions and serves static files

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const nodemailer = require('nodemailer');

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

// Create Express application instance
const app = express();

// Set the port - use environment variable if available, otherwise default to 3000
const PORT = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// Helmet: Security middleware that sets various HTTP headers
// Helps protect against common web vulnerabilities
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for development, enable in production
}));

// CORS: Cross-Origin Resource Sharing
// Allows the frontend to make requests to this backend from different domains
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false // In production, only allow requests from your domain
    : true, // In development, allow requests from any domain
  credentials: true
}));

// Morgan: HTTP request logger
// Logs all incoming requests to the console for debugging
app.use(morgan('combined'));

// Express built-in middleware for parsing JSON bodies
// Converts incoming JSON data into JavaScript objects
app.use(express.json({ limit: '10mb' }));

// Express built-in middleware for parsing URL-encoded bodies
// Handles form data sent with 'application/x-www-form-urlencoded'
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// EMAIL CONFIGURATION
// =============================================================================

// Email addresses are configurable via environment variables so they aren't
// hardcoded. They fall back to the values below if not provided.
//   EMAIL_USER     - the Gmail account that sends the mail (must match the App Password)
//   EMAIL_TO       - where contact-form messages are delivered (defaults to EMAIL_USER)
//   EMAIL_PASSWORD - 16-char Gmail App Password (set in .env, never committed)
// The form authenticates as EMAIL_USER (whose App Password is in .env) and
// delivers the messages to EMAIL_TO. The App Password MUST belong to EMAIL_USER
// — here we send using the likaiwen2014 account and deliver to relatte0620.
const EMAIL_USER = process.env.EMAIL_USER || 'likaiwen2014@gmail.com';
const EMAIL_TO = process.env.EMAIL_TO || 'relatte0620@gmail.com';

// Configure nodemailer transporter using Gmail
// This creates an email transport that will send emails through Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || '' // App password from Gmail (not regular password)
  }
});

// Verify the email configuration at startup so problems are obvious in the logs
// instead of only surfacing when someone submits the contact form.
if (process.env.EMAIL_PASSWORD) {
  transporter.verify()
    .then(() => console.log(`📧 Email ready — sending as ${EMAIL_USER}, delivering to ${EMAIL_TO}`))
    .catch((err) => console.error('📧 Email configuration FAILED:', err.message));
} else {
  console.warn('📧 EMAIL_PASSWORD is not set — the contact form will NOT send email until you add it to .env');
}

// =============================================================================
// STATIC FILE SERVING
// =============================================================================

// Serve static files from the React build directory
// This allows the server to serve the compiled React application
app.use(express.static(path.join(__dirname, 'build')));

// Serve uploaded images from the public directory
// This allows the frontend to access images in the public/images folder
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint - useful for monitoring and debugging
// Returns server status information
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Latte Portfolio Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Contact form submission endpoint
// Handles POST requests from the contact form on the website
app.post('/api/contact', async (req, res) => {
  try {
    // Extract form data from the request body
    const { name, email, message } = req.body;
    
    // Basic validation - ensure all required fields are present
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, and message are required'
      });
    }
    
    // Email validation - basic regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Log the contact form submission
    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================================');
    
    // Configure the email to be sent
    const mailOptions = {
      from: `"${name}" <${EMAIL_USER}>`, // Sender's name with the authenticated Gmail address
      to: EMAIL_TO, // Where the message is delivered
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
        success: true,
        message: 'Thank you for your message! I\'ll get back to you soon.',
        submissionId: Date.now()
      });
      
      console.log(`✅ Email sent successfully to ${EMAIL_TO} from ${email}`);
    } catch (emailError) {
      // If email sending fails, log the error and send error response
      console.error('❌ Error sending email:', emailError);
      
      res.status(500).json({
        success: false,
        error: 'There was an error sending your message. Please try again later or email directly.'
      });
    }
    
  } catch (error) {
    // Error handling - log the error and return appropriate response
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

// =============================================================================
// FRONTEND ROUTING (React Router)
// =============================================================================

// Catch-all handler: send back React's index.html file for any non-API routes
// This is necessary for client-side routing to work properly
// Without this, refreshing the page on any route would result in a 404 error
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Global error handler - catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Something went wrong on the server'
  });
});

// 404 handler - catches requests to non-existent routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🎨 LATTE\'S PORTFOLIO SERVER STARTED');
  console.log('='.repeat(60));
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'build')}`);
  console.log(`🖼️  Images available at: http://localhost:${PORT}/images/`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
});

// Graceful shutdown handling
// This ensures the server shuts down cleanly when receiving termination signals
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

