import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  Code2,
  Sparkles,
  RefreshCw,
  Check,
  ArrowRight,
  Database,
  Layers,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
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
  const [newValue, setNewValue] = useState('D');
  const [newType, setNewType] = useState<'int' | 'float' | 'str' | 'bool'>('str');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [lastOperation, setLastOperation] = useState<string>('my_list = ["prepare", "roll", "assemble"]');

  // Challenge tracking: user modifies element in the middle
  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);

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

    // If edited an element in between index > 0 and index < items.length - 1
    if (index > 0 && index < items.length - 1) {
      setChallengeCompleted(true);
    } else if (items.length <= 2 && index === 0) {
      setChallengeCompleted(true);
    }

    onInteracted?.();
  };

  const handleQuickModifyBtoX = () => {
    // Demo B -> X transformation directly
    const demoItems: PythonListItem[] = [
      { id: 'demo-1', value: 'A', type: 'str' },
      { id: 'demo-2', value: 'X', type: 'str' },
      { id: 'demo-3', value: 'C', type: 'str' },
    ];
    setItems(demoItems);
    setLastOperation('my_list[1] = "X"  # Đổi B thành X trong tích tắc');
    setChallengeCompleted(true);
    onInteracted?.();
  };

  const handleReset = () => {
    setItems(INITIAL_PYTHON_LIST_ITEMS);
    setLastOperation('my_list = ["prepare", "roll", "assemble"]');
    setEditingIndex(null);
    setChallengeCompleted(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#090a0f] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-zinc-500 font-medium">
            {language === 'vi'
              ? 'Giai đoạn 01 · Cấu trúc mảng động'
              : 'Stage 01 · Dynamic Array Structure'}
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Danh sách Python (Python List)'
              : 'Python List Data Structure'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            {language === 'vi'
              ? 'Lưu trữ các phần tử liên tiếp trong bộ nhớ RAM. Do tính dễ thay đổi (mutability), dữ liệu có thể bị sửa mà không có cơ chế phát hiện tự động.'
              : 'Stores contiguous elements in memory. Due to list mutability, items can be modified in place without cryptographic audit traces.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setViewMode('visual')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            viewMode === 'visual'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {language === 'vi' ? '1. Mô phỏng bộ nhớ' : '1. Memory Simulation'}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('example')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            viewMode === 'example'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {language === 'vi' ? '2. Ví dụ so sánh' : '2. Real-World Metaphor'}
        </button>

        <button
          type="button"
          onClick={() => setViewMode('code')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            viewMode === 'code'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {language === 'vi' ? '3. Code Python' : '3. Python Code'}
        </button>
      </div>

      {/* Mode 1: Visual Interactive RAM Array Simulator */}
      {viewMode === 'visual' && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div>
              <div className="text-xs font-mono text-zinc-300 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{strings.foundations.pythonList.currentList} ({items.length} {language === 'vi' ? 'phần tử' : 'elements'})</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {language === 'vi'
                  ? 'Địa chỉ ô nhớ RAM tăng dần tuần tự theo kích thước từng kiểu dữ liệu.'
                  : 'Contiguous RAM slots allocated sequentially for each array element.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickModifyBtoX}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Thử đổi [1] → "X"' : 'Quick Demo: [1] → "X"'}</span>
            </button>
          </div>

          {/* Array Visualization */}
          <div className="p-4 rounded-lg bg-black/40 border border-zinc-800/80 min-h-[130px] flex items-center overflow-x-auto">
            {items.length === 0 ? (
              <div className="w-full text-center text-xs font-mono text-zinc-600 py-6">
                [ ] (Danh sách rỗng)
              </div>
            ) : (
              <div className="flex items-center gap-2.5 w-full pb-1">
                {items.map((item, idx) => {
                  const isEditing = editingIndex === idx;
                  const isMiddle = idx > 0 && idx < items.length - 1;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center shrink-0"
                    >
                      <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
                        <span>[{idx}]</span>
                        {isMiddle && (
                          <span className="text-[9px] text-amber-400">· giữa</span>
                        )}
                      </div>

                      <div
                        className={`w-28 p-2.5 rounded-lg border transition-colors ${
                          isEditing
                            ? 'bg-zinc-900 border-emerald-500 ring-1 ring-emerald-500/30'
                            : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1.5">
                          <span>0x{((idx + 1) * 1024).toString(16)}</span>
                          <span className="text-zinc-400 font-medium">
                            {item.type}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-black border border-emerald-500 text-zinc-100 font-mono text-xs font-medium focus:outline-none"
                              autoFocus
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(idx)}
                                className="flex-1 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold font-mono transition-colors"
                              >
                                {language === 'vi' ? 'Lưu' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-mono"
                              >
                                {language === 'vi' ? 'Hủy' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="font-mono text-xs font-medium text-zinc-100 truncate text-center py-1 bg-black/50 rounded border border-zinc-800/80">
                              {item.type === 'str' ? `"${item.value}"` : String(item.value)}
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(idx)}
                                title={language === 'vi' ? 'Sửa' : 'Edit'}
                                className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(idx)}
                                title={language === 'vi' ? 'Xóa' : 'Delete'}
                                className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minimal Status Note */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-2 font-mono font-medium text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${challengeCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={challengeCompleted ? 'text-emerald-400' : 'text-amber-400'}>
                {challengeCompleted
                  ? language === 'vi'
                    ? 'Đã quan sát: Phần tử bị thay đổi trực tiếp trong RAM'
                    : 'Observed: Element mutated directly in RAM'
                  : language === 'vi'
                  ? 'Thử thách: Thử chỉnh sửa hoặc xóa một phần tử ở giữa'
                  : 'Observation test: Try modifying an element in the middle'}
              </span>
            </div>
            <p className="text-zinc-400 text-xs">
              {language === 'vi'
                ? 'Trong Python List, bất kỳ ai có quyền truy cập bộ nhớ đều có thể ghi đè dữ liệu ở chỉ số bất kỳ mà không làm thay đổi các phần tử xung quanh hay tạo cảnh báo. Blockchain cần cơ chế mạnh hơn thế.'
                : 'In a standard array, memory slots can be overwritten without affecting neighbor elements or leaving tamper traces. Blockchain requires cryptographic sealing.'}
            </p>
          </div>

          {/* Add Element Toolbar */}
          <form
            onSubmit={handleAddItem}
            className="flex flex-wrap items-center gap-2 text-xs font-mono"
          >
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={strings.foundations.pythonList.valuePlaceholder}
              className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 focus:outline-none focus:border-zinc-500"
            />

            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as 'int' | 'float' | 'str' | 'bool')
              }
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 focus:outline-none focus:border-zinc-500"
            >
              <option value="str">str</option>
              <option value="int">int</option>
              <option value="float">float</option>
              <option value="bool">bool</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{strings.foundations.pythonList.addElement}</span>
            </button>
          </form>

          {/* Operation Preview */}
          <div className="p-2.5 bg-black/40 rounded-lg border border-zinc-800/80 font-mono text-xs text-zinc-400 flex items-center justify-between">
            <span className="text-zinc-500">{strings.foundations.pythonList.codePreview}:</span>
            <code className="text-zinc-200">{lastOperation}</code>
          </div>
        </div>
      )}

      {/* Mode 2: Real-World Example */}
      {viewMode === 'example' && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <div className="text-sm font-semibold text-zinc-100">
            {language === 'vi'
              ? 'Sổ tay thông thường vs. Sổ cái bất biến'
              : 'Scratchpad vs. Immutable Ledger'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-xs font-mono font-medium text-zinc-200 block">
                {language === 'vi' ? 'Python List = Tờ giấy nháp' : 'Python List = Scratchpad'}
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Dễ dàng tẩy xóa hoặc sửa đổi dòng bất kỳ mà người khác xem lại không thể biết được nội dung ban đầu là gì.'
                  : 'Like writing with pencil on paper: any entry can be erased or replaced without leaving a cryptographic trace.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-xs font-mono font-medium text-zinc-200 block">
                {language === 'vi' ? 'Blockchain = Sổ cái mật mã' : 'Blockchain = Cryptographic Ledger'}
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {language === 'vi'
                  ? 'Mỗi bản ghi được niêm phong bằng mã băm của bản ghi trước. Sửa 1 ký tự sẽ làm đứt gãy toàn bộ chuỗi.'
                  : 'Each record is cryptographically linked to the previous one. Modifying one record invalidates all subsequent links.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Python Code */}
      {viewMode === 'code' && (
        <div className="p-6 rounded-xl bg-[#090a0f] border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="font-medium text-zinc-300">
              {language === 'vi' ? 'Minh họa thao tác danh sách Python' : 'Python List Implementation'}
            </span>
            <span className="text-zinc-500">Python 3.12</span>
          </div>

          <CodeViewer
            code={`# 1. Khởi tạo danh sách các công đoạn
my_list = ["prepare", "roll", "assemble"]

# 2. Thay đổi phần tử ở giữa (Không có kiểm tra toàn vẹn)
my_list[1] = "tampered_data"  # "roll" bị thay thế trực tiếp

# 3. Thêm phần tử vào cuối
my_list.append("serve")

print(my_list)  # Output: ['prepare', 'tampered_data', 'assemble', 'serve']`}
            language="python"
            filename="python_list_demo.py"
            maxHeight="320px"
          />
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-mono text-zinc-500">
          {language === 'vi'
            ? 'Tiếp theo: Tìm hiểu cách Linked List kết nối các Node bằng con trỏ'
            : 'Next: Learn how Linked Lists connect Nodes using pointers'}
        </span>

        <button
          type="button"
          onClick={onNextStage}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>
            {language === 'vi'
              ? 'Tiếp tục sang Danh Sách Liên Kết'
              : 'Continue to Linked List'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
