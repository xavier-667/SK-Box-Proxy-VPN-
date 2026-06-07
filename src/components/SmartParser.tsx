import React, { useState, useEffect } from 'react';
import { Clipboard, Link, CheckCircle2, AlertCircle, Layers, FileDown, Activity, Plus, ChevronDown } from 'lucide-react';
import { parseProxyUrl, ParsedProfile } from '../utils/parser';
import { motion, AnimatePresence } from 'motion/react';

interface ParserProps {
  onProfileStored: (profile: ParsedProfile) => void;
  onOpenMixer: () => void;
  onOpenConfigManager: () => void;
  onOpenHostChecker: () => void;
  onOpenManualConfig: () => void;
}

const SINGBOX_PROTOCOLS = ['SSH', 'VLESS', 'VMess', 'Trojan', 'Shadowsocks', 'ShadowsocksR', 'Hysteria', 'Hysteria2', 'TUIC', 'WireGuard', 'SOCKS', 'HTTP', 'HTTPS', 'Tor', 'ShadowTLS', 'Naive'];

export function SmartParser({ onProfileStored, onOpenMixer, onOpenConfigManager, onOpenHostChecker, onOpenManualConfig }: ParserProps) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [protocol, setProtocol] = useState('SSH');
  const [options, setOptions] = useState({
    usePayload: false, ssl: false, enhanced: false, slowDns: false,
    enableDns: true, udpCustom: false, psiphon: false, v2ray: false
  });

  const isOptionDisabled = (key: string, currentProtocol: string, currentOptions: any) => {
    const p = currentProtocol;
    const isSSH = p === 'SSH';
    const isShadowsocks = ['Shadowsocks', 'ShadowsocksR'].includes(p);
    const isPureUdp = ['Hysteria', 'Hysteria2', 'TUIC', 'WireGuard'].includes(p);
    
    if (key === 'enableDns') return false;
    
    if (isPureUdp) return true;
    
    if (key === 'udpCustom') return !isSSH || currentOptions.slowDns || currentOptions.v2ray;
    if (key === 'slowDns') return !isSSH || currentOptions.udpCustom || currentOptions.v2ray;
    if (key === 'psiphon') return !isSSH;
    if (key === 'v2ray') return !isShadowsocks || currentOptions.udpCustom || currentOptions.slowDns;
    
    if (key === 'ssl' && isShadowsocks) return true;
    
    return false;
  };

  // Auto-uncheck disabled options when protocol or other options change
  useEffect(() => {
    let changed = false;
    const newOptions = { ...options };
    
    Object.keys(options).forEach((key) => {
      if (options[key as keyof typeof options] && isOptionDisabled(key, protocol, options)) {
        newOptions[key as keyof typeof options] = false;
        changed = true;
      }
    });

    if (changed) {
      setOptions(newOptions);
    }
  }, [protocol, options]);

  const handleParse = () => {
    let toParse = input;
    // Prefix custom strings if they don't have a protocol
    if (!input.includes('://') && input.trim()) {
      toParse = `${protocol.toLowerCase()}://${input}`;
    }
    
    const profile = parseProxyUrl(toParse);
    if (profile) {
      // Add custom options to the profile so they are saved
      const finalProfile = { ...profile, protocol: profile.protocol === 'custom' ? protocol.toLowerCase() : profile.protocol };
      
      setStatus('success');
      onProfileStored(finalProfile);
      setTimeout(() => {
        setInput('');
        setStatus('idle');
      }, 1500);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#24283B] rounded-2xl p-4 shadow-xl relative overflow-hidden border border-transparent transition-colors">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7AA2F7]/50 to-transparent" />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-[#C0CAF5] flex items-center gap-2">
          <Link className="w-4 h-4 text-[#7AA2F7]" strokeWidth={2.5} />
          Smart Parser
        </h3>
        <div className="flex gap-2">
          <button onClick={onOpenHostChecker} className="p-1.5 bg-[#1A1B26] hover:bg-[#1f2335] text-[#565F89] hover:text-[#9ECE6A] rounded-lg transition-colors" title="Host Checker">
            <Activity className="w-4 h-4" />
          </button>
          <button onClick={onOpenMixer} className="p-1.5 bg-[#1A1B26] hover:bg-[#1f2335] text-[#565F89] hover:text-[#7DCFFF] rounded-lg transition-colors" title="Protocol Mixer">
            <Layers className="w-4 h-4" />
          </button>
          <button onClick={onOpenConfigManager} className="p-1.5 bg-[#1A1B26] hover:bg-[#1f2335] text-[#565F89] hover:text-[#BB9AF7] rounded-lg transition-colors" title="Import/Export Config">
            <FileDown className="w-4 h-4" />
          </button>
          <button onClick={onOpenManualConfig} className="p-1.5 bg-[#1A1B26] hover:bg-[#7AA2F7] hover:text-[#1A1B26] text-[#7AA2F7] rounded-lg transition-colors border border-[#3D59A1]/50 shadow-[0_0_10px_rgba(122,162,247,0.1)]" title="Manual Config">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full appearance-none bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[13px] text-[#C0CAF5] outline-none transition-all font-medium mb-3 cursor-pointer"
          >
            {SINGBOX_PROTOCOLS.map(p => (
              <option key={p} value={p}>{p} Protocol</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[#565F89] pointer-events-none" />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ip:port@user:pass" 
              className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl pl-4 pr-10 py-3 text-[13px] text-[#C0CAF5] outline-none transition-all font-mono placeholder:text-[#565F89]"
            />
            <button 
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#565F89] hover:text-[#7AA2F7] transition-colors rounded-lg"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleParse}
            disabled={!input.trim()}
            className="bg-[#7AA2F7] hover:opacity-90 text-[#1A1B26] font-bold px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center min-w-[80px]"
          >
            <AnimatePresence mode="wait">
              {status === 'idle' && <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px]">Parse</motion.span>}
              {status === 'success' && <motion.div key="success" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><CheckCircle2 className="w-5 h-5" /></motion.div>}
              {status === 'error' && <motion.div key="error" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><AlertCircle className="w-5 h-5 text-[#F7768E]" /></motion.div>}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-2 border-t border-[#1A1B26]">
        {[
          { key: 'usePayload', label: 'Use Payload' },
          { key: 'ssl', label: 'SSL' },
          { key: 'enhanced', label: 'Enhanced' },
          { key: 'slowDns', label: 'SlowDns' },
          { key: 'enableDns', label: 'Enable DNS' },
          { key: 'udpCustom', label: 'UDP Custom' },
          { key: 'psiphon', label: 'Psiphon' },
          { key: 'v2ray', label: 'V2ray' }
        ].map((opt) => {
          const disabled = isOptionDisabled(opt.key, protocol, options);
          return (
            <label 
              key={opt.key} 
              className={`flex items-center gap-2.5 group transition-opacity ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={(e) => {
                e.preventDefault();
                if (!disabled) {
                  toggleOption(opt.key as keyof typeof options);
                }
              }}
            >
              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                options[opt.key as keyof typeof options] 
                  ? 'bg-[#9ECE6A] border-[#9ECE6A]' 
                  : disabled ? 'bg-[#1A1B26] border-[#3b4261]' : 'bg-[#1A1B26] border-[#565F89] group-hover:border-[#7AA2F7]'
              }`}>
                {options[opt.key as keyof typeof options] && (
                  <svg className="w-3 h-3 text-[#1A1B26]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-[12px] font-medium transition-colors ${
                options[opt.key as keyof typeof options] ? 'text-[#C0CAF5]' : disabled ? 'text-[#565F89]' : 'text-[#9AA5CE]'
              }`}>
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
