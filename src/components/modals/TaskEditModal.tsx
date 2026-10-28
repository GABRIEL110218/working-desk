import React, { useState } from 'react';
import { TaskItem, Priority, TaskStatus } from '../../types';
import { X, Calendar, User, Tag, AlertTriangle } from 'lucide-react';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  initialTask?: Partial<TaskItem>;
  modalTitle?: string;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  modalTitle = '新建任务',
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'todo');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || '中');
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [owner, setOwner] = useState(initialTask?.owner || '我');
  const [tagsInput, setTagsInput] = useState(initialTask?.tags?.join(' ') || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }

    const tags = tagsInput
      .split(/[\s,，]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      owner: owner.trim() || '我',
      tags: tags.length > 0 ? tags : ['日常'],
      source: initialTask?.source || '手动创建',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] rounded-2xl border border-stone-200/80 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-200/60 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-base font-bold text-stone-900 tracking-tight">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              任务标题 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="例如：对齐 Q4 产品架构方案"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              详细描述与交付目标
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充上下文、前后置依赖、关键验收标准..."
              rows={3}
              className="w-full p-3.5 rounded-xl border border-stone-200/80 bg-white text-sm leading-relaxed text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                阶段状态
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-11 px-3 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900 cursor-pointer font-medium"
              >
                <option value="todo">待办清单</option>
                <option value="in_progress">进行中</option>
                <option value="review">待验收</option>
                <option value="done">已交付</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                优先级
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-11 px-3 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900 cursor-pointer font-medium"
              >
                <option value="高">高优先级 (P0/P1)</option>
                <option value="中">中优先级 (常规)</option>
                <option value="低">低优先级 (低优/待定)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>截止日期</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>负责人</span>
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="我 / 对接人"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span>标签分类 (用空格隔开)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="PRD 需求 联调 前端"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200/60">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              保存任务
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
