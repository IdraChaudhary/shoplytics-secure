'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Database, 
  Server, 
  Shield, 
  BarChart3, 
  ShoppingCart,
  Webhook,
  Monitor,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause
} from 'lucide-react';

interface Node3D {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'frontend' | 'backend' | 'database' | 'external' | 'service';
  color: string;
  size: number;
  connections: string[];
  icon: React.ElementType;
  description: string;
}

interface Connection3D {
  from: string;
  to: string;
  color: string;
  animated: boolean;
}

const NODES_3D: Node3D[] = [
  {
    id: 'frontend',
    name: 'Next.js Frontend',
    position: [-4, 2, 0],
    type: 'frontend',
    color: '#3b82f6',
    size: 1.2,
    connections: ['gateway'],
    icon: Monitor,
    description: 'React frontend with SSR'
  },
  {
    id: 'gateway',
    name: 'API Gateway',
    position: [0, 2, 0],
    type: 'backend',
    color: '#10b981',
    size: 1.5,
    connections: ['auth', 'analytics', 'webhooks'],
    icon: Server,
    description: 'Centralized API management'
  },
  {
    id: 'auth',
    name: 'Auth Service',
    position: [-2, 0, -2],
    type: 'service',
    color: '#8b5cf6',
    size: 1.0,
    connections: ['database'],
    icon: Shield,
    description: 'JWT authentication'
  },
  {
    id: 'analytics',
    name: 'Analytics Engine',
    position: [2, 0, -2],
    type: 'service',
    color: '#f59e0b',
    size: 1.3,
    connections: ['database', 'shopify'],
    icon: BarChart3,
    description: 'Real-time analytics processing'
  },
  {
    id: 'webhooks',
    name: 'Webhook Handler',
    position: [2, 0, 2],
    type: 'service',
    color: '#06b6d4',
    size: 1.0,
    connections: ['database', 'shopify'],
    icon: Webhook,
    description: 'Secure webhook processing'
  },
  {
    id: 'database',
    name: 'PostgreSQL',
    position: [0, -2, 0],
    type: 'database',
    color: '#db2777',
    size: 1.8,
    connections: [],
    icon: Database,
    description: 'Primary database'
  },
  {
    id: 'shopify',
    name: 'Shopify API',
    position: [4, 0, 0],
    type: 'external',
    color: '#6b7280',
    size: 1.4,
    connections: [],
    icon: ShoppingCart,
    description: 'External Shopify API'
  }
];

const CONNECTIONS_3D: Connection3D[] = [
  { from: 'frontend', to: 'gateway', color: '#3b82f6', animated: true },
  { from: 'gateway', to: 'auth', color: '#8b5cf6', animated: false },
  { from: 'gateway', to: 'analytics', color: '#f59e0b', animated: false },
  { from: 'gateway', to: 'webhooks', color: '#06b6d4', animated: false },
  { from: 'auth', to: 'database', color: '#db2777', animated: false },
  { from: 'analytics', to: 'database', color: '#db2777', animated: false },
  { from: 'webhooks', to: 'database', color: '#db2777', animated: false },
  { from: 'analytics', to: 'shopify', color: '#6b7280', animated: true },
  { from: 'webhooks', to: 'shopify', color: '#6b7280', animated: true }
];

function AnimatedConnection({ from, to, color, animated }: Connection3D & { from: [number, number, number]; to: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state) => {
    if (animated && ref.current) {
      setProgress((prev) => (prev + 0.01) % 1);
    }
  });

  const direction = useMemo(() => {
    return new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  }, [from, to]);

  const distance = direction.length();
  direction.normalize();

  const midPoint = useMemo(() => {
    return [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2,
      (from[2] + to[2]) / 2,
    ] as [number, number, number];
  }, [from, to]);

  const rotation = useMemo(() => {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return quaternion;
  }, [direction]);

  return (
    <group ref={ref} position={midPoint} quaternion={rotation}>
      {/* Connection line */}
      <Cylinder
        args={[0.02, 0.02, distance, 8]}
        material-color={color}
        material-transparent={true}
        material-opacity={0.6}
      />
      
      {/* Animated particle */}
      {animated && (
        <Sphere
          args={[0.05]}
          position={[0, (progress - 0.5) * distance, 0]}
          material-color={color}
          material-emissive={color}
          material-emissiveIntensity={0.5}
        />
      )}
    </group>
  );
}

function Node3DComponent({ 
  node, 
  onClick, 
  isSelected,
  scale = 1 
}: { 
  node: Node3D; 
  onClick: () => void;
  isSelected: boolean;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered || isSelected) {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.scale.setScalar(node.size * scale * 1.1);
      } else {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.scale.setScalar(node.size * scale);
      }
    }
  });

  const nodeGeometry = useMemo(() => {
    switch (node.type) {
      case 'database':
        return <Cylinder args={[0.8, 1.0, 0.6, 8]} />;
      case 'external':
        return <Box args={[1.2, 0.8, 1.2]} />;
      default:
        return <Box args={[1.0, 1.0, 1.0]} />;
    }
  }, [node.type]);

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {nodeGeometry}
        <meshPhongMaterial
          color={node.color}
          transparent={true}
          opacity={hovered || isSelected ? 0.9 : 0.7}
          emissive={node.color}
          emissiveIntensity={hovered || isSelected ? 0.3 : 0.1}
        />
      </mesh>
      
      {/* Node label */}
      <Html
        position={[0, node.size + 0.8, 0]}
        center
        style={{
          color: 'white',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}
      >
        {node.name}
      </Html>

      {/* Status indicator */}
      <Sphere
        position={[node.size * 0.7, node.size * 0.7, node.size * 0.7]}
        args={[0.15]}
        material-color="#10b981"
        material-emissive="#10b981"
        material-emissiveIntensity={0.8}
      />
    </group>
  );
}

function Scene({ 
  selectedNode, 
  onNodeClick,
  animationEnabled,
  cameraPosition 
}: {
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
  animationEnabled: boolean;
  cameraPosition: [number, number, number];
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);
  }, [camera, cameraPosition]);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Directional lights */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      
      {/* Point light for dramatic effect */}
      <pointLight position={[0, 0, 0]} intensity={0.8} />

      {/* Grid helper */}
      <gridHelper args={[20, 20, '#333333', '#333333']} position={[0, -4, 0]} />

      {/* Render nodes */}
      {NODES_3D.map((node) => (
        <Node3DComponent
          key={node.id}
          node={node}
          onClick={() => onNodeClick(node.id)}
          isSelected={selectedNode === node.id}
        />
      ))}

      {/* Render connections */}
      {animationEnabled && CONNECTIONS_3D.map((connection, index) => {
        const fromNode = NODES_3D.find(n => n.id === connection.from);
        const toNode = NODES_3D.find(n => n.id === connection.to);
        
        if (!fromNode || !toNode) return null;

        return (
          <AnimatedConnection
            key={index}
            from={fromNode.position}
            to={toNode.position}
            color={connection.color}
            animated={connection.animated}
          />
        );
      })}

      {/* Orbit controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        autoRotate={animationEnabled}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function Architecture3D() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([8, 6, 8]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedNodeData = useMemo(() => {
    return NODES_3D.find(node => node.id === selectedNode);
  }, [selectedNode]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const resetCamera = () => {
    setCameraPosition([8, 6, 8]);
  };

  const presetViews = [
    { name: 'Overview', position: [8, 6, 8] as [number, number, number] },
    { name: 'Frontend Focus', position: [-6, 3, 3] as [number, number, number] },
    { name: 'Backend Focus', position: [6, 3, 3] as [number, number, number] },
    { name: 'Database Focus', position: [0, 8, 0] as [number, number, number] }
  ];

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg p-4">
        <div className="flex flex-col space-y-3">
          <div>
            <h3 className="text-white text-lg font-semibold mb-2">3D Architecture</h3>
            <p className="text-gray-300 text-sm">Interactive 3D view of system components</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setAnimationEnabled(!animationEnabled)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                animationEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {animationEnabled ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={resetCamera}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-gray-300 text-xs mb-1">Camera Presets:</p>
            {presetViews.map((view) => (
              <button
                key={view.name}
                onClick={() => setCameraPosition(view.position)}
                className="block w-full text-left px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded"
              >
                {view.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNodeData && (
        <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-80 rounded-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: selectedNodeData.color }}
              />
              <h4 className="text-white font-semibold">{selectedNodeData.name}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-300 text-sm mb-3">{selectedNodeData.description}</p>
          
          <div className="space-y-2">
            <div>
              <span className="text-gray-400 text-xs">Type:</span>
              <span className="text-white text-sm ml-2 capitalize">{selectedNodeData.type}</span>
            </div>
            
            <div>
              <span className="text-gray-400 text-xs">Connections:</span>
              <span className="text-white text-sm ml-2">{selectedNodeData.connections.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg p-4">
        <h4 className="text-white text-sm font-semibold mb-2">Component Types</h4>
        <div className="space-y-1">
          {[
            { type: 'Frontend', color: '#3b82f6' },
            { type: 'Backend', color: '#10b981' },
            { type: 'Service', color: '#8b5cf6' },
            { type: 'Database', color: '#db2777' },
            { type: 'External', color: '#6b7280' }
          ].map(({ type, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-300 text-xs">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-50 rounded-lg p-4 max-w-xs">
        <h4 className="text-white text-sm font-semibold mb-2">Controls</h4>
        <div className="text-gray-300 text-xs space-y-1">
          <p>🖱️ Left click + drag: Rotate</p>
          <p>🖱️ Right click + drag: Pan</p>
          <p>🎯 Scroll: Zoom in/out</p>
          <p>🔍 Click components for details</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        className="w-full h-full"
        camera={{ position: cameraPosition, fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
      >
        <Scene
          selectedNode={selectedNode}
          onNodeClick={handleNodeClick}
          animationEnabled={animationEnabled}
          cameraPosition={cameraPosition}
        />
      </Canvas>
    </div>
  );
}
