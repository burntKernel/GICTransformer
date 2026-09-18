import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`glass rounded-xl ${glow ? 'glow-border' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
