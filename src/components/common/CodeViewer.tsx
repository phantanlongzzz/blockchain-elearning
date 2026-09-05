import React, { useState } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface CodeViewerProps {
  code: string;
  language?: 'python' | 'typescript' | 'javascript' | 'json' | string;
  filename?: string;
  maxHeight?: string;
  showLineNumbers?: boolean;
  highlightLine?: (lineNumber: number, lineText: string) => 'active' | 'winner' | 'warning' | 'success' | boolean | null | undefined;
  className?: string;
}

// Token types for VS Code Dark theme
type TokenType =
  | 'comment'
  | 'string'
  | 'keyword'
  | 'control'
  | 'type'
  | 'function'
  | 'variable'
  | 'number'
  | 'operator'
  | 'punctuation'
  | 'plain';

interface Token {
  type: TokenType;
  text: string;
}

// Robust syntax highlighter for Python, TypeScript, and JavaScript matching VS Code Dark
function tokenizeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  const isPython = lang.toLowerCase().includes('py');

  const pythonKeywords = new Set([
    'def', 'class', 'import', 'from', 'as', 'return', 'if', 'elif', 'else',
    'while', 'for', 'in', 'is', 'not', 'and', 'or', 'try', 'except', 'finally',
    'with', 'lambda', 'pass', 'break', 'continue', 'yield', 'raise', 'async',
    'await', 'global', 'nonlocal', 'assert', 'del'
  ]);

  const jsKeywords = new Set([
    'function', 'class', 'import', 'from', 'export', 'default', 'return', 'if',
    'else', 'while', 'for', 'of', 'in', 'try', 'catch', 'finally', 'switch',
    'case', 'break', 'continue', 'yield', 'async', 'await', 'const', 'let',
    'var', 'interface', 'type', 'enum', 'extends', 'implements', 'new', 'typeof',
    'instanceof', 'void', 'delete', 'throw'
  ]);

  const keywords = isPython ? pythonKeywords : jsKeywords;

  const constants = new Set([
    'True', 'False', 'None', 'true', 'false', 'null', 'undefined', 'self', 'this'
  ]);

  const builtInTypes = new Set([
    'int', 'str', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'object',
    'bytes', 'bytearray', 'string', 'number', 'boolean', 'any', 'void', 'never',
    'unknown', 'Record', 'Array', 'Promise', 'Map', 'Set', 'Uint8Array', 'Node',
    'LinkedList', 'Miner', 'MinerNode', 'Block', 'Blockchain'
  ]);

  while (i < len) {
    // 1. Comments
    if (isPython && line[i] === '#') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }
    if (!isPython && line.slice(i, i + 2) === '//') {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // 2. Python triple quotes on single line
    if (isPython && (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''")) {
      const q = line.slice(i, i + 3);
      const nextIdx = line.indexOf(q, i + 3);
      if (nextIdx !== -1) {
        tokens.push({ type: 'string', text: line.slice(i, nextIdx + 3) });
        i = nextIdx + 3;
        continue;
      } else {
        tokens.push({ type: 'string', text: line.slice(i) });
        break;
      }
    }

    // 3. String literals ("...", '...', `...`, f"...", r"...")
    let strPrefix = '';
    let currChar = line[i];
    if (isPython && (currChar === 'f' || currChar === 'r' || currChar === 'b') && (line[i + 1] === '"' || line[i + 1] === "'")) {
      strPrefix = currChar;
      i++;
      currChar = line[i];
    }

    if (currChar === '"' || currChar === "'" || (!isPython && currChar === '`')) {
      const quote = currChar;
      let str = strPrefix + quote;
      i++;
      let escaped = false;
      while (i < len) {
        const c = line[i];
        str += c;
        if (!escaped && c === quote) {
          i++;
          break;
        }
        if (c === '\\' && !escaped) {
          escaped = true;
        } else {
          escaped = false;
        }
        i++;
      }
      tokens.push({ type: 'string', text: str });
      continue;
    }

    // 4. Numbers (decimal, hex, binary)
    if (
      (/\d/.test(line[i]) && (i === 0 || !/[a-zA-Z0-9_]/.test(line[i - 1]))) ||
      (line[i] === '0' && (line[i + 1] === 'x' || line[i + 1] === 'b'))
    ) {
      let num = '';
      if (line.slice(i, i + 2) === '0x' || line.slice(i, i + 2) === '0b') {
        num += line.slice(i, i + 2);
        i += 2;
        while (i < len && /[0-9a-fA-F_]/.test(line[i])) {
          num += line[i++];
        }
      } else {
        while (i < len && /[0-9._]/.test(line[i])) {
          num += line[i++];
        }
      }
      tokens.push({ type: 'number', text: num });
      continue;
    }

    // 5. Identifiers / Words
    if (/[a-zA-Z_]/.test(line[i])) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_]/.test(line[i])) {
        word += line[i++];
      }

      // Check if followed by '(' -> function/method call or definition
      let peek = i;
      while (peek < len && (line[peek] === ' ' || line[peek] === '\t')) {
        peek++;
      }
      const isCall = peek < len && line[peek] === '(';

      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (constants.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (builtInTypes.has(word)) {
        tokens.push({ type: 'type', text: word });
      } else if (isCall) {
        tokens.push({ type: 'function', text: word });
      } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(word)) {
        tokens.push({ type: 'type', text: word });
      } else {
        tokens.push({ type: 'variable', text: word });
      }
      continue;
    }

    // 6. Multi-character operators
    const twoChars = line.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '->', '=>', '::', '&&', '||'].includes(twoChars)) {
      tokens.push({ type: 'operator', text: twoChars });
      i += 2;
      continue;
    }

    // 7. Single-character operators & punctuation
    if (['+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~'].includes(line[i])) {
      tokens.push({ type: 'operator', text: line[i] });
      i++;
      continue;
    }

    if (['(', ')', '[', ']', '{', '}', ':', ';', ',', '.'].includes(line[i])) {
      tokens.push({ type: 'punctuation', text: line[i] });
      i++;
      continue;
    }

    // 8. Spaces and other characters
    let plain = '';
    while (
      i < len &&
      !/[a-zA-Z0-9_#"'/`+\-*%=<>!&|^~()[\]{}:;,\.]/.test(line[i])
    ) {
      plain += line[i++];
    }
    if (plain.length > 0) {
      tokens.push({ type: 'plain', text: plain });
    } else {
      // Fallback 1 char
      tokens.push({ type: 'plain', text: line[i++] });
    }
  }

  return tokens;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'python',
  filename,
  maxHeight = '500px',
  showLineNumbers = true,
  highlightLine,
  className = '',
}) => {
  const { language: appLang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const cleanCode = code.trim();
  const lines = cleanCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine display filename / language tag
  const displayLang = language.toUpperCase();
  const displayFile =
    filename ||
    (language.toLowerCase().includes('py')
      ? 'script.py'
      : language.toLowerCase().includes('ts')
      ? 'module.ts'
      : 'code.txt');

  return (
    <div
      className={`rounded-xl overflow-hidden border border-[#2b2b2b] bg-[#1e1e1e] text-[#d4d4d4] shadow-2xl ${className}`}
      style={{ fontFamily: "Consolas, 'Cascadia Code', 'Fira Code', Menlo, Monaco, 'Courier New', monospace" }}
    >
      {/* VS Code Dark Title Bar & Tab */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-[#191919] select-none text-xs">
        {/* Active Tab */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1e1e1e] text-[#cccccc] rounded-t border-t-2 border-[#007acc] text-xs font-mono">
            <FileCode2 className="w-3.5 h-3.5 text-[#569cd6]" />
            <span className="font-medium tracking-wide">{displayFile}</span>
          </div>
          <span className="text-[11px] text-[#858585] px-2 py-0.5 rounded bg-[#2d2d2d]/60 font-mono">
            {displayLang}
          </span>
        </div>

        {/* Copy Button with VS Code button styling */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3c3c3c] text-[#cccccc] hover:text-white border border-[#454545] text-xs font-mono transition-colors cursor-pointer"
          title={appLang === 'vi' ? 'Sao chép mã nguồn' : 'Copy source code'}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#4ec9b0]" />
              <span className="text-[#4ec9b0] text-[11px]">
                {appLang === 'vi' ? 'Đã sao chép' : 'Copied'}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#858585]" />
              <span className="text-[11px]">
                {appLang === 'vi' ? 'Sao chép' : 'Copy'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      <div
        className="overflow-x-auto p-3 text-[13px] leading-[22px] select-text"
        style={{
          maxHeight,
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
        }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const hlResult = highlightLine ? highlightLine(lineNum, lineText) : null;

              let lineBg = 'transparent';
              let lineBorder = 'transparent';
              if (hlResult === 'active' || hlResult === 'warning') {
                lineBg = 'rgba(255, 204, 0, 0.08)';
                lineBorder = '#d7ba7d';
              } else if (hlResult === 'winner' || hlResult === 'success' || hlResult === true) {
                lineBg = 'rgba(78, 201, 176, 0.08)';
                lineBorder = '#4ec9b0';
              }

              const tokens = tokenizeLine(lineText, language);

              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: lineBg,
                    borderLeft: lineBorder !== 'transparent' ? `3px solid ${lineBorder}` : '3px solid transparent',
                  }}
                  className="hover:bg-[#282828]/50 transition-colors"
                >
                  {showLineNumbers && (
                    <td
                      className="pr-4 pl-2 select-none text-right align-top"
                      style={{
                        color: '#858585',
                        width: '3rem',
                        fontSize: '12px',
                        userSelect: 'none',
                        lineHeight: '22px',
                      }}
                    >
                      {lineNum}
                    </td>
                  )}
                  <td className="whitespace-pre font-mono" style={{ lineHeight: '22px' }}>
                    {tokens.map((tok, tIdx) => {
                      let color = '#d4d4d4'; // default plain
                      let fontStyle: 'normal' | 'italic' = 'normal';

                      switch (tok.type) {
                        case 'comment':
                          color = '#6a9955';
                          fontStyle = 'italic';
                          break;
                        case 'string':
                          color = '#ce9178';
                          break;
                        case 'keyword':
                          color = '#569cd6';
                          break;
                        case 'control':
                          color = '#c586c0';
                          break;
                        case 'type':
                          color = '#4ec9b0';
                          break;
                        case 'function':
                          color = '#dcdcaa';
                          break;
                        case 'variable':
                          color = '#9cdcfe';
                          break;
                        case 'number':
                          color = '#b5cea8';
                          break;
                        case 'operator':
                          color = '#d4d4d4';
                          break;
                        case 'punctuation':
                          color = '#808080';
                          break;
                        default:
                          color = '#d4d4d4';
                      }

                      return (
                        <span
                          key={tIdx}
                          style={{
                            color,
                            fontStyle,
                          }}
                        >
                          {tok.text}
                        </span>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor Status Bar (VS Code style footer) */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-[11px] font-mono select-none">
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>{displayLang}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{lines.length} lines</span>
          <span>Spaces: 4</span>
        </div>
      </div>
    </div>
  );
};
