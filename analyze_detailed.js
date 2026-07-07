const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data.json', 'utf-8'));

function extractColor(fill) {
  if (!fill || !fill.color) return null;
  const color = fill.color;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a.toFixed(2) : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function extractGradient(fill) {
  if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
    const stops = fill.gradientStops.map(stop => {
      const color = extractColor({color: stop.color});
      return `${color} ${(stop.position * 100).toFixed(0)}%`;
    });
    return {
      type: fill.type,
      stops: stops
    };
  }
  return null;
}

function extractTypography(node) {
  if (!node.style) return null;
  return {
    fontFamily: node.style.fontFamily,
    fontSize: node.style.fontSize,
    fontWeight: node.style.fontWeight,
    lineHeight: node.style.lineHeightPx || node.style.lineHeightPercentFontSize,
    letterSpacing: node.style.letterSpacing,
    textAlign: node.style.textAlignHorizontal
  };
}

function analyzeNode(node, depth = 0) {
  const result = {
    name: node.name,
    type: node.type,
    id: node.id
  };

  // Dimensions and position
  if (node.absoluteBoundingBox) {
    result.position = {
      x: Math.round(node.absoluteBoundingBox.x),
      y: Math.round(node.absoluteBoundingBox.y),
      width: Math.round(node.absoluteBoundingBox.width),
      height: Math.round(node.absoluteBoundingBox.height)
    };
  }

  // Text content
  if (node.characters) {
    result.text = node.characters;
    result.typography = extractTypography(node);
  }

  // Fills (colors and gradients)
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    result.fills = [];
    node.fills.forEach(fill => {
      if (fill.visible !== false) {
        if (fill.type === 'SOLID') {
          result.fills.push({
            type: 'SOLID',
            color: extractColor(fill),
            opacity: fill.opacity || 1
          });
        } else if (fill.type.includes('GRADIENT')) {
          result.fills.push({
            type: fill.type,
            gradient: extractGradient(fill),
            opacity: fill.opacity || 1
          });
        } else if (fill.type === 'IMAGE') {
          result.fills.push({
            type: 'IMAGE',
            imageRef: fill.imageRef,
            scaleMode: fill.scaleMode
          });
        }
      }
    });
  }

  // Strokes
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    result.strokes = node.strokes.map(stroke => ({
      type: stroke.type,
      color: extractColor(stroke),
      weight: node.strokeWeight
    }));
  }

  // Effects (shadows, blurs)
  if (node.effects && Array.isArray(node.effects) && node.effects.length > 0) {
    result.effects = node.effects.filter(e => e.visible !== false).map(effect => ({
      type: effect.type,
      radius: effect.radius,
      color: effect.color ? extractColor({color: effect.color}) : null,
      offset: effect.offset,
      spread: effect.spread
    }));
  }

  // Corner radius
  if (node.cornerRadius !== undefined) {
    result.cornerRadius = node.cornerRadius;
  }

  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    result.opacity = node.opacity;
  }

  // Constraints and layout
  if (node.constraints) {
    result.constraints = node.constraints;
  }

  // Interactions
  if (node.interactions && Array.isArray(node.interactions) && node.interactions.length > 0) {
    result.interactions = node.interactions.map(inter => ({
      trigger: inter.trigger,
      action: inter.action,
      transition: inter.transition
    }));
  }

  // Recursively process children
  if (node.children && Array.isArray(node.children)) {
    result.children = node.children.map(child => analyzeNode(child, depth + 1));
  }

  return result;
}

// Analyze all frames
const pages = data.document.children;
const output = {
  fileName: data.name,
  fileId: data.id,
  version: data.version,
  pages: []
};

pages.forEach(page => {
  const pageData = {
    name: page.name,
    frames: []
  };

  page.children.forEach(frame => {
    const frameAnalysis = analyzeNode(frame);
    pageData.frames.push(frameAnalysis);
  });

  output.pages.push(pageData);
});

// Write to file
fs.writeFileSync('figma_detailed.json', JSON.stringify(output, null, 2));

console.log('Detailed analysis complete!');
console.log(`Total frames analyzed: ${output.pages[0].frames.length}`);
console.log('Output saved to: figma_detailed.json');
