import React from 'react';
import { Html } from '@react-three/drei';
import { PCBLayerInfo } from '../../types/motherboard';
import { PCB_LAYERS_DATA } from '../../data/componentsData';

interface LayerStackup3DProps {
  selectedLayerId: string | null;
  onSelectLayer: (layer: PCBLayerInfo) => void;
}

export const LayerStackup3D: React.FC<LayerStackup3DProps> = ({
  selectedLayerId,
  onSelectLayer,
}) => {
  return (
    <group position={[0, 0, 0]}>
      {PCB_LAYERS_DATA.map((layer, index) => {
        // Vertical spacing
        const yPos = (index - 3.5) * 1.6;
        const isSelected = selectedLayerId === layer.id;

        return (
          <group key={layer.id} position={[0, yPos, 0]}>
            {/* PCB Layer Plane Slice */}
            <mesh
              receiveShadow
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                onSelectLayer(layer);
              }}
            >
              <boxGeometry args={[18, 0.12, 22]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : layer.color}
                emissive={isSelected ? '#0284c7' : layer.color}
                emissiveIntensity={isSelected ? 0.6 : 0.2}
                transparent
                opacity={0.88}
                roughness={0.4}
                metalness={0.6}
              />
            </mesh>

            {/* Microscopic PCB Traces pattern representation */}
            {[-6, -2, 2, 6].map((offsetZ, i) => (
              <mesh key={`trace-line-${i}`} position={[0, 0.08, offsetZ]}>
                <boxGeometry args={[16, 0.02, 0.15]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            ))}

            {/* Vertical Via Connection Rods between layers */}
            {index < PCB_LAYERS_DATA.length - 1 && (
              <group position={[5, 0.8, -5]}>
                <mesh>
                  <cylinderGeometry args={[0.08, 0.08, 1.5, 8]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.9} />
                </mesh>
              </group>
            )}

            {/* 3D Floating Layer Tag */}
            <Html position={[-9.8, 0, 0]} center distanceFactor={16}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer(layer);
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-lg ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 shadow-cyan-500/50 scale-105'
                    : 'bg-slate-900/90 text-slate-200 hover:text-white ring-1 ring-slate-700/80 hover:ring-cyan-500 backdrop-blur-md'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="whitespace-nowrap">
                  Layer {layer.layerNumber}: {layer.name.split(' (')[0]}
                </span>
                <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-cyan-400">
                  {layer.thickness}
                </span>
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
