import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ConnectionLink } from '../../types/motherboard';
import { Html } from '@react-three/drei';

interface ConnectionTracesProps {
  connections: ConnectionLink[];
  selectedComponentId: string | null;
  showAllConnections: boolean;
}

export const ConnectionTraces: React.FC<ConnectionTracesProps> = ({
  connections,
  selectedComponentId,
  showAllConnections,
}) => {
  // Filter active connections
  const activeLinks = useMemo(() => {
    if (showAllConnections) return connections;
    if (!selectedComponentId) return [];
    return connections.filter(
      (link) => link.sourceId === selectedComponentId || link.targetId === selectedComponentId
    );
  }, [connections, selectedComponentId, showAllConnections]);

  if (activeLinks.length === 0) return null;

  return (
    <group>
      {activeLinks.map((link) => (
        <SingleTraceCurve key={link.id} link={link} />
      ))}
    </group>
  );
};

interface SingleTraceCurveProps {
  link: ConnectionLink;
}

const SingleTraceCurve: React.FC<SingleTraceCurveProps> = ({ link }) => {
  const curve = useMemo(() => {
    if (!link.points || link.points.length < 2) return null;
    const vectors = link.points.map((p) => new THREE.Vector3(p[0], p[1] + 0.3, p[2]));
    return new THREE.CatmullRomCurve3(vectors);
  }, [link]);

  const tubeGeometry = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, 32, 0.06, 8, false);
  }, [curve]);

  // Moving glowing pulse point
  const pulseMeshRef = useRef<THREE.Mesh>(null);
  const midPoint = useMemo(() => {
    if (!curve) return new THREE.Vector3(0, 0, 0);
    return curve.getPoint(0.5);
  }, [curve]);

  useFrame(({ clock }) => {
    if (pulseMeshRef.current && curve) {
      const t = (clock.getElapsedTime() * 0.4) % 1.0;
      const point = curve.getPoint(t);
      pulseMeshRef.current.position.copy(point);
    }
  });

  if (!tubeGeometry || !curve) return null;

  return (
    <group>
      {/* Neon glowing tube trace */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color={link.color}
          emissive={link.color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Travelling data pulse sphere */}
      <mesh ref={pulseMeshRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Floating 3D Connection Badge */}
      <Html position={[midPoint.x, midPoint.y + 0.5, midPoint.z]} center distanceFactor={14}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300 shadow-lg ring-1 ring-cyan-500/50 backdrop-blur-md">
          {link.label} {link.bandwidth ? `(${link.bandwidth})` : ''}
        </div>
      </Html>
    </group>
  );
};
