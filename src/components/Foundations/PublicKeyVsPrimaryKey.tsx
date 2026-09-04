import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export const PublicKeyVsPrimaryKey: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  return (
    <div className="rounded-xl bg-[#090a0f] border border-zinc-800 p-5 sm:p-6 space-y-4 font-sans">
      {/* Section Title */}
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-semibold text-zinc-100 font-display">
          {isVi ? 'Public Key và Primary Key' : 'Public Key vs Primary Key'}
        </h4>
        <p className="text-xs text-zinc-400">
          {isVi
            ? 'Phân biệt hai khái niệm dễ gây nhầm lẫn giữa Mật mã học (Blockchain) và Cơ sở dữ liệu quan hệ (Database).'
            : 'Distinguishing two easily confused concepts between Cryptography (Blockchain) and Relational Databases.'}
        </p>
      </div>

      {/* 2-Column Comparison Layout (Desktop: 2 cols, Mobile: stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* LEFT — Public Key */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#0B0E12] border border-border-primary flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h5 className="text-base font-semibold text-zinc-100 font-display">
                  Public Key
                </h5>
                <span className="text-xs text-zinc-400 block font-medium">
                  {isVi ? 'Khóa công khai' : 'Public Key'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-text-primary bg-white/[0.04] border border-border-primary whitespace-nowrap">
                {isVi ? 'Mật mã học · Blockchain' : 'Cryptography · Blockchain'}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed pt-1">
              {isVi
                ? 'Dùng trong mật mã học để hỗ trợ xác minh chữ ký số và các cơ chế mật mã.'
                : 'Used in cryptography to verify digital signatures and cryptographic mechanisms.'}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-500 block text-[10px] uppercase font-sans">
              {isVi ? 'Ví dụ định dạng:' : 'Sample format:'}
            </span>
            <span className="text-emerald-400/90 truncate block">
              0x048b2a19cf73... (ECDSA Secp256k1)
            </span>
          </div>
        </div>

        {/* RIGHT — Primary Key */}
        <div className="p-4 sm:p-5 rounded-lg bg-[#0B0E12] border border-purple-500/30 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h5 className="text-base font-semibold text-zinc-100 font-display">
                  Primary Key
                </h5>
                <span className="text-xs text-zinc-400 block font-medium">
                  {isVi ? 'Khóa chính' : 'Primary Key'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-purple-400 bg-purple-500/10 border border-purple-500/30 whitespace-nowrap">
                {isVi ? 'Cơ sở dữ liệu · Cơ sở dữ liệu quan hệ' : 'Database · Relational Database'}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed pt-1">
              {isVi
                ? 'Dùng để định danh duy nhất một bản ghi trong cơ sở dữ liệu quan hệ.'
                : 'Used to uniquely identify a single record in a relational database.'}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-500 block text-[10px] uppercase font-sans">
              {isVi ? 'Ví dụ định dạng:' : 'Sample format:'}
            </span>
            <span className="text-purple-400/90 truncate block">
              id: 1042 / UUID v4 (SQL / RDBMS Index)
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM TAKEAWAY */}
      <div className="p-3 sm:p-3.5 rounded-lg bg-[#0B0E12] border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between gap-3">
        <span className="text-zinc-400 leading-relaxed">
          <strong className="text-zinc-200 font-medium font-sans">
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
