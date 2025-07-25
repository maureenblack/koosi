import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Box() {
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Scene3D() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Box />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Scene3D;