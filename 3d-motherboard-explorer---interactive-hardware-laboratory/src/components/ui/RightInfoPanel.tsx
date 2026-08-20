import React, { useState } from 'react';
import {
  X,
  Zap,
  Activity,
  Cpu,
  Layers,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Focus,
  Maximize2,
  Minimize2,
  CheckCircle2,
  BookOpen,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  MotherboardComponent,
  PCBLayerInfo,
} from '../../types/motherboard';
import { CATEGORIES } from '../../data/componentsData';
import { sound } from '../../utils/audio';

interface RightInfoPanelProps {
  component: MotherboardComponent | null;
  selectedLayer: PCBLayerInfo | null;
  isLayerMode: boolean;
  isIsolated: boolean;
  onClose: () => void;
  onSelectComponent: (id: string) => void;
  onToggleIsolation: () => void;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  component,
  selectedLayer,
  isLayerMode,
  isIsolated,
  onClose,
  onSelectComponent,
  onToggleIsolation,
}) => {
  const [levelMode, setLevelMode] = useState<'beginner' | 'advanced'>('beginner');
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'connections'>('overview');

  // If in PCB Layer inspection mode
  if (isLayerMode && selectedLayer) {
    return (
      <aside className="relative z-20 flex h-[calc(100vh-3.5rem)] w-80 sm:w-96 flex-col border-l border-[#1f1f23] bg-[#08080a] p-4 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selectedLayer.color }}
            />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              Layer {selectedLayer.layerNumber} of 8
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded p-1 text-gray-400 hover:bg-[#16161a] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">{selectedLayer.name}</h2>
            <p className="mt-1 text-xs text-gray-400 leading-relaxed">
              {selectedLayer.description}
            </p>
          </div>

          <div className="space-y-2 rounded-md border border-[#2a2a30] bg-[#16161a] p-3">
            <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-gray-400">
              Layer Specifications
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-[#0a0a0c] border border-[#2a2a30] p-2">
                <span className="text-[10px] text-gray-500 block">Copper Thickness</span>
                <span className="font-mono font-semibold text-blue-400">{selectedLayer.thickness}</span>
              </div>
              <div className="rounded bg-[#0a0a0c] border border-[#2a2a30] p-2">
                <span className="text-[10px] text-gray-500 block">Material</span>
                <span className="font-mono font-semibold text-gray-300">{selectedLayer.material}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-[#2a2a30] bg-[#16161a] p-3">
            <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-gray-400">
              Primary Electrical Purpose
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{selectedLayer.purpose}</p>
          </div>
        </div>
      </aside>
    );
  }

  // If no component is selected, don't occupy screen space - maximize 3D canvas
  if (!component) {
    return null;
  }

  const category = CATEGORIES.find((c) => c.id === component.category);

  return (
    <aside className="relative z-20 flex h-[calc(100vh-3.5rem)] w-80 sm:w-96 flex-col border-l border-[#1f1f23] bg-[#08080a]">
      {/* Header */}
      <div className="border-b border-[#1f1f23] p-4 bg-[#0a0a0c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full bg-blue-500"
            />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
              {category?.label || component.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Isolate Button */}
            <button
              onClick={() => {
                sound.playClick();
                onToggleIsolation();
              }}
              title={isIsolated ? 'Show Entire Motherboard' : 'Isolate Component in 3D'}
              className={`rounded px-2 py-1 text-[10px] font-semibold font-mono transition-colors cursor-pointer ${
                isIsolated
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#16161a] border border-[#2a2a30] text-gray-300 hover:text-white'
              }`}
            >
              {isIsolated ? 'Isolated' : 'Isolate'}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="rounded p-1 text-gray-400 hover:bg-[#16161a] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h2 className="mt-2 text-base font-bold text-white tracking-tight">
          {component.name}
        </h2>
        <p className="mt-1 text-xs text-blue-400/90 font-medium">
          {component.shortDescription}
        </p>

        {/* Level Toggle: Beginner vs Advanced */}
        <div className="mt-3 flex rounded-md bg-[#16161a] p-0.5 border border-[#2a2a30]">
          <button
            onClick={() => {
              sound.playClick();
              setLevelMode('beginner');
            }}
            className={`flex-1 rounded py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              levelMode === 'beginner'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Beginner Friendly
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setLevelMode('advanced');
            }}
            className={`flex-1 rounded py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              levelMode === 'advanced'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Engineering Specs
          </button>
        </div>

        {/* Nav Tabs */}
        <div className="mt-3 flex gap-1 border-t border-[#1f1f23] pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 rounded py-1 text-xs font-semibold cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#16161a] border border-[#2a2a30] text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`flex-1 rounded py-1 text-xs font-semibold cursor-pointer ${
              activeTab === 'technical'
                ? 'bg-[#16161a] border border-[#2a2a30] text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Tech Specs
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 rounded py-1 text-xs font-semibold cursor-pointer ${
              activeTab === 'connections'
                ? 'bg-[#16161a] border border-[#2a2a30] text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Data Paths ({component.connectedComponentIds.length})
          </button>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            {/* Real-World Analogy (Beginner) */}
            {levelMode === 'beginner' && (
              <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-bold uppercase font-mono tracking-wider">
                    Real-World Analogy
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-300 font-normal leading-relaxed">
                  "{component.realWorldAnalogy}"
                </p>
              </div>
            )}

            {/* What is it? */}
            <div className="space-y-1 rounded-md border border-[#1f1f23] bg-[#0f0f13] p-3">
              <div className="flex items-center gap-1.5 text-gray-300">
                <HelpCircle className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-300">
                  What is it?
                </h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{component.whatIsIt}</p>
            </div>

            {/* What does it do? */}
            <div className="space-y-1 rounded-md border border-[#1f1f23] bg-[#0f0f13] p-3">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Activity className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-300">
                  What does it do?
                </h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{component.whatItDoes}</p>
            </div>

            {/* How does it work? */}
            <div className="space-y-1 rounded-md border border-[#1f1f23] bg-[#0f0f13] p-3">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Cpu className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-gray-300">
                  How does it work?
                </h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{component.howItWorks}</p>
            </div>

            {/* Did You Know? */}
            <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">
                  Did You Know?
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                {component.didYouKnow}
              </p>
            </div>

            {/* Pro Builder Tip */}
            <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-3">
              <div className="flex items-center gap-2 text-blue-400">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">
                  Pro Builder Tip
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                {component.learnMoreUrlOrTip}
              </p>
            </div>
          </>
        )}

        {/* TAB 2: TECHNICAL SPECIFICATIONS */}
        {activeTab === 'technical' && (
          <div className="space-y-3">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {component.voltage && (
                <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-2.5">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-gray-500 block">
                    Operating Voltage
                  </span>
                  <span className="mt-1 font-mono text-xs font-bold text-blue-400 block truncate">
                    {component.voltage}
                  </span>
                </div>
              )}

              {component.dataSpeed && (
                <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-2.5">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-gray-500 block">
                    Data Bandwidth
                  </span>
                  <span className="mt-1 font-mono text-xs font-bold text-blue-400 block truncate">
                    {component.dataSpeed}
                  </span>
                </div>
              )}

              {component.busInterface && (
                <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-2.5">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-gray-500 block">
                    Bus / Interface
                  </span>
                  <span className="mt-1 text-xs font-semibold text-gray-300 block truncate">
                    {component.busInterface}
                  </span>
                </div>
              )}

              {component.powerRequirements && (
                <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-2.5">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-gray-500 block">
                    Power Dissipation
                  </span>
                  <span className="mt-1 text-xs font-semibold text-gray-300 block truncate">
                    {component.powerRequirements}
                  </span>
                </div>
              )}
            </div>

            {/* Detailed Spec List */}
            {component.specs && component.specs.length > 0 && (
              <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-3 space-y-2">
                <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-gray-400">
                  Architectural Parameters
                </div>
                <div className="divide-y divide-[#1f1f23]">
                  {component.specs.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between py-2 text-xs">
                      <span className="text-gray-400">{spec.label}</span>
                      <span className="font-mono font-semibold text-gray-200 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form factor / Generation */}
            {component.generation && (
              <div className="rounded-md border border-[#2a2a30] bg-[#16161a] p-3 text-xs">
                <span className="text-[10px] font-bold font-mono uppercase text-gray-500 block">Generation & Platform</span>
                <span className="font-semibold text-blue-400">{component.generation}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONNECTED COMPONENTS */}
        {activeTab === 'connections' && (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 leading-relaxed">
              This component is electrically linked to the following motherboard subsystems. Click any item to jump directly to it in 3D:
            </div>

            <div className="space-y-1.5">
              {component.connectedComponentIds.map((targetId) => (
                <button
                  key={targetId}
                  onClick={() => {
                    sound.playClick();
                    onSelectComponent(targetId);
                  }}
                  className="flex w-full items-center justify-between rounded-md border border-[#2a2a30] bg-[#16161a] p-2.5 text-left text-xs text-gray-300 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="font-semibold capitalize">
                      {targetId.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
