import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

function Crystal({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const crystalGeometry = useMemo(() => new THREE.OctahedronGeometry(1, 0), []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={mesh} position={position} castShadow receiveShadow>
      <primitive object={crystalGeometry} />
      <meshPhysicalMaterial
        color="#FFB800"
        transmission={0.6}
        roughness={0.1}
        metalness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        opacity={0.8}
        transparent
      />
    </mesh>
  );
}

function FloatingSymbol({ position, symbol, color, rotationSpeed = 1 }: 
  { position: [number, number, number]; symbol: string; color: string; rotationSpeed?: number }) {
  const group = useRef<THREE.Group>(null);
  const orbit = useRef(0);

  useFrame((state) => {
    if (group.current) {
      orbit.current += 0.01 * rotationSpeed;
      group.current.position.x = position[0] + Math.cos(orbit.current) * 2;
      group.current.position.z = position[2] + Math.sin(orbit.current) * 2;
      group.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={group} position={position}>
      <Text
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#1A0B4A"
      >
        {symbol}
      </Text>
    </group>
  );
}

function FloatingParticle({ basePosition }: { basePosition: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => Math.random() * 0.02 + 0.01, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  const radius = useMemo(() => Math.random() * (window.innerWidth <= 768 ? 1.5 : 2) + 1, []);

  useFrame((state) => {
    if (mesh.current) {
      const angle = state.clock.elapsedTime * speed + offset;
      mesh.current.position.x = basePosition[0] + Math.cos(angle) * radius;
      mesh.current.position.z = basePosition[2] + Math.sin(angle) * radius;
      mesh.current.position.y = basePosition[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={basePosition}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial
        color="#FFB800"
        emissive="#FF6B00"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function Scene3D() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const particles = useMemo(() => {
    const count = isMobile ? 30 : 50;
    return Array.from({ length: count }, (_, i) => (
      <FloatingParticle key={i} basePosition={[0, 0, 0]} />
    ));
  }, [isMobile]);

  return (
    <div 
      style={{ 
        width: '100%', 
        height: window.innerWidth <= 768 ? '60vh' : '80vh',
        background: 'linear-gradient(135deg, #1A0B4A 0%, #2D1B69 50%, #1A0B4A 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Canvas 
        camera={{ 
          position: isMobile ? [4, 2, 4] : [5, 3, 5], 
          fov: isMobile ? 60 : 50 
        }}
        style={{ cursor: 'grab' }}
        shadows
      >
        <Stars 
          radius={100} 
          depth={50} 
          count={3000} 
          factor={4} 
          saturation={0} 
          fade 
        />
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={2} 
          castShadow
        />
        <group scale={window.innerWidth <= 768 ? 0.6 : 1}>
          <Crystal position={[0, 0, 0]} />
          {/* Trigger Symbols */}
          <FloatingSymbol position={[1.5, 0, 0]} symbol="🎓" color="#FFB800" rotationSpeed={0.8} />
          <FloatingSymbol position={[-1.5, 0, 0]} symbol="💍" color="#FF6B00" rotationSpeed={1} />
          <FloatingSymbol position={[0, 1.5, 0]} symbol="🎂" color="#FFB800" rotationSpeed={1.2} />
          {/* Floating Particles */}
          {particles}
        </group>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}

export default Scene3D;