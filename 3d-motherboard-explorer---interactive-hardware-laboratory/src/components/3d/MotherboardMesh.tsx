import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MotherboardComponent, ComponentCategory, AppTheme } from '../../types/motherboard';
import { generatePCBTexture } from './PCBTextureGenerator';

interface MotherboardMeshProps {
  components: MotherboardComponent[];
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  activeCategory: ComponentCategory | null;
  explodedAmount: number; // 0.0 to 1.0
  isIsolated: boolean;
  theme: AppTheme;
  onSelectComponent: (id: string) => void;
  onHoverComponent: (id: string | null) => void;
}

export const MotherboardMesh: React.FC<MotherboardMeshProps> = ({
  components,
  selectedComponentId,
  hoveredComponentId,
  activeCategory,
  explodedAmount,
  isIsolated,
  theme,
  onSelectComponent,
  onHoverComponent,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const pcbTexture = useMemo(() => generatePCBTexture(theme), [theme]);

  // Dynamic Component Elevation for Exploded View
  const getComponentElevation = (comp: MotherboardComponent | undefined): [number, number, number] => {
    if (!comp) return [0, 0, 0];
    const base = comp.position;
    if (explodedAmount <= 0) return base;

    const offset = comp.explodedOffset || [0, 1.5, 0];
    return [
      base[0] + offset[0] * explodedAmount,
      base[1] + offset[1] * explodedAmount * 4.5,
      base[2] + offset[2] * explodedAmount,
    ];
  };

  // Determine appearance status
  const getComponentState = (comp: MotherboardComponent | undefined) => {
    if (!comp) return { isSelected: false, isHovered: false, isCategoryMatched: false, isDimmed: false };
    const isSelected = selectedComponentId === comp.id;
    const isHovered = hoveredComponentId === comp.id;
    const isCategoryMatched = activeCategory ? comp.category === activeCategory : false;
    const isDimmed = isIsolated && selectedComponentId !== null && !isSelected;

    return { isSelected, isHovered, isCategoryMatched, isDimmed };
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Base ATX Multi-layer PCB Board */}
      <mesh
        position={[0, explodedAmount * -1.5, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent('pcb_board');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverComponent('pcb_board');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverComponent(null);
        }}
      >
        <boxGeometry args={[18, 0.32, 22]} />
        <meshStandardMaterial
          map={pcbTexture}
          roughness={0.35}
          metalness={0.25}
          color={
            selectedComponentId === 'pcb_board'
              ? '#3b82f6'
              : '#ffffff'
          }
          emissive={selectedComponentId === 'pcb_board' ? '#1d4ed8' : '#000000'}
          emissiveIntensity={selectedComponentId === 'pcb_board' ? 0.35 : 0}
        />
      </mesh>

      {/* PCB Screw Standoff Rings in 9 ATX standard positions */}
      {[
        [-8.0, 0.17, -9.5], [0, 0.17, -9.5], [8.0, 0.17, -9.5],
        [-8.0, 0.17, 0.0],  [0, 0.17, 0.0],  [8.0, 0.17, 0.0],
        [-8.0, 0.17, 9.5],  [0, 0.17, 9.5],  [8.0, 0.17, 9.5],
      ].map((pos, idx) => (
        <group key={`standoff-${idx}`} position={[pos[0], pos[1] + explodedAmount * -1.5, pos[2]]}>
          {/* Gold & Silver ground ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.48, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Solder star contact pads */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={`star-${deg}`} position={[Math.cos(rad) * 0.38, 0.01, Math.sin(rad) * 0.38]}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
            );
          })}
          {/* Through hole */}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 20]} />
            <meshBasicMaterial color="#05070a" />
          </mesh>
        </group>
      ))}

      {/* Exploded View Guide Lines */}
      {explodedAmount > 0.05 && (
        <group>
          {components.map((comp) => {
            if (!comp.explodedOffset || comp.id === 'pcb_board') return null;
            const targetPos = getComponentElevation(comp);
            return (
              <line key={`guide-${comp.id}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array([
                        comp.position[0],
                        comp.position[1],
                        comp.position[2],
                        targetPos[0],
                        targetPos[1],
                        targetPos[2],
                      ]),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineDashedMaterial
                  color="#3b82f6"
                  dashSize={0.2}
                  gapSize={0.1}
                  opacity={0.6 * explodedAmount}
                  transparent
                />
              </line>
            );
          })}
        </group>
      )}

      {/* 2. CPU Socket (LGA 1700 / AM5) */}
      {renderCPUSocket(
        components.find((c) => c.id === 'cpu_socket')!,
        getComponentElevation(components.find((c) => c.id === 'cpu_socket')),
        getComponentState(components.find((c) => c.id === 'cpu_socket')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 3. CPU Processor (IHS - Integrated Heat Spreader) */}
      {renderCPU(
        components.find((c) => c.id === 'cpu')!,
        getComponentElevation(components.find((c) => c.id === 'cpu')),
        getComponentState(components.find((c) => c.id === 'cpu')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 4. DDR5 RAM Slots (DIMM Slots) */}
      {renderRAMSlots(
        components.find((c) => c.id === 'ram_slots')!,
        getComponentElevation(components.find((c) => c.id === 'ram_slots')),
        getComponentState(components.find((c) => c.id === 'ram_slots')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 5. DDR5 RAM Sticks (Slot 2 & 4 installed modules with Vivid Colors & RGB) */}
      {renderRAMStick(
        components.find((c) => c.id === 'ram_stick_1')!,
        getComponentElevation(components.find((c) => c.id === 'ram_stick_1')),
        getComponentState(components.find((c) => c.id === 'ram_stick_1')),
        '#06b6d4', // Cyan RGB Diffuser
        '#1d4ed8', // Royal Sapphire Blue Armor
        onSelectComponent,
        onHoverComponent
      )}

      {renderRAMStick(
        components.find((c) => c.id === 'ram_stick_2')!,
        getComponentElevation(components.find((c) => c.id === 'ram_stick_2')),
        getComponentState(components.find((c) => c.id === 'ram_stick_2')),
        '#ec4899', // Pink/Magenta RGB Diffuser
        '#dc2626', // Crimson Red Armor
        onSelectComponent,
        onHoverComponent
      )}

      {/* 6. VRM Power Delivery System (Chokes, DrMOS Power Stages, Ruby & Sapphire Solid Caps - Exposed) */}
      {renderVRMSystem(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 8. Chipset (Intel Z790 PCH) & Armor Heatsink */}
      {renderChipset(
        components.find((c) => c.id === 'chipset')!,
        getComponentElevation(components.find((c) => c.id === 'chipset')),
        getComponentState(components.find((c) => c.id === 'chipset')),
        onSelectComponent,
        onHoverComponent
      )}

      {renderChipsetHeatsink(
        components.find((c) => c.id === 'chipset_heatsink')!,
        getComponentElevation(components.find((c) => c.id === 'chipset_heatsink')),
        getComponentState(components.find((c) => c.id === 'chipset_heatsink')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 9. CMOS 3V Battery in Sapphire Socket */}
      {renderCMOSBattery(
        components.find((c) => c.id === 'cmos_battery')!,
        getComponentElevation(components.find((c) => c.id === 'cmos_battery')),
        getComponentState(components.find((c) => c.id === 'cmos_battery')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 10. BIOS / UEFI SPI Flash Chip */}
      {renderBIOSChip(
        components.find((c) => c.id === 'bios_chip')!,
        getComponentElevation(components.find((c) => c.id === 'bios_chip')),
        getComponentState(components.find((c) => c.id === 'bios_chip')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 11. PCIe Slots (x16 Primary Steel Armor, Secondary x16, x1 Slots) */}
      {renderPCIeSlots(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 12. M.2 NVMe SSD Slot, SSD Drive & Thermal Shield */}
      {renderM2System(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 13. SATA Ports (Red & Blue Stacked Blocks) */}
      {renderSATAPorts(
        components.find((c) => c.id === 'sata_ports')!,
        getComponentElevation(components.find((c) => c.id === 'sata_ports')),
        getComponentState(components.find((c) => c.id === 'sata_ports')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 14. Power Connectors (24-Pin ATX & 8-Pin CPU EPS with Gold Pins) */}
      {renderPowerConnectors(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 15. Rear I/O Shield & Colorful Port Cluster */}
      {renderRearIO(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 16. Audio Section (Codec IC, Nichicon Gold Caps, Isolated Boundary) */}
      {renderAudioSection(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 17. Ethernet Controller & Clock Generator ICs */}
      {renderNetworkingAndClock(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 18. Diagnostic POST Code 7-Segment & EZ Debug LEDs */}
      {renderDebugDiagnostics(
        components.find((c) => c.id === 'debug_leds')!,
        getComponentElevation(components.find((c) => c.id === 'debug_leds')),
        getComponentState(components.find((c) => c.id === 'debug_leds')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 19. Fan Headers & Internal Front Panel / USB Headers */}
      {renderInternalHeaders(
        components,
        getComponentElevation,
        getComponentState,
        onSelectComponent,
        onHoverComponent
      )}

      {/* 20. Scattered Surface-Mount MLCC Micro Capacitors */}
      {renderSMDArrays(
        components.find((c) => c.id === 'smd_resistors_capacitors')!,
        getComponentElevation(components.find((c) => c.id === 'smd_resistors_capacitors')),
        getComponentState(components.find((c) => c.id === 'smd_resistors_capacitors')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 21. SMD Precision Chip Resistors (0402 / 0603 / 0805) */}
      {renderSMDChipResistors(
        components.find((c) => c.id === 'smd_chip_resistors')!,
        getComponentElevation(components.find((c) => c.id === 'smd_chip_resistors')),
        getComponentState(components.find((c) => c.id === 'smd_chip_resistors')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 22. Convex 4-Pack Resistor Arrays (Bus Termination) */}
      {renderResistorNetworks(
        components.find((c) => c.id === 'resistor_networks')!,
        getComponentElevation(components.find((c) => c.id === 'resistor_networks')),
        getComponentState(components.find((c) => c.id === 'resistor_networks')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 23. Current Sense Shunt Resistors (Power Telemetry) */}
      {renderCurrentSenseShunts(
        components.find((c) => c.id === 'shunt_resistors')!,
        getComponentElevation(components.find((c) => c.id === 'shunt_resistors')),
        getComponentState(components.find((c) => c.id === 'shunt_resistors')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 24. Audio Section Precision Filter Resistors */}
      {renderAudioResistors(
        components.find((c) => c.id === 'audio_resistors')!,
        getComponentElevation(components.find((c) => c.id === 'audio_resistors')),
        getComponentState(components.find((c) => c.id === 'audio_resistors')),
        onSelectComponent,
        onHoverComponent
      )}

      {/* 25. Hardware Control, Status & Shift Registers (CSR / 74HC595 / EC) */}
      {renderHardwareRegisters(
        components.find((c) => c.id === 'hardware_registers'),
        getComponentElevation(components.find((c) => c.id === 'hardware_registers')),
        getComponentState(components.find((c) => c.id === 'hardware_registers')),
        onSelectComponent,
        onHoverComponent
      )}
    </group>
  );
};

// ==================== COMPONENT RENDER HELPERS ====================

function getMaterialProps(
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  baseColor: string,
  metalness = 0.5,
  roughness = 0.5
) {
  if (state.isSelected) {
    return {
      color: '#3b82f6',
      emissive: '#1d4ed8',
      emissiveIntensity: 0.8,
      metalness: 0.4,
      roughness: 0.2,
      opacity: 1.0,
      transparent: false,
    };
  }
  if (state.isHovered) {
    return {
      color: '#60a5fa',
      emissive: '#2563eb',
      emissiveIntensity: 0.5,
      metalness: 0.4,
      roughness: 0.25,
      opacity: 1.0,
      transparent: false,
    };
  }
  if (state.isCategoryMatched) {
    return {
      color: '#60a5fa',
      emissive: '#1e40af',
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.35,
      opacity: 1.0,
      transparent: false,
    };
  }
  if (state.isDimmed) {
    return {
      color: '#1f242d',
      emissive: '#000000',
      emissiveIntensity: 0,
      metalness: 0.1,
      roughness: 0.9,
      opacity: 0.2,
      transparent: true,
    };
  }
  return {
    color: baseColor,
    emissive: '#000000',
    emissiveIntensity: 0,
    metalness,
    roughness,
    opacity: 1.0,
    transparent: false,
  };
}

// 2. CPU Socket (LGA 1700 / AM5 - Vibrant Sapphire Frame & Chrome ILM)
function renderCPUSocket(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#1e3a8a', 0.5, 0.4); // Vibrant Sapphire Frame

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Precision Plastic Socket Base Frame (Sapphire Blue) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.28, 4.5]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Recessed Central Pin Cavity */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[3.5, 0.14, 3.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Gold Spring Contact Array (Dense gold contact pin grid) */}
      <mesh position={[0, 0.16, 0]}>
        <planeGeometry args={[3.3, 3.3]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.2}
          metalness={0.98}
          emissive="#d97706"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Gold Pin Dots Pattern */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) =>
        [-1.2, -0.6, 0, 0.6, 1.2].map((z) => (
          <mesh key={`pin-${x}-${z}`} position={[x, 0.17, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.02, 6]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
          </mesh>
        ))
      )}

      {/* Stainless Steel Independent Loading Mechanism (ILM Frame) */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[4.3, 0.06, 4.3]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
      </mesh>
      {/* Cutout center for CPU insertion */}
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[3.4, 0.08, 3.4]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Retention Load Lever (Chrome arm & latch hook) */}
      <mesh position={[2.3, 0.22, 0]} rotation={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.07, 0.07, 4.3, 12]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
      </mesh>
      {/* Lever Handle Cap (Electric Blue plastic tip) */}
      <mesh position={[2.3, 0.22, 2.2]}>
        <boxGeometry args={[0.2, 0.18, 0.4]} />
        <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Socket Corner Alignment Triangle (Gold) */}
      <mesh position={[-1.9, 0.22, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 3]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

// 3. CPU Processor (IHS - Emerald Green Substrate & Polished Nickel Heatspreader)
function renderCPU(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#f1f5f9', 0.94, 0.15);

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Vibrant Emerald Silicon Multi-layer Substrate Base */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[3.85, 0.08, 3.85]} />
        <meshStandardMaterial color="#059669" roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Gold Contact Pads on Under-lip */}
      {[-1.6, 1.6].map((x, i) => (
        <mesh key={`pad-${i}`} position={[x, -0.07, 0]}>
          <boxGeometry args={[0.3, 0.02, 3.2]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
        </mesh>
      ))}

      {/* Nickel-Plated Copper IHS Base Wings (clamped by socket ILM) */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[3.7, 0.12, 3.4]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Stepped Central Heatspreader Top Contact Plateau */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.12, 3.1]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Laser-Etched CPU Branding & Model Text Area */}
      <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Gold Pin 1 Corner Alignment Marker */}
      <mesh position={[-1.3, 0.19, -1.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 3]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

// 4. DDR5 RAM Slots (DIMM Slots with Color-Coded Channels & Armor)
function renderRAMSlots(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#18181b', 0.4, 0.5);

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* 4 Precision DDR5 DIMM Slot Housings */}
      {[-0.75, -0.25, 0.25, 0.75].map((xOffset, idx) => {
        const isPrimaryChannel = idx === 1 || idx === 3;
        const latchColor = idx === 0 || idx === 2 ? '#0284c7' : '#a855f7'; // Azure & Purple latches
        return (
          <group key={`dimm-slot-${idx}`} position={[xOffset, 0, 0]}>
            {/* Main Thermoplastic Slot Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.34, 0.44, 7.8]} />
              <meshStandardMaterial {...matProps} />
            </mesh>

            {/* Stainless Steel Reinforcement Shield on Primary Slots */}
            {isPrimaryChannel && (
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[0.36, 0.35, 7.7]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.12} />
              </mesh>
            )}

            {/* Internal Gold Spring Contact Row */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.12, 0.08, 7.2]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>

            {/* DDR5 Keying Notch */}
            <mesh position={[0, 0.21, -0.4]}>
              <boxGeometry args={[0.16, 0.12, 0.3]} />
              <meshStandardMaterial color="#111317" roughness={0.7} />
            </mesh>

            {/* Single-Sided EZ-Latch Ejector Clips on Top Edge (Vibrant Color) */}
            <mesh position={[0, 0.32, -3.8]}>
              <boxGeometry args={[0.28, 0.35, 0.32]} />
              <meshStandardMaterial color={latchColor} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Fixed bottom retention bracket */}
            <mesh position={[0, 0.28, 3.8]}>
              <boxGeometry args={[0.28, 0.28, 0.32]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 5. DDR5 RAM Sticks (Vivid Anodized Colors & RGB Diffuser Light Bars)
function renderRAMStick(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  rgbColor: string,
  armorColor: string,
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, armorColor, 0.88, 0.2);

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* 8-Layer Black PCB Base */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[0.12, 1.1, 7.3]} />
        <meshStandardMaterial color="#090a0f" roughness={0.6} />
      </mesh>

      {/* Gold-Plated Edge Fingers */}
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[0.14, 0.16, 7.1]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
      </mesh>

      {/* Dual Anodized Aluminum Armor Heatspreaders (Vibrant Finish) */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 1.1, 7.4]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Diamond Cut Geometric Fin Relief */}
      {[-2.2, -1.1, 0.0, 1.1, 2.2].map((z, i) => (
        <mesh key={`fin-${i}`} position={[0.14, 0.15, z]}>
          <boxGeometry args={[0.04, 0.6, 0.6]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}

      {/* Holographic Spec Label Sticker */}
      <mesh position={[0.14, -0.15, 0]}>
        <planeGeometry args={[0.01, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Frosted Acrylic RGB Diffuser Light Bar along top */}
      <mesh position={[0, 0.68, 0]}>
        <boxGeometry args={[0.28, 0.16, 7.35]} />
        <meshStandardMaterial
          color={state.isSelected ? '#3b82f6' : rgbColor}
          emissive={state.isSelected ? '#1d4ed8' : rgbColor}
          emissiveIntensity={0.95}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

// 6. VRM System (Power Delivery: Ruby & Sapphire Solid Caps, Molded Alloy Chokes, Power Stages)
function renderVRMSystem(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const vrmComp = components.find((c) => c.id === 'vrm');
  const chokesComp = components.find((c) => c.id === 'chokes');
  const capsComp = components.find((c) => c.id === 'capacitors');
  const mosfetsComp = components.find((c) => c.id === 'mosfets');

  const vrmState = getState(vrmComp);
  const chokesState = getState(chokesComp);
  const capsState = getState(capsComp);
  const mosfetsState = getState(mosfetsComp);

  const chokeMat = getMaterialProps(chokesState.isSelected ? chokesState : vrmState, '#1e293b', 0.7, 0.3);
  const mosfetMat = getMaterialProps(mosfetsState.isSelected ? mosfetsState : vrmState, '#0f172a', 0.4, 0.6);

  const leftPhases = [-6.2, -5.6, -5.0, -4.4, -3.8, -3.2, -2.6, -2.0];
  const topPhases = [-2.8, -2.1, -1.4, -0.7, 0.0, 0.7, 1.4, 2.1];

  return (
    <group>
      {/* LEFT VRM PHASE ARRAY */}
      <group position={[-3.2, 0, 0]}>
        {leftPhases.map((z, idx) => {
          // Alternating Ruby Red and Sapphire Blue solid caps
          const isRuby = idx % 2 === 0;
          const capColor = isRuby ? '#dc2626' : '#2563eb';
          const capMat = getMaterialProps(capsState.isSelected ? capsState : vrmState, capColor, 0.85, 0.2);

          return (
            <group key={`vrm-left-${idx}`}>
              {/* DrMOS 90A Smart Power Stage (MOSFET) */}
              <mesh
                position={[-1.2, 0.22, z]}
                castShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(mosfetsComp?.id || 'vrm');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(mosfetsComp?.id || 'vrm');
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  onHover(null);
                }}
              >
                <boxGeometry args={[0.55, 0.16, 0.55]} />
                <meshStandardMaterial {...mosfetMat} />
              </mesh>
              {/* Exposed silver thermal ground lead */}
              <mesh position={[-1.2, 0.31, z]}>
                <boxGeometry args={[0.3, 0.02, 0.3]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* R33 Molded Alloy Ferrite Choke (Inductor with Gold Accent) */}
              <mesh
                position={[-0.4, 0.36, z]}
                castShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(chokesComp?.id || 'vrm');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(chokesComp?.id || 'vrm');
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  onHover(null);
                }}
              >
                <boxGeometry args={[0.72, 0.48, 0.72]} />
                <meshStandardMaterial {...chokeMat} />
              </mesh>
              {/* Stamped Golden Inductance Marking on top */}
              <mesh position={[-0.4, 0.61, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.5, 0.3]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
              </mesh>

              {/* 10K Solid Polymer Capacitor (Ruby/Sapphire metallic sleeve) */}
              <mesh
                position={[0.5, 0.46, z]}
                castShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(capsComp?.id || 'vrm');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(capsComp?.id || 'vrm');
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  onHover(null);
                }}
              >
                <cylinderGeometry args={[0.26, 0.26, 0.66, 20]} />
                <meshStandardMaterial {...capMat} />
              </mesh>
              {/* Shiny Mirror Silver Capacitor Top */}
              <mesh position={[0.5, 0.8, z]}>
                <cylinderGeometry args={[0.25, 0.25, 0.03, 20]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
              </mesh>
              {/* Polarity Half-Circle Stripe (Electric Cyan) */}
              <mesh position={[0.5, 0.81, z + 0.1]}>
                <boxGeometry args={[0.18, 0.01, 0.18]} />
                <meshBasicMaterial color="#06b6d4" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* TOP VRM PHASE ARRAY */}
      <group position={[0, 0, -6.2]}>
        {topPhases.map((x, idx) => {
          const isRuby = idx % 2 !== 0;
          const capColor = isRuby ? '#dc2626' : '#2563eb';
          const capMat = getMaterialProps(capsState.isSelected ? capsState : vrmState, capColor, 0.85, 0.2);

          return (
            <group key={`vrm-top-${idx}`}>
              {/* Chokes */}
              <mesh
                position={[x, 0.36, -0.4]}
                castShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(chokesComp?.id || 'vrm');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(chokesComp?.id || 'vrm');
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  onHover(null);
                }}
              >
                <boxGeometry args={[0.72, 0.48, 0.72]} />
                <meshStandardMaterial {...chokeMat} />
              </mesh>
              <mesh position={[x, 0.61, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.5, 0.3]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.8} />
              </mesh>

              {/* Capacitors */}
              <mesh
                position={[x, 0.46, 0.5]}
                castShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(capsComp?.id || 'vrm');
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  onHover(capsComp?.id || 'vrm');
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  onHover(null);
                }}
              >
                <cylinderGeometry args={[0.26, 0.26, 0.66, 20]} />
                <meshStandardMaterial {...capMat} />
              </mesh>
              <mesh position={[x, 0.8, 0.5]}>
                <cylinderGeometry args={[0.25, 0.25, 0.03, 20]} />
                <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

// 7. VRM Heatsink Armor (Dual-Block CNC Aluminum + Polished Copper Heatpipe)
function renderVRMHeatsink(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#1e3a8a', 0.85, 0.2); // Cobalt Blue CNC Aluminum

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Left Heavy Multi-Finned Aluminum Armor Block */}
      <mesh position={[-0.4, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 1.3, 5.9]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Top Heavy Multi-Finned Aluminum Armor Block */}
      <mesh position={[3.2, 0.55, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 1.3, 1.85]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Connecting Polished Pure Copper Heatpipe */}
      <mesh position={[1.4, 0.8, -1.2]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2.7, 16]} />
        <meshStandardMaterial color="#f97316" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Precision CNC Heat Sink Cooling Fins Grooves */}
      {[-2.2, -1.4, -0.6, 0.2, 1.0, 1.8].map((z, i) => (
        <mesh key={`fin-${i}`} position={[-0.4, 1.22, z]}>
          <boxGeometry args={[1.75, 0.12, 0.25]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      ))}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <mesh key={`top-fin-${i}`} position={[x + 3.2, 1.22, -2.4]}>
          <boxGeometry args={[0.25, 0.12, 1.75]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      ))}

      {/* Brushed Chamfer Silver Highlight Stripe */}
      <mesh position={[-0.4, 0.6, 2.96]}>
        <boxGeometry args={[1.8, 0.1, 0.04]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// 8. Chipset (Intel Z790 PCH) & Armor Heatsink
function renderChipset(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#0284c7', 0.95, 0.15); // Silicon Teal Die

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Silicon Bare Die */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.22, 2.0]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Organic Emerald Substrate */}
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[2.9, 0.08, 2.9]} />
        <meshStandardMaterial color="#059669" roughness={0.4} />
      </mesh>
    </group>
  );
}

function renderChipsetHeatsink(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#1e293b', 0.85, 0.22);

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Main CNC Sculpted Chipset Armor Plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.0, 0.55, 4.0]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Stepped Tier Cutouts */}
      <mesh position={[0.6, 0.32, 0.6]}>
        <boxGeometry args={[2.4, 0.12, 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Illuminated Emblem ("Z790 APEX") */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#2563eb"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* 4x Spring-Loaded Corner Retention Screws (Chrome) */}
      {[
        [-1.7, 0.3, -1.7], [1.7, 0.3, -1.7],
        [-1.7, 0.3, 1.7],  [1.7, 0.3, 1.7],
      ].map((p, idx) => (
        <group key={`p-screw-${idx}`} position={[p[0], p[1], p[2]]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 12]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 9. CR2032 3V Lithium CMOS Battery in Sapphire Receptacle
function renderCMOSBattery(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#f8fafc', 0.98, 0.1); // Mirror Nickel Coin Cell

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Sapphire Socket Base Receptacle */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.22, 28]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
      </mesh>

      {/* Shiny Nickel-Plated CR2032 Coin Cell */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 28]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Engraved Plus Sign & Model text area on face */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 28]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
      </mesh>

      {/* Positive Spring Contact Ejector Clip (Gold) */}
      <mesh position={[0.75, 0.18, 0]}>
        <boxGeometry args={[0.22, 0.18, 0.45]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

// 10. BIOS SPI Flash SOIC-8 Chip
function renderBIOSChip(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#0f172a', 0.35, 0.65);

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Molded Epoxy SOIC-8 IC Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.26, 0.75]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* 8x Silver Gull-Wing Solder Leads */}
      <mesh position={[-0.52, -0.06, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.65]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.95} />
      </mesh>
      <mesh position={[0.52, -0.06, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.65]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.95} />
      </mesh>
      {/* Laser Etched Pin 1 Index Dot (Cyan) */}
      <mesh position={[-0.32, 0.14, -0.22]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 10]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

// 11. PCIe Slots (SafeSlot Steel Armor x16, Crimson Secondary x16, Amber x1)
function renderPCIeSlots(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const pciePriComp = components.find((c) => c.id === 'pcie_x16_primary');
  const pcieSecComp = components.find((c) => c.id === 'pcie_x16_secondary');
  const pcieX1Comp = components.find((c) => c.id === 'pcie_x1_slots');

  const priState = getState(pciePriComp);
  const secState = getState(pcieSecComp);
  const x1State = getState(pcieX1Comp);

  const priMat = getMaterialProps(priState, '#1e293b', 0.7, 0.3);
  const secMat = getMaterialProps(secState, '#dc2626', 0.6, 0.4); // Vibrant Crimson Red Slot
  const x1Mat = getMaterialProps(x1State, '#d97706', 0.6, 0.4); // Vibrant Amber Gold Slot

  return (
    <group>
      {/* Primary PCIe 5.0 x16 Slot with Stainless Steel Armor Jacket */}
      {pciePriComp && (
        <group
          position={getElev(pciePriComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pciePriComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(pciePriComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Main Slot Channel */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[9.1, 0.46, 0.72]} />
            <meshStandardMaterial {...priMat} />
          </mesh>

          {/* Stainless Steel Shielding Armor Jacket */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[9.18, 0.48, 0.78]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.96} roughness={0.12} />
          </mesh>

          {/* Interior Gold Spring Contact Pins */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[8.5, 0.1, 0.18]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
          </mesh>

          {/* PCIe SafeSlot EZ-Release Latch Wing (Vibrant Electric Blue) */}
          <mesh position={[4.65, 0.2, 0]}>
            <boxGeometry args={[0.55, 0.42, 0.55]} />
            <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Secondary PCIe x16 Slot (Vibrant Crimson Red) */}
      {pcieSecComp && (
        <group
          position={getElev(pcieSecComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pcieSecComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(pcieSecComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[9.0, 0.45, 0.7]} />
            <meshStandardMaterial {...secMat} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[8.4, 0.1, 0.2]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[4.6, 0.2, 0]}>
            <boxGeometry args={[0.5, 0.38, 0.5]} />
            <meshStandardMaterial color="#991b1b" />
          </mesh>
        </group>
      )}

      {/* PCIe x1 Slot (Vibrant Amber Gold) */}
      {pcieX1Comp && (
        <group
          position={getElev(pcieX1Comp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pcieX1Comp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(pcieX1Comp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.45, 0.7]} />
            <meshStandardMaterial {...x1Mat} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.2]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 12. M.2 NVMe System (Slot Connector & Exposed Emerald NVMe SSD Module with PCIe 5.0 Controller)
function renderM2System(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const slotComp = components.find((c) => c.id === 'm2_slot_1');
  const ssdComp = components.find((c) => c.id === 'm2_ssd_installed');

  const slotState = getState(slotComp);
  const ssdState = getState(ssdComp);

  const slotMat = getMaterialProps(slotState, '#18181b', 0.6, 0.4);
  const ssdMat = getMaterialProps(ssdState, '#059669', 0.4, 0.5); // Vibrant Emerald PCB

  return (
    <group>
      {/* M.2 Key-M Slot Receptacle & Standoff */}
      {slotComp && (
        <group
          position={getElev(slotComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(slotComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(slotComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Key-M SMT Connector */}
          <mesh position={[0, 0.16, -2.6]} castShadow>
            <boxGeometry args={[1.85, 0.36, 0.65]} />
            <meshStandardMaterial {...slotMat} />
          </mesh>
          <mesh position={[0, 0.25, -2.6]}>
            <boxGeometry args={[1.6, 0.06, 0.2]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} />
          </mesh>
          {/* Stainless Standoff Post on opposite end */}
          <mesh position={[0, 0.12, 2.6]}>
            <cylinderGeometry args={[0.22, 0.22, 0.32, 16]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      )}

      {/* M.2 NVMe SSD Installed Module (Emerald Green PCB & Gold Contacts) */}
      {ssdComp && (
        <group
          position={getElev(ssdComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(ssdComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(ssdComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Vibrant Emerald SSD 2280 PCB */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.55, 0.1, 5.5]} />
            <meshStandardMaterial {...ssdMat} />
          </mesh>
          {/* Gold Pin Edge Connector */}
          <mesh position={[0, 0.02, -2.65]}>
            <boxGeometry args={[1.4, 0.08, 0.25]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
          </mesh>
          {/* High-Speed PCIe 5.0 Controller IC with Mirror Nickel Cap */}
          <mesh position={[0, 0.12, -1.8]}>
            <boxGeometry args={[0.95, 0.15, 0.95]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Dual 3D NAND Flash Memory Packages */}
          <mesh position={[0, 0.12, -0.6]}>
            <boxGeometry args={[1.25, 0.14, 1.45]} />
            <meshStandardMaterial color="#0f172a" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.12, 1.0]}>
            <boxGeometry args={[1.25, 0.14, 1.45]} />
            <meshStandardMaterial color="#0f172a" roughness={0.65} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 13. SATA 6Gb/s Ports (Color Coded Red, Blue & Black Stacked Blocks)
function renderSATAPorts(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* 3x Stacked Dual-Port SATA 6Gb/s Blocks: Port 1-2 (Red), Port 3-4 (Blue), Port 5-6 (Black) */}
      {[
        { z: -1.3, color: '#ef4444', label: 'SATA 1/2 (6G)' },
        { z: 0.0, color: '#2563eb', label: 'SATA 3/4 (6G)' },
        { z: 1.3, color: '#0f172a', label: 'SATA 5/6 (6G)' }
      ].map((block, idx) => {
        const matProps = getMaterialProps(state, block.color, 0.6, 0.3);

        return (
          <group key={`sata-block-${idx}`} position={[0, 0, block.z]}>
            {/* Shrouded SATA Connector Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.45, 0.85, 0.95]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            {/* L-Shaped Port Cavities with Internal 7-Pin Gold Contact Blades */}
            <mesh position={[0.68, 0.18, 0]}>
              <boxGeometry args={[0.14, 0.28, 0.75]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            <mesh position={[0.68, -0.18, 0]}>
              <boxGeometry args={[0.14, 0.28, 0.75]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            {/* Gold Pin Contacts */}
            <mesh position={[0.62, 0.18, 0]}>
              <boxGeometry args={[0.06, 0.08, 0.55]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>
            <mesh position={[0.62, -0.18, 0]}>
              <boxGeometry args={[0.06, 0.08, 0.55]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>
            {/* Stainless Steel Spring Retention Locking Latches */}
            <mesh position={[0, 0.44, 0]}>
              <boxGeometry args={[0.8, 0.06, 0.4]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.12} />
            </mesh>
            {/* Color Accent Indicator Strip */}
            <mesh position={[-0.65, 0, 0]}>
              <boxGeometry args={[0.06, 0.7, 0.85]} />
              <meshStandardMaterial color={block.color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 14. Power Connectors (24-Pin ATX & 8-Pin CPU EPS with 24K Gold Pins)
function renderPowerConnectors(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const atxComp = components.find((c) => c.id === 'atx_24pin_power');
  const epsComp = components.find((c) => c.id === 'eps_8pin_power');

  const atxState = getState(atxComp);
  const epsState = getState(epsComp);

  const atxMat = getMaterialProps(atxState, '#0f172a', 0.4, 0.6);
  const epsMat = getMaterialProps(epsState, '#0f172a', 0.4, 0.6);

  return (
    <group>
      {/* 24-Pin ATX Main Power Connector */}
      {atxComp && (
        <group
          position={getElev(atxComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(atxComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(atxComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Shrouded 24-Pin Socket Housing */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.95, 4.9]} />
            <meshStandardMaterial {...atxMat} />
          </mesh>
          {/* 24x Gold Square Terminal Pins (2x12 Grid) */}
          <mesh position={[0, 0.49, 0]}>
            <boxGeometry args={[0.85, 0.06, 4.5]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
          </mesh>
          {/* Outer Plastic Locking Latch Tab (Royal Blue Accent) */}
          <mesh position={[0.68, 0.2, 0]}>
            <boxGeometry args={[0.16, 0.45, 1.3]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
        </group>
      )}

      {/* Dual 8-Pin ProCool CPU EPS 12V Power (Crimson Red Accent Latch) */}
      {epsComp && (
        <group
          position={getElev(epsComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(epsComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(epsComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.3, 0.85, 1.25]} />
            <meshStandardMaterial {...epsMat} />
          </mesh>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[1.9, 0.06, 0.85]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
          </mesh>
          {/* Red Safety Latch Lock Clip */}
          <mesh position={[0, 0.2, 0.68]}>
            <boxGeometry args={[1.2, 0.4, 0.14]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 15. Rear I/O Shield & Vivid Color-Coded Port Cluster (Red USB 10G, Blue USB 5G, PC99 Audio Jacks, 2.5G LAN, Gold Wi-Fi)
function renderRearIO(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const ioComp = components.find((c) => c.id === 'rear_io_ports');
  const ethComp = components.find((c) => c.id === 'ethernet_port');
  const usbComp = components.find((c) => c.id === 'usb_ports_rear');
  const hdmiComp = components.find((c) => c.id === 'hdmi_displayport');
  const audioPortsComp = components.find((c) => c.id === 'audio_ports_rear');

  const ioState = getState(ioComp);
  const ethState = getState(ethComp);
  const usbState = getState(usbComp);
  const hdmiState = getState(hdmiComp);
  const audioPortsState = getState(audioPortsComp);

  const shieldMat = getMaterialProps(ioState, '#e2e8f0', 0.96, 0.12); // Sleek Brushed Silver Stainless Steel
  const ethMat = getMaterialProps(ethState, '#e2e8f0', 0.96, 0.12); // Stainless Steel Silver Shield
  const hdmiMat = getMaterialProps(hdmiState, '#cbd5e1', 0.95, 0.14); // Brushed Aluminum Silver
  const audioPortsMat = getMaterialProps(audioPortsState, '#cbd5e1', 0.92, 0.18); // Silver Audio Faceplate

  return (
    <group>
      {/* Pre-installed Matte Dark Steel I/O Shield Shroud */}
      {ioComp && (
        <group
          position={getElev(ioComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(ioComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(ioComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.85, 2.1, 9.6]} />
            <meshStandardMaterial {...shieldMat} />
          </mesh>

          {/* Wi-Fi 6E / 7 Gold-Plated SMA Threaded Antenna Terminals */}
          <group position={[-0.95, 0.45, 3.8]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.25, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>
            <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>
          <group position={[-0.95, -0.2, 3.8]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.25, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>
            <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </group>

          {/* Clear CMOS Button (Amber/Orange) & BIOS FlashBack Button (Electric Cyan) */}
          <group position={[-0.95, 0.5, -4.2]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.15, 16]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
            </mesh>
          </group>
          <group position={[-0.95, -0.15, -4.2]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.15, 16]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
            </mesh>
          </group>
        </group>
      )}

      {/* 2.5G Dual Ethernet RJ-45 Ports Stack with Red Accent Shields & Active Link LEDs */}
      {ethComp && (
        <group
          position={getElev(ethComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(ethComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(ethComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Dual Stacked RJ-45 Metallic Port Shield with Red Accents */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.75, 1.45, 1.65]} />
            <meshStandardMaterial {...ethMat} />
          </mesh>

          {/* Primary Top 2.5G Ethernet Port (Intel I226-V) in Vivid Red Housing Ring */}
          <group position={[-0.88, 0.32, 0]}>
            {/* Red Outer Bezel Trim */}
            <mesh position={[0.02, 0, 0]}>
              <boxGeometry args={[0.04, 0.58, 1.02]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} />
            </mesh>
            {/* Dark Port Cavity */}
            <mesh>
              <boxGeometry args={[0.06, 0.52, 0.95]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            {/* 8 Gold RJ45 Spring Contacts */}
            <mesh position={[0.02, -0.16, 0]}>
              <boxGeometry args={[0.04, 0.06, 0.75]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>
            {/* Active 2.5G Red / Green Link LED */}
            <mesh position={[0.03, 0.22, -0.36]}>
              <boxGeometry args={[0.04, 0.08, 0.08]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.5} />
            </mesh>
            {/* Active 2.5G Amber Activity LED */}
            <mesh position={[0.03, 0.22, 0.36]}>
              <boxGeometry args={[0.04, 0.08, 0.08]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2.0} />
            </mesh>
          </group>

          {/* Secondary Bottom 1G Ethernet Port (Realtek RTL8125) with Red Trim */}
          <group position={[-0.88, -0.34, 0]}>
            {/* Red Outer Bezel Trim */}
            <mesh position={[0.02, 0, 0]}>
              <boxGeometry args={[0.04, 0.58, 1.02]} />
              <meshStandardMaterial color="#dc2626" roughness={0.3} />
            </mesh>
            {/* Dark Port Cavity */}
            <mesh>
              <boxGeometry args={[0.06, 0.52, 0.95]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            {/* 8 Gold RJ45 Spring Contacts */}
            <mesh position={[0.02, -0.16, 0]}>
              <boxGeometry args={[0.04, 0.06, 0.75]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
            </mesh>
            {/* Active Link LED */}
            <mesh position={[0.03, 0.22, -0.36]}>
              <boxGeometry args={[0.04, 0.08, 0.08]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.0} />
            </mesh>
            {/* Active Amber Activity LED */}
            <mesh position={[0.03, 0.22, 0.36]}>
              <boxGeometry args={[0.04, 0.08, 0.08]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
            </mesh>
          </group>

          {/* Red LANGuard 15KV Surge Protection Metal Shield */}
          <mesh position={[-0.88, 0, -0.84]}>
            <boxGeometry args={[0.04, 1.2, 0.12]} />
            <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.4} />
          </mesh>
        </group>
      )}

      {/* Massive Multi-Port Red USB 3.2 Gen 2 & Red-Accented USB Type-C Cluster */}
      {usbComp && (
        <group
          position={getElev(usbComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(usbComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(usbComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Main Triple-Stack Stainless Steel USB Port Housing Blocks */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.75, 1.45, 3.4]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.94} roughness={0.14} />
          </mesh>

          {/* Block 1: 2x Crimson Red USB 3.2 Gen 2 (10Gbps) Type-A Ports */}
          <group position={[-0.88, 0, -1.1]}>
            {/* Top Red USB Port */}
            <group position={[0, 0.34, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.34, 0.76]} />
                <meshBasicMaterial color="#05070a" />
              </mesh>
              <mesh position={[0.01, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.12, 0.68]} />
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
              </mesh>
              <mesh position={[0.02, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.04, 0.48]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
            </group>
            {/* Bottom Red USB Port */}
            <group position={[0, -0.34, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.34, 0.76]} />
                <meshBasicMaterial color="#05070a" />
              </mesh>
              <mesh position={[0.01, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.12, 0.68]} />
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
              </mesh>
              <mesh position={[0.02, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.04, 0.48]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
            </group>
          </group>

          {/* Block 2: 2x Reversible High-Speed USB Type-C 20G / USB4 Ports with Glowing Red Rings */}
          <group position={[-0.88, 0, 0]}>
            {/* Top USB-C (20 Gbps / Thunderbolt 4) with Glowing Ruby Red Ring */}
            <group position={[0, 0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
              {/* Outer Crimson Red Ring */}
              <mesh>
                <cylinderGeometry args={[0.22, 0.22, 0.06, 20]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
              </mesh>
              {/* Silver Port Bezel */}
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.98} />
              </mesh>
              {/* Reversible Center Tongue with Gold Pin Array */}
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.04, 0.06, 0.22]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
            </group>

            {/* Bottom USB-C (10 Gbps) with Glowing Red Ring */}
            <group position={[0, -0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.22, 0.22, 0.06, 20]} />
                <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={1.0} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.98} />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[0.04, 0.06, 0.22]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
            </group>
          </group>

          {/* Block 3: 2x Crimson Red High-Speed USB 3.2 Type-A Ports */}
          <group position={[-0.88, 0, 1.1]}>
            {/* Top Red USB Port */}
            <group position={[0, 0.34, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.34, 0.76]} />
                <meshBasicMaterial color="#05070a" />
              </mesh>
              <mesh position={[0.01, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.12, 0.68]} />
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
              </mesh>
              <mesh position={[0.02, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.04, 0.48]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
            </group>
            {/* Bottom Red USB Port */}
            <group position={[0, -0.34, 0]}>
              <mesh>
                <boxGeometry args={[0.06, 0.34, 0.76]} />
                <meshBasicMaterial color="#05070a" />
              </mesh>
              <mesh position={[0.01, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.12, 0.68]} />
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
              </mesh>
              <mesh position={[0.02, 0.08, 0]}>
                <boxGeometry args={[0.04, 0.04, 0.48]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* HDMI 2.1 & DisplayPort 1.4 Digital Video Output Block */}
      {hdmiComp && (
        <group
          position={getElev(hdmiComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(hdmiComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(hdmiComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Main Heavy Steel Shield Housing */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.75, 1.35, 1.85]} />
            <meshStandardMaterial {...hdmiMat} metalness={0.92} roughness={0.16} />
          </mesh>

          {/* Top: HDMI 2.1 Full-Size Port (19 Pins, 4K@120Hz / 8K@60Hz) */}
          <group position={[-0.88, 0.3, 0]}>
            {/* Black Trapezoidal Socket Receptacle */}
            <mesh>
              <boxGeometry args={[0.06, 0.38, 0.82]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            {/* HDMI 2.1 Gold Shroud & Pin Header Bar */}
            <mesh position={[0.01, 0.02, 0]}>
              <boxGeometry args={[0.04, 0.18, 0.68]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.15} />
            </mesh>
            {/* Laser Engraved "HDMI 2.1" Gold Badge */}
            <mesh position={[0.02, 0.22, 0]}>
              <boxGeometry args={[0.02, 0.06, 0.55]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} />
            </mesh>
          </group>

          {/* Bottom: DisplayPort 1.4a Full-Size Port with Blue Notch Latch */}
          <group position={[-0.88, -0.3, 0]}>
            {/* Dark Port Cavity */}
            <mesh>
              <boxGeometry args={[0.06, 0.38, 0.92]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            {/* DisplayPort Center Contact Tongue with 20 Gold Contacts */}
            <mesh position={[0.01, 0.02, 0]}>
              <boxGeometry args={[0.04, 0.18, 0.78]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Stainless Retention Friction Springs */}
            <mesh position={[0.02, -0.22, 0]}>
              <boxGeometry args={[0.02, 0.06, 0.6]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.96} />
            </mesh>
          </group>
        </group>
      )}

      {/* Color-Coded 7.1 HD Surround Audio Jacks (PC99 Standard: Green, Pink, Blue, Orange, Black) & Optical S/PDIF */}
      {audioPortsComp && (
        <group
          position={getElev(audioPortsComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(audioPortsComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(audioPortsComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Silver Audio Block Housing */}
          <mesh castShadow>
            <boxGeometry args={[1.65, 1.25, 2.2]} />
            <meshStandardMaterial {...audioPortsMat} />
          </mesh>

          {/* PC99 Color-Coded 3.5mm Gold-Plated Audio Rings:
              - Green (#84cc16): Front Speakers / Line-Out
              - Pink (#ec4899): Microphone In
              - Light Blue (#0284c7): Line-In
              - Orange (#f97316): Center / Subwoofer
              - Black/Gray (#334155): Rear Surround
          */}
          {[
            { z: -0.7, color: '#84cc16', label: 'Front L/R Out (Lime Green)' },
            { z: -0.25, color: '#ec4899', label: 'Mic-In (Pink)' },
            { z: 0.2, color: '#0284c7', label: 'Line-In (Light Blue)' },
            { z: 0.65, color: '#f97316', label: 'Center/Sub (Orange)' },
          ].map((jack, i) => (
            <group key={`color-jack-${i}`} position={[-0.84, 0.15, jack.z]}>
              {/* Outer Vibrant Colored Plastic Ring */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.26, 0.26, 0.12, 20]} />
                <meshStandardMaterial color={jack.color} roughness={0.3} />
              </mesh>
              {/* Gold Plated Inner Bezel */}
              <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
              </mesh>
              {/* 3.5mm Center Hole */}
              <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
                <meshBasicMaterial color="#05070a" />
              </mesh>
            </group>
          ))}

          {/* Square Optical S/PDIF TOSLINK Jack (Glowing Ruby Red Core with Gold Frame) */}
          <group position={[-0.84, -0.35, 0.2]}>
            {/* Outer Gold Frame */}
            <mesh>
              <boxGeometry args={[0.12, 0.38, 0.38]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Dark Shutter Door */}
            <mesh position={[-0.04, 0, 0]}>
              <boxGeometry args={[0.04, 0.28, 0.28]} />
              <meshBasicMaterial color="#05070a" />
            </mesh>
            {/* Glowing Red Optical LED Center */}
            <mesh position={[-0.06, 0, 0]}>
              <boxGeometry args={[0.02, 0.14, 0.14]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// 16. Audio Section (Realtek SupremeFX Codec & Nichicon "Fine Gold" Capacitors)
function renderAudioSection(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const codecComp = components.find((c) => c.id === 'audio_codec');
  const capsComp = components.find((c) => c.id === 'audio_capacitors');
  const frontAudioComp = components.find((c) => c.id === 'front_audio_header');

  const codecState = getState(codecComp);
  const capsState = getState(capsComp);
  const frontAudioState = getState(frontAudioComp);

  const codecMat = getMaterialProps(codecState, '#0f172a', 0.85, 0.2);
  const capMat = getMaterialProps(capsState, '#eab308', 0.95, 0.12); // Lustrous Nichicon Fine Gold
  const headerMat = getMaterialProps(frontAudioState, '#18181b', 0.5, 0.5);

  return (
    <group>
      {/* Audio Codec IC with Stainless Steel EMI Shield Cover */}
      {codecComp && (
        <group
          position={getElev(codecComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(codecComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(codecComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.28, 1.25]} />
            <meshStandardMaterial {...codecMat} />
          </mesh>
          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Row of Nichicon "Fine Gold" Audiophile Filter Capacitors */}
      {capsComp && (
        <group
          position={getElev(capsComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(capsComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(capsComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {[-0.5, -0.25, 0.0, 0.25, 0.5].map((z, idx) => (
            <group key={`gold-cap-${idx}`} position={[0, 0, z]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.58, 18]} />
                <meshStandardMaterial {...capMat} />
              </mesh>
              {/* Black Nichicon top rim */}
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.02, 18]} />
                <meshStandardMaterial color="#090a0f" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Front Panel HD Audio Header (Gold Pins) */}
      {frontAudioComp && (
        <group
          position={getElev(frontAudioComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(frontAudioComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(frontAudioComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[1.65, 0.42, 0.72]} />
            <meshStandardMaterial {...headerMat} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[1.35, 0.22, 0.42]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 17. Ethernet Controller & Clock Generator ICs
function renderNetworkingAndClock(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const lanComp = components.find((c) => c.id === 'ethernet_controller');
  const clkComp = components.find((c) => c.id === 'clock_generator');

  const lanState = getState(lanComp);
  const clkState = getState(clkComp);

  const lanMat = getMaterialProps(lanState, '#0f172a', 0.5, 0.5);
  const clkMat = getMaterialProps(clkState, '#0f172a', 0.5, 0.5);

  return (
    <group>
      {/* Intel / Realtek 2.5G LAN Controller IC */}
      {lanComp && (
        <group
          position={getElev(lanComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(lanComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(lanComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.95, 0.22, 0.95]} />
            <meshStandardMaterial {...lanMat} />
          </mesh>
        </group>
      )}

      {/* Clock Generator IC with Polished Quartz Crystal Oscillator */}
      {clkComp && (
        <group
          position={getElev(clkComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(clkComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(clkComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.75, 0.22, 0.75]} />
            <meshStandardMaterial {...clkMat} />
          </mesh>
          {/* Quartz Crystal Metallic Can */}
          <mesh position={[0.65, 0.12, 0]}>
            <boxGeometry args={[0.32, 0.22, 0.65]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 18. Diagnostic POST Code 7-Segment & EZ Debug LEDs (Electric Cyan Hex & Multi-color LEDs)
function renderDebugDiagnostics(
  comp: MotherboardComponent,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#0f172a', 0.2, 0.8);

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* 2-Digit 7-Segment Q-Code LED Display */}
      <mesh position={[-0.4, 0.12, 0]} castShadow>
        <boxGeometry args={[0.9, 0.28, 1.2]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      {/* Glowing Hex Display Segments ("A0" in Electric Cyan) */}
      <mesh position={[-0.4, 0.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.75, 0.95]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={1.4}
          roughness={0.1}
        />
      </mesh>

      {/* 4x Micro EZ-Debug SMD LEDs [Red CPU, Orange DRAM, White VGA, Green BOOT] */}
      {[-0.3, -0.1, 0.1, 0.3].map((z, idx) => {
        const colors = ['#ef4444', '#f59e0b', '#ffffff', '#22c55e'];
        return (
          <group key={`ez-led-${idx}`} position={[0.5, 0.12, z]}>
            <mesh>
              <boxGeometry args={[0.15, 0.1, 0.15]} />
              <meshStandardMaterial
                color={colors[idx]}
                emissive={colors[idx]}
                emissiveIntensity={0.9}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 19. PWM Fan Headers & Color-Coded Internal Front Panel / USB Headers
function renderInternalHeaders(
  components: MotherboardComponent[],
  getElev: (c: MotherboardComponent | undefined) => [number, number, number],
  getState: (c: MotherboardComponent | undefined) => { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  const fanComp = components.find((c) => c.id === 'cpu_fan_header');
  const sysFanComp = components.find((c) => c.id === 'system_fan_headers');
  const frontComp = components.find((c) => c.id === 'front_panel_header');
  const usbHeaderComp = components.find((c) => c.id === 'front_usb_headers');
  const usbcHeaderComp = components.find((c) => c.id === 'front_usbc_header');
  const frontAudioComp = components.find((c) => c.id === 'front_audio_header');

  const fanState = getState(fanComp);
  const sysFanState = getState(sysFanComp);
  const frontState = getState(frontComp);
  const usbHeaderState = getState(usbHeaderComp);
  const usbcHeaderState = getState(usbcHeaderComp);
  const frontAudioState = getState(frontAudioComp);

  const fanMat = getMaterialProps(fanState, '#f8fafc', 0.2, 0.6); // Alpine White CPU Fan Header
  const sysFanMat = getMaterialProps(sysFanState, '#e2e8f0', 0.2, 0.6);
  const frontMat = getMaterialProps(frontState, '#18181b', 0.4, 0.6);
  const usbMat = getMaterialProps(usbHeaderState, '#2563eb', 0.5, 0.4); // Electric Blue USB 3.2 Header
  const usbcMat = getMaterialProps(usbcHeaderState, '#cbd5e1', 0.9, 0.2); // Metallic Silver Type-E
  const audioMat = getMaterialProps(frontAudioState, '#eab308', 0.6, 0.4); // Canary Yellow HD Audio

  return (
    <group>
      {/* 4-Pin PWM CPU Fan & AIO Pump Headers (Alpine White) */}
      {fanComp && (
        <group
          position={getElev(fanComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(fanComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(fanComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Dual White Shrouded 4-Pin Fan Sockets */}
          {[-0.35, 0.35].map((xOffset, idx) => (
            <group key={`fan-hdr-${idx}`} position={[xOffset, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.55, 0.38, 0.4]} />
                <meshStandardMaterial {...fanMat} />
              </mesh>
              {/* Polarized Guide Tab */}
              <mesh position={[0, 0.15, 0.18]}>
                <boxGeometry args={[0.45, 0.22, 0.06]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* 4 Gold Pins */}
              {[-0.18, -0.06, 0.06, 0.18].map((px, i) => (
                <mesh key={`cpu-fan-pin-${i}`} position={[px, 0.28, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.98} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* Chassis & System Fan 4-Pin PWM Headers */}
      {sysFanComp && (
        <group
          position={getElev(sysFanComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(sysFanComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(sysFanComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.38, 0.4]} />
            <meshStandardMaterial {...sysFanMat} />
          </mesh>
          <mesh position={[0, 0.15, 0.18]}>
            <boxGeometry args={[0.5, 0.22, 0.06]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {[-0.18, -0.06, 0.06, 0.18].map((px, i) => (
            <mesh key={`sys-fan-pin-${i}`} position={[px, 0.28, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.98} />
            </mesh>
          ))}
        </group>
      )}

      {/* Front Panel Switches & LEDs Header (JFP1) with Color-Coded Pin Blocks */}
      {frontComp && (
        <group
          position={getElev(frontComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(frontComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(frontComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[1.5, 0.3, 0.65]} />
            <meshStandardMaterial {...frontMat} />
          </mesh>
          {/* Color Coded Pin Groups:
              - Orange: Power Switch (Pins 6,8)
              - Blue: Reset Switch (Pins 5,7)
              - Green: Power LED (Pins 2,4)
              - Red: HDD Activity LED (Pins 1,3)
          */}
          <mesh position={[-0.4, 0.22, -0.15]}>
            <boxGeometry args={[0.3, 0.1, 0.2]} />
            <meshStandardMaterial color="#ef4444" /> {/* HDD LED Red */}
          </mesh>
          <mesh position={[0.1, 0.22, -0.15]}>
            <boxGeometry args={[0.3, 0.1, 0.2]} />
            <meshStandardMaterial color="#22c55e" /> {/* Power LED Green */}
          </mesh>
          <mesh position={[-0.4, 0.22, 0.15]}>
            <boxGeometry args={[0.3, 0.1, 0.2]} />
            <meshStandardMaterial color="#2563eb" /> {/* Reset SW Blue */}
          </mesh>
          <mesh position={[0.1, 0.22, 0.15]}>
            <boxGeometry args={[0.3, 0.1, 0.2]} />
            <meshStandardMaterial color="#f97316" /> {/* Power SW Orange */}
          </mesh>
          {/* 9 Gold Terminal Header Pins */}
          {[-0.45, -0.3, -0.15, 0.0, 0.15, 0.3].map((px, i) => (
            <group key={`jfp1-col-${i}`}>
              <mesh position={[px, 0.32, -0.15]}>
                <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.98} />
              </mesh>
              {i !== 4 && (
                <mesh position={[px, 0.32, 0.15]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.98} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )}

      {/* Front Panel USB 3.2 Gen 1 (19-Pin Shrouded Royal Blue) + USB 2.0 (Black) */}
      {usbHeaderComp && (
        <group
          position={getElev(usbHeaderComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(usbHeaderComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(usbHeaderComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* 19-Pin Shrouded Electric Blue Housing with Keying Slot */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.75, 0.95]} />
            <meshStandardMaterial {...usbMat} />
          </mesh>
          {/* Keyed Notch Cavity */}
          <mesh position={[0, 0.35, -0.44]}>
            <boxGeometry args={[0.35, 0.2, 0.1]} />
            <meshBasicMaterial color="#05070a" />
          </mesh>
          {/* 19 Gold Pins */}
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[1.05, 0.08, 0.55]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* Front USB 3.2 Gen 2x2 Type-E Header (Metallic Silver & Cyan) */}
      {usbcHeaderComp && (
        <group
          position={getElev(usbcHeaderComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(usbcHeaderComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(usbcHeaderComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.7, 0.75]} />
            <meshStandardMaterial {...usbcMat} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.65, 0.08, 0.45]} />
            <meshStandardMaterial color="#06b6d4" />
          </mesh>
        </group>
      )}

      {/* Front Panel HD Audio Header (Canary Yellow / Gold Shroud) */}
      {frontAudioComp && (
        <group
          position={getElev(frontAudioComp)}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(frontAudioComp.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(frontAudioComp.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          {/* Canary Yellow AAFP Shroud */}
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.45, 0.55]} />
            <meshStandardMaterial {...audioMat} />
          </mesh>
          {/* Gold Pin Array */}
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.85, 0.15, 0.35]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 20. Scattered Surface-Mount MLCC Micro Capacitors
function renderSMDArrays(
  comp: MotherboardComponent | undefined,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#94a3b8', 0.5, 0.4);

  const smdPositions: [number, number, number][] = [
    [-1.8, 0.08, -1.2], [-1.5, 0.08, -1.2], [-1.2, 0.08, -1.2],
    [-1.8, 0.08, -0.9], [-1.5, 0.08, -0.9], [-1.2, 0.08, -0.9],
    [2.8, 0.08, -1.2],  [3.1, 0.08, -1.2],  [3.4, 0.08, -1.2],
    [2.8, 0.08, -0.9],  [3.1, 0.08, -0.9],  [3.4, 0.08, -0.9],
    [0.2, 0.08, 1.8],   [0.5, 0.08, 1.8],   [0.8, 0.08, 1.8],
    [0.2, 0.08, 2.1],   [0.5, 0.08, 2.1],   [0.8, 0.08, 2.1],
  ];

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {smdPositions.map((p, idx) => (
        <group key={`smd-cap-${idx}`} position={p}>
          {/* Ceramic 0603 MLCC Body (Earthy Tan/Brown Ceramic) */}
          <mesh>
            <boxGeometry args={[0.22, 0.08, 0.12]} />
            <meshStandardMaterial {...matProps} color="#c28c58" roughness={0.6} />
          </mesh>
          {/* Silver Soldered End Terminations */}
          <mesh position={[-0.1, 0, 0]}>
            <boxGeometry args={[0.04, 0.085, 0.125]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.04, 0.085, 0.125]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 21. SMD Precision Chip Resistors (0402 / 0603 / 0805)
function renderSMDChipResistors(
  comp: MotherboardComponent | undefined,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#0f172a', 0.4, 0.3);

  // Precision resistor locations across CPU socket, PCH, and logic paths
  const resistorPositions: { pos: [number, number, number]; rot?: number; code: string; isVertical?: boolean }[] = [
    // Near CPU socket & VRM feedback
    { pos: [-2.2, 0.08, -1.8], code: '103' },
    { pos: [-2.2, 0.08, -1.5], code: '472' },
    { pos: [-2.2, 0.08, -1.2], code: '100' },
    { pos: [-1.9, 0.08, -1.8], code: '000' },
    { pos: [-1.9, 0.08, -1.5], code: '220' },
    { pos: [-1.9, 0.08, -1.2], code: '103' },

    // Near RAM slots (DDR5 termination & VDDQ pull-ups)
    { pos: [2.5, 0.08, -4.5], code: '470' },
    { pos: [2.5, 0.08, -4.1], code: '100' },
    { pos: [2.5, 0.08, -3.7], code: '220' },
    { pos: [2.5, 0.08, -3.3], code: '103' },
    { pos: [2.5, 0.08, -2.9], code: '000' },
    { pos: [2.5, 0.08, -2.5], code: '472' },

    // Near Chipset & SPI BIOS
    { pos: [3.8, 0.08, 3.2], code: '103' },
    { pos: [4.2, 0.08, 3.2], code: '472' },
    { pos: [4.6, 0.08, 3.2], code: '100' },
    { pos: [3.8, 0.08, 3.6], code: '220' },
    { pos: [4.2, 0.08, 3.6], code: '103' },
    { pos: [4.6, 0.08, 3.6], code: '000' },

    // Near PCIe slots & Clock generator
    { pos: [-0.5, 0.08, 0.2], code: '100' },
    { pos: [-0.1, 0.08, 0.2], code: '470' },
    { pos: [0.3, 0.08, 0.2], code: '103' },
    { pos: [-0.5, 0.08, 0.5], code: '220' },
    { pos: [-0.1, 0.08, 0.5], code: '100' },
    { pos: [0.3, 0.08, 0.5], code: '472' },

    // Near CMOS Battery & RTC Crystal
    { pos: [2.2, 0.08, 6.2], code: '103' },
    { pos: [2.6, 0.08, 6.2], code: '104' },
    { pos: [3.0, 0.08, 6.2], code: '472' },
  ];

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {resistorPositions.map((r, idx) => (
        <group key={`chip-resistor-${idx}`} position={r.pos}>
          {/* PCB Solder Land Pads */}
          <mesh position={[-0.14, -0.02, 0]}>
            <boxGeometry args={[0.07, 0.02, 0.16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.14, -0.02, 0]}>
            <boxGeometry args={[0.07, 0.02, 0.16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Black Ceramic Resistor Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.09, 0.14]} />
            <meshStandardMaterial {...matProps} color="#0b0f19" roughness={0.3} metalness={0.1} />
          </mesh>

          {/* Shiny Tin/Silver Soldered End Terminals */}
          <mesh position={[-0.11, 0, 0]}>
            <boxGeometry args={[0.05, 0.095, 0.145]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.15} />
          </mesh>
          <mesh position={[0.11, 0, 0]}>
            <boxGeometry args={[0.05, 0.095, 0.145]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.15} />
          </mesh>

          {/* White SMD Stamped Value Marking (e.g. 103, 472, 000, 100) */}
          <mesh position={[0, 0.048, 0]}>
            <boxGeometry args={[0.11, 0.005, 0.07]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 22. Convex 4-Pack Resistor Arrays (Bus Termination)
function renderResistorNetworks(
  comp: MotherboardComponent | undefined,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#1e293b', 0.4, 0.4);

  // Array packs along DDR5 and PCIe buses
  const arrayPositions: [number, number, number][] = [
    [3.2, 0.08, -5.2],
    [3.2, 0.08, -4.4],
    [3.2, 0.08, -3.6],
    [3.2, 0.08, -2.8],
    [3.2, 0.08, -2.0],
    [-1.2, 0.08, 0.4],
    [-1.2, 0.08, 1.2],
    [-1.2, 0.08, 2.0],
  ];

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {arrayPositions.map((ap, idx) => (
        <group key={`res-pack-${idx}`} position={ap}>
          {/* Main 4-Pack Ceramic Chip Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.35, 0.1, 0.55]} />
            <meshStandardMaterial {...matProps} color="#0f172a" roughness={0.3} />
          </mesh>

          {/* 8 Concave/Convex Tin Solder Pins (4 on each side) */}
          {[-0.18, -0.06, 0.06, 0.18].map((zOffset, pinIdx) => (
            <group key={`pack-pin-${pinIdx}`}>
              {/* Left Pin */}
              <mesh position={[-0.18, -0.01, zOffset]}>
                <boxGeometry args={[0.06, 0.08, 0.08]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
              {/* Right Pin */}
              <mesh position={[0.18, -0.01, zOffset]}>
                <boxGeometry args={[0.06, 0.08, 0.08]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>
          ))}

          {/* Top Silk Stamping Identification Line */}
          <mesh position={[0, 0.052, 0]}>
            <boxGeometry args={[0.18, 0.005, 0.32]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 23. Current Sense Shunt Resistors (Power Telemetry)
function renderCurrentSenseShunts(
  comp: MotherboardComponent | undefined,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#18181b', 0.5, 0.5);

  const shuntPositions: [number, number, number][] = [
    [-6.2, 0.09, -7.5], // EPS 12V Main Feed
    [-5.6, 0.09, -7.5], // EPS 12V Secondary Feed
    [7.2, 0.09, -2.8],  // ATX 24-Pin 12V Rail
    [7.2, 0.09, -2.1],  // ATX 24-Pin 5V Rail
  ];

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {shuntPositions.map((sp, idx) => (
        <group key={`shunt-${idx}`} position={sp}>
          {/* Heavy Copper/Gold PCB Thermal Solder Lands */}
          <mesh position={[-0.26, -0.02, 0]}>
            <boxGeometry args={[0.16, 0.03, 0.44]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.1} />
          </mesh>
          <mesh position={[0.26, -0.02, 0]}>
            <boxGeometry args={[0.16, 0.03, 0.44]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.1} />
          </mesh>

          {/* High-Power Alloy Shunt Block Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.15, 0.38]} />
            <meshStandardMaterial {...matProps} color="#1c1917" roughness={0.4} />
          </mesh>

          {/* Massive Low-Resistance Solder Terminations */}
          <mesh position={[-0.22, 0, 0]}>
            <boxGeometry args={[0.12, 0.155, 0.39]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.97} roughness={0.12} />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <boxGeometry args={[0.12, 0.155, 0.39]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.97} roughness={0.12} />
          </mesh>

          {/* White Laser Marking "R005" (5 Milliohms) */}
          <mesh position={[0, 0.078, 0]}>
            <boxGeometry args={[0.24, 0.005, 0.18]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 24. Audio Section Precision Filter Resistors
function renderAudioResistors(
  comp: MotherboardComponent | undefined,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#0284c7', 0.4, 0.3);

  const audioResPositions: { pos: [number, number, number]; isAxial?: boolean; bandColor?: string }[] = [
    { pos: [-6.8, 0.08, 6.8], isAxial: true, bandColor: '#b45309' }, // 1kΩ
    { pos: [-6.4, 0.08, 6.8], isAxial: true, bandColor: '#7c3aed' }, // 4.7kΩ
    { pos: [-6.8, 0.08, 7.3], isAxial: true, bandColor: '#059669' }, // 10kΩ
    { pos: [-6.4, 0.08, 7.3], isAxial: true, bandColor: '#dc2626' }, // 220Ω
    { pos: [-6.8, 0.08, 7.8], isAxial: false },
    { pos: [-6.4, 0.08, 7.8], isAxial: false },
    { pos: [-6.0, 0.08, 7.8], isAxial: false },
  ];

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {audioResPositions.map((ar, idx) => (
        <group key={`audio-res-${idx}`} position={ar.pos}>
          {ar.isAxial ? (
            /* Audiophile Cylindrical Metal Film Resistor with Color Bands */
            <group rotation={[0, 0, Math.PI / 2]}>
              {/* Ceramic Cylindrical Body (Sky Blue / Turquoise Audiophile Casing) */}
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.3, 16]} />
                <meshStandardMaterial {...matProps} color="#0284c7" roughness={0.35} />
              </mesh>
              {/* Color Bands (Brown, Violet, Red, Gold) */}
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.072, 0.072, 0.025, 16]} />
                <meshStandardMaterial color={ar.bandColor || '#b45309'} />
              </mesh>
              <mesh position={[0, 0.01, 0]}>
                <cylinderGeometry args={[0.072, 0.072, 0.025, 16]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              <mesh position={[0, -0.04, 0]}>
                <cylinderGeometry args={[0.072, 0.072, 0.025, 16]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
              <mesh position={[0, -0.09, 0]}>
                <cylinderGeometry args={[0.072, 0.072, 0.025, 16]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} />
              </mesh>
              {/* Tinned Copper Leads */}
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
              </mesh>
              <mesh position={[0, -0.22, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
              </mesh>
            </group>
          ) : (
            /* SMD 0805 Low-Noise Audio Thin-Film Chip Resistor */
            <group>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.26, 0.09, 0.15]} />
                <meshStandardMaterial {...matProps} color="#0369a1" roughness={0.3} />
              </mesh>
              <mesh position={[-0.12, 0, 0]}>
                <boxGeometry args={[0.05, 0.095, 0.155]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.1} />
              </mesh>
              <mesh position={[0.12, 0, 0]}>
                <boxGeometry args={[0.05, 0.095, 0.155]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.1} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

// 25. Hardware Control, Status & Shift Registers (74HC595 / EC Hardware Registers / MMIO Latches)
function renderHardwareRegisters(
  comp: MotherboardComponent | undefined,
  pos: [number, number, number],
  state: { isSelected: boolean; isHovered: boolean; isCategoryMatched: boolean; isDimmed: boolean },
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void
) {
  if (!comp) return null;
  const matProps = getMaterialProps(state, '#0f172a', 0.6, 0.3);

  // 8-bit binary register data state: 1 0 1 1 0 0 1 0
  const registerBits = [1, 0, 1, 1, 0, 0, 1, 0];

  return (
    <group
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(comp.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
    >
      {/* Main 16-Pin SOIC Shift Register IC (74HC595 / High-Speed CMOS Register) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.22, 0.75]} />
        <meshStandardMaterial {...matProps} />
      </mesh>

      {/* Pin 1 Index Notch / Indentation Dot */}
      <mesh position={[-0.52, 0.12, -0.22]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
        <meshStandardMaterial color="#000000" roughness={0.9} />
      </mesh>

      {/* Laser-Etched Silkscreen Label "74HC595 REG" */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.45]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* 16x Tinned Silver Solder Lead Pins (8 on top row, 8 on bottom row) */}
      {[-0.52, -0.37, -0.22, -0.07, 0.08, 0.23, 0.38, 0.53].map((px, i) => (
        <group key={`reg-pin-${i}`}>
          {/* Top Pin Lead */}
          <mesh position={[px, -0.04, -0.44]}>
            <boxGeometry args={[0.06, 0.04, 0.16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.1} />
          </mesh>
          {/* Bottom Pin Lead */}
          <mesh position={[px, -0.04, 0.44]}>
            <boxGeometry args={[0.06, 0.04, 0.16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.1} />
          </mesh>
          {/* Gold PCB Solder Pads */}
          <mesh position={[px, -0.09, -0.52]}>
            <boxGeometry args={[0.08, 0.01, 0.12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} />
          </mesh>
          <mesh position={[px, -0.09, 0.52]}>
            <boxGeometry args={[0.08, 0.01, 0.12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.98} />
          </mesh>
        </group>
      ))}

      {/* Live 8-Bit Hardware Register Status Bar (Micro SMD LEDs: Green=1, Red=0) */}
      <group position={[0, 0.05, 0.85]}>
        {/* Silkscreen Register Bus Baseboard */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[1.4, 0.02, 0.3]} />
          <meshStandardMaterial color="#042f2e" roughness={0.5} />
        </mesh>
        {registerBits.map((bit, idx) => {
          const bitX = -0.52 + idx * 0.15;
          const ledColor = bit === 1 ? '#22c55e' : '#ef4444';
          return (
            <group key={`reg-bit-${idx}`} position={[bitX, 0.02, 0]}>
              <mesh>
                <boxGeometry args={[0.08, 0.05, 0.12]} />
                <meshStandardMaterial
                  color={ledColor}
                  emissive={ledColor}
                  emissiveIntensity={1.4}
                  roughness={0.2}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Secondary Embedded Controller Status Latch Register (SOIC-8 IC) */}
      <group position={[0.95, 0, -0.1]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.65, 0.18, 0.55]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.45, 0.35]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} />
        </mesh>
        {/* 8 Pins for EC Register */}
        {[-0.2, -0.07, 0.07, 0.2].map((px, i) => (
          <group key={`ec-reg-pin-${i}`}>
            <mesh position={[px, -0.04, -0.32]}>
              <boxGeometry args={[0.05, 0.03, 0.12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
            </mesh>
            <mesh position={[px, -0.04, 0.32]}>
              <boxGeometry args={[0.05, 0.03, 0.12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
            </mesh>
          </group>
        ))}
      </group>

      {/* High-Speed Copper Data / Clock / Latch Routing Bus Traces */}
      {[-0.3, 0.0, 0.3].map((zOffset, i) => (
        <mesh key={`reg-trace-${i}`} position={[-0.95, -0.08, zOffset]}>
          <boxGeometry args={[0.5, 0.01, 0.04]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

