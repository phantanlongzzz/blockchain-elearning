const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
console.log('Total TS/TSX files:', files.length);

const resultsByFile = {};

files.forEach(f => {
  if (f.startsWith('src/i18n') || f.includes('worker') || f.endsWith('.d.ts')) return;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const fileMatches = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('import ') || trimmed.includes('console.')) return;
    
    // Check for hardcoded English in JSX text nodes or string literals
    // Let's look for common English words in text nodes
    const stripped = line.replace(/className="[^"]*"/g, '').replace(/id="[^"]*"/g, '').replace(/style={{[^}]*}}/g, '');
    
    // Check if line contains pure English text between tags or in string attributes
    const matchTag = stripped.match(/>([^<>{}]*[a-zA-Z]{4,}[^<>{}]*)</);
    if (matchTag) {
      const text = matchTag[1].trim();
      // Exclude technical identifiers, hex, numbers, JSX code
      if (!/^(SHA-256|BTC|ETH|ECDSA|secp256k1|Nonce|Hash|HashRate|Merkle|PoW|PoS|P2P|API|JSON|HTTP|CSS|HTML|NIST|FIPS|UTC|ID|TX|true|false|null|undefined|[0-9a-fA-Fx\s:\-.,()+#\/\\%^&*]+)$/.test(text)
          && !text.startsWith('0x')
          && !/^[A-Z0-9_]+$/.test(text)
          && !text.includes('isVi')
          && !text.includes('strings.')
          && !text.includes('t(')) {
        // Check if Vietnamese characters exist in text
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(text);
        if (!hasVietnamese && /[a-zA-Z]{3,}/.test(text)) {
          fileMatches.push({ line: idx + 1, text, type: 'JSX text' });
        }
      }
    }

    // Check placeholder / title / aria-label
    const matchAttr = stripped.match(/(placeholder|title|aria-label)="([^"]*[a-zA-Z]{4,}[^"]*)"/);
    if (matchAttr) {
      const attrName = matchAttr[1];
      const attrVal = matchAttr[2].trim();
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(attrVal);
      if (!hasVietnamese && !attrVal.includes('{') && !/^[0-9a-fA-Fx\s:\-.,]+$/.test(attrVal)) {
        fileMatches.push({ line: idx + 1, text: `${attrName}="${attrVal}"`, type: 'Attribute' });
      }
    }
  });

  if (fileMatches.length > 0) {
    resultsByFile[f] = fileMatches;
  }
});

Object.keys(resultsByFile).forEach(f => {
  console.log(`\n=== ${f} (${resultsByFile[f].length} items) ===`);
  resultsByFile[f].forEach(m => console.log(`  [Line ${m.line}] [${m.type}] ${m.text}`));
});
