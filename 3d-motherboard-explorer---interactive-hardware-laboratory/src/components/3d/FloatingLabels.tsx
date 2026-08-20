import React from 'react';
import { Html } from '@react-three/drei';
import { MotherboardComponent, ComponentCategory } from '../../types/motherboard';
import { CATEGORIES } from '../../data/componentsData';

interface FloatingLabelsProps {
  components: MotherboardComponent[];
  showLabels: boolean;
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  activeCategory: ComponentCategory | null;
  explodedAmount: number;
  onSelectComponent: (id: string) => void;
  onHoverComponent: (id: string | null) => void;
}

export const FloatingLabels: React.FC<FloatingLabelsProps> = ({
  components,
  showLabels,
  selectedComponentId,
  hoveredComponentId,
  activeCategory,
  explodedAmount,
  onSelectComponent,
  onHoverComponent,
}) => {
  if (!showLabels && !selectedComponentId && !hoveredComponentId) return null;

  return (
    <group>
      {components.map((comp) => {
        if (comp.id === 'pcb_board') return null; // Don't float tag over the board base

        const isSelected = selectedComponentId === comp.id;
        const isHovered = hoveredComponentId === comp.id;
        const isCategoryMatched = activeCategory ? comp.category === activeCategory : false;

        // If labels are hidden, only show the currently selected or hovered one
        if (!showLabels && !isSelected && !isHovered) return null;

        // If category filter is on and not matching, hide unless hovered/selected
        if (activeCategory && !isCategoryMatched && !isSelected && !isHovered) return null;

        const offset = comp.explodedOffset || [0, 1.5, 0];
        const posX = comp.position[0] + offset[0] * explodedAmount;
        const posY = comp.position[1] + offset[1] * explodedAmount * 4.5 + 0.65;
        const posZ = comp.position[2] + offset[2] * explodedAmount;

        const catInfo = CATEGORIES.find((c) => c.id === comp.category);
        const badgeColor = catInfo?.color || '#3b82f6';

        return (
          <Html
            key={`label-${comp.id}`}
            position={[posX, posY, posZ]}
            center
            distanceFactor={26}
            zIndexRange={[100, 0]}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent(comp.id);
              }}
              onMouseEnter={() => onHoverComponent(comp.id)}
              onMouseLeave={() => onHoverComponent(null)}
              className={`group flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium shadow-md transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? 'scale-105 bg-blue-600 border-blue-400 text-white shadow-blue-500/30 ring-1 ring-blue-300'
                  : isHovered
                    ? 'scale-100 bg-[#0f0f14] border-blue-500/80 text-blue-300 shadow-black/60'
                    : 'bg-[#0a0a0e]/90 border-[#26262d]/90 text-gray-300 hover:text-white hover:border-gray-500 shadow-black/40'
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full transition-transform shrink-0"
                style={{ backgroundColor: isSelected ? '#ffffff' : badgeColor }}
              />
              <span className="whitespace-nowrap tracking-tight">{comp.shortName}</span>
            </button>
          </Html>
        );
      })}
    </group>
  );
};
