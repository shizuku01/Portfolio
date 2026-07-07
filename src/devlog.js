// =============================================================================
// DEVLOG DATA - Unity game development daily progress
// =============================================================================
// This file holds all of your devlog entries. To add a new day's progress,
// just copy one of the entry objects below, paste it anywhere in the array,
// and fill it in. Entries are automatically sorted NEWEST-FIRST when displayed,
// so you never have to worry about ordering.
//
// After editing, redeploy:
//   git add src/devlog.js && git commit -m "devlog: <date>" && git push
//   (then on the server: git pull && rebuild — see DEPLOYMENT.md)
//
// -----------------------------------------------------------------------------
// FIELDS FOR EACH ENTRY
// -----------------------------------------------------------------------------
//   date   (required)  "YYYY-MM-DD"  — used for display AND sorting
//   title  (required)  short headline for the day
//   game   (optional)  which project this is about (shows as a gold tag)
//   body   (required)  an array of strings; each string is one paragraph /
//                      bullet point. Write as many as you like.
//   image  (optional)  path to a screenshot in /public/images, e.g.
//                      "/images/devlog-2026-07-07.png"
// =============================================================================

export const devlogPosts = [
  {
    date: '2026-07-07',
    title: 'Player controller & camera follow',
    game: 'Untitled 2D Platformer',
    body: [
      'Set up the player controller using Rigidbody2D for movement and jumping. Movement feels responsive now that I switched from transform.Translate to physics-based velocity.',
      'Added a smooth camera follow with Cinemachine — spent a while tuning the damping so it does not feel laggy during fast falls.',
      'Next up: coyote time and jump buffering so the jump feels forgiving.',
    ],
    // image: '/images/devlog-2026-07-07.png',
  },
  {
    date: '2026-07-06',
    title: 'Project setup and tilemap experiments',
    game: 'Untitled 2D Platformer',
    body: [
      'Created a fresh Unity 2D project and got the folder structure organized (Scripts, Prefabs, Art, Scenes).',
      'Blocked out a test level with the Tilemap system and a Composite Collider so the ground is one clean collider instead of hundreds.',
      'Learned that Rule Tiles save a ton of time for auto-connecting terrain edges.',
    ],
  },
];
