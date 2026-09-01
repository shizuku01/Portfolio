const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data.json', 'utf-8'));

const interactions = [];
const allFrames = {};

// First pass: collect all frame IDs and names
function collectFrameIds(node, pageName = '') {
  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    allFrames[node.id] = {
      name: node.name,
      page: pageName,
      id: node.id
    };
  }
  if (node.children) {
    node.children.forEach(child => collectFrameIds(child, pageName));
  }
}

// Second pass: find all interactions
function findInteractions(node, currentFrame = null) {
  if (node.type === 'FRAME' || node.type === 'COMPONENT') {
    currentFrame = node.name;
  }

  if (node.interactions && Array.isArray(node.interactions)) {
    node.interactions.forEach(interaction => {
      const inter = {
        sourceFrame: currentFrame,
        sourceElement: node.name,
        elementType: node.type,
        trigger: interaction.trigger,
        action: interaction.action
      };

      // Get destination frame name
      if (interaction.action && interaction.action.destinationId) {
        const destId = interaction.action.destinationId;
        inter.destinationFrame = allFrames[destId] ? allFrames[destId].name : 'Unknown';
        inter.destinationId = destId;
      }

      // Get transition details
      if (interaction.transition) {
        inter.transition = {
          type: interaction.transition.type,
          duration: interaction.transition.duration,
          easing: interaction.transition.easing,
          direction: interaction.transition.direction
        };
      }

      interactions.push(inter);
    });
  }

  if (node.children) {
    node.children.forEach(child => findInteractions(child, currentFrame));
  }
}

// Collect frame IDs
data.document.children.forEach(page => {
  collectFrameIds(page, page.name);
});

// Find interactions
data.document.children.forEach(page => {
  page.children.forEach(frame => findInteractions(frame));
});

// Create interaction map
const interactionMap = {};
interactions.forEach(inter => {
  const key = inter.sourceFrame;
  if (!interactionMap[key]) {
    interactionMap[key] = [];
  }
  interactionMap[key].push(inter);
});

console.log('='.repeat(80));
console.log('FIGMA INTERACTIONS AND TRANSITIONS ANALYSIS');
console.log('='.repeat(80));
console.log(`\nTotal Interactions Found: ${interactions.length}`);
console.log(`Total Frames with Interactions: ${Object.keys(interactionMap).length}\n`);

// Display interactions by frame
Object.keys(interactionMap).sort().forEach(frameName => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`FRAME: "${frameName}"`);
  console.log('='.repeat(60));

  interactionMap[frameName].forEach((inter, idx) => {
    console.log(`\n  Interaction ${idx + 1}:`);
    console.log(`    Source Element: "${inter.sourceElement}" (${inter.elementType})`);
    console.log(`    Trigger: ${inter.trigger?.type || 'N/A'}`);
    console.log(`    Action: ${inter.action?.type || 'N/A'}`);

    if (inter.destinationFrame) {
      console.log(`    → Navigates to: "${inter.destinationFrame}"`);
    }

    if (inter.transition) {
      console.log(`    Transition:`);
      console.log(`      Type: ${inter.transition.type}`);
      console.log(`      Duration: ${inter.transition.duration || 0}ms`);
      console.log(`      Easing: ${JSON.stringify(inter.transition.easing) || 'N/A'}`);
      if (inter.transition.direction) {
        console.log(`      Direction: ${inter.transition.direction}`);
      }
    }
  });
});

// Save to JSON
fs.writeFileSync('figma_interactions.json', JSON.stringify({
  totalInteractions: interactions.length,
  framesWithInteractions: Object.keys(interactionMap).length,
  interactionMap: interactionMap,
  allInteractions: interactions
}, null, 2));

console.log(`\n\n${'='.repeat(80)}`);
console.log('Analysis saved to: figma_interactions.json');
console.log('='.repeat(80));
