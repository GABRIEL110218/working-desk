import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { CalendarDays, Inbox, Kanban, Wrench, Settings } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { activeTab, setActiveTab, inbox } = useApp();

  const isToolsActive =
    activeTab === 'tools' ||
    activeTab === 'meetings' ||
    activeTab === 'commute' ||
    activeTab === 'phrases' ||
    activeTab === 'weekly' ||
    activeTab === 'reminders';

  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'today', label: '今日', icon: CalendarDays },
    { id: 'inbox', label: '收件箱', icon: Inbox, badge: inbox.length > 0 ? inbox.length : undefined },
    { id: 'tasks', label: '任务', icon: Kanban },
    { id: 'tools', label: '工具', icon: Wrench },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbfaf8]/95 backdrop-blur-xl border-t border-stone-200/60 h-16 flex items-center justify-around px-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === 'tools' ? isToolsActive : activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 transition-all relative cursor-pointer ${
              isActive ? 'text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-stone-900 text-stone-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
