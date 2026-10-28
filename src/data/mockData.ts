import { TaskItem, InboxItem, CommuteRoute, PhraseDraft, ReminderItem } from '../types';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: '输出 Q4 用户增长看板需求初稿',
    description: '整理产品指标模型与前端组件交互契约',
    status: 'in_progress',
    priority: '高',
    dueDate: '2026-10-29',
    owner: '我',
    tags: ['PRD', '数据看板'],
    source: '常规规划',
    createdAt: '2026-10-27T09:00:00Z',
  },
  {
    id: 'task-2',
    title: '推进跨端鉴权接口与安全网关联调',
    description: '验证 Token 自动续期与错误边界回落',
    status: 'todo',
    priority: '高',
    dueDate: '2026-10-30',
    owner: '技术对接组',
    tags: ['后端联调', '安全'],
    source: '架构评审会',
    createdAt: '2026-10-26T14:30:00Z',
  },
  {
    id: 'task-3',
    title: '评审通勤路线与移动端触控优化改版',
    description: '核验 8px 网格规范与触摸目标高度',
    status: 'review',
    priority: '中',
    dueDate: '2026-10-28',
    owner: '设计团队',
    tags: ['UI/UX', '规范'],
    source: '晨会纪要',
    createdAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'task-4',
    title: '梳理周五大客户私享会演示 Demo 流程',
    description: '准备环境兜底数据与话术提纲',
    status: 'todo',
    priority: '中',
    dueDate: '2026-10-31',
    owner: '市场运营',
    tags: ['客户沟通', '演示'],
    source: '快速输入',
    createdAt: '2026-10-25T11:20:00Z',
  },
  {
    id: 'task-5',
    title: '完成周度技术债清理与依赖升级',
    description: '更新 Node.js LTS 补丁和无用依赖项移除',
    status: 'done',
    priority: '低',
    dueDate: '2026-10-27',
    owner: '我',
    tags: ['工程基建'],
    source: '常规维护',
    createdAt: '2026-10-24T08:00:00Z',
  },
];

export const INITIAL_INBOX: InboxItem[] = [
  {
    id: 'inbox-1',
    content: '法务提示：对外演示材料需要去掉内部测试服务器 IP 地址',
    source: '沟通',
    createdAt: '2026-10-28T08:15:00Z',
  },
  {
    id: 'inbox-2',
    content: '跟供应商确认下周二服务器机架巡检人员的访客入园报备',
    source: '快速输入',
    createdAt: '2026-10-27T18:40:00Z',
  },
  {
    id: 'inbox-3',
    content: '调研一下新版高德地图 API 的驾车预计拥堵时长权重算法',
    source: '会议',
    createdAt: '2026-10-27T15:10:00Z',
  },
];

export const INITIAL_COMMUTE_ROUTES: CommuteRoute[] = [
  {
    id: 'route-1',
    name: '家 → 望京科技园公司',
    start: '太阳宫地铁站 B 口',
    end: '望京科技园 A 座 12F',
    mode: 'subway',
    durationMin: 38,
    departTime: '08:40',
    externalUrl: 'https://www.amap.com',
    note: '早高峰 14 号线换乘人流密集，建议走 3 号车厢中门',
    alternativesCount: 2,
    isDefault: true,
  },
  {
    id: 'route-2',
    name: '公司 → 家（晚高峰公交/步行）',
    start: '望京科技园西门',
    end: '太阳宫家',
    mode: 'bus',
    durationMin: 46,
    departTime: '19:30',
    externalUrl: 'https://map.baidu.com',
    note: '乘 536 路直达，遇下雨天可改打车走京密路',
    alternativesCount: 1,
    isDefault: false,
  },
];

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'remind-1',
    title: '10:30 产品迭代对齐例会',
    time: '10:30',
    priority: '高',
    isCompleted: false,
    createdAt: '2026-10-28T08:00:00Z',
  },
  {
    id: 'remind-2',
    title: '15:00 提交下月差旅预算审批申请',
    time: '15:00',
    priority: '中',
    isCompleted: false,
    createdAt: '2026-10-28T08:00:00Z',
  },
  {
    id: 'remind-3',
    title: '17:30 更新周报草稿并同步给组长',
    time: '17:30',
    priority: '低',
    isCompleted: false,
    createdAt: '2026-10-28T08:00:00Z',
  },
];

export const SAMPLE_MEETING_NOTE = `会议主题：VibeDesk Q4 核心版本落地与协同排期会
参会人员：张伟（产品）、李明（前端）、王雪（后端）、陈静（测试）、赵强（设计）
会议时间：2026-10-28 10:00 - 11:30

【背景与讨论核心】
本次会议围绕产品第一阶段“7 个核心模块”的落地排期进行了深入探讨。大家一致同意：
1. 必须在保证基础工作流（今日、收件箱、看板、周报、提醒）完整体验的同时，将会议纪要转待办、通勤聚合、沟通话术三个轻量模块作为第一阶段交付。
2. 所有模块均需具备无 AI / 无外部 API 降级能力，避免环境依赖阻断体验。

【会议讨论决议与行动项 Action Items】：
- 李明负责在 2026-10-29 前完成会议纪要转待办前端两栏交互与候选卡片编辑组件。优先级：高。
- 王雪负责在 2026-10-30 前打通服务端 Gemini API 与离线规则解析器的双模切换机制。优先级：高。
- 赵强需要在 2026-10-28 下班前提供 8px 网格规范下的通勤卡片紧凑版尺寸标注。优先级：中。
- 陈静负责于 2026-10-31 组织第一轮全链路冒烟测试，覆盖移动端 5 个 Tab 与桌面端 240px 分组导航。优先级：中。
- 张伟负责在周五前向管理层同步第一阶段 MVP 演示 Demo 脚本。优先级：低。
- 由@运维组在月底前完成容器镜像基线安全扫描。优先级：低。
`;
