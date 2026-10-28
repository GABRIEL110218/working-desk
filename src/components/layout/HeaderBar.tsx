import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, CheckSquare, Sparkles, Clock } from 'lucide-react';

export const HeaderBar: React.FC<{ onOpenQuickCreate: () => void }> = ({ onOpenQuickCreate }) => {
  const { activeTab, tasks, aiEnabled } = useApp();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'today':
        return { group: '工作流', current: '今日聚焦' };
      case 'inbox':
        return { group: '工作流', current: '临时收件箱' };
      case 'tasks':
        return { group: '工作流', current: '任务看板' };
      case 'weekly':
        return { group: '工作流', current: '周报生成' };
      case 'meetings':
        return { group: '提效工具', current: '会议纪要转待办' };
      case 'commute':
        return { group: '提效工具', current: '通勤信息聚合' };
      case 'phrases':
        return { group: '提效工具', current: '沟通话术草稿' };
      case 'tools':
        return { group: '系统管理', current: '工具聚合箱' };
      case 'reminders':
        return { group: '系统管理', current: '提醒中心' };
      case 'settings':
        return { group: '系统管理', current: '偏好设置' };
      default:
        return { group: '工作台', current: '概览' };
    }
  };

  const breadcrumb = getBreadcrumb();
  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;

  const todayStr = new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date());

  return (
    <header className="h-16 border-b border-stone-200/50 bg-[#fbfaf8]/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Zone 1: Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500 whitespace-nowrap min-w-0">
        <span className="font-medium text-stone-600">{breadcrumb.group}</span>
        <span className="text-stone-300" aria-hidden="true">/</span>
        <h1 className="font-semibold text-stone-900 text-sm tracking-tight truncate">
          {breadcrumb.current}
        </h1>
      </div>

      {/* Zone 2: Date & Status Telemetry */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-stone-500 font-mono tabular-nums">
        <div className="flex items-center gap-1.5 text-stone-600 bg-stone-100/70 px-2.5 py-1 rounded-full border border-stone-200/40">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{todayStr}</span>
        </div>
        <span className="text-stone-300" aria-hidden="true">·</span>
        <div className="flex items-center gap-1.5 text-stone-600">
          <CheckSquare className="w-3.5 h-3.5 text-stone-400" />
          <span>
            <strong className="text-stone-900 font-semibold">{pendingTasksCount}</strong> 项在办
          </span>
        </div>
        {aiEnabled && (
          <>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50/70 px-2.5 py-0.5 rounded-full border border-indigo-100/60 font-sans">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span className="text-[11px] font-medium">Gemini 增强中</span>
            </div>
          </>
        )}
      </div>

      {/* Zone 3: Primary Quick Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenQuickCreate}
          className="h-9 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(28,25,23,0.3)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-stone-300" />
          <span>新建任务</span>
        </button>
      </div>
    </header>
  );
};
