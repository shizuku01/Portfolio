// =============================================================================
// LATTE'S PORTFOLIO - ROOT / ROUTES
// =============================================================================
// The app is a multi-page site now. This component just maps URLs to pages:
//   /          -> Home      (hero, gallery, contact)
//   /blog      -> Blog      (tabbed sub-sections: Devlog, Unity Development, Crafting)
//   /projects  -> Projects  (past client / collaborative work)
// The <BrowserRouter> that powers this lives in index.js.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import BlogPage from './BlogPage';
import ProjectsPage from './ProjectsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      {/* Anything unknown falls back to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
