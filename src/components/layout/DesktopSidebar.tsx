import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  CalendarDays,
  Inbox,
  Kanban,
  FileText,
  FileCheck2,
  Navigation,
  MessageSquareQuote,
  Bell,
  Settings,
  Sparkles,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, inbox, reminders, commuteRoutes, aiEnabled } = useApp();

  const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;
  const inboxCount = inbox.length;

  const groups: NavGroup[] = [
    {
      title: '工作流',
      items: [
        { id: 'today', label: '今日聚焦', icon: CalendarDays },
        { id: 'inbox', label: '临时收件箱', icon: Inbox, badge: inboxCount > 0 ? inboxCount : undefined },
        { id: 'tasks', label: '任务看板', icon: Kanban },
        { id: 'weekly', label: '周报生成', icon: FileText },
      ],
    },
    {
      title: '提效工具',
      items: [
        { id: 'meetings', label: '会议纪要转待办', icon: FileCheck2 },
        { id: 'commute', label: '通勤信息聚合', icon: Navigation, badge: commuteRoutes.length > 0 ? `${commuteRoutes.length}条` : undefined },
        { id: 'phrases', label: '沟通话术草稿', icon: MessageSquareQuote },
      ],
    },
    {
      title: '系统管理',
      items: [
        { id: 'reminders', label: '提醒中心', icon: Bell, badge: pendingRemindersCount > 0 ? pendingRemindersCount : undefined },
        { id: 'settings', label: '偏好设置', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-stone-200/60 bg-[#fbfaf8]/95 backdrop-blur-xl min-h-screen select-none z-20">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-stone-200/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-stone-100 flex items-center justify-center font-bold text-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)] border border-stone-700/50">
            V
          </div>
          <div>
            <div className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-1.5">
              <span>VibeDesk</span>
              <span className="text-[10px] font-mono text-stone-600 bg-stone-200/70 px-1 py-0.2 rounded font-normal">
                v0.2
              </span>
            </div>
            <p className="text-[10px] text-stone-600 truncate max-w-[130px]">
              个人敏捷工作台
            </p>
          </div>
        </div>
      </div>

      {/* Group Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold text-stone-600 tracking-wider mb-2">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full h-10 px-3 rounded-xl flex items-center justify-between text-xs font-medium transition-all group duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-stone-50 shadow-[0_2px_8px_-2px_rgba(28,25,23,0.3)] font-semibold'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 hover:translate-x-0.5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'text-stone-100'
                            : 'text-stone-400 group-hover:text-stone-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded font-mono tabular-nums transition-colors ${
                          isActive
                            ? 'bg-stone-800 text-stone-300'
                            : 'bg-stone-200/70 text-stone-600 group-hover:bg-stone-300/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI Mode State Footer Card */}
      <div className="p-3 border-t border-stone-200/50 shrink-0">
        <div className="p-3 rounded-xl bg-white/70 border border-stone-200/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-indigo-500 ring-4 ring-indigo-100 animate-pulse' : 'bg-stone-300'}`} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-stone-800 truncate">
                {aiEnabled ? 'Gemini 3.8 就绪' : '本地离线模式'}
              </div>
              <div className="text-[10px] text-stone-400 truncate">
                {aiEnabled ? '智能解析与草稿辅助' : '无依赖规则降级'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-stone-500 hover:text-stone-900 text-[10px] font-medium p-1 hover:bg-stone-100 rounded transition-colors"
            title="前往设置"
          >
            配置
          </button>
        </div>
      </div>
    </aside>
  );
};
