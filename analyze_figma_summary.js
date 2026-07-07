const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data.json', 'utf-8'));

const document = data.document;
const pages = document.children;

const summary = {
  fileName: data.name,
  fileId: data.id,
  pages: [],
  allFrames: [],
  colorPalette: new Set(),
  interactions: []
};

function extractColor(fill) {
  if (!fill || !fill.color) return null;
  const color = fill.color;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function extractNodeElements(node, elements = [], parentPath = '') {
  const currentPath = `${parentPath}/${node.name}`;

  // Extract basic element info
  const element = {
    name: node.name,
    type: node.type,
    path: currentPath
  };

  // Add dimensions if available
  if (node.absoluteBoundingBox) {
    element.dimensions = {
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height,
      x: node.absoluteBoundingBox.x,
      y: node.absoluteBoundingBox.y
    };
  }

  // Extract text content
  if (node.characters) {
    element.text = node.characters.substring(0, 100);
  }

  // Extract colors
  if (node.fills && Array.isArray(node.fills)) {
    const colors = [];
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID') {
        const color = extractColor(fill);
        if (color) {
          colors.push(color);
          summary.colorPalette.add(color);
        }
      }
    });
    if (colors.length > 0) element.colors = colors;
  }

  // Check for interactions
  if (node.interactions && Array.isArray(node.interactions)) {
    element.interactions = node.interactions.map(interaction => ({
      trigger: interaction.trigger?.type || 'unknown',
      action: interaction.action?.type || 'unknown',
      targetFrame: interaction.action?.destinationId || 'unknown'
    }));
  }

  elements.push(element);

  // Process children
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => {
      extractNodeElements(child, elements, currentPath);
    });
  }

  return elements;
}

pages.forEach((page, pageIdx) => {
  const pageData = {
    name: page.name,
    frames: []
  };

  const frames = page.children;
  frames.forEach((frame, frameIdx) => {
    const frameData = {
      name: frame.name,
      type: frame.type,
      index: frameIdx + 1
    };

    // Add dimensions
    if (frame.absoluteBoundingBox) {
      frameData.dimensions = {
        width: frame.absoluteBoundingBox.width,
        height: frame.absoluteBoundingBox.height,
        x: frame.absoluteBoundingBox.x,
        y: frame.absoluteBoundingBox.y
      };
    }

    // Extract all child elements
    const elements = [];
    if (frame.children && Array.isArray(frame.children)) {
      frame.children.forEach(child => {
        extractNodeElements(child, elements, frame.name);
      });
    }
    frameData.elementCount = frame.children ? frame.children.length : 0;
    frameData.totalElements = elements.length;
    frameData.elements = elements.slice(0, 50); // Limit to first 50 for summary

    // Check for frame-level interactions
    if (frame.interactions && Array.isArray(frame.interactions)) {
      frameData.interactions = frame.interactions;
    }

    pageData.frames.push(frameData);
    summary.allFrames.push({
      name: frameData.name,
      page: pageIdx + 1
    });
  });

  summary.pages.push(pageData);
});

// Output summary
console.log(JSON.stringify({
  fileName: summary.fileName,
  fileId: summary.fileId,
  totalPages: summary.pages.length,
  totalFrames: summary.allFrames.length,
  frames: summary.allFrames,
  colorPaletteSize: summary.colorPalette.size,
  colors: Array.from(summary.colorPalette).slice(0, 20),
  pageDetails: summary.pages.map(p => ({
    name: p.name,
    frameCount: p.frames.length,
    frames: p.frames.map(f => ({
      name: f.name,
      dimensions: f.dimensions,
      elementCount: f.elementCount,
      totalElements: f.totalElements,
      hasInteractions: f.interactions ? f.interactions.length > 0 : false
    }))
  }))
}, null, 2));
