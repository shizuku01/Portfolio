// =============================================================================
// PROJECTS DATA - past projects (client / collaborative work)
// =============================================================================
// These are shown on the /projects page as cards. This is separate from the
// home-page Gallery, which is for personal artwork.
//
// -----------------------------------------------------------------------------
// TO ADD A PROJECT
// -----------------------------------------------------------------------------
//   Copy one of the objects below and fill it in. Fields:
//     id           (required)  unique key (any short url-safe string)
//     title        (required)  project name
//     year         (required)  year or range, e.g. "2024" or "2023–2024"
//     description  (required)  a short paragraph (role, tools, outcome...)
//     image        (optional)  cover image in /public/images, e.g.
//                              "/images/project-aurora.jpg"
//                              If omitted, a placeholder tile is shown instead.
//
// The entries below are EXAMPLES — replace them with your real projects.
// After editing, redeploy:
//   git add src/projectsData.js && git commit -m "projects: <what>" && git push
//   (then on the server: git pull && rebuild — see DEPLOYMENT.md)
// =============================================================================

export const projects = [
  {
    id: 'example-brand',
    title: 'Example — Brand Identity',
    year: '2024',
    description:
      'Placeholder entry. A full visual identity: logo, color system, and packaging delivered across print and digital. Replace this with one of your real past projects.',
    // image: '/images/project-brand.jpg',
  },
  {
    id: 'example-web',
    title: 'Example — Marketing Website',
    year: '2023',
    description:
      'Placeholder entry. Designed and illustrated a responsive landing site, including custom hero art and iconography. Swap in your own project details and cover image.',
    // image: '/images/project-web.jpg',
  },
  {
    id: 'example-illustration',
    title: 'Example — Editorial Illustration',
    year: '2023',
    description:
      'Placeholder entry. A commissioned illustration series for a print magazine feature. Update the title, year, description, and add an image to make it yours.',
    // image: '/images/project-editorial.jpg',
  },
];
