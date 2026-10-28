import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActionItemCandidate, Priority } from '../types';
import { SAMPLE_MEETING_NOTE } from '../data/mockData';
import {
  Upload,
  Sparkles,
  FileText,
  CheckSquare,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  Inbox,
  ArrowRight,
  Check,
  Quote,
} from 'lucide-react';

export const MeetingNotesView: React.FC = () => {
  const { batchAddActionItems, aiEnabled, showToast } = useApp();

  const [meetingTitle, setMeetingTitle] = useState('Q4 核心版本落地与协同排期会');
  const [rawText, setRawText] = useState('');
  const [candidates, setCandidates] = useState<ActionItemCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceType, setSourceType] = useState<'gemini' | 'rule-fallback' | null>(null);

  // Handle file upload (.txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      showToast('仅支持上传 .txt 纯文本文件', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        setMeetingTitle(file.name.replace(/\.txt$/, ''));
        showToast(`已成功载入文件：“${file.name}”`, 'success');
      }
    };
    reader.readAsText(file);
  };

  // Populate sample meeting notes
  const handleFillSample = () => {
    setMeetingTitle('VibeDesk Q4 核心版本落地与协同排期会');
    setRawText(SAMPLE_MEETING_NOTE);
    showToast('已填入标准会议纪要示范文本', 'info');
  };

  // Parse action items
  const handleParse = async () => {
    if (!rawText.trim()) {
      showToast('请先粘贴或输入会议纪要文本', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, meetingTitle }),
      });

      if (!res.ok) {
        throw new Error(`服务器响应异常: ${res.status}`);
      }

      const data = await res.json();
      setCandidates(data.items || []);
      setSourceType(data.source || 'gemini');
      if (data.items?.length > 0) {
        showToast(`提取到 ${data.items.length} 项候选行动待办`, 'success');
      } else {
        showToast('未检测到明确动宾短语，可微调纪要后重试', 'info');
      }
    } catch (err: any) {
      console.error(err);
      showToast('解析失败，已自动降级为规则提炼', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle select candidate
  const toggleSelect = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  // Update candidate field
  const updateCandidate = (id: string, updates: Partial<ActionItemCandidate>) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Delete candidate
  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    showToast('已从候选列表中移除', 'info');
  };

  // Select all / Deselect all
  const allSelected = candidates.length > 0 && candidates.every((c) => c.selected);
  const handleToggleSelectAll = () => {
    const nextState = !allSelected;
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: nextState })));
  };

  // Discard selected
  const handleDiscardSelected = () => {
    setCandidates((prev) => prev.filter((c) => !c.selected));
    showToast('已丢弃所选候选待办', 'info');
  };

  // Batch add to Tasks
  const handleBatchToTasks = () => {
    batchAddActionItems(candidates, 'tasks');
    setCandidates((prev) => prev.filter((c) => !c.selected));
  };

  // Batch add to Inbox
  const handleBatchToInbox = () => {
    batchAddActionItems(candidates, 'inbox');
    setCandidates((prev) => prev.filter((c) => !c.selected));
  };

  const selectedCount = candidates.filter((c) => c.selected).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            会议纪要转待办
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            粘贴纪要原始文本，智能解析候选行动项，经人工校对后批量流转至看板或收件箱
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFillSample}
            type="button"
            className="h-9 px-3.5 rounded-xl border border-stone-200/80 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors cursor-pointer shadow-2xs"
          >
            填入示例纪要
          </button>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Input Panel (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              会议名称
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="例如：产品技术周度对齐会"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 transition-all text-stone-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                会议纪要原文
              </label>
              <span className="text-[11px] font-mono text-stone-400 tabular-nums">
                {rawText.length} 字
              </span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="直接粘贴会议记录、讨论决议或包含行动项的发言记录...（如包含负责人与交付时间，提炼更精准）"
              rows={13}
              className="w-full p-4 rounded-xl border border-stone-200/80 bg-white/70 text-sm leading-relaxed text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 transition-all resize-y min-h-[260px]"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={handleParse}
              disabled={loading || !rawText.trim()}
              className="flex-1 h-11 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(28,25,23,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{loading ? '正在提炼候选待办...' : '开始解析候选待办'}</span>
            </button>

            <label className="h-11 px-4 rounded-xl border border-stone-200/80 bg-white/70 hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>上传 .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>隐私保护：文本仅用于当前会话提取，默认不长期存储原文。</span>
          </div>
        </div>

        {/* Right Column: Candidate Results (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[560px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-stone-900">
                提炼候选行动项
              </h3>
              <span className="text-xs font-mono tabular-nums px-2.5 py-0.5 rounded-full bg-stone-200/70 text-stone-700 font-semibold">
                {candidates.length}
              </span>
            </div>

            {candidates.length > 0 && (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/60 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>AI 草稿，请校对</span>
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-6 flex-1 space-y-3.5 overflow-y-auto max-h-[640px]">
            {loading && (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-stone-200/60 bg-white/60 animate-pulse space-y-3"
                  >
                    <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                    <div className="flex gap-4">
                      <div className="h-3 bg-stone-200 rounded-md w-1/4" />
                      <div className="h-3 bg-stone-200 rounded-md w-1/4" />
                      <div className="h-3 bg-stone-200 rounded-md w-1/4" />
                    </div>
                    <div className="h-3 bg-stone-100 rounded-md w-5/6" />
                  </div>
                ))}
              </div>
            )}

            {!loading && candidates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-stone-400">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3 text-stone-400">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-stone-700">
                  粘贴纪要后点击“开始解析候选待办”
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  模型将智能识别人名、交付目标、时间点与责任边界，生成可交互的待办确认卡片。
                </p>
                <button
                  onClick={handleFillSample}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  载入示范纪要试一试
                </button>
              </div>
            )}

            {!loading &&
              candidates.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    item.selected
                      ? 'border-stone-300 bg-white shadow-2xs'
                      : 'border-stone-200/60 bg-stone-50/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="mt-1 w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
                    />

                    <div className="flex-1 space-y-2.5">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateCandidate(item.id, { title: e.target.value })}
                        placeholder="任务标题"
                        className="w-full text-sm font-semibold text-stone-900 border-b border-transparent hover:border-stone-300 focus:border-stone-900 focus:outline-hidden py-0.5 rounded transition-colors"
                      />

                      {/* Metadata Chips */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <div className="flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/50">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-stone-400">负责人:</span>
                          <input
                            type="text"
                            value={item.owner}
                            onChange={(e) => updateCandidate(item.id, { owner: e.target.value })}
                            className="w-20 bg-transparent text-stone-800 font-medium focus:outline-hidden"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/50">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-stone-400">截止:</span>
                          <input
                            type="date"
                            value={item.dueDate}
                            onChange={(e) => updateCandidate(item.id, { dueDate: e.target.value })}
                            className="bg-transparent text-stone-800 font-mono text-[11px] focus:outline-hidden"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/50">
                          <span className="text-stone-400">优先级:</span>
                          <select
                            value={item.priority}
                            onChange={(e) => updateCandidate(item.id, { priority: e.target.value as Priority })}
                            className="bg-transparent text-stone-800 font-medium focus:outline-hidden cursor-pointer"
                          >
                            <option value="高">高优 (P0)</option>
                            <option value="中">中优 (常规)</option>
                            <option value="低">低优</option>
                          </select>
                        </div>
                      </div>

                      {/* Source Sentence Snippet */}
                      {item.sourceSentence && (
                        <div className="text-[11px] text-stone-600 bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/40 flex items-start gap-1.5 leading-relaxed">
                          <Quote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                          <span>{item.sourceSentence}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteCandidate(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                      title="移除此项"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Floating Action Bar */}
          {candidates.length > 0 && (
            <div className="p-4 border-t border-stone-200/60 bg-stone-50/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900"
                  />
                  <span>全选</span>
                </label>
                <span className="text-xs text-stone-400">
                  已勾选 <strong className="font-mono tabular-nums text-stone-900">{selectedCount}</strong> / {candidates.length} 项
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscardSelected}
                  disabled={selectedCount === 0}
                  className="h-9 px-3 text-xs font-medium text-stone-500 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                >
                  丢弃所选
                </button>
                <button
                  onClick={handleBatchToInbox}
                  disabled={selectedCount === 0}
                  className="h-9 px-3.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Inbox className="w-3.5 h-3.5 text-stone-500" />
                  <span>加入收件箱</span>
                </button>
                <button
                  onClick={handleBatchToTasks}
                  disabled={selectedCount === 0}
                  className="h-9 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold transition-colors shadow-xs disabled:opacity-40 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>批量加入任务看板</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
