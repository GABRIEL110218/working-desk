import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InboxItem, TaskItem } from '../types';
import { TaskEditModal } from '../components/modals/TaskEditModal';
import {
  Inbox,
  Plus,
  FileCheck2,
  ArrowRight,
  MessageSquareQuote,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const InboxView: React.FC = () => {
  const {
    inbox,
    addInboxItem,
    deleteInboxItem,
    convertInboxToTask,
    setActiveTab,
    setPhrasePrefill,
    showToast,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [convertingItem, setConvertingItem] = useState<InboxItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    addInboxItem(inputVal.trim(), '快速输入');
    setInputVal('');
  };

  const handleStartConvert = (item: InboxItem) => {
    setConvertingItem(item);
    setIsTaskModalOpen(true);
  };

  const handleSaveConvertedTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    if (!convertingItem) return;
    convertInboxToTask(convertingItem.id, taskData);
    setConvertingItem(null);
  };

  const handleGeneratePhraseFromItem = (item: InboxItem) => {
    setPhrasePrefill({
      goal: item.content.slice(0, 40),
      background: item.content,
    });
    setActiveTab('phrases');
    showToast('已自动填入沟通话术草稿', 'info');
  };

  const filteredItems = inbox.filter((item) => {
    if (sourceFilter === 'all') return true;
    return item.source === sourceFilter;
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            临时收件箱
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            快速捕获脑海中的碎片灵感、临时待办与未决事项，随后一键转化为看板任务或沟通文案
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('meetings')}
            className="h-10 px-4 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>从纪要导入</span>
          </button>
        </div>
      </div>

      {/* Quick Input Bar */}
      <form
        onSubmit={handleCapture}
        className="glass-panel p-2 rounded-2xl flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-stone-400/30 focus-within:border-stone-400"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="随手记下一句话灵感或紧急留言，按回车立即存入收件箱..."
          className="flex-1 h-11 px-4 text-sm bg-transparent focus:outline-hidden placeholder:text-stone-400 text-stone-800"
          autoFocus
        />
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-stone-400 px-2 py-1 rounded bg-stone-100/60 border border-stone-200/50">
          <span>Enter ⏎</span>
        </div>
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="h-10 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4 text-stone-300" />
          <span>存入收件箱</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl text-xs font-medium text-stone-600 border border-stone-200/50">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              sourceFilter === 'all'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            全部 ({inbox.length})
          </button>
          <button
            onClick={() => setSourceFilter('快速输入')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              sourceFilter === '快速输入'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            快速输入
          </button>
          <button
            onClick={() => setSourceFilter('会议')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              sourceFilter === '会议'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            会议导入
          </button>
          <button
            onClick={() => setSourceFilter('沟通')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              sourceFilter === '沟通'
                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            沟通相关
          </button>
        </div>

        <span className="text-xs text-stone-400 font-mono tabular-nums">
          共 {filteredItems.length} 条备忘
        </span>
      </div>

      {/* Inbox Items List */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center glass-panel rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-800">临时收件箱已清空</p>
            <p className="text-xs text-stone-400 mt-1">
              通过上方输入框随时记录，或者从会议纪要批量拆分待办暂存至此处。
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl p-5 hover:border-stone-300 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      item.source === '会议'
                        ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                        : item.source === '沟通'
                        ? 'bg-sky-50 text-sky-700 border-sky-200/60'
                        : 'bg-stone-100 text-stone-600 border-stone-200/60'
                    }`}
                  >
                    {item.source}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400 tabular-nums">
                    {new Date(item.createdAt).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm font-medium text-stone-900 leading-normal">
                  {item.content}
                </p>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <button
                  onClick={() => handleGeneratePhraseFromItem(item)}
                  className="h-8 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="以此为目标起草沟通话术"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-sky-600" />
                  <span>生成话术</span>
                </button>

                <button
                  onClick={() => handleStartConvert(item)}
                  className="h-8 px-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-[0.98]"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span>转为任务</span>
                </button>

                <button
                  onClick={() => deleteInboxItem(item.id)}
                  className="h-8 px-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {convertingItem && (
        <TaskEditModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setConvertingItem(null);
          }}
          onSave={handleSaveConvertedTask}
          modalTitle="收件箱转任务"
          initialTask={{
            title: convertingItem.content.slice(0, 50),
            description: convertingItem.content,
            tags: [convertingItem.source || '收件箱'],
            priority: '中',
          }}
        />
      )}
    </div>
  );
};
