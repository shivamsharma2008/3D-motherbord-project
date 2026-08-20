import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { sound } from '../../utils/audio';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Quick search motherboard components' },
    { key: 'R', desc: 'Reset 3D camera to default overview' },
    { key: '1', desc: 'Camera: Top View (Birds Eye)' },
    { key: '2', desc: 'Camera: Front Edge View' },
    { key: '3', desc: 'Camera: Side Profile View' },
    { key: '4', desc: 'Camera: Isometric 3D View' },
    { key: 'L', desc: 'Toggle 3D Floating Labels ON / OFF' },
    { key: 'C', desc: 'Toggle Animated Connection Data Traces' },
    { key: 'E', desc: 'Toggle Exploded Assembly View' },
    { key: 'X', desc: 'Toggle 8-Layer PCB Cross-Section Mode' },
    { key: 'I', desc: 'Isolate currently selected component' },
    { key: 'M', desc: 'Toggle Audio Mute / Unmute' },
    { key: 'Esc', desc: 'Deselect component or close modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-400">Navigate the 3D lab like a power user</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-800/80 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-300">{sc.desc}</span>
              <kbd className="flex h-6 min-w-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800 px-2 font-mono text-[11px] font-bold text-cyan-300 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
