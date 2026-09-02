import fs from 'fs';

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');
content = content.replace(
`            ) : (
              {/* HORIZONTAL BLOCKCHAIN TIMELINE */}
              <div className="p-4 sm:p-5`,
`            ) : (
              /* HORIZONTAL BLOCKCHAIN TIMELINE */
              <div className="p-4 sm:p-5`
);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
