import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    aiEnabled,
    setAiEnabled,
    serverAiAvailable,
    checkServerAiStatus,
    resetToMockData,
    exportDataJson,
    importDataJson,
    showToast,
  } = useApp();

  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VibeDesk_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('工作台数据已导出为 JSON 备份文件', 'success');
  };

  const handleImport = () => {
    if (!importJsonText.trim()) {
      showToast('请先粘贴 JSON 格式的备份数据', 'warning');
      return;
    }
    const success = importDataJson(importJsonText);
    if (success) {
      setImportJsonText('');
      setShowImportArea(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200/60 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
          偏好与系统设置
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          管理 AI 增强引擎、本地私有数据备份与示范数据一键重置
        </p>
      </div>

      {/* AI Engine & Offline Fallback Configuration */}
      <div className="glass-panel rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Gemini 3.8 AI 智能增强
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                启用后，会议纪要转待办、沟通话术草稿与周报生成将调用服务端 Gemini API 进行上下文理解。
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setAiEnabled(!aiEnabled)}
            className={`w-13 h-7 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
              aiEnabled ? 'bg-stone-900 justify-end' : 'bg-stone-300 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* Server Status Badge */}
        <div className="p-3.5 bg-stone-50/80 rounded-xl border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-stone-500" />
            <span className="text-stone-700 font-medium">服务端 API 连接状态：</span>
            {serverAiAvailable === null ? (
              <span className="text-stone-400">检测中...</span>
            ) : serverAiAvailable ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                API Key 已就绪 (Gemini 3.8 Flash)
              </span>
            ) : (
              <span className="text-amber-700 font-medium">
                无可用 API Key，已自动生效无缝离线规则与模板兜底
              </span>
            )}
          </div>

          <button
            onClick={() => {
              checkServerAiStatus();
              showToast('已重新检测服务端连接状态', 'info');
            }}
            className="text-stone-600 hover:text-stone-900 underline text-xs cursor-pointer self-start sm:self-auto"
          >
            刷新状态
          </button>
        </div>

        <div className="text-[11px] text-stone-500 bg-stone-50/60 p-3 rounded-xl border border-stone-200/50 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <span>
            <strong>第一阶段交付保障原则</strong>：
            三个新增模块均具备无 AI / 无外部 API 的降级方案：会议纪要支持本地句法启发式待办提取，沟通话术具备 6+ 场景内置模板矩阵，通勤信息支持纯手动配置与外部地图唤起，离线环境下依然稳定通畅。
          </span>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-5 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-stone-900">
            本地数据安全与备份
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            所有任务、收件箱碎片、通勤路线与沟通草稿均持久化存储在您本地浏览器中，绝无隐私泄露风险。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出全量 JSON 数据</span>
          </button>

          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="h-10 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>恢复备份数据</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('确定要重置并恢复示范工作台数据吗？当前新增数据将被覆盖。')) {
                resetToMockData();
              }
            }}
            className="h-10 px-3.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为示范数据</span>
          </button>
        </div>

        {/* JSON Import Area */}
        {showImportArea && (
          <div className="pt-3 border-t border-stone-100 space-y-3">
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="请粘贴先前导出的 JSON 备份文本..."
              rows={5}
              className="w-full p-3.5 rounded-xl border border-stone-200 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportArea(false)}
                className="px-3 py-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-1.5 text-xs bg-stone-900 text-stone-100 rounded-lg hover:bg-stone-800 font-semibold cursor-pointer"
              >
                确认导入
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About VibeDesk */}
      <div className="glass-panel rounded-2xl p-6 text-xs space-y-2 text-stone-600">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
          <span>VibeDesk 职场敏捷工作台</span>
          <span className="font-mono text-xs bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full text-stone-700">
            PRD v0.2
          </span>
        </div>
        <p className="leading-relaxed">
          围绕现代职场人的高频核心场景构建，覆盖今日聚焦、临时收件箱、任务看板、周报生成、会议纪要转待办、通勤信息聚合、沟通话术草稿与日程提醒。
        </p>
      </div>
    </div>
  );
};
