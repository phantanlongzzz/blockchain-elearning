import fs from 'fs';

const file = 'src/components/BlockchainVisualizer.tsx';
let content = fs.readFileSync(file, 'utf-8');

const targetRegex = /const formatted = \`\$\{hash\.slice\(0, 8\)\}\.\.\.\$\{hash\.slice\(-6\)\}\`;\s*return \(\s*<div className="flex items-center justify-between font-mono text-xs py-0\.5 group\/hash">([\s\S]*?)<button\s*type="button"\s*onClick=\{handleCopy\}/;

const replacement = `const formatted = \`\${hash.slice(0, 8)}...\${hash.slice(-6)}\`;
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex items-center justify-between font-mono text-xs py-0.5 group/hash">
      <span 
        className={\`\${expanded ? 'break-all' : 'truncate'} select-all cursor-pointer\`}
        title="Click to expand/collapse full hash"
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
      >
        {expanded ? (
          <span className={isError ? 'text-rose-400 font-semibold' : 'text-[#F2F4F7]'}>{hash}</span>
        ) : prefixHighlight && hash.startsWith('0'.repeat(prefixHighlight)) ? (
          <>
            <span className={isError ? 'text-rose-400 font-bold' : 'text-[#00C98D] font-bold'}>
              {hash.slice(0, prefixHighlight)}
            </span>
            <span className="text-[#A5AFBF]">
              {hash.slice(prefixHighlight, 8)}...{hash.slice(-6)}
            </span>
          </>
        ) : (
          <span className={isError ? 'text-rose-400 font-semibold' : 'text-[#F2F4F7]'}>
            {formatted}
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={handleCopy}`;

content = content.replace(targetRegex, replacement);

fs.writeFileSync(file, content);
