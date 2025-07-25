import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, useGLTF, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

function Silhouette({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} receiveShadow>
      <planeGeometry args={[1.5, 3]} />
      <meshBasicMaterial color="#1A0B4A" transparent opacity={0.8} />
    </mesh>
  );
}

function FloatingMessage({ position, visible, progress = 0 }: { position: [number, number, number], visible: boolean, progress?: number }) {
  const mesh = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current && visible) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
      mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.y = 1 + Math.cos(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return visible ? (
    <group ref={mesh} position={position}>
      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <planeGeometry args={[2.2, 0.7]} />
        <meshBasicMaterial color="#FFB800" transparent opacity={0.1} />
      </mesh>
      {/* Message background */}
      <Plane args={[2, 0.5]} position={[0, 0, 0.1]}>
        <meshBasicMaterial color="#FFB800" transparent opacity={0.2} />
      </Plane>
      {/* Message text */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.2}
        color="#FFB800"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#1A0B4A"
      >
        Your Future Message
      </Text>
      {/* Magical particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI * 0.4) * 1.2,
          Math.sin(i * Math.PI * 0.4) * 0.3,
          0.1
        ]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#FFB800" />
        </mesh>
      ))}
    </group>
  ) : null;
}

function Butterfly({ position, color }: { position: [number, number, number], color: string }) {
  const group = useRef<THREE.Group>(null);
  const wingSpeed = useMemo(() => Math.random() * 0.1 + 0.2, []);
  const flySpeed = useMemo(() => Math.random() * 0.02 + 0.01, []);
  const radius = useMemo(() => Math.random() * 2 + 2, []);
  const heightOffset = useMemo(() => Math.random() * 2, []);

  useFrame((state) => {
    if (group.current) {
      const time = state.clock.elapsedTime;
      group.current.position.x = position[0] + Math.cos(time * flySpeed) * radius;
      group.current.position.z = position[2] + Math.sin(time * flySpeed) * radius;
      group.current.position.y = position[1] + heightOffset + Math.sin(time * 0.5) * 0.3;
      group.current.rotation.y = Math.atan2(
        Math.cos(time * flySpeed + Math.PI / 2) * radius,
        Math.sin(time * flySpeed + Math.PI / 2) * radius
      );
      // Wing flapping animation
      if (group.current.children[0]) {
        group.current.children[0].rotation.y = Math.sin(time * wingSpeed) * 0.5;
      }
      if (group.current.children[1]) {
        group.current.children[1].rotation.y = -Math.sin(time * wingSpeed) * 0.5;
      }
    }
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[-0.2, 0, 0]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0, 0]} scale={[0.1, 0.3, 0.1]}>
        <boxGeometry />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

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
  const [showMessage, setShowMessage] = React.useState(true);
  const [transformationProgress, setTransformationProgress] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTransformationProgress((prev) => (prev + 0.01) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(() => {
    const count = isMobile ? 20 : 30;
    return Array.from({ length: count }, (_, i) => (
      <FloatingParticle 
        key={i} 
        basePosition={[0.5 + Math.cos(i) * 2, Math.sin(i * 2) * 0.5, 1 + Math.sin(i) * 2]} 
      />
    ));
  }, [isMobile]);

  const butterflies = useMemo(() => {
    const count = isMobile ? 3 : 5;
    return Array.from({ length: count }, (_, i) => (
      <Butterfly 
        key={i} 
        position={[0, 0, 0]} 
        color={i % 2 === 0 ? '#FFB800' : '#FF6B00'} 
      />
    ));
  }, [isMobile]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowMessage(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
          position: isMobile ? [6, 3, 6] : [8, 4, 8], 
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
        <group scale={window.innerWidth <= 768 ? 0.6 : 1} rotation={[0, -Math.PI / 6, 0]}>
          {/* Person Silhouette */}
          <Silhouette position={[-3, 0, -1]} />
          {/* Floating Message */}
          <FloatingMessage position={[-1.5, 0.5, 0]} visible={showMessage} />
          {/* Crystal */}
          <Crystal position={[0.5, 0, 1]} />
          {/* Trigger Symbols */}
          <FloatingSymbol position={[2, 0.5, 1.5]} symbol="🎓" color="#FFB800" rotationSpeed={0.8} />
          <FloatingSymbol position={[0, 1.5, 2]} symbol="💍" color="#FF6B00" rotationSpeed={1} />
          <FloatingSymbol position={[-1, 1, 1.5]} symbol="🎂" color="#FFB800" rotationSpeed={1.2} />
          {/* Butterflies */}
          {butterflies}
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