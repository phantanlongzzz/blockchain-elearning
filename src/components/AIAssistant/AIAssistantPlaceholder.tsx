import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const AIAssistantPlaceholder: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 bg-[#090A0F] font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[#00C98D]/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl text-center space-y-6">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0F131A] border border-[#1C2430] shadow-2xl mb-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00C98D]/20 to-transparent rounded-2xl opacity-50" />
          <Bot className="w-10 h-10 text-[#00C98D]" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#F2F4F7] tracking-tight">
          {isVi ? '🤖 Blockchain AI Assistant' : '🤖 Blockchain AI Assistant'}
        </h1>
        
        <p className="text-base sm:text-lg text-[#A5AFBF] max-w-xl leading-relaxed">
          {isVi 
            ? 'Trợ lý học tập thông minh hỗ trợ giải thích kiến thức Blockchain, phân tích mô phỏng và trả lời câu hỏi theo nội dung bài học.'
            : 'Intelligent learning assistant to help explain Blockchain concepts, analyze simulations, and answer curriculum questions.'}
        </p>

        <div className="pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#11161E] border border-[#1C2430] text-sm text-[#717B8C]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {isVi ? 'Đang phát triển...' : 'Under development...'}
          </div>
        </div>
      </div>
    </div>
  );
};
