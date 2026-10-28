import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommuteRoute, CommuteMode } from '../types';
import { CommuteRouteModal } from '../components/modals/CommuteRouteModal';
import {
  Navigation,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  Clock,
  Star,
  Compass,
  Car,
  Bike,
  Footprints,
  Train,
  Bus,
  ArrowRight,
  Info,
} from 'lucide-react';

export const CommuteView: React.FC = () => {
  const { commuteRoutes, saveCommuteRoute, deleteCommuteRoute, setDefaultCommuteRoute } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<CommuteRoute | null>(null);

  const getModeIcon = (mode: CommuteMode) => {
    switch (mode) {
      case 'subway':
        return <Train className="w-5 h-5 text-indigo-600" />;
      case 'bus':
        return <Bus className="w-5 h-5 text-sky-600" />;
      case 'drive':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'bike':
        return <Bike className="w-5 h-5 text-amber-600" />;
      case 'walk':
        return <Footprints className="w-5 h-5 text-stone-600" />;
      default:
        return <Navigation className="w-5 h-5 text-stone-600" />;
    }
  };

  const getModeLabel = (mode: CommuteMode) => {
    switch (mode) {
      case 'subway':
        return '地铁轨道';
      case 'bus':
        return '地面公交';
      case 'drive':
        return '自驾出行';
      case 'bike':
        return '单车骑行';
      case 'walk':
        return '徒步通勤';
      default:
        return '常规出行';
    }
  };

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: CommuteRoute) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const isMaxReached = commuteRoutes.length >= 3;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Visual Transit Hero Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-200/50">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/transit_motion_abstract_1793175591962.jpg"
            alt="Transit abstract routes"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-900/70 to-stone-900/35" />
        </div>

        <div className="relative z-10 p-7 md:p-8 text-stone-100 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300 uppercase tracking-widest">
              <span>COMMUTE AGGREGATOR</span>
              <span className="text-stone-500">·</span>
              <span>最高频 3 条路线</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              城市通勤信息聚合
            </h2>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
              沉淀家与职场间的最优换乘节奏，今日页置顶感知，支持直达地图 App 查看实时动态路况。
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            disabled={isMaxReached}
            className={`h-10 px-5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 active:scale-[0.98] ${
              isMaxReached
                ? 'bg-white/20 text-stone-400 cursor-not-allowed backdrop-blur-md'
                : 'bg-white text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isMaxReached ? '已达 3 条配置上限' : '新增常用路线'}</span>
          </button>
        </div>
      </div>

      {/* Main Routes List */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {commuteRoutes.length === 0 ? (
          <div className="p-16 text-center glass-panel rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-1">
              还没有配置路线，新增一条常用通勤方案吧
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5 leading-relaxed">
              设置早晚高峰起终点、出行方式与常规耗时，今日工作台将智能为您置顶默认通勤卡片。
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              配置第一条路线
            </button>
          </div>
        ) : (
          commuteRoutes.map((route) => (
            <div
              key={route.id}
              className={`glass-panel rounded-2xl p-6 transition-all duration-200 space-y-4 ${
                route.isDefault
                  ? 'ring-2 ring-stone-900/20 border-stone-300 shadow-sm'
                  : 'hover:border-stone-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-white shadow-xs border border-stone-200/60">
                    {getModeIcon(route.mode)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {route.name}
                      </h3>
                      {route.isDefault && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                          今日默认
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <span>{getModeLabel(route.mode)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono text-stone-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        常规出发 {route.departTime}
                      </span>
                      {route.alternativesCount ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-600">
                            备选方案 {route.alternativesCount} 种
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-extrabold font-mono text-stone-900 tabular-nums">
                      {route.durationMin}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">分钟</span>
                  </div>
                  <span className="text-[11px] text-stone-400">单程平均耗时</span>
                </div>
              </div>

              {/* Station Flow Diagram */}
              <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/60 space-y-2">
                <div className="relative flex items-center justify-between text-xs text-stone-700">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200/60 shadow-2xs z-10">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-stone-900">{route.start}</span>
                  </div>

                  <div className="flex-1 mx-3 border-t-2 border-dashed border-stone-300 relative flex items-center justify-center">
                    <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-mono">
                      ~{route.durationMin}min
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-200/60 shadow-2xs z-10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-stone-900">{route.end}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {route.note && (
                <p className="text-xs text-stone-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/40 leading-relaxed">
                  💡 {route.note}
                </p>
              )}

              {/* Footer Actions */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>耗时支持手动维护校对，可随时根据季节与排班调整</span>
                </div>

                <div className="flex items-center gap-2">
                  {!route.isDefault && (
                    <button
                      onClick={() => setDefaultCommuteRoute(route.id)}
                      className="h-8 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>设为今日默认</span>
                    </button>
                  )}

                  {route.externalUrl && (
                    <a
                      href={route.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 transition-colors flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      <span>唤起地图导航</span>
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenEdit(route)}
                    className="h-8 px-3 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-400" />
                    <span>编辑</span>
                  </button>

                  <button
                    onClick={() => deleteCommuteRoute(route.id)}
                    className="h-8 px-2.5 rounded-lg border border-stone-200 bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CommuteRouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveCommuteRoute}
        routeToEdit={editingRoute}
      />
    </div>
  );
};
