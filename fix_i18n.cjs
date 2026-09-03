const fs = require('fs');

let vi = fs.readFileSync('src/i18n/vi.ts', 'utf8');
vi = vi.replace(/"presetPeer": "Phan → Peer"/g, '"presetPeer": "Heidi → Ivan"');
fs.writeFileSync('src/i18n/vi.ts', vi);

let en = fs.readFileSync('src/i18n/en.ts', 'utf8');
en = en.replace(/presetPeer: 'Phan → Peer'/g, "presetPeer: 'Heidi → Ivan'");
fs.writeFileSync('src/i18n/en.ts', en);

