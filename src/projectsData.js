// =============================================================================
// PROJECTS DATA - past projects (client / collaborative work)
// =============================================================================
// Shown as "Case Studies" cards on /work, alongside personal illustration
// (see artworkData.js) - the filter tabs there let a visitor narrow to just
// one or the other. Clicking a card opens its own page at /work/:id (see
// ProjectDetail.js).
//
// -----------------------------------------------------------------------------
// TO ADD A PROJECT
// -----------------------------------------------------------------------------
//   Copy one of the objects below and fill it in.
//
//   Card fields (shown on /work):
//     id           (required)  unique url-safe key — becomes the /work/<id> URL
//     title        (required)  full project name - used as the detail page's h1
//     shortTitle   (optional)  a short version for the tight card overlay on
//                              /work (falls back to `title` if omitted)
//     year         (required)  year or range, e.g. "2024" or "2023–2024"
//     description  (required)  a short paragraph (role, tools, outcome...) —
//                              also shown at the top of the detail page
//     image        (optional)  cover image in /public/images, e.g.
//                              "/images/project-aurora.jpg"
//                              If omitted, a placeholder tile is shown instead.
//     externalUrl  (optional)  for work that lives elsewhere (e.g. a live
//                              client site) - the card links straight out to
//                              this URL in a new tab instead of /work/<id>,
//                              and `id`/`detail` aren't used.
//
//   Detail-page fields (optional — omit `detail` entirely for a simple project
//   that's just a card with no extra page content):
//     detail.meta      array of { label, value } rows, e.g. Role / Team / Course
//     detail.game      optional - embeds a playable Unity WebGL build at the
//                       top of the page via GamePlayer, see GamePlayer.js
//     detail.embed     optional - embeds a live static site/prototype at the
//                       top of the page via SitePreview, see SitePreview.js
//     detail.sections  array of { heading, body: [paragraph, ...], date?,
//                       image?, imageAlt?, caption? } — rendered in order
//                       down the page. `date` (optional) renders as a small
//                       label above the heading, for devlog-style entries.
//
// The last entry below is a placeholder EXAMPLE — replace it with a real
// project, or add more. After editing, redeploy:
//   git add src/projectsData.js && git commit -m "projects: <what>" && git push
//   (then on the server: git pull && rebuild — see DEPLOYMENT.md)
// =============================================================================

export const projects = [
  {
    id: 'livinglab',
    title: 'LivingLab — Website Design',
    shortTitle: 'LivingLab',
    year: '2026',
    description:
      'An in-progress website design for LIVING+ Lab, an intelligent-built-environment research group — currently live and being worked on.',
    image: '/images/project-livinglab.jpg',
    externalUrl: 'https://www.openstory.fun/livinglab',
  },
  {
    id: 'finbin',
    title: 'FinBin — Interactive Recycling Design',
    shortTitle: 'FinBin',
    year: '2024',
    description:
      'A 4-person studio project (UC Davis DES 001) reimagining street trash cans as playful, animal-shaped recycling bins to boost public engagement, inspired by Germany’s bottle-deposit (pfand) system. I engineered the tool-free, slot-together cardboard construction for the final whale-shaped prototype — its fins flap open when a recyclable is dropped in — and designed the flat-design exhibition poster and pitch graphics. Presented live at the December 2024 studio exhibition in Cruess Hall, where visitors tested the working prototype.',
    image: '/images/project-finbin.jpg',
    detail: {
      meta: [
        { label: 'Role', value: 'Fabrication (slot-construction system) + exhibition poster design' },
        { label: 'Team', value: 'Feliks Karapetyan, Kevyn S. Campos, Kyra Calderhead' },
        { label: 'Course', value: 'UC Davis, DES 001 Studio — Fall 2024' },
      ],
      sections: [
        {
          heading: 'The Brief',
          body: [
            'Recycling awareness has never really been the problem — participation is. Traditional bins ask people to prioritize a distant, impersonal benefit, so engagement stays low no matter how much information campaigns push. We looked at Germany’s pfand bottle-deposit system, which reaches a return rate above 98% by giving people an immediate, tangible reward for recycling.',
            'Rather than building new deposit stations with limited reach, our brief was to design a replacement lid that turns any existing trash can into something people want to interact with — an eye-catching form for the first pull, and a small reward loop (a scannable QR code redeemable for digital vouchers) to bring people back.',
          ],
        },
        {
          heading: 'Designing the Interaction',
          body: [
            'A Crazy 8s sketch session pointed the group toward animal-themed, interactive trash cans. Our first sketch solution was a seagull, with a wide beak opening and expressive flapping wings to relate to coastal cities.',
            'Rapid prototyping took us through three cardboard iterations: the seagull, then two whale versions. The beak read as too sharp and unwelcoming for the young kids we were targeting, so we rounded it into a whale’s mouth and swapped adhesive joints for interlocking cardboard slots — no glue holding the moving parts together. The whale kept the seagull’s best idea, though: its side fins flap open when a recyclable drops into the mouth.',
          ],
          image: '/images/project-finbin-diagram.jpg',
          imageAlt: 'Construction diagram of the FinBin whale mechanism',
          caption: 'Slot-together construction — chute trigger, lever-and-string, and cardboard slit attachments, no glue required.',
        },
        {
          heading: 'Building It',
          body: [
            'My focus was engineering the physical build: a body cut from a reused shipping box with 45° slots for the neck and head, a honeycomb-cardboard jaw that filters out pests while still letting bottles through quickly, and a lever-and-string trigger so the fins flap whenever something is dropped in. Every piece interlocks, so the whole thing can be reproduced from a flat-pack kit without tape or hot glue holding the moving parts together.',
            'Materials were mostly reused cardboard plus about $27 in hardware and paint — a squeaky-toy trigger, springs, popsicle sticks, and acrylic paint for the finish.',
          ],
        },
        {
          heading: 'Identity & Presentation',
          body: [
            'Kyra designed the FinBin brand identity — logo suite, an ocean-inspired color palette, and a fin-pattern motif — which became the basis for the packaging and instruction materials. I designed the flat-design exhibition poster and pitch graphics used to introduce the concept to visitors.',
          ],
          image: '/images/project-finbin-brand.jpg',
          imageAlt: 'FinBin brand identity: logo suite, color palette, and typography',
        },
        {
          heading: 'The Exhibition',
          body: [
            'On December 6, 2024 we installed the prototype in Cruess Hall for "Chaos in the Courtyard," the studio’s final exhibition. Visitors tested it themselves — dropping a bottle in to watch the fins flap — and the reaction was immediate: people who didn’t know how it worked lit up the moment they saw it move, and asked to try it again.',
          ],
          image: '/images/project-finbin-prototype.jpg',
          imageAlt: 'The finished FinBin whale prototype on display at the exhibition',
          caption: 'The finished prototype at "Chaos in the Courtyard," Cruess Hall.',
        },
        {
          heading: 'The Team',
          body: [
            'Left to right: me (fabrication, poster design), Feliks Karapetyan (sketches, materials collage), Kevyn S. Campos (sketches, product layout), and Kyra Calderhead (design sketches, brand identity, photography).',
          ],
          image: '/images/project-finbin-team.jpg',
          imageAlt: 'The four-person FinBin team standing with the prototype',
        },
      ],
    },
  },
  {
    id: 'elysium',
    title: 'Elysium — Festival Brand Identity',
    shortTitle: 'Elysium',
    year: '2026',
    description:
      'A semester-long DES 116 studio project building a complete brand identity for Elysium, a fictional rock + grunge music festival: a logo and 10-page brand guideline, an illustrated event poster and digital ad campaign, and co-branded product extensions with Cheetos, Coca-Cola, and Vans.',
    image: '/images/project-elysium.jpg',
    detail: {
      meta: [
        { label: 'Role', value: 'Sole designer — identity, guidelines, campaign & product extensions' },
        { label: 'Course', value: 'UC Davis, DES 116 — Brand Identity Studio' },
        { label: 'Deliverables', value: 'Logo & brand guidelines, poster & digital campaign, co-branded merchandise' },
      ],
      sections: [
        {
          heading: 'The Concept',
          body: [
            'Elysium is a fictional rock + grunge festival built around a pun: "rock" as the music genre and "rock" as in geology and space. That double meaning runs through the whole identity — raw, high-contrast grunge textures paired with a mood board of astronauts, comets, and topographic line work under the theme "the scientific exploration of rock."',
            'The logo is a fractured turntable-and-star mark, deliberately built from separable pieces — the star, the sliced disc, the wordmark — so it could recombine across different applications without losing its identity.',
          ],
        },
        {
          heading: 'Identity & Guidelines',
          body: [
            'Built out a full 10-page brand guideline: logo positioning and clear space, minimum size, an alternate lockup, and explicit prohibited uses (no changing the proportions, opacity, or color). A strict monotone palette — black through white — keeps the "anonymity of grunge" feeling, paired with Railroad Gothic headlines against clean Parabolica body text.',
            'The guideline also documents a pattern-exploration study built around contrast and collision of negative space, which shows up later in the co-branded products.',
          ],
          image: '/images/project-elysium-identity.jpg',
          imageAlt: 'Elysium brand guidelines cover: the logo on a diagonal black-and-white field',
        },
        {
          heading: 'Campaign Applications',
          body: [
            'Took the identity into a real campaign: an illustrated headline poster, "Your Utopia Awaits," for the festival date at The Bellwether in LA, plus a matching set of digital ads and social banners with Sony and Spotify sponsor placements — testing how the system holds up outside a brand book.',
          ],
          image: '/images/project-elysium-campaign.jpg',
          imageAlt: 'Elysium digital ad and social banner set for the festival campaign',
        },
        {
          heading: 'Co-Branded Products',
          body: [
            'Designed a co-branded Cheetos bag, keeping the monotone Elysium treatment but letting the product’s original colors show through so the collab still reads as Cheetos on shelf. Did the same exercise for a Coca-Cola can, keeping the brand red and layering in a cross-hatch pattern that echoes the star shape in the Elysium mark.',
          ],
          image: '/images/project-elysium-cheetos.jpg',
          imageAlt: 'Co-branded Elysium x Cheetos Flamin’ Hot packaging mockup',
        },
        {
          heading: 'Wearables',
          body: [
            'Redesigned the Vans Torrey jacket and a matching backpack as festival merch — split the jacket into black and white halves to carry over the identity’s negative-space language while keeping Vans’ classic silhouette, and built the backpack’s pattern from the logo’s vinyl-disc shapes.',
          ],
          image: '/images/project-elysium-jacket.jpg',
          imageAlt: 'Co-branded Elysium x Vans jacket, front and back',
        },
      ],
    },
  },
  {
    id: 'unity-development',
    title: 'Unity Development — Untitled 2D Platformer',
    shortTitle: 'Unity Development',
    year: '2026',
    description:
      'Ongoing development notes and a playable WebGL demo for an untitled 2D platformer — player movement, camera work, and level tooling, built in Unity.',
    image: '/images/project-unity.jpg',
    detail: {
      meta: [
        { label: 'Role', value: 'Solo developer' },
        { label: 'Engine', value: 'Unity, 2D URP' },
        { label: 'Status', value: 'In progress' },
      ],
      game: {
        title: 'Playable Demo — 2D Game',
        src: '/game/index.html',
        width: 960,
        height: 600,
        ready: true,
      },
      sections: [
        {
          date: '2026-07-07',
          heading: 'Player controller & camera follow',
          body: [
            'Set up the player controller using Rigidbody2D for movement and jumping. Movement feels responsive now that I switched from transform.Translate to physics-based velocity.',
            'Added a smooth camera follow with Cinemachine — spent a while tuning the damping so it does not feel laggy during fast falls.',
            'Next up: coyote time and jump buffering so the jump feels forgiving.',
          ],
        },
        {
          date: '2026-07-06',
          heading: 'Project setup and tilemap experiments',
          body: [
            'Created a fresh Unity 2D project and got the folder structure organized (Scripts, Prefabs, Art, Scenes).',
            'Blocked out a test level with the Tilemap system and a Composite Collider so the ground is one clean collider instead of hundreds.',
            'Learned that Rule Tiles save a ton of time for auto-connecting terrain edges.',
          ],
        },
      ],
    },
  },
  {
    id: 'web-design',
    title: 'Web Design — Fintech Brand Explorations',
    shortTitle: 'Web Design',
    year: '2026',
    description:
      'Twelve visual directions explored for a single fintech brief, each shipped with a small built-in editor for live recoloring, type, and layout changes.',
    image: '/images/project-web-design.jpg',
    detail: {
      meta: [
        { label: 'Role', value: 'Design + front-end build' },
        { label: 'Scope', value: '12 directions, one brief' },
      ],
      embed: {
        title: 'Design Iterations — a fintech brief (12 directions)',
        src: '/lingyue/index.html',
        height: 760,
        ready: true,
        note: 'Every page has a built-in editor — press Shift+E (or the "Edit design" button) to change colours, fonts and layout live. Available in English and 中文. Best on desktop.',
      },
      sections: [
        {
          date: '2026-07-15',
          heading: '12 design directions for one brief',
          body: [
            'Took a single fintech brief and pushed it through twelve visual directions instead of settling on the first idea that worked.',
            'They come in three tiers: four maximalist originals (a trading-terminal cockpit, an engineering blueprint, an investment memo, and a Swiss numeric ledger), a decluttered version of each that keeps the identity but strips it back to the argument, and four brand-new minimalist directions.',
            'The most useful part was deciding what to cut. Distilling the source deck down to five sections — thesis, the problem, the capability, why it is trustworthy, and one call to action — did more for the design than any amount of styling.',
            'Each page also ships with a small editor I built. Shift+E opens one panel with four tabs: recolour the page, swap the fonts and type scale, drag in new sections, or save the look. It speaks English and 中文, and you can point it at a single section instead of the whole page.',
            'The interesting constraint was writing it for people who have never opened a design tool. That meant no jargon on screen — the panel says "Accent", "Background", "Text" rather than the CSS variable names underneath — and everything past the first four controls is folded away until you ask for it.',
          ],
        },
      ],
    },
  },
  {
    id: 'example-illustration',
    title: 'Example — Editorial Illustration',
    shortTitle: 'Example',
    year: '2023',
    description:
      'Placeholder entry. A commissioned illustration series for a print magazine feature. Update the title, year, description, and add an image to make it yours.',
    // image: '/images/project-editorial.jpg',
  },
];
