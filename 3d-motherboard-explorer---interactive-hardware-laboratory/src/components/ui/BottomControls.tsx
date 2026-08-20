import React, { useState } from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  GitCommit,
  SlidersHorizontal,
  Layers,
  Focus,
  Maximize2,
  Minimize2,
  Compass,
  Info,
  Sliders,
  XCircle,
} from 'lucide-react';
import { ViewCameraPreset } from '../../types/motherboard';
import { sound } from '../../utils/audio';

interface BottomControlsProps {
  cameraPreset: ViewCameraPreset;
  onSetCameraPreset: (preset: ViewCameraPreset) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showAllConnections: boolean;
  onToggleConnections: () => void;
  explodedAmount: number;
  onChangeExplodedAmount: (val: number) => void;
  isIsolated: boolean;
  onToggleIsolation: () => void;
  isLayerMode: boolean;
  onToggleLayerMode: () => void;
  selectedComponentId: string | null;
  onClearSelection: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  cameraPreset,
  onSetCameraPreset,
  showLabels,
  onToggleLabels,
  showAllConnections,
  onToggleConnections,
  explodedAmount,
  onChangeExplodedAmount,
  isIsolated,
  onToggleIsolation,
  isLayerMode,
  onToggleLayerMode,
  selectedComponentId,
  onClearSelection,
}) => {
  const [showExplodedPopup, setShowExplodedPopup] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(false);

  return (
    <div className="pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex flex-col items-center gap-2 px-4">
      {/* Exploded Slider Popup */}
      {showExplodedPopup && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-[#2a2a30] bg-[#0f0f13]/95 backdrop-blur-md p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-xs font-semibold text-white whitespace-nowrap">Explode Model:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={explodedAmount}
            onChange={(e) => onChangeExplodedAmount(parseFloat(e.target.value))}
            className="w-36 sm:w-48 accent-emerald-500 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-emerald-400 min-w-[3ch]">
            {Math.round(explodedAmount * 100)}%
          </span>
          <button
            onClick={() => onChangeExplodedAmount(explodedAmount > 0 ? 0 : 0.8)}
            className="rounded bg-[#16161a] border border-[#2a2a30] px-2.5 py-1 text-[10px] font-mono font-bold text-gray-300 hover:text-white cursor-pointer"
          >
            {explodedAmount > 0 ? 'Reset' : 'Explode'}
          </button>
        </div>
      )}

      {/* Clear Selected Component Quick Badge */}
      {selectedComponentId && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-950/80 backdrop-blur-md px-3.5 py-1 text-xs text-blue-200 shadow-xl animate-in fade-in duration-200">
          <span>Component Active</span>
          <button
            onClick={() => {
              sound.playClick();
              onClearSelection();
            }}
            className="flex items-center gap-1 rounded bg-blue-600/60 hover:bg-blue-600 text-white font-medium px-2 py-0.5 text-[11px] transition-colors cursor-pointer"
          >
            <XCircle className="h-3 w-3" />
            <span>Close Selection</span>
          </button>
        </div>
      )}

      {/* Main Glass Floating Pill Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 rounded-xl border border-[#2a2a30] bg-[#0a0a0c]/90 backdrop-blur-md p-1.5 shadow-2xl">
        {/* Reset Camera */}
        <button
          onClick={() => {
            sound.playClick();
            onSetCameraPreset('default');
          }}
          title="Reset Camera Angle (R)"
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-gray-300 hover:bg-[#16161a] hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Reset View</span>
        </button>

        {/* View Presets */}
        <div className="hidden md:flex items-center gap-0.5 border-l border-[#1f1f23] px-1">
          {[
            { id: 'top', label: 'Top' },
            { id: 'front', label: 'Front' },
            { id: 'side', label: 'Side' },
            { id: 'isometric', label: '3D' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSetCameraPreset(item.id as ViewCameraPreset);
              }}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
                cameraPreset === item.id
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                  : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-[#1f1f23]" />

        {/* 3D Labels Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleLabels();
          }}
          title="Toggle 3D Component Labels / Marks (L)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer ${
            showLabels
              ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
              : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
          }`}
        >
          {showLabels ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{showLabels ? 'Hide Marks' : 'Show Marks'}</span>
        </button>

        {/* Show Circuits & Connections */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleConnections();
          }}
          title="Toggle Data & Power Circuits (C)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer ${
            showAllConnections
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
          }`}
        >
          <GitCommit className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Circuits</span>
        </button>

        {/* Exploded View Toggle Popup Button */}
        <button
          onClick={() => {
            sound.playClick();
            setShowExplodedPopup(!showExplodedPopup);
          }}
          title="Exploded Assembly View (E)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer ${
            explodedAmount > 0 || showExplodedPopup
              ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
              : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Explode</span>
          {explodedAmount > 0 && (
            <span className="rounded bg-purple-500/30 px-1 text-[10px] font-mono text-purple-300">
              {Math.round(explodedAmount * 100)}%
            </span>
          )}
        </button>

        {/* 8-Layer Stackup Mode */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleLayerMode();
          }}
          title="Inspect 8 PCB Internal Layers (X)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer ${
            isLayerMode
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
              : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">PCB Layers</span>
        </button>

        {/* Component Isolation Mode */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleIsolation();
          }}
          title="Isolate Selected Component (I)"
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer ${
            isIsolated
              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
              : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
          }`}
        >
          <Focus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Isolate</span>
        </button>

        {/* Close All Marks / Selections */}
        {(selectedComponentId || showLabels) && (
          <button
            onClick={() => {
              sound.playClick();
              onClearSelection();
              if (showLabels) onToggleLabels();
            }}
            title="Close All Marks & Selections"
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-rose-500/20 transition-all cursor-pointer"
          >
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">Clear All Marks</span>
          </button>
        )}
      </div>
    </div>
  );
};
