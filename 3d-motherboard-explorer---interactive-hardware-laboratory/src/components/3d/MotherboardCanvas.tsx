import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  MotherboardComponent,
  ComponentCategory,
  ViewCameraPreset,
  AppTheme,
  ConnectionLink,
  PCBLayerInfo,
} from '../../types/motherboard';
import { MotherboardMesh } from './MotherboardMesh';
import { ConnectionTraces } from './ConnectionTraces';
import { FloatingLabels } from './FloatingLabels';
import { LayerStackup3D } from './LayerStackup3D';

interface MotherboardCanvasProps {
  components: MotherboardComponent[];
  connections: ConnectionLink[];
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  activeCategory: ComponentCategory | null;
  explodedAmount: number;
  isIsolated: boolean;
  showLabels: boolean;
  showAllConnections: boolean;
  isLayerMode: boolean;
  selectedLayerId: string | null;
  cameraPreset: ViewCameraPreset;
  theme: AppTheme;
  isMaximized?: boolean;
  zoomLevel?: number;
  dragMode?: 'orbit' | 'pan';
  panOffset?: { x: number; z: number };
  onSelectComponent: (id: string) => void;
  onHoverComponent: (id: string | null) => void;
  onSelectLayer: (layer: PCBLayerInfo) => void;
  onCanvasReady?: () => void;
}

// Camera animation controller with free panning and unrestricted movement
function CameraRig({
  cameraPreset,
  selectedComponent,
  isLayerMode,
  isMaximized,
  zoomLevel = 1.0,
  dragMode = 'orbit',
  panOffset = { x: 0, z: 0 },
}: {
  cameraPreset: ViewCameraPreset;
  selectedComponent: MotherboardComponent | null;
  isLayerMode: boolean;
  isMaximized?: boolean;
  zoomLevel?: number;
  dragMode?: 'orbit' | 'pan';
  panOffset?: { x: number; z: number };
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const targetCamPos = useRef(new THREE.Vector3(0, 10.5, 10.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(true);
  const animStartTime = useRef(Date.now());

  useEffect(() => {
    isAnimating.current = true;
    animStartTime.current = Date.now();

    if (isLayerMode) {
      targetCamPos.current.set(-13 + panOffset.x, 4.5, 16 + panOffset.z);
      targetLookAt.current.set(panOffset.x, 0, panOffset.z);
      return;
    }

    if (selectedComponent) {
      const [cx, cy, cz] = selectedComponent.position;
      targetLookAt.current.set(cx + panOffset.x, cy, cz + panOffset.z);
      targetCamPos.current.set(cx + panOffset.x + 2.0, cy + 4.6, cz + panOffset.z + 5.0);
      return;
    }

    const zoomScale = (isMaximized ? 0.88 : 0.95) / Math.max(0.2, zoomLevel);

    switch (cameraPreset) {
      case 'top':
        targetCamPos.current.set(panOffset.x, 15.5 * zoomScale, panOffset.z + 0.001);
        targetLookAt.current.set(panOffset.x, 0, panOffset.z);
        break;
      case 'front':
        targetCamPos.current.set(panOffset.x, 2.8 * zoomScale, panOffset.z + 13.0 * zoomScale);
        targetLookAt.current.set(panOffset.x, 0, panOffset.z);
        break;
      case 'side':
        targetCamPos.current.set(panOffset.x + 14.0 * zoomScale, 3.2 * zoomScale, panOffset.z);
        targetLookAt.current.set(panOffset.x, 0, panOffset.z);
        break;
      case 'isometric':
        targetCamPos.current.set(panOffset.x + 9.8 * zoomScale, 10.2 * zoomScale, panOffset.z + 9.8 * zoomScale);
        targetLookAt.current.set(panOffset.x, 0, panOffset.z);
        break;
      case 'cpu_focus':
        targetCamPos.current.set(panOffset.x - 0.5, 5.8 * (1 / zoomLevel), panOffset.z + 1.8 * (1 / zoomLevel));
        targetLookAt.current.set(panOffset.x - 0.5, 0.5, panOffset.z - 3.5);
        break;
      case 'vrm_focus':
        targetCamPos.current.set(panOffset.x - 3.5, 5.2 * (1 / zoomLevel), panOffset.z + 1.2 * (1 / zoomLevel));
        targetLookAt.current.set(panOffset.x - 4.2, 0.5, panOffset.z - 4.2);
        break;
      case 'pcie_focus':
        targetCamPos.current.set(panOffset.x - 2.5, 6.0 * (1 / zoomLevel), panOffset.z + 5.5 * (1 / zoomLevel));
        targetLookAt.current.set(panOffset.x - 2.5, 0.5, panOffset.z + 1.5);
        break;
      case 'io_focus':
        targetCamPos.current.set(panOffset.x - 10 * (1 / zoomLevel), 4.0, panOffset.z - 2.5);
        targetLookAt.current.set(panOffset.x - 7.8, 1.0, panOffset.z - 3.2);
        break;
      case 'default':
      default:
        targetCamPos.current.set(panOffset.x, 11.2 * zoomScale, panOffset.z + 10.5 * zoomScale);
        targetLookAt.current.set(panOffset.x, 0, panOffset.z);
        break;
    }
  }, [cameraPreset, selectedComponent, isLayerMode, isMaximized, zoomLevel, panOffset]);

  // Smoothly animate only during transitions, then give full control to user OrbitControls pan
  useFrame(() => {
    if (!isAnimating.current) return;

    camera.position.lerp(targetCamPos.current, 0.1);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.1);
      controlsRef.current.update();
    }

    if (
      camera.position.distanceTo(targetCamPos.current) < 0.05 ||
      Date.now() - animStartTime.current > 1200
    ) {
      isAnimating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.07}
      minDistance={1.0}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2 + 0.18}
      rotateSpeed={0.8}
      zoomSpeed={1.2}
      panSpeed={1.4}
      screenSpacePanning={true}
      mouseButtons={{
        LEFT: dragMode === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: dragMode === 'pan' ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}

export const MotherboardCanvas: React.FC<MotherboardCanvasProps> = ({
  components,
  connections,
  selectedComponentId,
  hoveredComponentId,
  activeCategory,
  explodedAmount,
  isIsolated,
  showLabels,
  showAllConnections,
  isLayerMode,
  selectedLayerId,
  cameraPreset,
  theme,
  isMaximized = true,
  zoomLevel = 1.0,
  dragMode = 'orbit',
  panOffset = { x: 0, z: 0 },
  onSelectComponent,
  onHoverComponent,
  onSelectLayer,
}) => {
  const selectedComp = components.find((c) => c.id === selectedComponentId) || null;

  const bgColor =
    theme === 'blueprint-cad'
      ? '#091528'
      : theme === 'stealth-matrix'
        ? '#040d07'
        : '#ffffff';

  return (
    <div
      className={`relative h-full w-full select-none overflow-hidden bg-white ${
        dragMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      id="motherboard-canvas-container"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 11.2, 10.5], fov: 36, near: 0.1, far: 1000 }}
        style={{ background: bgColor }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.15} color="#ffffff" />
          
          <directionalLight
            position={[14, 24, 14]}
            intensity={1.65}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
          
          <directionalLight position={[-16, 18, -14]} intensity={0.95} color="#f8fafc" />
          <directionalLight position={[-8, 12, 16]} intensity={0.75} color="#ffffff" />
          <pointLight position={[0, 14, 0]} intensity={0.65} color="#ffffff" distance={30} />

          <CameraRig
            cameraPreset={cameraPreset}
            selectedComponent={selectedComp}
            isLayerMode={isLayerMode}
            isMaximized={isMaximized}
            zoomLevel={zoomLevel}
            dragMode={dragMode}
            panOffset={panOffset}
          />

          {isLayerMode ? (
            <LayerStackup3D
              selectedLayerId={selectedLayerId}
              onSelectLayer={onSelectLayer}
            />
          ) : (
            <>
              <MotherboardMesh
                components={components}
                selectedComponentId={selectedComponentId}
                hoveredComponentId={hoveredComponentId}
                activeCategory={activeCategory}
                explodedAmount={explodedAmount}
                isIsolated={isIsolated}
                theme={theme}
                onSelectComponent={onSelectComponent}
                onHoverComponent={onHoverComponent}
              />

              <ConnectionTraces
                connections={connections}
                selectedComponentId={selectedComponentId}
                showAllConnections={showAllConnections}
              />

              <FloatingLabels
                components={components}
                showLabels={showLabels}
                selectedComponentId={selectedComponentId}
                hoveredComponentId={hoveredComponentId}
                activeCategory={activeCategory}
                explodedAmount={explodedAmount}
                onSelectComponent={onSelectComponent}
                onHoverComponent={onHoverComponent}
              />
            </>
          )}

          <gridHelper
            args={[60, 60, '#cbd5e1', '#f1f5f9']}
            position={[0, -2.2, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
