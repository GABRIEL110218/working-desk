import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  CheckCircle2,
  ListTodo,
  RotateCcw,
  Check,
} from 'lucide-react';

export const WeeklyReportView: React.FC = () => {
  const { tasks, showToast } = useApp();

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'todo');

  const [templateType, setTemplateType] = useState<'standard' | 'okr' | 'minimal'>('standard');
  const [blockers, setBlockers] = useState('各协同模块按既定计划迭代，暂无严重外部阻碍。');
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/ai/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks: completedTasks.map((t) => t.title),
          inProgressTasks: inProgressTasks.map((t) => `${t.title} (截止: ${t.dueDate}, 负责人: ${t.owner})`),
          blockers,
          templateType,
        }),
      });

      if (!res.ok) throw new Error('周报生成失败');

      const data = await res.json();
      setReportText(data.report || '');
      showToast('周报已生成完毕，可直接在线编辑', 'success');
    } catch (err) {
      console.error(err);
      // Fallback
      const fallback = `# 本周个人工作周报\n\n## 一、 本周重点交付\n${completedTasks.map((t) => `- [x] ${t.title}（${t.tags.join('/')}）`).join('\n') || '- 基础日常支撑'}\n\n## 二、 下周推进计划\n${inProgressTasks.map((t) => `- [ ] ${t.title}（预计交付: ${t.dueDate}）`).join('\n')}\n\n## 三、 风险与卡点\n- ${blockers}\n`;
      setReportText(fallback);
      showToast('已生成结构化周报模版', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!reportText.trim()) return;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      showToast('周报全文已复制到剪贴板', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动框选', 'warning');
    }
  };

  const handleDownload = () => {
    if (!reportText.trim()) return;
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VibeDesk_周报_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('已下载 Markdown 周报文件', 'success');
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200/60 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          周报智能生成
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          自动归集本周完成项与下周在办计划，提炼清晰有说服力的工作汇报
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Config Panel (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              汇报模板类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: '标准汇报' },
                { id: 'okr', label: 'OKR 导向' },
                { id: 'minimal', label: '极简清单' },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplateType(tpl.id as any)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    templateType === tpl.id
                      ? 'border-stone-900 bg-stone-900 text-stone-100 shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aggregated Stats Preview */}
          <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>本周已完成任务</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-stone-900">
                {completedTasks.length} 项
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-700">
              <span className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                <span>规划与推进中事项</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-stone-900">
                {inProgressTasks.length} 项
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              协同卡点与风险说明
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="列出跨部门依赖阻碍、资源短缺或需要领导协助事项..."
              rows={4}
              className="w-full p-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-11 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(28,25,23,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{loading ? '正在梳理与润色中...' : '一键生成周度汇报'}</span>
          </button>
        </div>

        {/* Right Editor Panel (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl shadow-xs flex flex-col min-h-[520px] overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between bg-stone-50/50">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              周报预览与实时编辑
            </h3>
            <span className="text-xs font-mono text-stone-400 tabular-nums">
              {reportText.length} 字
            </span>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {reportText ? (
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="周报草稿生成后可在此直接编辑润色..."
                rows={16}
                className="w-full flex-1 p-4 rounded-xl border border-stone-200/70 bg-stone-50/40 text-sm font-mono text-stone-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 resize-none min-h-[340px]"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center text-stone-400">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3 text-stone-400">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-stone-700">
                  本周周报尚未生成
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  点击左侧“一键生成周度汇报”，系统将自动依据当前看板数据生成汇报文本。
                </p>
                <button
                  onClick={handleGenerate}
                  className="mt-4 px-4 py-2 bg-stone-900 text-stone-100 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  立即生成
                </button>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-stone-200/60 bg-stone-50/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleGenerate}
              disabled={loading || !reportText}
              className="h-8 px-3 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-stone-400" />
              <span>重新润色</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={!reportText}
                className="h-9 px-3.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span>导出 .md</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!reportText}
                className={`h-9 px-5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-40 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已复制全文</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制全文</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
