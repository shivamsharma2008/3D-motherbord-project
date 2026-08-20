import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Camera,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Palette,
  Keyboard,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { MotherboardComponent, ViewCameraPreset, AppTheme } from '../../types/motherboard';
import { sound } from '../../utils/audio';

interface TopBarProps {
  components: MotherboardComponent[];
  onSelectComponent: (id: string) => void;
  onSetCameraPreset: (preset: ViewCameraPreset) => void;
  theme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
  onOpenShortcuts: () => void;
  onOpenQuiz: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  selectedComponentId?: string | null;
  onClearAllMarks?: () => void;
  showLabels?: boolean;
  onToggleLabels?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  components,
  onSelectComponent,
  onSetCameraPreset,
  theme,
  onSetTheme,
  onOpenShortcuts,
  onOpenQuiz,
  isMuted,
  onToggleMute,
  selectedComponentId,
  onClearAllMarks,
  showLabels = true,
  onToggleLabels,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search filter
  const searchResults = searchQuery.trim()
    ? components.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleFullscreenToggle = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleScreenshot = () => {
    sound.playWhoosh();
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `motherboard-3d-explorer-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  // Keyboard shortcut listener for '/' search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="relative z-30 flex h-14 w-full items-center justify-between border-b border-[#1f1f23] bg-[#0a0a0c] px-4 sm:px-6">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white italic text-sm shadow-md shadow-emerald-500/20">
          M
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight uppercase text-white sm:text-base">
              <span className="text-emerald-400 font-bold">MBX</span> <span className="text-gray-400 font-light">//</span> Hardware Explorer
            </h1>
            <span className="hidden rounded bg-[#16161a] px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-[#2a2a30] sm:inline-block">
              ATX Z790 GREEN PCB
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="relative mx-4 max-w-md flex-1">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-500" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search CPU, RAM, VRM, PCIe, BIOS... (/)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="h-9 w-full rounded-lg border border-[#2a2a30] bg-[#16161a] pl-9 pr-8 text-xs text-gray-200 placeholder-gray-500 transition-all focus:border-emerald-500 focus:bg-[#1a1a20] focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-xs text-gray-500 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute left-0 top-11 max-h-72 w-full overflow-y-auto rounded-lg border border-[#2a2a30] bg-[#0f0f13] p-1.5 shadow-2xl z-50">
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectComponent(item.id);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-[#1a1a22] cursor-pointer"
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                    <span className="font-mono text-[10px] text-gray-400">{item.shortName}</span>
                  </div>
                  <p className="line-clamp-1 text-[11px] text-gray-400">{item.shortDescription}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls Header Cluster */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Close All Marks Option */}
        {(selectedComponentId || showLabels) && onClearAllMarks && (
          <button
            onClick={() => {
              sound.playClick();
              onClearAllMarks();
            }}
            title="Close all marked components and active selection"
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/60 hover:text-rose-100 transition-all cursor-pointer"
          >
            <XCircle className="h-4 w-4 text-rose-400" />
            <span className="hidden md:inline">Close Marked Components</span>
          </button>
        )}

        {/* Toggle Marks / Labels */}
        {onToggleLabels && (
          <button
            onClick={() => {
              sound.playClick();
              onToggleLabels();
            }}
            title={showLabels ? 'Hide Component Marks' : 'Show Component Marks'}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all cursor-pointer ${
              showLabels
                ? 'border border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                : 'text-gray-400 hover:bg-[#16161a] hover:text-gray-200'
            }`}
          >
            {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="hidden sm:inline">{showLabels ? 'Marks On' : 'Marks Off'}</span>
          </button>
        )}

        {/* Mute Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Sound FX (M)' : 'Mute Sound FX (M)'}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-white cursor-pointer transition-colors"
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Screenshot Capture */}
        <button
          onClick={handleScreenshot}
          title="Capture High-Res Screenshot"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-white cursor-pointer transition-colors"
        >
          <Camera className="h-4 w-4" />
        </button>

        {/* Keyboard Shortcuts */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenShortcuts();
          }}
          title="Keyboard Shortcuts"
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-white cursor-pointer transition-colors"
        >
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Fullscreen Maximize Toggle */}
        <button
          onClick={handleFullscreenToggle}
          title="Fullscreen Mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-[#16161a] hover:text-white cursor-pointer transition-colors"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};
