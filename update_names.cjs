const fs = require('fs');

let viContent = fs.readFileSync('src/i18n/vi.ts', 'utf8');
viContent = viContent.replace(/"instructorName": "TS\. Nguyễn Hoài Đức"/g, '"instructorName": "Nguyễn Hoài Đức"');
fs.writeFileSync('src/i18n/vi.ts', viContent);

let enContent = fs.readFileSync('src/i18n/en.ts', 'utf8');
enContent = enContent.replace(/instructorName: 'Dr\. Nguyễn Hoài Đức'/g, "instructorName: 'Nguyễn Hoài Đức'");
enContent = enContent.replace(/instructorName: 'Dr\. Nguyen Hoai Duc'/g, "instructorName: 'Nguyen Hoai Duc'");
fs.writeFileSync('src/i18n/en.ts', enContent);
