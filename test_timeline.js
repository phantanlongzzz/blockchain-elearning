const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');
console.log(content.indexOf('const [focusedBlockIndex'));
