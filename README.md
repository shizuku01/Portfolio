# 🎨 Latte's Portfolio Website

A modern, responsive portfolio website for showcasing artwork with a clean dark theme and smooth animations.

## 📁 Project Structure

```
latte-portfolio/
├── src/                    # React frontend source code
│   ├── App.js             # Main React component with detailed comments
│   ├── index.js           # React application entry point
│   └── index.css          # All CSS styles with detailed comments
├── public/                 # Static files served by the server
│   └── images/            # Artwork images and profile picture
├── server.js              # Express server with detailed comments
├── package.json           # Combined frontend/backend dependencies
├── Dockerfile             # Single container build configuration
├── docker-compose.yml     # Simplified Docker deployment
└── README.md              # This file
```

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Build and start the application
docker-compose up --build -d

# View the website
open http://localhost:3000

# Stop the application
docker-compose down
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start development server (runs both frontend and backend)
npm run dev

# Or start production server
npm start
```

## 🛠️ How It Works

### Frontend (React)
- **App.js**: Main component that renders the entire website
  - Manages contact form state
  - Handles form submissions to backend API
  - Renders hero section, gallery, and contact form
- **index.js**: Entry point that renders the React app into the DOM
- **index.css**: All styling with detailed comments explaining each section

### Backend (Express)
- **server.js**: Single server that handles both API and static file serving
  - Serves React build files
  - Handles contact form submissions (`POST /api/contact`)
  - Provides health check endpoint (`GET /api/health`)
  - Serves images from `/images` directory

### Combined Architecture
- **Single Container**: Frontend and backend run in one Docker container
- **Static Serving**: Express serves the built React app
- **API Integration**: React makes API calls to the same server
- **Image Handling**: Images are served directly by Express

## 📝 Code Comments

Every file includes detailed comments explaining:
- **What each section does**
- **Why specific choices were made**
- **How different parts work together**
- **Configuration options and alternatives**

## 🎨 Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Professional dark color scheme
- **Smooth Animations**: CSS transitions and hover effects
- **Contact Form**: Functional contact form with validation
- **Image Gallery**: Grid layout with hover overlays
- **Social Links**: Integration with Twitter and Pixiv

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Adding New Artwork
1. Add images to `public/images/` directory
2. Follow naming convention: `Artwork[Number]-[Year]-[Name].jpg`
3. Add artwork card to the gallery in `src/App.js`

### Customizing Colors
Main colors are defined in `src/index.css`:
- Background: `#0f0f0f` (dark)
- Text: `#e5e7eb` (light gray)
- Accent: `#d4af37` (gold)

## 📦 Dependencies

### Frontend
- React 18 - UI framework
- Axios - HTTP client for API calls

### Backend
- Express - Web server framework
- CORS - Cross-origin resource sharing
- Helmet - Security headers
- Morgan - HTTP request logging

## 🌐 Deployment

### Docker Deployment
```bash
# Build and deploy
docker-compose up --build -d

# View logs
docker-compose logs -f

# Update and redeploy
docker-compose down
docker-compose up --build -d
```

### Production Considerations
- Set `NODE_ENV=production`
- Enable HTTPS in production
- Configure proper CORS origins
- Set up email service for contact form
- Add database for storing contact submissions

## 🤝 Support

This is a simplified, educational version of a portfolio website. The code is heavily commented to help understand how modern web applications work.

## 📄 License

MIT License - Feel free to use this code for your own projects!