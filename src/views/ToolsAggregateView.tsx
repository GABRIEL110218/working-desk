import React from 'react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import {
  FileCheck2,
  Navigation,
  MessageSquareQuote,
  FileText,
  Bell,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ToolCardInfo {
  id: NavigationTab;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  badge?: string;
}

export const ToolsAggregateView: React.FC = () => {
  const { setActiveTab } = useApp();

  const tools: ToolCardInfo[] = [
    {
      id: 'meetings',
      title: '会议纪要转待办',
      desc: '粘贴纪要快速提炼责任人与时间点，人工核验后批量流转至看板或收件箱。',
      icon: FileCheck2,
      iconBg: 'bg-indigo-600 text-white',
      badge: 'AI 增强',
    },
    {
      id: 'commute',
      title: '通勤信息聚合',
      desc: '沉淀高频上下班路线与耗时规律，今日页置顶感知，支持直达地图导航。',
      icon: Navigation,
      iconBg: 'bg-emerald-600 text-white',
      badge: '高频常用',
    },
    {
      id: 'phrases',
      title: '沟通话术草稿',
      desc: '针对催促进度、委婉拒绝、向上汇报等复杂场景，快速生成高情商草案。',
      icon: MessageSquareQuote,
      iconBg: 'bg-sky-600 text-white',
      badge: '场景矩阵',
    },
    {
      id: 'weekly',
      title: '周报生成',
      desc: '自动聚合本周已完成工作与下周主线计划，一键输出结构化周度汇报。',
      icon: FileText,
      iconBg: 'bg-amber-600 text-white',
      badge: '一键归纳',
    },
    {
      id: 'reminders',
      title: '提醒中心',
      desc: '全天日程提醒与时间节点管理，支持声音预警与推迟稍后提醒。',
      icon: Bell,
      iconBg: 'bg-rose-600 text-white',
      badge: '即时预警',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200/60 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          提效工具箱
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          专为提升职场敏捷度打造的高频提效套件，支持随时独立调用
        </p>
      </div>

      {/* 3-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4 group cursor-pointer hover:border-stone-400 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl ${tool.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900 truncate">
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-900 group-hover:text-white text-stone-500 flex items-center justify-center transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
