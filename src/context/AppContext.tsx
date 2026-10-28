import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TaskItem,
  InboxItem,
  CommuteRoute,
  PhraseDraft,
  ReminderItem,
  NavigationTab,
  ActionItemCandidate,
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_INBOX,
  INITIAL_COMMUTE_ROUTES,
  INITIAL_REMINDERS,
} from '../data/mockData';

interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Tasks
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;

  // Inbox
  inbox: InboxItem[];
  addInboxItem: (content: string, source?: InboxItem['source']) => string;
  deleteInboxItem: (id: string) => void;
  convertInboxToTask: (inboxId: string, taskData: Partial<TaskItem>) => void;

  // Commute
  commuteRoutes: CommuteRoute[];
  saveCommuteRoute: (route: Omit<CommuteRoute, 'id'>, id?: string) => boolean;
  deleteCommuteRoute: (id: string) => void;
  setDefaultCommuteRoute: (id: string) => void;

  // Meeting Notes Candidates -> Tasks/Inbox
  batchAddActionItems: (items: ActionItemCandidate[], destination: 'tasks' | 'inbox') => void;

  // Phrase generator helper
  phrasePrefill: { goal?: string; background?: string } | null;
  setPhrasePrefill: (data: { goal?: string; background?: string } | null) => void;
  phraseDrafts: PhraseDraft[];
  savePhraseDraft: (draft: Omit<PhraseDraft, 'id' | 'createdAt'>) => void;

  // Reminders
  reminders: ReminderItem[];
  addReminder: (title: string, time: string, priority: ReminderItem['priority']) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  playChimeSound: () => void;

  // AI & System
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  serverAiAvailable: boolean | null;
  checkServerAiStatus: () => Promise<void>;

  // Toast
  toasts: ToastState[];
  showToast: (message: string, type?: ToastState['type']) => void;
  removeToast: (id: string) => void;

  // Data management
  resetToMockData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_PREFIX = 'vibedesk_v02_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('today');

  // Load from localStorage or mock
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [inbox, setInbox] = useState<InboxItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}inbox`);
      return saved ? JSON.parse(saved) : INITIAL_INBOX;
    } catch {
      return INITIAL_INBOX;
    }
  });

  const [commuteRoutes, setCommuteRoutes] = useState<CommuteRoute[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}commute`);
      return saved ? JSON.parse(saved) : INITIAL_COMMUTE_ROUTES;
    } catch {
      return INITIAL_COMMUTE_ROUTES;
    }
  });

  const [phraseDrafts, setPhraseDrafts] = useState<PhraseDraft[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}phraseDrafts`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}reminders`);
      return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [aiEnabled, setAiEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}ai_enabled`);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [serverAiAvailable, setServerAiAvailable] = useState<boolean | null>(null);
  const [phrasePrefill, setPhrasePrefill] = useState<{ goal?: string; background?: string } | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Check AI health on mount
  const checkServerAiStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setServerAiAvailable(data.aiConfigured);
      } else {
        setServerAiAvailable(false);
      }
    } catch {
      setServerAiAvailable(false);
    }
  };

  useEffect(() => {
    checkServerAiStatus();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}inbox`, JSON.stringify(inbox));
  }, [inbox]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}commute`, JSON.stringify(commuteRoutes));
  }, [commuteRoutes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}phraseDrafts`, JSON.stringify(phraseDrafts));
  }, [phraseDrafts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reminders`, JSON.stringify(reminders));
  }, [reminders]);

  const setAiEnabled = (enabled: boolean) => {
    setAiEnabledState(enabled);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}ai_enabled`, JSON.stringify(enabled));
    showToast(enabled ? '已开启 AI 智能辅助模式' : '已切换为本地轻量规则/模板模式', 'info');
  };

  // Toast Helpers
  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Chime sound via Web Audio API (smooth synthetic chord)
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now); // A4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch {
      // Audio playback non-blocking
    }
  };

  // Task Actions
  const addTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>): string => {
    const id = `task-${Date.now()}`;
    const newTask: TaskItem = {
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`已创建任务：“${newTask.title.slice(0, 18)}...”`, 'success');
    return id;
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('任务已删除', 'info');
  };

  // Inbox Actions
  const addInboxItem = (content: string, source: InboxItem['source'] = '快速输入'): string => {
    const id = `inbox-${Date.now()}`;
    const newItem: InboxItem = {
      id,
      content,
      source,
      createdAt: new Date().toISOString(),
    };
    setInbox((prev) => [newItem, ...prev]);
    showToast('已录入收件箱', 'success');
    return id;
  };

  const deleteInboxItem = (id: string) => {
    setInbox((prev) => prev.filter((i) => i.id !== id));
    showToast('收件箱条目已移除', 'info');
  };

  const convertInboxToTask = (inboxId: string, taskData: Partial<TaskItem>) => {
    const item = inbox.find((i) => i.id === inboxId);
    if (!item) return;

    const newTaskId = addTask({
      title: taskData.title || item.content.slice(0, 60),
      description: taskData.description || item.content,
      status: taskData.status || 'todo',
      priority: taskData.priority || '中',
      dueDate: taskData.dueDate || new Date().toISOString().slice(0, 10),
      owner: taskData.owner || '我',
      tags: taskData.tags || [item.source || '收件箱'],
      source: `收件箱转入 (${item.source})`,
    });

    setInbox((prev) => prev.filter((i) => i.id !== inboxId));
    showToast('已将收件箱灵感转化为看板任务', 'success');
  };

  // Commute Actions (Max 3 routes rule)
  const saveCommuteRoute = (routeData: Omit<CommuteRoute, 'id'>, id?: string): boolean => {
    if (!id && commuteRoutes.length >= 3) {
      showToast('第一阶段最多支持配置 3 条常用路线', 'warning');
      return false;
    }

    if (id) {
      setCommuteRoutes((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              ...routeData,
              isDefault: routeData.isDefault ? true : r.isDefault,
            };
          }
          if (routeData.isDefault) {
            return { ...r, isDefault: false };
          }
          return r;
        })
      );
      showToast('通勤路线已更新', 'success');
    } else {
      const newRoute: CommuteRoute = {
        ...routeData,
        id: `route-${Date.now()}`,
        isDefault: commuteRoutes.length === 0 || routeData.isDefault,
      };
      setCommuteRoutes((prev) => {
        let list = prev;
        if (newRoute.isDefault) {
          list = list.map((r) => ({ ...r, isDefault: false }));
        }
        return [...list, newRoute];
      });
      showToast('新增常用路线成功', 'success');
    }
    return true;
  };

  const deleteCommuteRoute = (id: string) => {
    setCommuteRoutes((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (filtered.length > 0 && !filtered.some((r) => r.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    showToast('通勤路线已删除', 'info');
  };

  const setDefaultCommuteRoute = (id: string) => {
    setCommuteRoutes((prev) =>
      prev.map((r) => ({ ...r, isDefault: r.id === id }))
    );
    showToast('已将该路线设为默认', 'success');
  };

  // Meeting Action Items Batch Processing
  const batchAddActionItems = (
    items: ActionItemCandidate[],
    destination: 'tasks' | 'inbox'
  ) => {
    const selectedItems = items.filter((it) => it.selected);
    if (selectedItems.length === 0) {
      showToast('请先勾选需要转入的候选行动项', 'warning');
      return;
    }

    if (destination === 'tasks') {
      const newTasks: TaskItem[] = selectedItems.map((it, idx) => ({
        id: `task-meeting-${Date.now()}-${idx}`,
        title: it.title,
        description: `来源句子：${it.sourceSentence}`,
        status: 'todo',
        priority: it.priority || '中',
        dueDate: it.dueDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        owner: it.owner || '待指定',
        tags: ['会议待办'],
        source: '会议纪要',
        createdAt: new Date().toISOString(),
      }));

      setTasks((prev) => [...newTasks, ...prev]);
      showToast(`已成功将 ${selectedItems.length} 项行动项加入任务看板（待办）`, 'success');
    } else {
      const newInboxItems: InboxItem[] = selectedItems.map((it, idx) => ({
        id: `inbox-meeting-${Date.now()}-${idx}`,
        content: `【${it.owner || '待指定'}】${it.title} (截止: ${it.dueDate || '待定'})`,
        source: '会议',
        createdAt: new Date().toISOString(),
      }));

      setInbox((prev) => [...newInboxItems, ...prev]);
      showToast(`已将 ${selectedItems.length} 项行动项暂存至收件箱`, 'success');
    }
  };

  // Phrase Draft Actions
  const savePhraseDraft = (draftData: Omit<PhraseDraft, 'id' | 'createdAt'>) => {
    const newDraft: PhraseDraft = {
      ...draftData,
      id: `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPhraseDrafts((prev) => [newDraft, ...prev.slice(0, 19)]);
    showToast('沟通草稿已归档保存', 'success');
  };

  // Reminders Actions
  const addReminder = (
    title: string,
    time: string,
    priority: ReminderItem['priority'] = '中'
  ) => {
    const newReminder: ReminderItem = {
      id: `remind-${Date.now()}`,
      title,
      time,
      priority,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [newReminder, ...prev]);
    showToast('提醒事项已添加', 'success');
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.isCompleted;
          if (next) playChimeSound();
          return { ...r, isCompleted: next };
        }
        return r;
      })
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showToast('提醒已删除', 'info');
  };

  // Data Reset & Backup
  const resetToMockData = () => {
    setTasks(INITIAL_TASKS);
    setInbox(INITIAL_INBOX);
    setCommuteRoutes(INITIAL_COMMUTE_ROUTES);
    setReminders(INITIAL_REMINDERS);
    setPhraseDrafts([]);
    localStorage.clear();
    showToast('已重置所有模块为示范工作台数据', 'info');
  };

  const exportDataJson = (): string => {
    const exportObject = {
      version: '0.2.0',
      exportedAt: new Date().toISOString(),
      tasks,
      inbox,
      commuteRoutes,
      phraseDrafts,
      reminders,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.inbox && Array.isArray(parsed.inbox)) setInbox(parsed.inbox);
      if (parsed.commuteRoutes && Array.isArray(parsed.commuteRoutes)) setCommuteRoutes(parsed.commuteRoutes);
      if (parsed.reminders && Array.isArray(parsed.reminders)) setReminders(parsed.reminders);
      if (parsed.phraseDrafts && Array.isArray(parsed.phraseDrafts)) setPhraseDrafts(parsed.phraseDrafts);
      showToast('数据恢复成功！', 'success');
      return true;
    } catch {
      showToast('JSON 数据格式有误，导入失败', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        inbox,
        addInboxItem,
        deleteInboxItem,
        convertInboxToTask,
        commuteRoutes,
        saveCommuteRoute,
        deleteCommuteRoute,
        setDefaultCommuteRoute,
        batchAddActionItems,
        phrasePrefill,
        setPhrasePrefill,
        phraseDrafts,
        savePhraseDraft,
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        playChimeSound,
        aiEnabled,
        setAiEnabled,
        serverAiAvailable,
        checkServerAiStatus,
        toasts,
        showToast,
        removeToast,
        resetToMockData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
