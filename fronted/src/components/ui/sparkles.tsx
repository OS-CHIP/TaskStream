"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export const Sparkles: React.FC<SparklesProps> = ({
  id,
  className,
  background = 'transparent',
  minSize = 0.6,
  maxSize = 1.5,
  speed = 3,
  particleColor = '#ffffff',
  particleDensity = 200,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < particleDensity; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: minSize + Math.random() * (maxSize - minSize),
          delay: Math.random() * 2,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, [particleDensity, minSize, maxSize]);

  const randomMove = () => Math.random() * 4 - 2;

  return (
    <div
      id={id}
      className={cn('relative h-full w-full overflow-hidden', className)}
      style={{ background }}
    >
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.span
            key={`particle-${particle.id}`}
            className="absolute inline-block rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particleColor,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, randomMove(), randomMove(), 0],
              y: [0, randomMove(), randomMove(), 0],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1.2, 0],
            }}
            transition={{
              duration: Math.random() * 6 + speed,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Sparkles;