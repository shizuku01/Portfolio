const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data.json', 'utf-8'));

const document = data.document;
const pages = document.children;

console.log("=".repeat(80));
console.log("FIGMA FILE: P2 Final");
console.log("=".repeat(80));

function extractColor(fill) {
  if (!fill) return null;
  const color = fill.color;
  if (color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== undefined ? color.a : 1;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return null;
}

function extractNodeDetails(node, depth = 0) {
  const indent = "  ".repeat(depth);
  const name = node.name;
  const type = node.type;
  const bbox = node.absoluteBoundingBox;
  const width = bbox ? bbox.width.toFixed(2) : 'N/A';
  const height = bbox ? bbox.height.toFixed(2) : 'N/A';
  const x = bbox ? bbox.x.toFixed(2) : 'N/A';
  const y = bbox ? bbox.y.toFixed(2) : 'N/A';

  let details = `${indent}${type}: "${name}" [${width}x${height}] @ (${x}, ${y})`;

  // Extract text content
  if (node.characters) {
    details += ` | Text: "${node.characters.substring(0, 50)}"`;
  }

  // Extract colors
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID') {
        const color = extractColor(fill);
        if (color) details += ` | Color: ${color}`;
      }
    });
  }

  console.log(details);

  // Process children
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => extractNodeDetails(child, depth + 1));
  }
}

pages.forEach((page, pageIdx) => {
  console.log(`\nPAGE ${pageIdx + 1}: "${page.name}"`);
  console.log("-".repeat(80));

  const frames = page.children;
  console.log(`Total Frames: ${frames.length}\n`);

  frames.forEach((frame, frameIdx) => {
    console.log(`\nFRAME ${frameIdx + 1}: "${frame.name}"`);
    console.log("~".repeat(50));
    extractNodeDetails(frame);
  });
});
