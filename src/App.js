// =============================================================================
// LATTE'S PORTFOLIO - ROOT / ROUTES
// =============================================================================
// The app is a multi-page site now. This component just maps URLs to pages:
//   /       -> Home  (hero, gallery, contact)
//   /blog   -> Blog  (tabbed sub-sections: Devlog, Unity Development, Crafting)
// The <BrowserRouter> that powers this lives in index.js.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import BlogPage from './BlogPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<BlogPage />} />
      {/* Anything unknown falls back to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
