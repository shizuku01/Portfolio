# 🎨 Latte's Portfolio - Code Explanation

This document explains every part of the portfolio website code to help you understand how it works.

## 📁 Current Project Structure

```
Portfolio/
├── backend/                    # Express.js backend server
│   ├── server.js              # Main server file with API endpoints
│   ├── package.json           # Backend dependencies
│   └── Dockerfile             # Backend container configuration
├── frontend/                   # React.js frontend application
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── index.js           # React entry point
│   │   └── index.css          # All styling
│   ├── public/
│   │   ├── index.html         # HTML template
│   │   └── images/            # Artwork images and profile picture
│   ├── package.json           # Frontend dependencies
│   └── Dockerfile             # Frontend container configuration
├── docker-compose.yml         # Orchestrates both containers
└── README.md                  # Setup instructions
```

## 🔧 How the Architecture Works

### 1. **Docker Compose Setup**
- **Two Containers**: Frontend (React) and Backend (Express) run separately
- **Networking**: Containers can communicate with each other
- **Port Mapping**: Frontend on port 3000, Backend on port 5000
- **Development**: Hot reloading for both frontend and backend

### 2. **Backend (Express Server)**
- **Purpose**: Handles API requests and serves static files
- **Endpoints**:
  - `GET /api/health` - Server status check
  - `POST /api/contact` - Contact form submissions
- **Features**: CORS enabled, security headers, request logging

### 3. **Frontend (React Application)**
- **Purpose**: User interface and user interactions
- **Components**: Hero section, gallery, contact form
- **API Integration**: Sends contact form data to backend
- **Styling**: Dark theme with animations and hover effects

## 📝 Detailed Code Explanations

### Backend Server (`backend/server.js`)

```javascript
// Express server setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
```

**What this does:**
- Imports required packages for web server functionality
- Creates Express application instance
- Sets port (5000 for backend, 3000 for frontend)

**Middleware Setup:**
```javascript
app.use(helmet());           // Security headers
app.use(cors());            // Allow cross-origin requests
app.use(morgan('combined')); // Log HTTP requests
app.use(express.json());    // Parse JSON request bodies
```

**Static File Serving:**
```javascript
app.use(express.static(path.join(__dirname, '../frontend/build')));
```
- Serves the built React application
- Allows backend to serve frontend files

**API Routes:**
```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  // Process form data here
  res.json({ success: true, message: 'Message sent!' });
});
```

### Frontend React App (`frontend/src/App.js`)

**State Management:**
```javascript
const [contactForm, setContactForm] = useState({ 
  name: '', 
  email: '', 
  message: '' 
});
```
- `useState` Hook manages form data
- `contactForm` stores user input
- `setContactForm` updates the state

**Event Handlers:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent page refresh
  try {
    await axios.post('/api/contact', contactForm);
    setSubmitStatus('success');
  } catch (error) {
    setSubmitStatus('error');
  }
};
```
- Prevents default form submission
- Sends data to backend API
- Handles success/error responses

**Component Structure:**
```javascript
return (
  <div className="portfolio">
    <section className="hero">
      {/* Profile picture, name, scroll arrow */}
    </section>
    
    <section id="gallery" className="gallery">
      {/* Artwork grid with menu */}
    </section>
    
    <section id="contact" className="contact">
      {/* Contact form */}
    </section>
  </div>
);
```

### Styling (`frontend/src/index.css`)

**CSS Architecture:**
- **Reset Styles**: Remove browser defaults
- **Base Styles**: Typography, colors, layout foundation
- **Component Styles**: Specific styling for each section
- **Responsive Design**: Media queries for different screen sizes

**Key CSS Concepts:**
```css
/* Flexbox for centering */
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid for artwork layout */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

/* CSS Transitions for animations */
.artwork-card {
  transition: all 0.3s ease;
}

.artwork-card:hover {
  transform: translateY(-5px);
}
```

## 🚀 How to Run the Application

### Using Docker (Recommended)
```bash
# Start both frontend and backend
docker-compose up --build -d

# View the website
open http://localhost:3000

# Stop the application
docker-compose down
```

### Development Mode
```bash
# Terminal 1: Start backend
cd backend
npm install
npm run dev

# Terminal 2: Start frontend
cd frontend
npm install
npm start
```

## 🔄 Data Flow

1. **User visits website** → Frontend loads on port 3000
2. **User fills contact form** → React state updates
3. **User submits form** → Axios sends POST to `/api/contact`
4. **Backend receives request** → Express processes form data
5. **Backend responds** → JSON success/error message
6. **Frontend updates** → Shows success/error message to user

## 🎨 Customization Guide

### Adding New Artwork
1. Add image to `frontend/public/images/`
2. Update `App.js` with new artwork card:
```javascript
<div className="artwork-card">
  <img src="/images/NewArtwork.jpg" alt="New Artwork" />
  <div className="artwork-content">
    <h3>New Artwork</h3>
    <p>2024</p>
  </div>
</div>
```

### Changing Colors
Update CSS variables in `index.css`:
```css
:root {
  --primary-color: #d4af37;    /* Gold accent */
  --background-color: #0f0f0f; /* Dark background */
  --text-color: #e5e7eb;       /* Light text */
}
```

### Adding New API Endpoints
1. Add route to `backend/server.js`:
```javascript
app.get('/api/new-endpoint', (req, res) => {
  res.json({ message: 'New endpoint working!' });
});
```

2. Call from frontend:
```javascript
const response = await axios.get('/api/new-endpoint');
```

## 🛠️ Development Tips

### Debugging
- **Frontend**: Use browser DevTools (F12)
- **Backend**: Check Docker logs with `docker-compose logs`
- **API**: Test endpoints with Postman or curl

### Performance
- **Images**: Optimize artwork images for web
- **Caching**: Add cache headers for static assets
- **Build**: Use `npm run build` for production optimization

### Security
- **CORS**: Configure allowed origins in production
- **Helmet**: Security headers are already enabled
- **Validation**: Add input validation for contact form

## 📚 Learning Resources

- **React**: [Official React Documentation](https://reactjs.org/docs)
- **Express**: [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- **Docker**: [Docker Compose Documentation](https://docs.docker.com/compose/)
- **CSS**: [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

This portfolio demonstrates modern web development practices with React, Express, and Docker!
