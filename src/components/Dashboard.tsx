import React, { useState, useEffect } from 'react';
import { Power, FileSymlink, ChevronRight, ChevronsDown, ChevronsUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ParsedProfile } from '../utils/parser';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  activeProfile: ParsedProfile | null;
  onOpenSettings: () => void;
  onOpenGuides: () => void;
  onOpenConfigs?: () => void;
}

export function Dashboard({ activeProfile, onOpenSettings, onOpenGuides, onOpenConfigs }: DashboardProps) {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'>('disconnected');
  const [connectionTime, setConnectionTime] = useState(0);
  const [pingData, setPingData] = useState<{ ms: number, status: 'idle' | 'testing' | 'done' }>({ ms: 0, status: 'idle' });
  const [networkStats, setNetworkStats] = useState({ up: '0 B', down: '0 B' });
  const [chartData, setChartData] = useState<any[]>(Array.from({length: 10}, (_, i) => ({ time: i.toString(), up: 0, down: 0 })));
  
  const isConnected = connectionState === 'connected' || connectionState === 'reconnecting';

  const handleToggle = () => {
    if (!activeProfile) return;
    if (connectionState === 'disconnected' || connectionState === 'failed') {
      setConnectionState('connecting');
      setTimeout(() => {
        setConnectionState('connected');
      }, 2000);
    } else {
      setConnectionState('disconnected');
    }
  };

  useEffect(() => {
    setPingData({ ms: 0, status: 'idle' });
    if (connectionState !== 'disconnected') {
      setConnectionState('disconnected');
    }
  }, [activeProfile]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (connectionState === 'connected' || connectionState === 'reconnecting') {
      timer = setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
    } else if (connectionState === 'disconnected') {
      setConnectionTime(0);
      setChartData(Array.from({length: 10}, (_, i) => ({ time: i.toString(), up: 0, down: 0 })));
    }
    return () => clearInterval(timer);
  }, [connectionState]);

  useEffect(() => {
    if (!isConnected) {
      setNetworkStats({ up: '0 B', down: '0 B' });
      return;
    }
    
    const interval = setInterval(() => {
      const upBase = Math.random() * 50 + 5;
      const downBase = Math.random() * 800 + 40;
      
      setNetworkStats({
        up: `${upBase.toFixed(1)} KB/s`,
        down: `${downBase.toFixed(1)} KB/s`
      });
      
      setChartData(prev => {
        const newData = [...prev.slice(1), { time: new Date().toLocaleTimeString(), up: upBase, down: downBase }];
        return newData;
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, [isConnected]);

  const handlePingTest = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (pingData.status === 'testing' || !activeProfile) return;
    
    setPingData({ ms: 0, status: 'testing' });
    
    try {
      const response = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: activeProfile.address, port: activeProfile.port })
      });
      const data = await response.json();
      if (data.status === 'done') {
        setPingData({ ms: data.ms, status: 'done' });
      } else {
        setPingData({ ms: -1, status: 'error' });
      }
    } catch {
      setPingData({ ms: -1, status: 'error' });
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected': return 'CONNECTED';
      case 'connecting': return 'CONNECTING...';
      case 'reconnecting': return 'RECONNECTING...';
      default: return 'NOT CONNECTED';
    }
  };

  return (
    <div className="flex flex-col items-center pt-2 pb-4 flex-1 w-full relative">
      <motion.div 
        className="w-full justify-center items-center mb-10 flex relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-[#C0CAF5]">
          SK Box Proxy VPN
        </h1>
        <button 
          onClick={onOpenSettings}
          className="absolute right-0 bg-[#24283B] rounded-full p-2.5 flex flex-col items-center justify-center transition-colors shadow-sm hover:bg-[#2A2E44]"
        >
          <Award className="w-6 h-6 text-[#9ECE6A]" strokeWidth={2} />
        </button>
      </motion.div>

      {/* Main Connection Button */}
      <div className="flex flex-col items-center justify-center mb-4 w-full flex-1">
        <motion.button
          onClick={handleToggle}
          disabled={!activeProfile}
          whileTap={activeProfile ? { scale: 0.95 } : {}}
          className={`w-[120px] h-[120px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg relative ${
            !activeProfile ? 'bg-[#1A1B26] border border-[#24283B] opacity-50 cursor-not-allowed' : 'bg-[#24283B] hover:bg-[#2A2E44]'
          }`}
        >
          {isConnected && (
            <motion.div 
              className="absolute inset-[-10px] rounded-full border border-[#7DCFFF]/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
          <Power className={`w-10 h-10 transition-all z-10 ${
            connectionState === 'connected' ? 'text-[#7DCFFF] drop-shadow-[0_0_15px_rgba(125,207,255,0.5)]' 
            : connectionState === 'connecting' ? 'text-[#E0AF68] opacity-80' 
            : 'text-[#9AA5CE]'
          }`} strokeWidth={2.5} />
        </motion.button>
        
        <h2 className={`mt-8 mb-2 text-[14px] font-bold tracking-widest ${
          connectionState === 'connected' ? 'text-[#7DCFFF]' 
          : 'text-[#565F89]'
        }`}>
          {getConnectionStatusText()}
        </h2>
        
        {isConnected && (
          <div className="w-full px-6 mt-4 flex flex-col items-center">
            <div className="flex justify-between w-full text-[10px] text-[#565F89] font-mono mb-2 px-2 uppercase tracking-widest font-bold">
              <span>Traffic Monitor</span>
              <span className="text-[#9ECE6A] flex items-center gap-1">LIVE<div className="w-1.5 h-1.5 bg-[#9ECE6A] rounded-full animate-pulse"/></span>
            </div>
            <div className="w-full h-[100px] border border-[#24283B] bg-[#1A1B26]/50 rounded-xl overflow-hidden flex justify-center items-center p-2 relative shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7DCFFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7DCFFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9ECE6A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#9ECE6A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1B26', borderColor: '#24283B', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)} KB/s`, name === 'down' ? 'Download' : 'Upload']}
                    animationDuration={200}
                  />
                  <Area type="monotone" dataKey="down" stroke="#7DCFFF" fillOpacity={1} fill="url(#colorDown)" isAnimationActive={false} strokeWidth={2} />
                  <Area type="monotone" dataKey="up" stroke="#9ECE6A" fillOpacity={1} fill="url(#colorUp)" isAnimationActive={false} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => onOpenConfigs && onOpenConfigs()}
        className="w-[90%] mx-auto bg-[#24283B] rounded-2xl p-4 mt-auto cursor-pointer border border-transparent transition-colors hover:border-[#3D59A1]"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-[#7AA2F7]">
            <FileSymlink className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1 overflow-hidden shrink min-w-0">
            <p className="text-[12px] text-[#9AA5CE] mb-0.5 font-medium tracking-wide uppercase">Active Config</p>
            <h4 className="text-[14px] font-medium text-[#C0CAF5] truncate">
              {activeProfile ? activeProfile.name : 'No Profile Selected'}
            </h4>
            <p className="text-[12px] text-[#565F89] truncate">
              {activeProfile ? `${activeProfile.address}:${activeProfile.port}` : 'Please add a configuration'}
            </p>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[12px] text-[#7AA2F7] font-medium uppercase tracking-wider">{activeProfile ? activeProfile.protocol : 'NONE'}</span>
            <ChevronRight className="w-5 h-5 text-[#565F89]" strokeWidth={2} />
          </div>
        </div>

        <div className="flex justify-center w-full mb-4 mt-1">
          <button 
            disabled={pingData.status === 'testing'}
            onClick={handlePingTest}
            className={`text-[12px] font-bold uppercase tracking-widest transition-opacity hover:opacity-80 ${pingData.status === 'error' ? 'text-[#F7768E]' : 'text-[#E0AF68]'}`}
          >
            {pingData.status === 'testing' ? 'TESTING...' : pingData.status === 'done' ? `${pingData.ms} ms` : pingData.status === 'error' ? 'TIMEOUT' : 'PING'}
          </button>
        </div>

        <div className="w-full h-px bg-[#1A1B26] mb-3"></div>
        
        {/* Stats */}
        <div className="w-full flex justify-around px-2 mb-1">
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-medium text-[#9AA5CE] mb-1">Downlink</span>
            <div className="flex items-center gap-1.5">
              <ChevronsDown className="w-4 h-4 text-[#7DCFFF]" />
              <span className="text-[13px] text-[#7DCFFF] font-medium">{networkStats.down}</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-medium text-[#9AA5CE] mb-1">Uplink</span>
            <div className="flex items-center gap-1.5">
              <ChevronsUp className="w-4 h-4 text-[#9ECE6A]" />
              <span className="text-[13px] text-[#9ECE6A] font-medium">{networkStats.up}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
