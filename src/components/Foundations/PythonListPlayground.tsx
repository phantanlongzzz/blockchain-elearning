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
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {language === 'vi' ? '1. Trình gỡ lỗi RAM' : '1. RAM Memory Inspector'}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('example')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              viewMode === 'example'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {language === 'vi' ? '2. So sánh sổ tay' : '2. Scratchpad Metaphor'}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
              viewMode === 'code'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {language === 'vi' ? '3. Mã Python 3.12' : '3. Python Source'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
        </button>
      </div>

      {/* Mode 1: Memory Debugger (Memory Inspector) */}
      {viewMode === 'visual' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-4">
          {/* Header / Sub-toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
              <span className="text-xs font-sans font-semibold text-slate-200 uppercase tracking-wide">
                Memory Inspector · RAM Address Space
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({items.length} slots · 0x0400..0x{((items.length) * 1024).toString(16).toUpperCase().padStart(4, '0')})
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickModifyBtoX}
              className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Thử đổi [1] → "X"' : 'Quick Test: [1] → "X"'}</span>
            </button>
          </div>

          {/* Layer 2: Memory Slots Grid (Interactive Canvas) */}
          <div className="bg-black/35 backdrop-blur-md border border-white/[0.05] rounded-xl p-6 relative overflow-hidden bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]">
            {items.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-white/[0.08] rounded-lg">
                [ ] Danh sách rỗng / Empty Buffer
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => {
                  const isEditing = editingIndex === idx;
                  const hexAddr = `0x${((idx + 1) * 1024).toString(16).toUpperCase().padStart(4, '0')}`;
                  const isIndex1 = idx === 1;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        isEditing
                          ? 'bg-[#0E1424]/95 border-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_20px_rgba(0,210,255,0.25)]'
                          : isIndex1 && item.value === 'X'
                          ? 'bg-amber-500/[0.06] border-amber-500/40 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                          : 'bg-[#0E1424]/85 backdrop-blur-md border-cyan-500/20 hover:border-cyan-400/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                      }`}
                    >
                      {/* Slot Header: [ Index: 0 ] [ Addr: 0x0400 ] [ Type: str ] */}
                      <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-white/[0.06] text-[11px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">Index: {idx}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400">Addr: {hexAddr}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-400 text-[10px]">
                          Type: {item.type}
                        </span>
                      </div>

                      {/* Slot Body Value */}
                      {isEditing ? (
                        <div className="space-y-2 py-1 font-mono">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-black/80 border border-cyan-500/50 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(idx)}
                              className="flex-1 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-[11px] transition-colors cursor-pointer"
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
                        <div className="space-y-2 py-1">
                          <div className="flex items-center justify-between gap-2 p-2 bg-black/40 rounded border border-white/[0.04]">
                            <span className="text-slate-500 text-[11px] font-mono">Value:</span>
                            <span className={`font-mono text-xs font-medium truncate ${item.value === 'X' ? 'text-amber-300 font-bold' : 'text-cyan-300'}`}>
                              {item.type === 'str' ? `"${item.value}"` : String(item.value)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1">
                              {isIndex1 && (
                                <button
                                  type="button"
                                  onClick={handleQuickModifyBtoX}
                                  title={language === 'vi' ? 'Đổi thành "X"' : 'Change to "X"'}
                                  className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30 transition-colors cursor-pointer"
                                >
                                  Đổi [1]→'X'
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(idx)}
                                title={language === 'vi' ? 'Sửa' : 'Edit'}
                                className="text-slate-400 hover:text-cyan-400 p-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(idx)}
                                title={language === 'vi' ? 'Xóa' : 'Delete'}
                                className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Anti-Overexplaining 1-Line Callout Alert */}
          <div className="bg-cyan-950/20 border-l-2 border-cyan-400/80 border-y border-r border-white/[0.05] rounded-r-xl p-4 text-xs font-sans text-slate-300 flex items-center gap-2">
            <span className="text-amber-300 font-medium">⚠️ Rủi ro Mutability:</span>
            <span>Các ô nhớ RAM độc lập không có cơ chế phát hiện sửa đổi hay chống giả mạo.</span>
          </div>

          {/* Add Element Toolbar */}
          <form
            onSubmit={handleAddItem}
            className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1"
          >
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={strings.foundations.pythonList.valuePlaceholder}
              className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-black/50 border border-white/[0.08] focus:border-cyan-500/50 text-slate-200 outline-none"
            />

            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as 'int' | 'float' | 'str' | 'bool')
              }
              className="px-3 py-2 rounded-lg bg-black/50 border border-white/[0.08] focus:border-cyan-500/50 text-slate-300 outline-none cursor-pointer"
            >
              <option value="str">str</option>
              <option value="int">int</option>
              <option value="float">float</option>
              <option value="bool">bool</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{strings.foundations.pythonList.addElement}</span>
            </button>
          </form>

          {/* Operation Executed Preview */}
          <div className="p-2.5 bg-black/40 rounded-lg border border-white/[0.06] font-mono text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-500 font-sans">Lệnh Python vừa thực thi:</span>
            <code className="text-cyan-300">{lastOperation}</code>
          </div>
        </div>
      )}

      {/* Mode 2: Metaphor Comparison */}
      {viewMode === 'example' && (
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-3 font-mono text-xs">
          <div className="text-xs font-sans font-semibold text-white uppercase tracking-wide">
            {language === 'vi' ? 'Sổ tay thông thường vs. Sổ cái bất biến' : 'Scratchpad vs. Immutable Ledger'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-[#0E1424]/85 backdrop-blur-md border border-cyan-500/20 space-y-1.5">
              <span className="font-semibold text-amber-300 block font-sans">
                {language === 'vi' ? 'Python List = Tờ giấy nháp' : 'Python List = Scratchpad'}
              </span>
              <p className="text-slate-400 leading-relaxed text-xs font-sans">
                {language === 'vi'
                  ? 'Dễ dàng tẩy xóa hoặc sửa đổi dòng bất kỳ mà người khác xem lại không thể biết được nội dung ban đầu là gì.'
                  : 'Any entry can be overwritten or deleted without leaving a verifiable audit trail.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1424]/85 backdrop-blur-md border border-cyan-500/20 space-y-1.5">
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
        <div className="p-6 rounded-2xl bg-[#0B0F19]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-3">
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,210,255,0.25)] transition-all cursor-pointer"
        >
          <span>{language === 'vi' ? 'Tiếp tục: Danh sách liên kết →' : 'Continue: Linked List →'}</span>
        </button>
      </div>
    </div>
  );
};
