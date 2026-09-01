// =============================================================================
// BLOG DATA - a single running list of posts, shown on /journal
// =============================================================================
// The Blog (formerly split into Devlog / Unity Development / Crafting / Web
// Design tabs) is now one page, one list, renamed Journal. Unity Development
// and Web Design became their own case studies on /work (see
// projectsData.js); Crafting was empty and got dropped.
//
// -----------------------------------------------------------------------------
// TO ADD A POST
// -----------------------------------------------------------------------------
//   Append an object to `blogPosts`. Fields:
//     date   (required)  "YYYY-MM-DD"  — used for display AND sorting (newest first)
//     title  (required)  short headline
//     tag    (optional)  small accent-colored pill (e.g. a category)
//     body   (required)  array of strings; each string is one paragraph
//     image  (optional)  path to an image in /public/images, e.g.
//                        "/images/devlog-2026-07-07.png"
//
// After editing, redeploy:
//   git add src/blogData.js && git commit -m "blog: <what>" && git push
//   (then on the server: git pull && rebuild — see DEPLOYMENT.md)
// =============================================================================

export const blogPosts = [
  {
    date: '2026-08-31',
    title: 'A freeform pass: Gallery and Projects merged into Work, Blog renamed Journal',
    tag: 'Site',
    body: [
      'Rebuilt the site with more structural freedom this time. Gallery and Projects used to be two separate places; now they live together on one /work page with a filter (All / Case Studies / Illustration), since to a visitor they were always just "things I made."',
      'Home got shorter — just the hero, a small hand-picked "Featured" pull of a few pieces, and contact. The full archive lives on /work instead of being dumped on the landing page.',
      'Renamed the Blog to Journal, kept it as the single running list from the last pass.',
    ],
  },
  {
    date: '2026-08-31',
    title: 'Merged Devlog into Blog, moved Unity + Web Design into Projects',
    tag: 'Site',
    body: [
      'Folded the Devlog into the Blog — no more tabs, just one running list.',
      'Unity Development and Web Design now live alongside FinBin and Elysium as their own case studies.',
      'Retired the Crafting section — it never had anything in it.',
    ],
  },
  {
    date: '2026-07-09',
    title: 'Blog moved to its own page + reorganized sections',
    tag: 'Site',
    body: [
      'Moved the blog off the home page onto a dedicated /blog page.',
      'Split the game-development notes into their own section and repurposed this one for updates to the website itself.',
    ],
  },
];
