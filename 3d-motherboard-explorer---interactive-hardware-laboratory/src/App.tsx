import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  GitCommit,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  VolumeX,
  Camera,
  ZoomIn,
  ZoomOut,
  Hand,
  Orbit,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Compass,
  Share2,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import {
  MotherboardComponent,
  ComponentCategory,
  ViewCameraPreset,
  AppTheme,
  PCBLayerInfo,
} from './types/motherboard';
import { MOTHERBOARD_COMPONENTS, CONNECTION_LINKS, PCB_LAYERS_DATA } from './data/componentsData';
import { MotherboardCanvas } from './components/3d/MotherboardCanvas';
import { sound } from './utils/audio';

export default function App() {
  const [components] = useState<MotherboardComponent[]>(MOTHERBOARD_COMPONENTS);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null);
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [isIsolated, setIsIsolated] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [showAllConnections, setShowAllConnections] = useState<boolean>(true);
  const [isLayerMode, setIsLayerMode] = useState<boolean>(false);
  const [selectedLayer, setSelectedLayer] = useState<PCBLayerInfo | null>(PCB_LAYERS_DATA[0]);
  const [cameraPreset, setCameraPreset] = useState<ViewCameraPreset>('default');
  const [theme] = useState<AppTheme>('clean-light');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExplodeSlider, setShowExplodeSlider] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  
  // Navigation & Pan state
  const [dragMode, setDragMode] = useState<'orbit' | 'pan'>('pan'); // Default to Pan/Move hand mode for effortless movement
  const [panOffset, setPanOffset] = useState<{ x: number; z: number }>({ x: 0, z: 0 });

  // Move across motherboard handlers
  const handleMove = useCallback((dx: number, dz: number) => {
    sound.playClick();
    setPanOffset((prev) => ({
      x: Math.round((prev.x + dx) * 10) / 10,
      z: Math.round((prev.z + dz) * 10) / 10,
    }));
  }, []);

  const handleResetPosition = useCallback(() => {
    sound.playClick();
    setPanOffset({ x: 0, z: 0 });
    setZoomLevel(1.0);
    setCameraPreset('default');
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    sound.playClick();
    setZoomLevel((prev) => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    sound.playClick();
    setZoomLevel((prev) => Math.max(0.3, Math.round((prev - 0.25) * 100) / 100));
  }, []);

  const handleResetZoom = useCallback(() => {
    sound.playClick();
    setZoomLevel(1.0);
  }, []);

  // Close / clear all markings
  const handleClearAllMarks = useCallback(() => {
    sound.playClick();
    setSelectedComponentId(null);
    setHoveredComponentId(null);
    setActiveCategory(null);
    setIsIsolated(false);
    setShowLabels(false);
  }, []);

  const handleSelectComponent = useCallback((id: string) => {
    sound.playClick();
    setSelectedComponentId(id);
  }, []);

  const handleToggleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleScreenshot = () => {
    sound.playWhoosh();
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `motherboard-3d-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleCopyLink = () => {
    sound.playClick();
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2500);
        })
        .catch(() => {
          // Fallback if clipboard permission is blocked
          fallbackCopyText(url);
        });
    } else {
      fallbackCopyText(url);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      // ignore
    }
    document.body.removeChild(textArea);
  };

  // Keyboard Navigation: WASD, Arrow keys, +, -, Space/H for Hand Pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          e.preventDefault();
          handleMove(0, -2.5);
          break;
        case 'arrowdown':
        case 's':
          e.preventDefault();
          handleMove(0, 2.5);
          break;
        case 'arrowleft':
        case 'a':
          e.preventDefault();
          handleMove(-2.5, 0);
          break;
        case 'arrowright':
        case 'd':
          e.preventDefault();
          handleMove(2.5, 0);
          break;
        case 'h':
        case ' ':
          e.preventDefault();
          setDragMode((prev) => (prev === 'pan' ? 'orbit' : 'pan'));
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetZoom();
          break;
        case 'r':
          handleResetPosition();
          break;
        case '1':
          sound.playClick();
          setCameraPreset('top');
          break;
        case '2':
          sound.playClick();
          setCameraPreset('front');
          break;
        case '3':
          sound.playClick();
          setCameraPreset('side');
          break;
        case '4':
          sound.playClick();
          setCameraPreset('isometric');
          break;
        case 'l':
          sound.playClick();
          setShowLabels((prev) => !prev);
          break;
        case 'c':
          sound.playClick();
          setShowAllConnections((prev) => !prev);
          break;
        case 'e':
          sound.playClick();
          setExplodedAmount((prev) => (prev > 0 ? 0 : 0.8));
          break;
        case 'f':
          handleToggleFullscreen();
          break;
        case 'escape':
          handleClearAllMarks();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClearAllMarks, handleZoomIn, handleZoomOut, handleResetZoom, handleMove, handleResetPosition]);

  const selectedComp = components.find((c) => c.id === selectedComponentId) || null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white select-none font-sans">
      {/* 100% Full Viewport 3D Motherboard Canvas */}
      <div className="absolute inset-0 h-full w-full">
        <MotherboardCanvas
          components={components}
          connections={CONNECTION_LINKS}
          selectedComponentId={selectedComponentId}
          hoveredComponentId={hoveredComponentId}
          activeCategory={activeCategory}
          explodedAmount={explodedAmount}
          isIsolated={isIsolated}
          showLabels={showLabels}
          showAllConnections={showAllConnections}
          isLayerMode={isLayerMode}
          selectedLayerId={selectedLayer?.id || null}
          cameraPreset={cameraPreset}
          theme={theme}
          isMaximized={true}
          zoomLevel={zoomLevel}
          dragMode={dragMode}
          panOffset={panOffset}
          onSelectComponent={handleSelectComponent}
          onHoverComponent={setHoveredComponentId}
          onSelectLayer={(layer) => {
            sound.playClick();
            setSelectedLayer(layer);
          }}
        />
      </div>

      {/* Floating Top Header Badge */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-gray-200/80 bg-white/90 px-3.5 py-1.5 shadow-lg backdrop-blur-md">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
            3D
          </div>
          <span className="text-xs font-semibold tracking-wide text-gray-800">
            3D Motherboard Explorer <span className="text-emerald-600 font-mono text-[11px] ml-1">Z790 ATX</span>
          </span>
          {(panOffset.x !== 0 || panOffset.z !== 0) && (
            <button
              onClick={handleResetPosition}
              className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors cursor-pointer"
              title="Recenter Motherboard Position"
            >
              Recenter
            </button>
          )}
        </div>

        {/* Quick Utility Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white/90 p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => {
              sound.playClick();
              setShowShareModal(true);
            }}
            title="Share Project / Live Website Link"
            className="flex h-8 items-center gap-1.5 rounded-full bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline sm:inline">Share Live</span>
          </button>
          <button
            onClick={handleScreenshot}
            title="Take Screenshot"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen (F)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Floating Navigation D-Pad (Move Across Motherboard) on Left */}
      <div className="pointer-events-auto absolute left-5 top-20 z-20 flex flex-col items-center rounded-2xl border border-gray-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-md">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Move</span>
        
        {/* Up */}
        <button
          onClick={() => handleMove(0, -3)}
          title="Move Up (W / ↑)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        {/* Left, Center/Reset, Right */}
        <div className="flex items-center gap-1 my-0.5">
          <button
            onClick={() => handleMove(-3, 0)}
            title="Move Left (A / ←)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetPosition}
            title="Recenter Motherboard (R)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
          >
            <Crosshair className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleMove(3, 0)}
            title="Move Right (D / →)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Down */}
        <button
          onClick={() => handleMove(0, 3)}
          title="Move Down (S / ↓)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowDown className="h-4 w-4" />
        </button>

        {/* Drag Mode Toggle (Hand Pan vs Orbit 3D) */}
        <div className="mt-2 flex w-full flex-col gap-1 border-t border-gray-100 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              setDragMode('pan');
            }}
            title="Pan / Move Mode (Click & Drag across board)"
            className={`flex h-7 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-colors cursor-pointer ${
              dragMode === 'pan'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Hand className="h-3 w-3" />
            <span>Pan</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setDragMode('orbit');
            }}
            title="3D Rotate Mode (Click & Rotate angle)"
            className={`flex h-7 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition-colors cursor-pointer ${
              dragMode === 'orbit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Orbit className="h-3 w-3" />
            <span>Orbit</span>
          </button>
        </div>
      </div>

      {/* Floating Zoom Widget on Right */}
      <div className="pointer-events-auto absolute right-5 top-20 z-20 flex flex-col items-center gap-1 rounded-2xl border border-gray-200/90 bg-white/95 p-1.5 shadow-xl backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          title="Zoom In (+)"
          disabled={zoomLevel >= 3.5}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={handleResetZoom}
          title="Click to Reset Zoom (100%)"
          className="rounded-lg px-1.5 py-0.5 font-mono text-[10px] font-bold text-gray-500 hover:bg-gray-100 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          disabled={zoomLevel <= 0.3}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Selected Component Info Card (Modal Sheet on Mobile, Floating Card on Desktop) */}
      {selectedComp && (
        <div className="pointer-events-auto absolute z-30 inset-x-3 bottom-20 sm:bottom-auto sm:inset-x-auto sm:right-16 sm:top-20 max-w-full sm:w-96 max-h-[70vh] sm:max-h-none overflow-y-auto rounded-2xl border border-gray-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                {selectedComp.shortName}
              </span>
              <h3 className="mt-1 text-sm sm:text-base font-bold text-gray-900 leading-snug">{selectedComp.name}</h3>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedComponentId(null);
              }}
              title="Close (Esc)"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-gray-600">
            {selectedComp.whatItDoes || selectedComp.shortDescription}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-2.5 text-[11px] border border-gray-100">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Bus Interface</span>
              <span className="font-semibold text-gray-800">{selectedComp.busInterface || 'Direct SMT'}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Speed / Spec</span>
              <span className="font-semibold text-gray-800">{selectedComp.dataSpeed || selectedComp.voltage || 'Standard'}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-1 gap-2">
            <span className="text-[11px] font-medium text-emerald-700 truncate">
              💡 {selectedComp.realWorldAnalogy || 'Core Motherboard Interconnect'}
            </span>
            <button
              onClick={() => {
                sound.playClick();
                setSelectedComponentId(null);
              }}
              className="rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer whitespace-nowrap active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Sleek Floating Bottom Control Bar (Touch Optimized for Android & Mobile) */}
      <div className="pointer-events-none absolute bottom-3 sm:bottom-5 left-0 right-0 z-20 flex flex-col items-center gap-2 px-2 sm:px-4">
        {/* Exploded Slider Popup */}
        {showExplodeSlider && (
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 rounded-full border border-gray-200/90 bg-white/95 px-3.5 py-2 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Explode:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={explodedAmount}
              onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
              className="w-28 sm:w-48 accent-emerald-600 cursor-pointer h-2"
            />
            <span className="font-mono text-xs font-bold text-emerald-600 min-w-[3ch]">
              {Math.round(explodedAmount * 100)}%
            </span>
            <button
              onClick={() => setExplodedAmount(explodedAmount > 0 ? 0 : 0.85)}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer active:scale-95"
            >
              {explodedAmount > 0 ? 'Reset' : 'Explode'}
            </button>
          </div>
        )}

        {/* Main Floating Glass Capsule Bar */}
        <div className="pointer-events-auto flex max-w-full overflow-x-auto no-scrollbar items-center gap-1 rounded-full border border-gray-200/90 bg-white/95 px-2 py-1 sm:py-1.5 shadow-2xl backdrop-blur-md">
          {/* Recenter & Reset Camera */}
          <button
            onClick={handleResetPosition}
            title="Reset View & Recenter (R)"
            className="flex h-8 items-center gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden xs:inline sm:inline">Recenter</span>
          </button>

          {/* Drag Mode Switcher */}
          <div className="flex items-center gap-0.5 border-l border-gray-200 pl-1.5 pr-1">
            <button
              onClick={() => {
                sound.playClick();
                setDragMode('pan');
              }}
              title="Move / Pan across motherboard (Hand tool)"
              className={`flex h-7 items-center gap-1 rounded-full px-2 sm:px-2.5 text-xs font-medium transition-colors cursor-pointer active:scale-95 whitespace-nowrap ${
                dragMode === 'pan'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Hand className="h-3 w-3" />
              <span>Pan</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setDragMode('orbit');
              }}
              title="3D Orbit / Rotate camera"
              className={`flex h-7 items-center gap-1 rounded-full px-2 sm:px-2.5 text-xs font-medium transition-colors cursor-pointer active:scale-95 whitespace-nowrap ${
                dragMode === 'orbit'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Orbit className="h-3 w-3" />
              <span>3D</span>
            </button>
          </div>

          {/* View Presets */}
          <div className="hidden md:flex items-center gap-1 border-l border-gray-200 px-1.5">
            {[
              { id: 'top', label: 'Top (1)' },
              { id: 'front', label: 'Front (2)' },
              { id: 'side', label: 'Side (3)' },
              { id: 'isometric', label: '3D (4)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playClick();
                  setCameraPreset(p.id as ViewCameraPreset);
                }}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  cameraPreset === p.id
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-200" />

          {/* Toggle Labels */}
          <button
            onClick={() => {
              sound.playClick();
              setShowLabels((prev) => !prev);
            }}
            title="Toggle Component Labels (L)"
            className={`flex h-8 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-medium transition-colors cursor-pointer active:scale-95 whitespace-nowrap ${
              showLabels
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'
            }`}
          >
            {showLabels ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{showLabels ? 'Marks On' : 'Marks Off'}</span>
            <span className="sm:hidden">Labels</span>
          </button>

          {/* Toggle Circuits */}
          <button
            onClick={() => {
              sound.playClick();
              setShowAllConnections((prev) => !prev);
            }}
            title="Toggle Animated Data Bus Circuits (C)"
            className={`flex h-8 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-medium transition-colors cursor-pointer active:scale-95 whitespace-nowrap ${
              showAllConnections
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Circuits</span>
          </button>

          {/* Explode Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowExplodeSlider(!showExplodeSlider);
            }}
            title="Exploded Assembly View (E)"
            className={`flex h-8 items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 text-xs font-medium transition-colors cursor-pointer active:scale-95 whitespace-nowrap ${
              explodedAmount > 0 || showExplodeSlider
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Explode</span>
            {explodedAmount > 0 && (
              <span className="font-mono text-[10px] bg-purple-700 px-1.5 rounded-full">
                {Math.round(explodedAmount * 100)}%
              </span>
            )}
          </button>

          {/* Close All Marks */}
          {(selectedComponentId || showLabels) && (
            <button
              onClick={handleClearAllMarks}
              title="Close all marks and active selection (Esc)"
              className="flex h-8 items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 sm:px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Close All Marks</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Your Project is Live!</h3>
                  <p className="text-xs text-gray-500">Anyone with this link can view and explore your 3D model</p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* URL Display Box */}
            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Public Live Website Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="w-full bg-transparent font-mono text-xs text-emerald-800 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
                >
                  {hasCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-4 space-y-2 rounded-xl bg-emerald-50/60 p-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-emerald-900">100% Free, Global, Real-Time Access</span>
              </div>
              <p className="text-gray-600 leading-relaxed text-[11.5px]">
                Share this link on WhatsApp, Discord, LinkedIn, Reddit, or email. Users on mobile (iOS/Android) and desktop can interact in real time with zero installation.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
