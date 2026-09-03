const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

// Replace standard variables
content = content.replace(
  /--font-sans:[^;]+;/g,
  `--font-sans: "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif;`
);

content = content.replace(
  /--font-mono:[^;]+;/g,
  `--font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", monospace;`
);

// We should also remove --font-display, font-display, Space Grotesk
content = content.replace(
  /--font-display:[^;]+;/g,
  ``
);

// Replace font-family directly in @layer base
content = content.replace(
  /font-family:\s*'Plus Jakarta Sans'[^;]+;/g,
  `font-family: var(--font-sans);`
);

content = content.replace(
  /font-family:\s*'JetBrains Mono'[^;!]+(!important)?;/g,
  `font-family: var(--font-mono) $1;`
);

// Replace typography rules
content = content.replace(
  /\.font-sans\s*\{\s*font-family:[^\}]+\}/g,
  `.font-sans {\n  font-family: var(--font-sans);\n}`
);

content = content.replace(
  /\.font-display\s*\{\s*font-family:[^\}]+\}/g,
  `.font-display {\n  font-family: var(--font-sans);\n}` // Fallback font-display to sans
);

content = content.replace(
  /\.font-mono\s*\{\s*font-family:[^\}]+\}/g,
  `.font-mono {\n  font-family: var(--font-mono) !important;\n  letter-spacing: 0.03em;\n  font-variant-numeric: tabular-nums;\n}`
);

content = content.replace(
  /\.hex-tabular\s*\{\s*font-family:[^\}]+\}/g,
  `.hex-tabular {\n  font-family: var(--font-mono) !important;\n  letter-spacing: 0.03em !important;\n  font-variant-numeric: tabular-nums !important;\n  font-feature-settings: "tnum" 1, "zero" 1, "liga" 0 !important;\n}`
);

fs.writeFileSync('src/index.css', content);
