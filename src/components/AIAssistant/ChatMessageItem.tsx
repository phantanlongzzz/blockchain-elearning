import React, { useState } from 'react';
import { Bot, User, Copy, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { ChatMessageItem as ChatMessageType } from '../../services/aiChatService';

interface ChatMessageItemProps {
  message: ChatMessageType;
  onRetry?: () => void;
  language: 'vi' | 'en';
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  language,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple, robust formatter for markdown-like syntax (bold, inline code, bullet points, headers)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            return <div key={lineIdx} className="h-1" />;
          }

          // Header line
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={lineIdx} className="font-bold text-emerald-300 text-xs sm:text-sm mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={lineIdx} className="font-bold text-emerald-200 text-sm mt-2.5 mb-1">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }

          // Bullet item
          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
          const lineContent = isBullet ? trimmed.substring(2) : trimmed;

          // Parse inline bold and code
          const parts: React.ReactNode[] = [];
          // Regex for **bold** and `code`
          const regex = /(\*\*.*?\*\*|`.*?`)/g;
          const segments = lineContent.split(regex);

          segments.forEach((seg, segIdx) => {
            if (seg.startsWith('**') && seg.endsWith('**')) {
              parts.push(
                <strong key={segIdx} className="font-semibold text-white">
                  {seg.slice(2, -2)}
                </strong>
              );
            } else if (seg.startsWith('`') && seg.endsWith('`')) {
              parts.push(
                <code
                  key={segIdx}
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 font-mono text-[11px] text-emerald-300"
                >
                  {seg.slice(1, -1)}
                </code>
              );
            } else {
              parts.push(seg);
            }
          });

          if (isBullet) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-1">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="flex-1">{parts}</span>
              </div>
            );
          }

          return <p key={lineIdx}>{parts}</p>;
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-emerald-600 text-white'
            : message.isError
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : message.isError ? (
          <AlertCircle className="w-4 h-4 text-rose-400" />
        ) : (
          <Bot className="w-4 h-4 text-emerald-400" />
        )}
      </div>

      {/* Message Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 transition-all relative group ${
          isUser
            ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-950/20'
            : message.isError
            ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-tl-sm'
            : 'bg-[#0B0E12] border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
        }`}
      >
        {/* Content */}
        {renderFormattedContent(message.content)}

        {/* Footer info & copy action */}
        <div
          className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[10px] ${
            isUser
              ? 'border-white/10 text-emerald-100/70'
              : message.isError
              ? 'border-rose-900/40 text-rose-400/80'
              : 'border-slate-800 text-slate-400'
          }`}
        >
          <span>{message.timestamp}</span>

          <div className="flex items-center gap-1.5">
            {message.isError && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-rose-100 bg-rose-900/50 hover:bg-rose-800/60 px-2 py-0.5 rounded cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'vi' ? 'Thử lại' : 'Retry'}</span>
              </button>
            )}

            {!isUser && !message.isError && (
              <button
                type="button"
                onClick={handleCopy}
                title={language === 'vi' ? 'Sao chép câu trả lời' : 'Copy answer'}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-emerald-300 p-0.5 rounded cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
