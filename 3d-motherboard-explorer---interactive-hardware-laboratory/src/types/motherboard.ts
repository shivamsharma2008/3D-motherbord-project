export type ComponentCategory =
  | 'processing'
  | 'memory'
  | 'power'
  | 'storage'
  | 'expansion'
  | 'connectivity'
  | 'audio'
  | 'cooling'
  | 'firmware'
  | 'io';

export interface ComponentSpec {
  label: string;
  value: string;
}

export interface MotherboardComponent {
  id: string;
  name: string;
  shortName: string;
  category: ComponentCategory;
  position: [number, number, number]; // [x, y, z] in 3D world
  dimensions: [number, number, number]; // [width, height, depth]
  rotation?: [number, number, number];
  explodedOffset?: [number, number, number]; // custom exploded displacement
  
  // Educational content
  shortDescription: string;
  whatIsIt: string;
  whatItDoes: string;
  howItWorks: string;
  realWorldAnalogy: string;
  didYouKnow: string;
  learnMoreUrlOrTip: string;
  
  // Technical specs
  specs: ComponentSpec[];
  voltage?: string;
  dataSpeed?: string;
  busInterface?: string;
  powerRequirements?: string;
  generation?: string;
  typicalUse?: string;
  
  // Graph of connections
  connectedComponentIds: string[];
  
  // Status in virtual builder
  isRemovable?: boolean;
  installed?: boolean;
}

export interface ConnectionLink {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  type: 'data' | 'power' | 'control' | 'clock';
  bandwidth?: string;
  color: string;
  points?: [number, number, number][];
}

export interface PCBLayerInfo {
  id: string;
  name: string;
  layerNumber: number;
  thickness: string;
  material: string;
  purpose: string;
  color: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'identify_3d' | 'multiple_choice';
  question: string;
  scenario?: string;
  targetComponentId?: string; // For 3D click questions
  options?: string[]; // For multiple choice
  correctOptionIndex?: number;
  explanation: string;
  category: ComponentCategory;
}

export type ViewCameraPreset = 'default' | 'top' | 'front' | 'side' | 'isometric' | 'cpu_focus' | 'vrm_focus' | 'pcie_focus' | 'io_focus';

export type AppTheme = 'cyber-dark' | 'clean-light' | 'blueprint-cad' | 'stealth-matrix';
