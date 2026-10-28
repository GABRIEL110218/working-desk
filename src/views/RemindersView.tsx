import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Priority, ReminderItem } from '../types';
import {
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Volume2,
  Trash2,
  Calendar,
} from 'lucide-react';

export const RemindersView: React.FC = () => {
  const {
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    playChimeSound,
    showToast,
  } = useApp();

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const [priority, setPriority] = useState<Priority>('中');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReminder(title.trim(), time, priority);
    setTitle('');
  };

  const handleSnooze = (item: ReminderItem, minutes: number) => {
    const [h, m] = item.time.split(':').map(Number);
    const date = new Date();
    date.setHours(h || 12, (m || 0) + minutes);
    const newTime = `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;

    deleteReminder(item.id);
    addReminder(item.title, newTime, item.priority);
    showToast(`已推迟提醒至 ${newTime}`, 'info');
  };

  const activeReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            提醒中心
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            重要时间节点预警与即时备忘，支持平滑提示音效与延期顺延
          </p>
        </div>

        <button
          onClick={playChimeSound}
          className="h-10 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors flex items-center gap-2 shadow-2xs self-start sm:self-auto cursor-pointer active:scale-[0.98]"
        >
          <Volume2 className="w-4 h-4 text-indigo-600" />
          <span>试听提醒音效</span>
        </button>
      </div>

      {/* Add Reminder Card */}
      <form
        onSubmit={handleAdd}
        className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 shadow-xs"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：15:00 参加外部接口联调对齐会..."
          className="flex-1 h-11 px-4 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 w-full sm:w-auto"
        />

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900 cursor-pointer font-medium"
          >
            <option value="高">高优</option>
            <option value="中">中优</option>
            <option value="低">低优</option>
          </select>

          <button
            type="submit"
            disabled={!title.trim()}
            className="h-11 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>添加</span>
          </button>
        </div>
      </form>

      {/* Active Reminders */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
          <span>待提醒事项</span>
          <span className="font-mono tabular-nums text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded-full font-bold">
            {activeReminders.length}
          </span>
        </h3>

        {activeReminders.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl text-xs text-stone-400">
            暂无未处理的日程提醒，今日节奏轻快从容
          </div>
        ) : (
          activeReminders.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4.5 rounded-2xl flex items-center justify-between gap-4 hover:border-stone-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => toggleReminder(item.id)}
                  className="text-stone-300 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                  title="标记为完成"
                >
                  <Circle className="w-5 h-5 stroke-[1.8]" />
                </button>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-sm font-semibold text-stone-900 truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-mono text-stone-800 font-bold flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {item.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-semibold border ${
                        item.priority === '高'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                          : 'bg-stone-100 text-stone-600 border-stone-200/60'
                      }`}
                    >
                      {item.priority}优
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSnooze(item, 15)}
                  className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-medium text-stone-600 transition-colors cursor-pointer"
                >
                  +15分
                </button>
                <button
                  onClick={() => handleSnooze(item, 60)}
                  className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-medium text-stone-600 transition-colors cursor-pointer"
                >
                  +1小时
                </button>
                <button
                  onClick={() => deleteReminder(item.id)}
                  className="h-8 px-2.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="删除提醒"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="space-y-3 pt-5 border-t border-stone-200/60">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            已完成提醒 ({completedReminders.length})
          </h3>

          <div className="space-y-2 opacity-60">
            {completedReminders.map((item) => (
              <div
                key={item.id}
                className="bg-white/60 rounded-xl border border-stone-200 p-3.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 line-through text-stone-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-stone-500">{item.title}</span>
                  <span className="font-mono text-[11px]">({item.time})</span>
                </div>
                <button
                  onClick={() => deleteReminder(item.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
