import React, { useState } from 'react';
import { CommuteRoute, CommuteMode } from '../../types';
import { X, Navigation, Clock, Link, AlertCircle } from 'lucide-react';

interface CommuteRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (route: Omit<CommuteRoute, 'id'>, id?: string) => boolean;
  routeToEdit?: CommuteRoute | null;
}

export const CommuteRouteModal: React.FC<CommuteRouteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  routeToEdit,
}) => {
  const [name, setName] = useState(routeToEdit?.name || '');
  const [start, setStart] = useState(routeToEdit?.start || '');
  const [end, setEnd] = useState(routeToEdit?.end || '');
  const [mode, setMode] = useState<CommuteMode>(routeToEdit?.mode || 'subway');
  const [durationMin, setDurationMin] = useState(routeToEdit?.durationMin || 40);
  const [departTime, setDepartTime] = useState(routeToEdit?.departTime || '08:30');
  const [externalUrl, setExternalUrl] = useState(routeToEdit?.externalUrl || 'https://www.amap.com');
  const [note, setNote] = useState(routeToEdit?.note || '');
  const [alternativesCount, setAlternativesCount] = useState(routeToEdit?.alternativesCount || 1);
  const [isDefault, setIsDefault] = useState(routeToEdit?.isDefault ?? false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !start.trim() || !end.trim()) {
      setError('请完整填写路线名称、起点与终点');
      return;
    }

    const success = onSave(
      {
        name: name.trim(),
        start: start.trim(),
        end: end.trim(),
        mode,
        durationMin: Number(durationMin) || 30,
        departTime: departTime || '08:30',
        externalUrl: externalUrl.trim() || undefined,
        note: note.trim() || undefined,
        alternativesCount: Number(alternativesCount) || 1,
        isDefault,
      },
      routeToEdit?.id
    );

    if (success) {
      onClose();
    }
  };

  const handleApplyPresetUrl = (type: 'amap' | 'baidu') => {
    if (type === 'amap') {
      setExternalUrl(`https://www.amap.com/search?query=${encodeURIComponent(end || '公司')}`);
    } else {
      setExternalUrl(`https://map.baidu.com/search/${encodeURIComponent(end || '公司')}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fcfbf9] rounded-2xl border border-stone-200/80 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-200/60 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-base font-bold text-stone-900 tracking-tight">
            {routeToEdit ? '编辑常用通勤路线' : '新增常用通勤路线'}
          </h2>
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
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              路线名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="例如：家 → 望京科技园公司"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                起点 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="例如：太阳宫地铁站"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                终点 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="例如：望京科技园 A座"
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                出行方式
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as CommuteMode)}
                className="w-full h-11 px-2 rounded-xl border border-stone-200/80 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900 cursor-pointer font-medium"
              >
                <option value="subway">🚇 地铁</option>
                <option value="bus">🚌 公交</option>
                <option value="drive">🚗 驾车</option>
                <option value="bike">🚲 骑行</option>
                <option value="walk">🚶 步行</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                耗时 (分钟)
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                出发时间
              </label>
              <input
                type="time"
                value={departTime}
                onChange={(e) => setDepartTime(e.target.value)}
                className="w-full h-11 px-2.5 rounded-xl border border-stone-200/80 bg-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
                <Link className="w-3.5 h-3.5 text-stone-400" />
                <span>外部地图/导航链接</span>
              </label>
              <div className="flex gap-2 text-[11px] text-stone-500">
                <button
                  type="button"
                  onClick={() => handleApplyPresetUrl('amap')}
                  className="hover:text-stone-900 underline cursor-pointer"
                >
                  高德预设
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetUrl('baidu')}
                  className="hover:text-stone-900 underline cursor-pointer"
                >
                  百度预设
                </button>
              </div>
            </div>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://www.amap.com"
              className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                备选路线数
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={alternativesCount}
                onChange={(e) => setAlternativesCount(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-stone-200/80 bg-white text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 text-stone-900"
              />
            </div>

            <div className="flex items-center h-full pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800 select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
                <span>设为今日默认路线</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              出行小贴士 / 拥堵便签
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：雨雪天气需提前 15 分钟出发"
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
              保存路线
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
