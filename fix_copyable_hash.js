import fs from 'fs';

const file = 'src/components/common/CopyableHash.tsx';
let content = fs.readFileSync(file, 'utf-8');

const target = `      {/* Responsive hash text display */}
      <span className="truncate select-all cursor-text font-mono tracking-wider">
        {truncateMobileOnly ? (
          <>
            <span className="hidden sm:inline break-all">{hash}</span>
            <span className="sm:hidden">{formattedMobile}</span>
          </>
        ) : (
          <>
            <span className="hidden md:inline">{formattedDesktop}</span>
            <span className="md:hidden">{formattedMobile}</span>
          </>
        )}
      </span>`;

const replacement = `      {/* Responsive hash text display */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className={\`text-left select-all cursor-pointer font-mono tracking-wider transition-all \${expanded ? 'break-all' : 'truncate'}\`}
        title="Click to expand/collapse full value"
      >
        {expanded ? (
          hash
        ) : truncateMobileOnly ? (
          <>
            <span className="hidden sm:inline break-all">{hash}</span>
            <span className="sm:hidden">{formattedMobile}</span>
          </>
        ) : (
          <>
            <span className="hidden md:inline">{formattedDesktop}</span>
            <span className="md:hidden">{formattedMobile}</span>
          </>
        )}
      </button>`;

content = content.replace(target, replacement);

const stateTarget = `  const [copied, setCopied] = useState(false);`;
const stateReplacement = `  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);`;

content = content.replace(stateTarget, stateReplacement);

fs.writeFileSync(file, content);
