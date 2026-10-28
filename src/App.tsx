import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { HeaderBar } from './components/layout/HeaderBar';
import { ToastContainer } from './components/common/ToastContainer';
import { TaskEditModal } from './components/modals/TaskEditModal';

// Views
import { TodayView } from './views/TodayView';
import { InboxView } from './views/InboxView';
import { TaskBoardView } from './views/TaskBoardView';
import { WeeklyReportView } from './views/WeeklyReportView';
import { MeetingNotesView } from './views/MeetingNotesView';
import { CommuteView } from './views/CommuteView';
import { PhraseDraftsView } from './views/PhraseDraftsView';
import { ToolsAggregateView } from './views/ToolsAggregateView';
import { RemindersView } from './views/RemindersView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, addTask } = useApp();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'today':
        return <TodayView onOpenQuickCreate={() => setIsQuickCreateOpen(true)} />;
      case 'inbox':
        return <InboxView />;
      case 'tasks':
        return <TaskBoardView />;
      case 'weekly':
        return <WeeklyReportView />;
      case 'meetings':
        return <MeetingNotesView />;
      case 'commute':
        return <CommuteView />;
      case 'phrases':
        return <PhraseDraftsView />;
      case 'tools':
        return <ToolsAggregateView />;
      case 'reminders':
        return <RemindersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView onOpenQuickCreate={() => setIsQuickCreateOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800 font-sans">
      {/* 240px Grouped Desktop Left Navigation */}
      <DesktopSidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <HeaderBar onOpenQuickCreate={() => setIsQuickCreateOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile 5-Tab Bottom Bar */}
      <MobileNavigation />

      {/* Quick Task Creation Modal */}
      <TaskEditModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSave={addTask}
        modalTitle="新建工作台任务"
      />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
