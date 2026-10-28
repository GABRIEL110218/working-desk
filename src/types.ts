export type Priority = '高' | '中' | '低';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type CommuteMode = 'subway' | 'bus' | 'drive' | 'bike' | 'walk';

export type PhraseTone = '正式' | '简洁' | '委婉' | '坚定';

export type PhraseScenario = 
  | '催进度'
  | '拒绝请求'
  | '汇报进展'
  | '请求资源'
  | '道歉/澄清'
  | '冷静版甩锅回复'
  | '自定义';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  owner: string;
  tags: string[];
  source?: string;
  createdAt: string;
}

export interface InboxItem {
  id: string;
  content: string;
  source: '快速输入' | '会议' | '沟通' | '外部';
  createdAt: string;
  convertedTaskId?: string;
}

export interface MeetingNote {
  id: string;
  title: string;
  rawText: string;
  createdAt: string;
  parsedItemsCount: number;
}

export interface ActionItemCandidate {
  id: string;
  meetingId?: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: Priority;
  sourceSentence: string;
  selected: boolean;
}

export interface CommuteRoute {
  id: string;
  name: string;
  start: string;
  end: string;
  mode: CommuteMode;
  durationMin: number;
  departTime: string;
  externalUrl?: string;
  note?: string;
  alternativesCount?: number;
  isDefault: boolean;
}

export interface PhraseDraft {
  id: string;
  scenario: PhraseScenario;
  target: string;
  goal: string;
  tone: PhraseTone;
  background: string;
  draftText: string;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  priority: Priority;
  isCompleted: boolean;
  linkedTaskId?: string;
  createdAt: string;
}

export type NavigationTab = 
  | 'today'
  | 'inbox'
  | 'tasks'
  | 'weekly'
  | 'meetings'
  | 'commute'
  | 'phrases'
  | 'reminders'
  | 'tools'
  | 'settings';
