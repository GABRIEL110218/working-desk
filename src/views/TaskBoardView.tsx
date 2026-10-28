import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem, TaskStatus, Priority } from '../types';
import { TaskEditModal } from '../components/modals/TaskEditModal';
import {
  Kanban,
  ListFilter,
  Plus,
  Search,
  Calendar,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  Circle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const TaskBoardView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, playChimeSound, showToast } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const columns: { id: TaskStatus; title: string; countBadge: string; dotColor: string }[] = [
    { id: 'todo', title: '待办清单', countBadge: 'bg-stone-200 text-stone-700', dotColor: 'bg-stone-400' },
    { id: 'in_progress', title: '进行中', countBadge: 'bg-indigo-100 text-indigo-800', dotColor: 'bg-indigo-500' },
    { id: 'review', title: '待验收', countBadge: 'bg-amber-100 text-amber-800', dotColor: 'bg-amber-500' },
    { id: 'done', title: '已交付', countBadge: 'bg-emerald-100 text-emerald-800', dotColor: 'bg-emerald-500' },
  ];

  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleToggleDone = (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    if (nextStatus === 'done') playChimeSound();
    updateTask(task.id, { status: nextStatus });
    showToast(nextStatus === 'done' ? '任务已标记为完成' : '已重新放回待办', 'info');
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case '高':
        return 'text-rose-700 bg-rose-50 border-rose-200/60';
      case '中':
        return 'text-amber-700 bg-amber-50 border-amber-200/60';
      case '低':
        return 'text-stone-600 bg-stone-100 border-stone-200/60';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            任务看板
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            全流程工作项追踪与阶段流转，看板与清单模式自由切换
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-stone-200/60 p-1 rounded-xl border border-stone-200/50">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              看板
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              清单
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-[0_2px_8px_-2px_rgba(28,25,23,0.3)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>新建任务</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按标题、描述、负责人或标签检索..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-stone-200/80 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">优先级筛选：</span>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(['all', '高', '中', '低'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {p === 'all' ? '全部' : `${p}优`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-stone-100/70 rounded-2xl border border-stone-200/70 p-3.5 space-y-3 min-h-[540px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-stone-900">
                      {col.title}
                    </h3>
                  </div>
                  <span className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full font-semibold ${col.countBadge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="glass-panel p-4 rounded-xl shadow-2xs hover:shadow-md transition-all duration-200 space-y-3 group bg-white/90"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}优
                        </span>

                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
                            title="编辑"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => handleToggleDone(task)}
                          className="mt-0.5 text-stone-300 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 stroke-[1.8]" />
                          )}
                        </button>
                        <h4 className={`text-sm font-semibold text-stone-900 leading-snug ${task.status === 'done' ? 'line-through text-stone-400' : ''}`}>
                          {task.title}
                        </h4>
                      </div>

                      {task.description && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed pl-6">
                          {task.description}
                        </p>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {task.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-stone-100/90 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200/50"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>{task.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          <span>{task.dueDate.slice(5)}</span>
                        </div>
                      </div>

                      {/* Stage Shift Selector */}
                      <div className="pt-1 flex items-center justify-between gap-1 text-[11px]">
                        <span className="text-stone-400 text-[10px]">流转:</span>
                        <select
                          value={task.status}
                          onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                          className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-0.5 text-[11px] text-stone-700 focus:outline-hidden cursor-pointer"
                        >
                          <option value="todo">待办清单</option>
                          <option value="in_progress">进行中</option>
                          <option value="review">待验收</option>
                          <option value="done">已交付</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="py-16 text-center text-xs text-stone-400">
                      该阶段暂无任务
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xs divide-y divide-stone-100">
          <div className="px-6 py-3.5 bg-stone-50/80 text-xs font-bold text-stone-500 uppercase tracking-wider grid grid-cols-12 gap-4">
            <div className="col-span-5">任务描述与交付目标</div>
            <div className="col-span-2">当前阶段</div>
            <div className="col-span-1">优先级</div>
            <div className="col-span-2">截止日期</div>
            <div className="col-span-2 text-right">操作</div>
          </div>

          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="px-6 py-4 hover:bg-stone-50/60 transition-colors grid grid-cols-12 gap-4 items-center text-xs"
            >
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleDone(task)}
                  className="text-stone-300 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className={`font-semibold text-stone-900 truncate ${task.status === 'done' ? 'line-through text-stone-400' : ''}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-stone-500 truncate text-[11px] mt-0.5">{task.description}</div>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                  className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 cursor-pointer"
                >
                  <option value="todo">待办清单</option>
                  <option value="in_progress">进行中</option>
                  <option value="review">待验收</option>
                  <option value="done">已交付</option>
                </select>
              </div>

              <div className="col-span-1">
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <div className="col-span-2 font-mono tabular-nums text-stone-600">
                {task.dueDate}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask || undefined}
        modalTitle={editingTask ? '编辑工作项' : '新建工作项'}
      />
    </div>
  );
};
