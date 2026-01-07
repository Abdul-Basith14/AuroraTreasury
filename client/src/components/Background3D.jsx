import React from 'react';
import { motion } from 'framer-motion';

const FloatingCube = ({ size = 60, x, y, z, color, duration, delay }) => {
  return (
    <motion.div
      style={{
        width: size,
        height: size,
        x,
        y,
        z,
        position: 'absolute',
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: [0, 360],
        rotateY: [0, 360],
        y: [y, y - 100, y],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      }}
    >
      {/* Front */}
      <div className={`absolute inset-0 ${color} opacity-40`} style={{ transform: `translateZ(${size / 2}px)` }} />
      {/* Back */}
      <div className={`absolute inset-0 ${color} opacity-40`} style={{ transform: `rotateY(180deg) translateZ(${size / 2}px)` }} />
      {/* Right */}
      <div className={`absolute inset-0 ${color} opacity-40`} style={{ transform: `rotateY(90deg) translateZ(${size / 2}px)` }} />
      {/* Left */}
      <div className={`absolute inset-0 ${color} opacity-40`} style={{ transform: `rotateY(-90deg) translateZ(${size / 2}px)` }} />
      {/* Top */}
      <div className={`absolute inset-0 ${color} opacity-40`} style={{ transform: `rotateX(90deg) translateZ(${size / 2}px)` }} />
      {/* Bottom */}
      <div className={`absolute inset-0 ${color} opacity-40`} style={{ transform: `rotateX(-90deg) translateZ(${size / 2}px)` }} />
    </motion.div>
  );
};

const Background3D = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]" style={{ perspective: '1000px' }}>
      {/* Aurora Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#0A0A0A] to-[#000000] opacity-95" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      
      {/* Ambient Light/Glow - Aurora Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#A6C36F]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1F221C]/40 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#A6C36F]/5 rounded-full blur-[120px]" />
      </div>

      {/* 3D Floating Cubes */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1000px' }}>
        <FloatingCube size={80} x={-300} y={-100} z={0} color="bg-[#A6C36F]" duration={15} delay={0} />
        <FloatingCube size={60} x={300} y={100} z={-100} color="bg-[#3A3E36]" duration={18} delay={2} />
        <FloatingCube size={40} x={-200} y={200} z={-50} color="bg-[#1F221C]" duration={20} delay={5} />
        <FloatingCube size={100} x={200} y={-200} z={-200} color="bg-[#8FAE5D]" duration={25} delay={1} />
        <FloatingCube size={50} x={0} y={-300} z={-100} color="bg-[#2A2D25]" duration={22} delay={3} />
      </div>
    </div>
  );
};

export default Background3D;
