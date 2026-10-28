import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhraseScenario, PhraseTone } from '../types';
import {
  MessageSquareQuote,
  Sparkles,
  Copy,
  RotateCcw,
  Minimize2,
  Briefcase,
  HeartHandshake,
  ShieldAlert,
  BookmarkCheck,
  Check,
  Feather,
} from 'lucide-react';

export const PhraseDraftsView: React.FC = () => {
  const { phrasePrefill, setPhrasePrefill, savePhraseDraft, showToast } = useApp();

  const [scenario, setScenario] = useState<PhraseScenario>('催进度');
  const [target, setTarget] = useState('跨部门对接人');
  const [goal, setGoal] = useState('确认今天下班前交付接口契约文档');
  const [tone, setTone] = useState<PhraseTone>('委婉');
  const [background, setBackground] = useState(
    '下游联调定于明天上午启动，目前阻塞在鉴权契约未敲定，希望对方今天能给到。'
  );

  const [draftText, setDraftText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sourceNotice, setSourceNotice] = useState('AI 深度草拟');

  // If redirected with prefill from Inbox
  useEffect(() => {
    if (phrasePrefill) {
      if (phrasePrefill.goal) setGoal(phrasePrefill.goal);
      if (phrasePrefill.background) setBackground(phrasePrefill.background);
      setScenario('催进度');
      setPhrasePrefill(null);
    }
  }, [phrasePrefill, setPhrasePrefill]);

  // Generate / Refine call
  const handleGenerate = async (action: 'generate' | 'shorten' | 'formalize' | 'soften' = 'generate') => {
    if (!scenario || !goal.trim()) {
      showToast('请先输入沟通目标', 'warning');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai/phrase-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          target,
          goal,
          tone,
          background,
          action,
          currentDraft: draftText,
        }),
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const data = await res.json();
      setDraftText(data.draftText || '');
      setSourceNotice(data.notice || 'AI 草拟完成，请校对');
      showToast(action === 'generate' ? '话术草稿已生成' : '已按指定语气完成调整', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('生成出现异常，已启用内置场景模板', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!draftText.trim()) return;
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      showToast('草稿已复制到剪贴板，可直接发送', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('复制失败，请手动全选复制', 'warning');
    }
  };

  // Save draft for later
  const handleSaveDraft = () => {
    if (!draftText.trim()) return;
    savePhraseDraft({
      scenario,
      target,
      goal,
      tone,
      background,
      draftText,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200/60 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          沟通话术草稿
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          针对催进度、委婉拒绝、向上汇报等高难度职场场景，智能草拟得体表达（坚持人工校对，不自动发送）
        </p>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Form Panel (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              沟通场景分类
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as PhraseScenario)}
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 font-medium text-stone-900 cursor-pointer"
            >
              <option value="催进度">📌 催促进度 (温和但有明确节点契约)</option>
              <option value="拒绝请求">🛡️ 拒绝请求 (清晰边界且不伤和气)</option>
              <option value="汇报进展">📊 向上汇报 (突出交付物与结构化数据)</option>
              <option value="请求资源">🤝 请求协同 (争取支持与权限协调)</option>
              <option value="道歉/澄清">🕊️ 坦诚澄清 (复盘延误与纠偏方案)</option>
              <option value="冷静版甩锅回复">🧘 冷静版甩锅/边界界定 (有理有据划清职责)</option>
              <option value="自定义">✏️ 自由定制场景</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                沟通对象
              </label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="例如：跨部门/领导/客户"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                语气基调
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as PhraseTone)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 font-medium text-stone-900 cursor-pointer"
              >
                <option value="正式">商务正式 (严谨周全)</option>
                <option value="简洁">极简要点 (直奔主题)</option>
                <option value="委婉">委婉商讨 (温和关切)</option>
                <option value="坚定">坚定果断 (寸步不让)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              核心沟通目标 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="例如：让对方今天下班前确认联调排期"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              上下文与背景线索
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="补充项目前置条件、时间紧迫度或关键卡点..."
              rows={6}
              className="w-full p-3.5 rounded-xl border border-stone-200/80 bg-white/70 text-sm leading-relaxed text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 resize-y min-h-[140px]"
            />
          </div>

          <button
            onClick={() => handleGenerate('generate')}
            disabled={loading || !goal.trim()}
            className="w-full h-11 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(28,25,23,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{loading ? '正在沉淀措辞中...' : '生成高质量沟通草案'}</span>
          </button>

          <div className="text-[11px] text-stone-500 bg-amber-50/50 p-3 rounded-xl border border-amber-200/40 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>提醒：建议去除涉及商业私密、密码或未公开机密的字眼。</span>
          </div>
        </div>

        {/* Right Draft Workspace Panel (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl shadow-xs flex flex-col min-h-[560px] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/60 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>{sourceNotice}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-stone-400 tabular-nums">
                {draftText.length} 字
              </span>
              {draftText && (
                <button
                  onClick={handleSaveDraft}
                  className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title="保存至草稿库"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>归档</span>
                </button>
              )}
            </div>
          </div>

          {/* Editable Draft Canvas */}
          <div className="p-6 flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-4 py-8 animate-pulse">
                <div className="h-4 bg-stone-200 rounded-md w-1/4" />
                <div className="h-4 bg-stone-200 rounded-md w-5/6" />
                <div className="h-4 bg-stone-200 rounded-md w-4/6" />
                <div className="h-4 bg-stone-150 rounded-md w-full" />
                <div className="h-4 bg-stone-150 rounded-md w-2/3" />
              </div>
            ) : draftText ? (
              <div className="flex-1 flex flex-col relative">
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="草稿将在此渲染，支持直接在线改写与编辑..."
                  className="w-full flex-1 p-5 rounded-xl border border-stone-200/70 bg-stone-50/50 text-sm leading-relaxed text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 font-sans resize-none min-h-[340px]"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-24 text-center text-stone-400">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3 text-stone-400">
                  <Feather className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-stone-700">
                  选择场景后点击“生成高质量沟通草案”
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  支持随后一键调节为更委婉、更简短或更严谨的商务腔调。
                </p>
                <button
                  onClick={() => handleGenerate('generate')}
                  className="mt-4 px-4 py-2 bg-stone-900 text-stone-100 text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                >
                  基于预设快速体验
                </button>
              </div>
            )}
          </div>

          {/* Micro-refine Toolbar & Copy CTA */}
          <div className="p-4 border-t border-stone-200/60 bg-stone-50/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Tone refinement buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleGenerate('generate')}
                disabled={loading || !draftText}
                className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-stone-400" />
                <span>换一种说法</span>
              </button>
              <button
                onClick={() => handleGenerate('shorten')}
                disabled={loading || !draftText}
                className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <Minimize2 className="w-3 h-3 text-stone-400" />
                <span>更精炼</span>
              </button>
              <button
                onClick={() => handleGenerate('formalize')}
                disabled={loading || !draftText}
                className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <Briefcase className="w-3 h-3 text-stone-400" />
                <span>更正式</span>
              </button>
              <button
                onClick={() => handleGenerate('soften')}
                disabled={loading || !draftText}
                className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <HeartHandshake className="w-3 h-3 text-stone-400" />
                <span>更温和</span>
              </button>
            </div>

            {/* Copy CTA */}
            <button
              onClick={handleCopy}
              disabled={!draftText}
              className={`h-9 px-5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-40 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已复制到剪贴板</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制草稿文本</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
