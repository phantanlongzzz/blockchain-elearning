const fs = require('fs');

const files = [
  'src/components/BlockArchitecture/DigitalSignatureMiniLab.tsx',
  'src/components/Foundations/CryptographyFoundations.tsx',
  'src/i18n/vi.ts',
  'src/data/quizData.ts'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/Khóa bí mật/g, 'Khóa riêng');
  fs.writeFileSync(f, c);
});
