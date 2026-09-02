const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

content = content.replace(
  `FileText, Trophy, Trash2, Code2, Info, Check, ArrowRight, ExternalLink`,
  `FileText, Trophy, Trash2, Code2, Info, Check, ArrowRight, ExternalLink, ChevronLeft, ChevronRight`
);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
