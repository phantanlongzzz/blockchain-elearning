const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

const tsBad = `      const children = Array.from(el.children);
      children.forEach((child) => {
        if (child.id && child.id.startsWith('timeline-block-')) {
          const htmlChild = child;
          const childCenter = htmlChild.offsetLeft + htmlChild.offsetWidth / 2;
          const diff = Math.abs(childCenter - centerPos);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = parseInt(htmlChild.id.replace('timeline-block-', ''), 10);
          }
        }
      });`;

const tsGood = `      const children = Array.from(el.children) as HTMLElement[];
      children.forEach((child) => {
        if (child.id && child.id.startsWith('timeline-block-')) {
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const diff = Math.abs(childCenter - centerPos);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = parseInt(child.id.replace('timeline-block-', ''), 10);
          }
        }
      });`;

content = content.replace(tsBad, tsGood);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
