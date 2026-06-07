import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Activity, Globe, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface HostCheckerProps {
  onClose: () => void;
}

export function HostChecker({ onClose }: HostCheckerProps) {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('443');
  const [method, setMethod] = useState('HEAD');
  const [isChecking, setIsChecking] = useState(false);
  const [logs, setLogs] = useState<{ id: number; text: string; type: 'info' | 'success' | 'error' | 'header' }[]>([]);

  const addLog = (text: string, type: 'info' | 'success' | 'error' | 'header' = 'info') => {
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  const handleCheck = async () => {
    if (!host.trim()) return;
    
    setIsChecking(true);
    setLogs([]);
    addLog(`Initiating real remote server test...`, 'info');
    
    try {
      const response = await fetch('/api/check-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, method })
      });
      
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs.map((l: any, i: number) => ({ ...l, id: Date.now() + i })));
      }
    } catch (e) {
      addLog(`Failed to contact local proxy backend.`, 'error');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#1A1B26]/80 backdrop-blur-sm z-[70]"
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 w-full h-[85vh] bg-[#1A1B26] border-t border-[#3D59A1]/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(61,89,161,0.1)] z-[70] flex flex-col"
      >
        <div className="bg-[#1A1B26]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#7DCFFF]" />
            <h2 className="text-lg font-bold text-[#C0CAF5]">Host Checker</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#565F89] hover:text-[#C0CAF5] transition-colors bg-[#24283B]/50 hover:bg-[#24283B] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 space-y-6 flex flex-col">
          
          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4 shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <select 
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="bg-[#1A1B26] border border-[#24283B] rounded-lg px-2 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors w-24"
              >
                <option value="HEAD">HEAD</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
              <input 
                type="text" 
                placeholder="Target Host/SNI (e.g. google.com)" 
                value={host}
                onChange={e => setHost(e.target.value)}
                className="flex-1 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
              />
              <input 
                type="text" 
                placeholder="Port" 
                value={port}
                onChange={e => setPort(e.target.value)}
                className="w-16 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors text-center"
              />
            </div>
            
            <button 
              onClick={handleCheck}
              disabled={!host || isChecking}
              className="w-full bg-[#7DCFFF] hover:bg-[#7dcfffd0] text-[#1A1B26] font-bold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isChecking ? (
                <div className="w-4 h-4 border-2 border-[#1A1B26]/30 border-t-[#1A1B26] rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isChecking ? 'Checking Host...' : 'Check Host & SNI'}
            </button>
          </div>

          <div className="flex-1 bg-[#1A1B26] border border-[#24283B] rounded-xl p-4 overflow-hidden flex flex-col font-mono text-[11px] sm:text-xs">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#24283B] shrink-0">
              <span className="text-[#565F89] uppercase tracking-widest text-[10px] font-bold">Terminal Output</span>
              {logs.length > 0 && !isChecking && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                  {logs.some(l => l.type === 'error') ? (
                    <span className="text-[#F7768E] flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Dead/Blocked</span>
                  ) : (
                    <span className="text-[#9ECE6A] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Alive</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#565F89] space-y-2 opacity-50">
                  <Globe className="w-8 h-8" />
                  <span>Awaiting target host...</span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {logs.map(log => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`break-all ${
                        log.type === 'error' ? 'text-[#F7768E]' :
                        log.type === 'success' ? 'text-[#9ECE6A]' :
                        log.type === 'header' ? 'text-[#7AA2F7]' :
                        'text-[#9AA5CE]'
                      }`}
                    >
                      {log.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}
