import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Plus,
  Navigation,
  ExternalLink,
  Clock,
  Sparkles,
  FileCheck2,
  MessageSquareQuote,
  Calendar,
  Train,
  Bus,
  Car,
  Bike,
  Footprints,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CommuteMode } from '../types';

export const TodayView: React.FC<{ onOpenQuickCreate: () => void }> = ({ onOpenQuickCreate }) => {
  const {
    tasks,
    updateTask,
    addTask,
    commuteRoutes,
    reminders,
    toggleReminder,
    setActiveTab,
    playChimeSound,
    showToast,
  } = useApp();

  const [quickInput, setQuickInput] = useState('');

  // Default commute route
  const defaultRoute = commuteRoutes.find((r) => r.isDefault) || commuteRoutes[0];

  // Today's tasks (active tasks or completed today)
  const todayTasks = tasks.filter((t) => t.status !== 'done');
  const completedTasks = tasks.filter((t) => t.status === 'done');
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Active reminders
  const activeReminders = reminders.filter((r) => !r.isCompleted);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    addTask({
      title: quickInput.trim(),
      status: 'todo',
      priority: '中',
      dueDate: new Date().toISOString().slice(0, 10),
      owner: '我',
      tags: ['今日聚焦'],
      source: '今日快捷输入',
    });

    setQuickInput('');
  };

  const handleCompleteTask = (id: string) => {
    playChimeSound();
    updateTask(id, { status: 'done' });
    showToast('任务已标记为完成，状态已同步', 'success');
  };

  const getModeIcon = (mode: CommuteMode) => {
    switch (mode) {
      case 'subway':
        return <Train className="w-4 h-4 text-indigo-600" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-sky-600" />;
      case 'drive':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'bike':
        return <Bike className="w-4 h-4 text-amber-600" />;
      case 'walk':
        return <Footprints className="w-4 h-4 text-stone-600" />;
      default:
        return <Navigation className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Visual Atmospheric Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-200/50">
        {/* Background Image with warm gradient scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/workspace_ambient_card_1793175591615.jpg"
            alt="Workspace atmosphere"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/75 to-stone-900/40" />
        </div>

        {/* Content over hero banner */}
        <div className="relative z-10 p-7 md:p-9 text-stone-100 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-widest">
              <span>TODAY'S COCKPIT</span>
              <span className="text-stone-500">·</span>
              <span className="font-mono text-stone-300">
                {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
              保持专注，推进核心价值落地
            </h2>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
              共规划 {tasks.length} 项关键事项 · 已交付 {completedTasks.length} 项 · 还有 {todayTasks.length} 项正在有条不紊推进
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-stone-950/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-full md:w-64 space-y-2.5 shrink-0 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>整体完成度</span>
              </span>
              <span className="font-mono font-bold text-white text-sm tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Tasks Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Fluid Quick Input Bar */}
          <form
            onSubmit={handleQuickAdd}
            className="glass-panel p-2 rounded-2xl flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-stone-400/30 focus-within:border-stone-400"
          >
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="输入今日待办事项，按回车立即归档聚焦..."
              className="flex-1 h-11 px-4 text-sm bg-transparent focus:outline-hidden placeholder:text-stone-400 text-stone-800"
            />
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-stone-400 px-2 py-1 rounded bg-stone-100/60 border border-stone-200/50">
              <span>Enter ⏎</span>
            </div>
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="h-10 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] shrink-0"
            >
              <Plus className="w-4 h-4 text-stone-300" />
              <span>添加</span>
            </button>
          </form>

          {/* Today Tasks List Panel */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200/60 flex items-center justify-between bg-stone-50/40">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-stone-900">
                  今日待办事项
                </h3>
                <span className="font-mono text-xs tabular-nums text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-full font-medium">
                  {todayTasks.length} 项进行中
                </span>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <span>看板完整视图</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="divide-y divide-stone-100/80">
              {todayTasks.length === 0 ? (
                <div className="py-16 text-center text-stone-400 text-xs space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-stone-600 text-sm">今日待办事项已全部完成！</p>
                  <p className="text-stone-400 text-xs">享受轻松时刻，或随时从收件箱规划新任务。</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 md:p-5 hover:bg-stone-50/80 transition-all duration-150 flex items-start gap-3.5 group cursor-pointer"
                  >
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="mt-0.5 text-stone-300 hover:text-emerald-600 transition-colors shrink-0 group-hover:scale-110"
                      title="点击完成任务"
                    >
                      <Circle className="w-4 h-4 stroke-[1.8]" />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-stone-900 group-hover:text-stone-950 transition-colors truncate">
                          {task.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border ${
                            task.priority === '高'
                              ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                              : task.priority === '中'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-stone-100 text-stone-600 border-stone-200/60'
                          }`}
                        >
                          {task.priority}优
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-stone-500 truncate leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1 font-mono tabular-nums">
                        <span className="flex items-center gap-1 text-stone-500">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {task.dueDate}
                        </span>
                        <span>·</span>
                        <span>负责人: {task.owner}</span>
                        {task.tags.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-stone-500">#{task.tags[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Commute Card & Quick Tools (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Commute Embedded Card with Transit Map Preview */}
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xs space-y-3">
            <div className="p-5 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  通勤路线感知
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('commute')}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 underline transition-colors cursor-pointer"
              >
                配置路线
              </button>
            </div>

            {defaultRoute ? (
              <div className="p-5 pt-1 space-y-3.5">
                {/* Visual Transit Timeline */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100/70 border border-stone-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-stone-200/50">
                        {getModeIcon(defaultRoute.mode)}
                      </div>
                      <span className="text-xs font-bold text-stone-900 truncate max-w-[130px]">
                        {defaultRoute.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-xl font-bold font-mono text-stone-900 tabular-nums">
                          {defaultRoute.durationMin}
                        </span>
                        <span className="text-xs text-stone-500">分钟</span>
                      </div>
                    </div>
                  </div>

                  {/* Route points line */}
                  <div className="relative flex items-center justify-between text-[11px] text-stone-600 pt-1">
                    <div className="flex items-center gap-1.5 z-10 bg-white/90 px-2 py-0.5 rounded-full border border-stone-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="truncate max-w-[85px]">{defaultRoute.start}</span>
                    </div>
                    <div className="flex-1 mx-2 border-t border-dashed border-stone-300" />
                    <div className="flex items-center gap-1.5 z-10 bg-white/90 px-2 py-0.5 rounded-full border border-stone-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="truncate max-w-[85px]">{defaultRoute.end}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span className="font-mono">常规出发 {defaultRoute.departTime}</span>
                    {defaultRoute.externalUrl && (
                      <a
                        href={defaultRoute.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-700 hover:text-stone-950 flex items-center gap-1 font-medium transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                        <span>地图导航</span>
                      </a>
                    )}
                  </div>
                </div>

                {defaultRoute.note && (
                  <p className="text-[11px] text-stone-500 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/40 leading-relaxed">
                    💡 {defaultRoute.note}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-stone-400">
                暂未配置常用通勤路线
              </div>
            )}
          </div>

          {/* Quick Efficiency Tools Launchers */}
          <div className="glass-panel p-5 rounded-2xl shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              高频提效入口
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('meetings')}
                className="p-3.5 rounded-xl border border-stone-200/70 bg-white/70 hover:bg-stone-900 hover:text-white transition-all text-left space-y-2 group cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 group-hover:text-white">
                    纪要转待办
                  </div>
                  <div className="text-[10px] text-stone-400 group-hover:text-stone-300">
                    智能提取行动项
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('phrases')}
                className="p-3.5 rounded-xl border border-stone-200/70 bg-white/70 hover:bg-stone-900 hover:text-white transition-all text-left space-y-2 group cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 group-hover:text-white">
                    沟通话术
                  </div>
                  <div className="text-[10px] text-stone-400 group-hover:text-stone-300">
                    催进度与得体回复
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Schedule Reminders Widget */}
          <div className="glass-panel p-5 rounded-2xl shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                待办日程预警
              </h3>
              <button
                onClick={() => setActiveTab('reminders')}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 underline cursor-pointer"
              >
                提醒中心
              </button>
            </div>

            <div className="space-y-2">
              {activeReminders.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-stone-200/60 text-xs hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleReminder(r.id)}
                      className="text-stone-300 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      <Circle className="w-3.5 h-3.5 stroke-[1.8]" />
                    </button>
                    <span className="truncate text-stone-800 font-medium">{r.title}</span>
                  </div>
                  <span className="font-mono text-[11px] text-stone-500 font-semibold shrink-0 bg-stone-100 px-2 py-0.5 rounded-full">
                    {r.time}
                  </span>
                </div>
              ))}
              {activeReminders.length === 0 && (
                <p className="text-xs text-stone-400 py-3 text-center">
                  暂无未处理的即时提醒
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
