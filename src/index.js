// =============================================================================
// LATTE'S PORTFOLIO - REACT APPLICATION ENTRY POINT
// =============================================================================
// This is the main entry point for the React application
// It renders the App component into the HTML DOM

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// =============================================================================
// APPLICATION RENDERING
// =============================================================================

// Get the root element from the HTML file (public/index.html)
// This is where the entire React application will be rendered
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component into the root element
// React.StrictMode is a development tool that helps identify potential problems
// It doesn't affect production builds but provides additional checks in development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

