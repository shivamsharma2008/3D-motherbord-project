import React from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowDownCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { MotherboardComponent } from '../../types/motherboard';
import { sound } from '../../utils/audio';

interface VirtualBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: MotherboardComponent[];
  installedParts: Record<string, boolean>;
  onTogglePartInstall: (partId: string) => void;
  onResetBuild: () => void;
  onSelectComponent: (id: string) => void;
}

export const VirtualBuilderModal: React.FC<VirtualBuilderModalProps> = ({
  isOpen,
  onClose,
  components,
  installedParts,
  onTogglePartInstall,
  onResetBuild,
  onSelectComponent,
}) => {
  if (!isOpen) return null;

  const removableParts = [
    {
      id: 'cpu',
      name: 'Central Processing Unit (CPU)',
      slotName: 'LGA1700 / AM5 Socket',
      step: 1,
      rule: 'Align the golden triangle on the CPU corner with the socket triangle before clamping the lever.',
    },
    {
      id: 'ram_stick_1',
      name: 'DDR5 RAM Stick 1 (Slot A2)',
      slotName: 'DIMM Slot 2',
      step: 2,
      rule: 'Install in Slot 2 (A2) first for optimal signal reflection termination.',
    },
    {
      id: 'ram_stick_2',
      name: 'DDR5 RAM Stick 2 (Slot B2)',
      slotName: 'DIMM Slot 4',
      step: 3,
      rule: 'Fills Channel B to enable 128-bit Dual-Channel memory bandwidth.',
    },
    {
      id: 'm2_ssd_installed',
      name: 'M.2 NVMe PCIe 5.0 SSD',
      slotName: 'M.2 Slot 1 (CPU Attached)',
      step: 4,
      rule: 'Insert at a 30-degree angle, press down gently, and secure with the EZ-Latch.',
    },
    {
      id: 'm2_shield_1',
      name: 'M.2 Thermal Armor Heatsink',
      slotName: 'M.2 Thermal Plate',
      step: 5,
      rule: 'Remember to peel off the protective plastic film from the blue thermal pad.',
    },
    {
      id: 'vrm_heatsink',
      name: 'VRM Aluminum Heatsink Armor',
      slotName: 'VRM Power Stages',
      step: 6,
      rule: 'Passively cools the 16 DrMOS power stages and power chokes.',
    },
    {
      id: 'cmos_battery',
      name: 'CR2032 3V Lithium Coin Battery',
      slotName: 'CMOS Socket',
      step: 7,
      rule: 'Positive (+) side facing up to power the Real-Time Clock.',
    },
  ];

  const totalInstalled = removableParts.filter((p) => installedParts[p.id] !== false).length;
  const isComplete = totalInstalled === removableParts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Virtual Assembly Lab</h2>
              <p className="text-xs text-slate-400">Install and remove modular hardware components</p>
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

        {/* Assembly Status Banner */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Assembly Status:</span>
            <span className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalInstalled} / {removableParts.length} Components Mounted
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onResetBuild();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Scrollable Parts List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {removableParts.map((part) => {
            const isInstalled = installedParts[part.id] !== false;

            return (
              <div
                key={part.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                  isInstalled
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/40 opacity-75'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                      {part.step}
                    </span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectComponent(part.id);
                      }}
                      className="text-xs sm:text-sm font-bold text-white hover:text-cyan-400 text-left cursor-pointer"
                    >
                      {part.name}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{part.rule}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isInstalled) sound.playClick();
                      else sound.playSuccess();
                      onTogglePartInstall(part.id);
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      isInstalled
                        ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Install</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 cursor-pointer"
          >
            Done Building
          </button>
        </div>
      </div>
    </div>
  );
};
