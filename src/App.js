// =============================================================================
// LATTE'S PORTFOLIO - ROOT / ROUTES
// =============================================================================
//   /              -> Home          (hero, featured pull, contact)
//   /work          -> Work          (illustration + client projects, filterable)
//   /work/:id      -> ProjectDetail (full write-up for one project)
//   /journal       -> Journal       (a single running list of posts)
// The <BrowserRouter> that powers this lives in index.js.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import WorkPage from './WorkPage';
import ProjectDetail from './ProjectDetail';
import JournalPage from './JournalPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/work/:id" element={<ProjectDetail />} />
      <Route path="/journal" element={<JournalPage />} />
      {/* Anything unknown falls back to the home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
