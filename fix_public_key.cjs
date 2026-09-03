const fs = require('fs');

const files = [
  'src/components/Foundations/CryptographyFoundations.tsx',
  'src/components/AIAssistant/chatSuggestionsData.ts',
  'src/data/foundationsData.ts',
  'src/data/quizData.ts'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/Khóa công khai \(Public Key\)/g, 'Khóa công khai');
  c = c.replace(/Khóa Bí Mật \(Private Key\)/g, 'Khóa riêng');
  c = c.replace(/Khóa Công Khai \(Public Key\)/g, 'Khóa công khai');
  c = c.replace(/Khóa bí mật \(Private Key\)/g, 'Khóa riêng');
  fs.writeFileSync(f, c);
});
