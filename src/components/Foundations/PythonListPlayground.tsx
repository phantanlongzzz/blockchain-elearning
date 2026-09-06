import React, { useState } from 'react';
import { Plus, Trash2, Edit3, RefreshCw, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { PythonListItem } from '../../types';
import { INITIAL_PYTHON_LIST_ITEMS } from '../../data/foundationsData';
import { CodeViewer } from '../common/CodeViewer';

interface PythonListPlaygroundProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
}

export const PythonListPlayground: React.FC<PythonListPlaygroundProps> = ({
  onInteracted,
  onNextStage,
}) => {
  const { strings, language } = useLanguage();
  const [items, setItems] = useState<PythonListItem[]>(INITIAL_PYTHON_LIST_ITEMS);
  const [newValue, setNewValue] = useState('serve');
  const [newType, setNewType] = useState<'int' | 'float' | 'str' | 'bool'>('str');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [lastOperation, setLastOperation] = useState<string>('my_list = ["prepare", "roll", "assemble"]');

  // Progressive disclosure mode: 'visual' | 'example' | 'code'
  const [viewMode, setViewMode] = useState<'visual' | 'example' | 'code'>('visual');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    let parsedVal: string | number | boolean = newValue;
    if (newType === 'int') {
      parsedVal = parseInt(newValue, 10) || 0;
    } else if (newType === 'float') {
      parsedVal = parseFloat(newValue) || 0.0;
    } else if (newType === 'bool') {
      parsedVal = newValue.toLowerCase() === 'true' || newValue === '1';
    }

    const newItem: PythonListItem = {
      id: `item-${Date.now()}`,
      value: parsedVal,
      type: newType,
    };

    setItems([...items, newItem]);
    const displayVal = newType === 'str' ? `"${parsedVal}"` : String(parsedVal);
    setLastOperation(`my_list.append(${displayVal})`);
    setNewValue('');
    onInteracted?.();
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
    setLastOperation(`del my_list[${index}]`);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    onInteracted?.();
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(String(items[index].value));
  };

  const handleSaveEdit = (index: number) => {
    const currentItem = items[index];
    let parsedVal: string | number | boolean = editValue;
    if (currentItem.type === 'int') {
      parsedVal = parseInt(editValue, 10) || 0;
    } else if (currentItem.type === 'float') {
      parsedVal = parseFloat(editValue) || 0.0;
    } else if (currentItem.type === 'bool') {
      parsedVal = editValue.toLowerCase() === 'true' || editValue === '1';
    }

    const updated = items.map((item, idx) =>
      idx === index ? { ...item, value: parsedVal } : item
    );
    setItems(updated);
    const displayVal = currentItem.type === 'str' ? `"${parsedVal}"` : String(parsedVal);
    setLastOperation(`my_list[${index}] = ${displayVal}`);
    setEditingIndex(null);
    onInteracted?.();
  };

  const handleQuickModifyBtoX = () => {
    const demoItems: PythonListItem[] = [
      { id: 'demo-1', value: 'prepare', type: 'str' },
      { id: 'demo-2', value: 'X', type: 'str' },
      { id: 'demo-3', value: 'assemble', type: 'str' },
    ];
    setItems(demoItems);
    setLastOperation('my_list[1] = "X"  # Đổi giá trị tại ô 0x0800 thành "X" trực tiếp');
    onInteracted?.();
  };

  const handleReset = () => {
    setItems(INITIAL_PYTHON_LIST_ITEMS);
    setLastOperation('my_list = ["prepare", "roll", "assemble"]');
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Tab Switcher & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {language === 'vi' ? '1. Trình gỡ lỗi RAM' : '1. RAM Memory Inspector'}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('example')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
              viewMode === 'example'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {language === 'vi' ? '2. So sánh sổ tay' : '2. Scratchpad Metaphor'}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer ${
              viewMode === 'code'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {language === 'vi' ? '3. Mã Python 3.12' : '3. Python Source'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] hover:border-cyan-500/30 text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
        </button>
      </div>

      {/* Mode 1: Memory Debugger (Memory Inspector) */}
      {viewMode === 'visual' && (
        <div className="p-6 rounded-2xl bg-[#0B101E] border border-slate-800 space-y-4">
          {/* Header / Sub-toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-sans font-semibold text-slate-200 uppercase tracking-wide">
                {language === 'vi'
                  ? `KHÔNG GIAN ĐỊA CHỈ BỘ NHỚ RAM (${items.length} Ô LIỀN KỀ · 0x0400 - 0x${(items.length * 1024).toString(16).toUpperCase().padStart(4, '0')})`
                  : `RAM ADDRESS SPACE (${items.length} CONTIGUOUS SLOTS · 0x0400 - 0x${(items.length * 1024).toString(16).toUpperCase().padStart(4, '0')})`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickModifyBtoX}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-sans flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'vi' ? 'Thử đổi [1] -> "X"' : 'Quick Test: [1] -> "X"'}</span>
            </button>
          </div>

          {/* Layer 2: Contiguous Memory Tape (Thanh Băng Nhớ Liền Kề) */}
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl bg-[#080C16]">
              [ ] {language === 'vi' ? 'Danh sách rỗng / Không có ô nhớ' : 'Empty Buffer / No Slots'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-800 rounded-xl overflow-hidden bg-[#080C16]">
              {items.map((slot, idx) => {
                const isEditing = editingIndex === idx;
                const hexAddr = `0x${((idx + 1) * 1024).toString(16).toUpperCase().padStart(4, '0')}`;
                const isTampered = idx === 1 && String(slot.value) === 'X';

                return (
                  <div
                    key={slot.id || idx}
                    className={`p-4 border-b md:border-b-0 md:border-r last:border-b-0 last:md:border-r-0 border-slate-800/80 flex flex-col justify-between min-h-[160px] relative transition-colors ${
                      isEditing
                        ? 'bg-[#0E1424] ring-1 ring-cyan-500'
                        : isTampered
                        ? 'bg-amber-500/[0.04] border-amber-500/50'
                        : 'bg-[#080C16] hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Header ô nhớ */}
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 pb-2 border-b border-white/[0.04]">
                      <span className="text-cyan-400 font-bold">{language === 'vi' ? `Chỉ số [${idx}]` : `Index [${idx}]`}</span>
                      <span>{language === 'vi' ? `Ô nhớ: ${hexAddr}` : `Addr: ${hexAddr}`}</span>
                    </div>

                    {/* Giá trị phần tử */}
                    <div className="py-4 text-center">
                      {isEditing ? (
                        <div className="space-y-2 py-1 font-mono">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-black/80 border border-cyan-500/50 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(idx)}
                              className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-[11px] transition-colors cursor-pointer"
                            >
                              {language === 'vi' ? 'Lưu' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
                            >
                              {language === 'vi' ? 'Hủy' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`inline-block font-mono text-base px-3 py-1.5 rounded border ${
                            isTampered
                              ? 'text-amber-300 font-bold bg-amber-500/10 border-amber-500/40'
                              : 'text-white bg-white/[0.03] border-white/[0.06]'
                          }`}
                        >
                          "{slot.value}"
                        </span>
                      )}
                    </div>

                    {/* Footer thông tin */}
                    <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 pt-2 border-t border-white/[0.04]">
                      <span>{language === 'vi' ? 'Kích thước: 8 byte' : 'Size: 8 bytes'}</span>
                      {/* Nút sửa nhanh */}
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            {language === 'vi' ? 'Sửa' : 'Edit'}
                          </button>
                        )}
                        {items.length > 1 && !isEditing && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            {language === 'vi' ? 'Xóa' : 'Del'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Silent Tampering Alert (Cơ chế Sửa Đổi Âm Thầm) */}
          {items.length > 1 && String(items[1].value) === 'X' ? (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 font-sans text-xs text-amber-200/90 flex items-start gap-2.5">
              <div className="font-semibold text-amber-300 whitespace-nowrap">{language === 'vi' ? '[Lỗ hổng Bộ nhớ]' : '[Memory Vulnerability]'}</div>
              <div>
                {language === 'vi' ? (
                  <>
                    Ô nhớ <strong>0x0800</strong> đã bị ghi đè thành công từ "roll" sang "X". Các ô nhớ lân cận [0] và [2] không hề thay đổi.{' '}
                    <strong className="text-white">Không có cơ chế kiểm tra tính toàn vẹn:</strong> Người đọc dữ liệu không thể phát hiện ô nhớ này đã từng bị can thiệp!
                  </>
                ) : (
                  <>
                    Memory slot <strong>0x0800</strong> was successfully overwritten from "roll" to "X". Adjacent memory slots [0] and [2] were not modified.{' '}
                    <strong className="text-white">No integrity verification mechanism:</strong> Any consumer reading this memory cannot detect that it was tampered with!
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#080C16] border border-slate-800 text-xs font-sans text-slate-400 flex items-center gap-2">
              <span className="text-cyan-400 font-medium">{language === 'vi' ? '💡 Đặc tính RAM:' : '💡 RAM Property:'}</span>
              <span>
                {language === 'vi'
                  ? 'Mỗi ô nhớ là một khối độc lập trong không gian bộ nhớ. Thao tác ghi đè ô bất kỳ diễn ra âm thầm và không tạo vết nứt hay cảnh báo.'
                  : 'Each memory slot is independent in address space. Overwriting any slot happens silently without raising alarms.'}
              </span>
            </div>
          )}

          {/* Add Element Toolbar */}
          <form
            onSubmit={handleAddItem}
            className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1"
          >
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập giá trị phần tử mới...' : 'Enter new element value...'}
              className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 focus:border-cyan-500 text-slate-200 outline-none"
            />

            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as 'int' | 'float' | 'str' | 'bool')
              }
              className="px-3 py-2 rounded-lg bg-[#060913] border border-slate-800 focus:border-cyan-500 text-slate-300 outline-none cursor-pointer font-sans"
            >
              <option value="str">{language === 'vi' ? 'Kiểu: Chuỗi (str)' : 'Type: String (str)'}</option>
              <option value="int">{language === 'vi' ? 'Kiểu: Số nguyên (int)' : 'Type: Integer (int)'}</option>
              <option value="float">{language === 'vi' ? 'Kiểu: Số thực (float)' : 'Type: Float (float)'}</option>
              <option value="bool">{language === 'vi' ? 'Kiểu: Boolean (bool)' : 'Type: Boolean (bool)'}</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-sans font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? '+ Thêm vào Mảng' : '+ Add to Array'}</span>
            </button>
          </form>

          {/* Operation Executed Preview */}
          <div className="p-3 bg-[#060913] rounded-lg border border-slate-800 font-mono text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-400 font-sans">{language === 'vi' ? 'Lệnh Python tương đương:' : 'Equivalent Python statement:'}</span>
            <code className="text-cyan-300 font-mono">{lastOperation}</code>
          </div>
        </div>
      )}

      {/* Mode 2: Metaphor Comparison */}
      {viewMode === 'example' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 border border-white/[0.08] space-y-3 font-mono text-xs">
          <div className="text-xs font-sans font-semibold text-white uppercase tracking-wide">
            {language === 'vi' ? 'Sổ tay thông thường vs. Sổ cái bất biến' : 'Scratchpad vs. Immutable Ledger'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-[#0E1424]/85 border border-cyan-500/20 space-y-1.5">
              <span className="font-semibold text-amber-300 block font-sans">
                {language === 'vi' ? 'Python List = Tờ giấy nháp' : 'Python List = Scratchpad'}
              </span>
              <p className="text-slate-400 leading-relaxed text-xs font-sans">
                {language === 'vi'
                  ? 'Dễ dàng tẩy xóa hoặc sửa đổi dòng bất kỳ mà người khác xem lại không thể biết được nội dung ban đầu là gì.'
                  : 'Any entry can be overwritten or deleted without leaving a verifiable audit trail.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1424]/85 border border-cyan-500/20 space-y-1.5">
              <span className="font-semibold text-cyan-300 block font-sans">
                {language === 'vi' ? 'Blockchain = Sổ cái mật mã' : 'Blockchain = Cryptographic Ledger'}
              </span>
              <p className="text-slate-400 leading-relaxed text-xs font-sans">
                {language === 'vi'
                  ? 'Mỗi bản ghi được niêm phong bằng mã băm của bản ghi trước. Sửa 1 ký tự sẽ làm đứt gãy toàn bộ chuỗi.'
                  : 'Each block is sealed with the previous block hash. Changing one character breaks all downstream links.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Python Code */}
      {viewMode === 'code' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-sans text-slate-400">
            <span className="font-medium text-slate-200">
              {language === 'vi' ? 'Minh họa thao tác danh sách Python' : 'Python List Implementation'}
            </span>
            <span className="text-slate-500 font-mono">Python 3.12</span>
          </div>

          <CodeViewer
            code={`# 1. Khởi tạo danh sách các công đoạn trong RAM
my_list = ["prepare", "roll", "assemble"]

# 2. Thay đổi phần tử ở giữa (Không có cơ chế kiểm tra toàn vẹn)
my_list[1] = "X"  # Ô 0x0800 bị ghi đè trực tiếp mà không báo động

# 3. Thêm phần tử vào cuối
my_list.append("serve")

print(my_list)  # Output: ['prepare', 'X', 'assemble', 'serve']`}
            language="python"
            filename="python_list_demo.py"
            maxHeight="300px"
          />
        </div>
      )}

      {/* Single Primary Navigation CTA at Bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-white/[0.06] gap-3">
        <span className="text-xs font-sans text-slate-400">
          {language === 'vi'
            ? 'Tiếp theo: Tìm hiểu cấu trúc Danh sách liên kết (Linked List)'
            : 'Next: Explore Linked List data structure'}
        </span>
        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors cursor-pointer"
        >
          <span>{language === 'vi' ? 'Tiếp tục: Danh sách liên kết →' : 'Continue: Linked List →'}</span>
        </button>
      </div>
    </div>
  );
};
