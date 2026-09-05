import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, RotateCcw, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { sendChatMessage, ChatMessageItem as ChatMessageType } from '../../services/aiChatService';
import { getSuggestionsForSection } from './chatSuggestionsData';
import { ChatMessageItem } from './ChatMessageItem';

export const AIAssistantWidget: React.FC = () => {
  const { language, strings } = useLanguage();
  const { currentLesson } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isVi = language === 'vi';
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Load chat history from sessionStorage if available
  useEffect(() => {
    const saved = sessionStorage.getItem('ai_assistant_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  // Save chat history to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('ai_assistant_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const newUserMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Gather context
      const context = {
        activeSection: currentLesson.id,
        sectionName: isVi ? currentLesson.titleVi : currentLesson.titleEn,
      };

      const replyText = await sendChatMessage({
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        context,
        language
      });

      const newAssistantMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Lỗi kết nối / Connection error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(strings.aiAssistant.clearConfirm)) {
      setMessages([]);
      sessionStorage.removeItem('ai_assistant_history');
    }
  };

  const suggestions = getSuggestionsForSection(currentLesson.id, language);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Chat Panel */}
        {isOpen && (
          <div className="w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-[#0F131A] border border-[#1C2430] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Icon Avatar Bot */}
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B101E]" />
                </div>
                <span className="font-sans font-semibold text-sm text-white tracking-normal">
                  {isVi ? 'Trợ lý Blockchain' : 'Blockchain Assistant'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                  title={strings.aiAssistant.clearChat}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                  title={strings.aiAssistant.closeChat}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0F131A]/50 to-[#0A0D0F]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center">
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-slate-400 font-medium">{strings.aiAssistant.suggestedQuestionsTitle}</p>
                    <div className="flex flex-col gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(suggestion)}
                          className="text-left p-3 text-sm text-cyan-100 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-900/50 rounded-xl transition-colors leading-snug cursor-pointer"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      language={language}
                      onRetry={msg.isError ? () => {
                        // Remove error message and retry last user message
                        const userMsgs = messages.filter(m => m.role === 'user');
                        const lastUserMsg = userMsgs[userMsgs.length - 1];
                        if (lastUserMsg) {
                          setMessages(prev => prev.filter(m => m.id !== msg.id));
                          handleSend(lastUserMsg.content);
                        }
                      } : undefined}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-cyan-500 animate-pulse" />
                      </div>
                      <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl rounded-tl-sm p-3.5 text-sm flex items-center gap-2 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                        <span className="text-cyan-400/80">{strings.aiAssistant.typing}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3.5 bg-[#0F131A] border-t border-white/[0.08]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
                className="flex items-end gap-2"
              >
                <div className="relative flex-1">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(inputValue);
                      }
                    }}
                    placeholder={strings.aiAssistant.inputPlaceholder}
                    disabled={isLoading}
                    className="w-full bg-[#1A222C] border border-[#2A3441] text-white rounded-xl py-3 pl-4 pr-10 resize-none max-h-32 min-h-[44px] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-500 text-sm disabled:opacity-50"
                    rows={1}
                    style={{ height: 'auto', overflowY: 'hidden' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                      if (target.scrollHeight > 120) target.style.overflowY = 'auto';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="h-11 w-11 shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-900/20 cursor-pointer"
                  title={strings.aiAssistant.sendButton}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 group"
            title={strings.aiAssistant.floatingButtonLabel}
          >
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-pulse" />
            
            {/* Tooltip on hover if not open */}
            {isHovered && (
              <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-xl border border-slate-700 animate-in fade-in slide-in-from-right-2">
                {strings.aiAssistant.floatingButtonLabel}
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-slate-800" />
              </div>
            )}
          </button>
        )}
      </div>
    </>
  );
};
