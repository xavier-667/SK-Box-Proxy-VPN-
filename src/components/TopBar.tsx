import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-8 w-full bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 fixed top-0 left-0 z-50 border-b border-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono font-medium tracking-wider text-cyan-400">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-[10px] font-mono text-fuchsia-400 font-bold uppercase tracking-widest">SK-BOX CORE</span>
      </div>
    </motion.div>
  );
}
