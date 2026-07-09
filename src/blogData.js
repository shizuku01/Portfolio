// =============================================================================
// BLOG DATA - All blog sub-sections and their posts
// =============================================================================
// The Blog lives on its own page (/blog) and is split into tabbed sub-sections.
// Everything below drives BOTH the tab bar on the Blog page AND the nested
// sub-links in the home-page sidebar — so this is the single source of truth.
//
// -----------------------------------------------------------------------------
// TO ADD A NEW SUB-SECTION (tab)
// -----------------------------------------------------------------------------
//   Append an object to `blogSections` with:
//     id     (required)  unique url-safe key, e.g. "photography"
//     label  (required)  text shown on the tab + sidebar
//     intro  (optional)  one-line description under the tab bar
//     posts  (required)  array of post objects (may be empty → "coming soon")
//
// -----------------------------------------------------------------------------
// TO ADD A POST to any sub-section
// -----------------------------------------------------------------------------
//   Copy a post object into that section's `posts` array. Fields:
//     date   (required)  "YYYY-MM-DD"  — used for display AND sorting (newest first)
//     title  (required)  short headline
//     tag    (optional)  small gold pill (e.g. project name, category)
//     body   (required)  array of strings; each string is one paragraph
//     image  (optional)  path to an image in /public/images, e.g.
//                        "/images/devlog-2026-07-07.png"
//
// After editing, redeploy:
//   git add src/blogData.js && git commit -m "blog: <what>" && git push
//   (then on the server: git pull && rebuild — see DEPLOYMENT.md)
// =============================================================================

export const blogSections = [
  // ---------------------------------------------------------------------------
  // DEVLOG — updates & improvements to this website itself
  // ---------------------------------------------------------------------------
  {
    id: 'devlog',
    label: 'Devlog',
    intro: "Updates and improvements I've made to this site.",
    posts: [
      {
        date: '2026-07-09',
        title: 'Blog moved to its own page + reorganized sections',
        tag: 'Site',
        body: [
          'Moved the blog off the home page onto a dedicated /blog page with tabbed sub-sections.',
          'Split the game-development notes into a new "Unity Development" section, and repurposed this Devlog for updates to the website itself.',
          'Added a new "Crafting" section for hands-on, physical projects.',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // UNITY DEVELOPMENT — daily game-dev progress
  // ---------------------------------------------------------------------------
  {
    id: 'unity',
    label: 'Unity Development',
    intro: "Daily notes on the games I'm building in Unity.",
    posts: [
      {
        date: '2026-07-07',
        title: 'Player controller & camera follow',
        tag: 'Untitled 2D Platformer',
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
        tag: 'Untitled 2D Platformer',
        body: [
          'Created a fresh Unity 2D project and got the folder structure organized (Scripts, Prefabs, Art, Scenes).',
          'Blocked out a test level with the Tilemap system and a Composite Collider so the ground is one clean collider instead of hundreds.',
          'Learned that Rule Tiles save a ton of time for auto-connecting terrain edges.',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // CRAFTING — hands-on / physical projects
  // ---------------------------------------------------------------------------
  {
    id: 'crafting',
    label: 'Crafting',
    intro: 'Hands-on builds and physical projects.',
    posts: [],
  },
];
