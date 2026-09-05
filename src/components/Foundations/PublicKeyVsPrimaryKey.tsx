import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export const PublicKeyVsPrimaryKey: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <div className="rounded-xl bg-black/35 backdrop-blur-md border border-white/[0.06] p-5 sm:p-6 space-y-4 font-sans">
      {/* Section Title */}
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-white font-sans">
          {isVi ? 'Public Key và Primary Key' : 'Public Key vs Primary Key'}
        </h4>
        <p className="text-xs text-slate-400">
          {isVi
            ? 'Phân biệt hai khái niệm dễ gây nhầm lẫn giữa Mật mã học (Blockchain) và Cơ sở dữ liệu quan hệ (Database).'
            : 'Distinguishing two easily confused concepts between Cryptography (Blockchain) and Relational Databases.'}
        </p>
      </div>

      {/* 2-Column Comparison Layout (Desktop: 2 cols, Mobile: stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* LEFT — Public Key */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0E1526]/70 border border-cyan-500/25 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h5 className="text-base font-bold text-white font-sans">
                  Public Key
                </h5>
                <span className="text-xs text-cyan-300 block font-medium">
                  {isVi ? 'Khóa công khai' : 'Public Key'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 whitespace-nowrap">
                {isVi ? 'Mật mã học · Blockchain' : 'Cryptography · Blockchain'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {isVi
                ? 'Dùng trong mật mã học để hỗ trợ xác minh chữ ký số và các cơ chế mật mã.'
                : 'Used in cryptography to verify digital signatures and cryptographic mechanisms.'}
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">
              {isVi ? 'Ví dụ định dạng:' : 'Sample format:'}
            </span>
            <span className="text-cyan-300 truncate block">
              0x048b2a19cf73... (ECDSA Secp256k1)
            </span>
          </div>
        </div>

        {/* RIGHT — Primary Key */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0E1526]/70 border border-purple-500/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h5 className="text-base font-bold text-white font-sans">
                  Primary Key
                </h5>
                <span className="text-xs text-purple-300 block font-medium">
                  {isVi ? 'Khóa chính' : 'Primary Key'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-purple-400 bg-purple-500/10 border border-purple-500/30 whitespace-nowrap">
                {isVi ? 'Cơ sở dữ liệu · Cơ sở dữ liệu quan hệ' : 'Database · Relational Database'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {isVi
                ? 'Dùng để định danh duy nhất một bản ghi trong cơ sở dữ liệu quan hệ.'
                : 'Used to uniquely identify a single record in a relational database.'}
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">
              {isVi ? 'Ví dụ định dạng:' : 'Sample format:'}
            </span>
            <span className="text-purple-400/90 truncate block">
              id: 1042 / UUID v4 (SQL / RDBMS Index)
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM TAKEAWAY */}
      <div className="p-3 sm:p-3.5 rounded-lg bg-[#0E1526]/60 border border-white/[0.06] text-xs text-slate-300 flex items-center justify-between gap-3">
        <span className="text-slate-300 leading-relaxed">
          <strong className="text-cyan-400 font-semibold font-mono">
            {isVi ? 'Ghi nhớ cốt lõi: ' : 'Core takeaway: '}
          </strong>
          {isVi
            ? 'Tên gần giống nhau, nhưng thuộc hai lĩnh vực khác nhau và có chức năng hoàn toàn khác nhau.'
            : 'Similar in name, but belonging to two distinct fields with completely different functions.'}
        </span>
      </div>
    </div>
  );
};

