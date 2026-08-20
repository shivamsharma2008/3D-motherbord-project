import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Zap,
  HardDrive,
  Maximize2,
  Globe,
  Volume2,
  Wind,
  Binary,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Wrench,
  Eye,
  Crosshair,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import { MotherboardComponent, ComponentCategory } from '../../types/motherboard';
import { CATEGORIES } from '../../data/componentsData';
import { sound } from '../../utils/audio';

interface LeftSidebarProps {
  components: MotherboardComponent[];
  selectedComponentId: string | null;
  activeCategory: ComponentCategory | null;
  explodedAmount: number;
  isLayerMode: boolean;
  isIsolated: boolean;
  onSelectComponent: (id: string) => void;
  onSelectCategory: (category: ComponentCategory | null) => void;
  onChangeExplodedAmount: (val: number) => void;
  onToggleLayerMode: () => void;
  onToggleIsolation: () => void;
  onOpenQuiz: () => void;
  onOpenBuilder: () => void;
  onClearAllMarks?: () => void;
}

type TabMode = 'categories' | 'components' | 'exploded' | 'layers';

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  components,
  selectedComponentId,
  activeCategory,
  explodedAmount,
  isLayerMode,
  isIsolated,
  onSelectComponent,
  onSelectCategory,
  onChangeExplodedAmount,
  onToggleLayerMode,
  onToggleIsolation,
  onOpenQuiz,
  onOpenBuilder,
  onClearAllMarks,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('categories');
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed for maximum motherboard canvas view
  const [componentFilter, setComponentFilter] = useState('');

  // Icon map for categories
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="h-4 w-4" />;
      case 'Layers': return <Layers className="h-4 w-4" />;
      case 'Zap': return <Zap className="h-4 w-4" />;
      case 'HardDrive': return <HardDrive className="h-4 w-4" />;
      case 'Maximize2': return <Maximize2 className="h-4 w-4" />;
      case 'Globe': return <Globe className="h-4 w-4" />;
      case 'Volume2': return <Volume2 className="h-4 w-4" />;
      case 'Wind': return <Wind className="h-4 w-4" />;
      case 'Binary': return <Binary className="h-4 w-4" />;
      case 'Sliders': return <Sliders className="h-4 w-4" />;
      default: return <Cpu className="h-4 w-4" />;
    }
  };

  const filteredComponents = components.filter((c) => {
    const matchesFilter =
      componentFilter.trim() === '' ||
      c.name.toLowerCase().includes(componentFilter.toLowerCase()) ||
      c.category.toLowerCase().includes(componentFilter.toLowerCase());
    const matchesCat = !activeCategory || c.category === activeCategory;
    return matchesFilter && matchesCat;
  });

  return (
    <aside
      className={`relative z-20 flex h-[calc(100vh-3.5rem)] flex-col border-r border-[#1f1f23] bg-[#08080a]/95 backdrop-blur-md transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-72 sm:w-80'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => {
          sound.playClick();
          setIsCollapsed(!isCollapsed);
        }}
        title={isCollapsed ? 'Expand Sidebar' : 'Maximize Canvas (Collapse Sidebar)'}
        className="absolute -right-3.5 top-6 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[#2a2a30] bg-[#0a0a0c] text-gray-400 shadow-md hover:border-emerald-500 hover:text-white cursor-pointer transition-transform"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* When Collapsed: Vertical Navigation Quick Bar */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={() => {
              sound.playClick();
              setIsCollapsed(false);
              setActiveTab('categories');
            }}
            title="Categories"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-emerald-400 cursor-pointer"
          >
            <Layers className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsCollapsed(false);
              setActiveTab('components');
            }}
            title="All 28+ Components"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-blue-400 cursor-pointer"
          >
            <Cpu className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setIsCollapsed(false);
              setActiveTab('exploded');
            }}
            title="Exploded View"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-purple-400 cursor-pointer"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onToggleLayerMode();
            }}
            title="PCB 8-Layer Mode"
            className={`flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer ${
              isLayerMode ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:bg-[#16161a] hover:text-amber-400'
            }`}
          >
            <Layers className="h-5 w-5" />
          </button>

          {/* Quick Clear All Marks button in collapsed bar */}
          {onClearAllMarks && (
            <button
              onClick={() => {
                sound.playClick();
                onClearAllMarks();
              }}
              title="Close All Marks & Active Components"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-950/40 cursor-pointer mt-2"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}

          <div className="my-auto" />

          <button
            onClick={onOpenQuiz}
            title="Knowledge Quiz"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-400 hover:bg-[#16161a] cursor-pointer"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            onClick={onOpenBuilder}
            title="Virtual PC Builder"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-cyan-400 hover:bg-[#16161a] cursor-pointer"
          >
            <Wrench className="h-5 w-5" />
          </button>
        </div>
      ) : (
        /* Expanded Sidebar View */
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header & Tabs */}
          <div className="border-b border-[#1f1f23] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Explorer Navigation
              </span>
              {onClearAllMarks && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onClearAllMarks();
                  }}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Close All Marks"
                >
                  <XCircle className="h-3 w-3" />
                  <span>Close Marks</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#121216] p-1">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('categories');
                }}
                className={`rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-emerald-600 text-white font-semibold shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('components');
                }}
                className={`rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'components'
                    ? 'bg-emerald-600 text-white font-semibold shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Parts ({components.length})
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveTab('exploded');
                }}
                className={`rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'exploded'
                    ? 'bg-emerald-600 text-white font-semibold shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Explode
              </button>
            </div>
          </div>

          {/* Tab 1: Categories View */}
          {activeTab === 'categories' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectCategory(null);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === null
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-[#16161a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>All Hardware Modules</span>
                </div>
                <span className="rounded bg-[#16161a] px-1.5 py-0.5 font-mono text-[10px] text-gray-400">
                  {components.length}
                </span>
              </button>

              {CATEGORIES.map((cat) => {
                const count = components.filter((c) => c.category === cat.id).length;
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectCategory(isSelected ? null : (cat.id as ComponentCategory));
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'text-gray-300 hover:bg-[#16161a]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: cat.color }}>{getCategoryIcon(cat.icon)}</span>
                      <span>{cat.label}</span>
                    </div>
                    <span className="rounded bg-[#16161a] px-1.5 py-0.5 font-mono text-[10px] text-gray-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Components List */}
          {activeTab === 'components' && (
            <div className="flex flex-1 flex-col overflow-hidden p-3">
              <input
                type="text"
                placeholder="Filter components..."
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
                className="mb-2 h-8 w-full rounded-md border border-[#2a2a30] bg-[#16161a] px-2.5 text-xs text-gray-200 placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredComponents.map((comp) => {
                  const isSelected = selectedComponentId === comp.id;
                  const cat = CATEGORIES.find((c) => c.id === comp.category);
                  return (
                    <button
                      key={comp.id}
                      onClick={() => onSelectComponent(comp.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow'
                          : 'text-gray-300 hover:bg-[#16161a]'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || '#3b82f6' }}
                        />
                        <span className="truncate">{comp.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 shrink-0 ml-1">
                        {comp.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Exploded View Controls */}
          {activeTab === 'exploded' && (
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-200 block mb-2">
                  Explosion Elevation Distance
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedAmount}
                  onChange={(e) => onChangeExplodedAmount(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs font-mono text-gray-400 mt-1">
                  <span>Assembled (0%)</span>
                  <span className="text-emerald-400 font-bold">{Math.round(explodedAmount * 100)}%</span>
                  <span>Full (100%)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onChangeExplodedAmount(0)}
                  className="rounded-lg bg-[#16161a] border border-[#2a2a30] py-2 text-xs font-medium text-gray-300 hover:text-white cursor-pointer"
                >
                  Assemble
                </button>
                <button
                  onClick={() => onChangeExplodedAmount(0.85)}
                  className="rounded-lg bg-emerald-600 text-white font-semibold py-2 text-xs hover:bg-emerald-500 cursor-pointer"
                >
                  Explode 85%
                </button>
              </div>

              <div className="rounded-lg bg-[#121216] border border-[#1f1f23] p-3 text-xs text-gray-400">
                <p className="leading-relaxed">
                  💡 Exploded view separates the CPU, RAM modules, M.2 armor shields, VRM heatsinks, and capacitors from the green motherboard PCB along their assembly axis.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Interactive Modals launcher */}
          <div className="border-t border-[#1f1f23] p-3 space-y-2">
            <button
              onClick={onOpenQuiz}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500/15 border border-amber-500/30 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Interactive Hardware Quiz</span>
            </button>
            <button
              onClick={onOpenBuilder}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors cursor-pointer"
            >
              <Wrench className="h-4 w-4" />
              <span>Virtual PC Builder</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
