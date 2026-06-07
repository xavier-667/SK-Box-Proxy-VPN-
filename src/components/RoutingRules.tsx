import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Navigation, Shield, Globe, Smartphone, AlertCircle } from 'lucide-react';

interface Rule {
  id: string;
  type: 'domain' | 'ip' | 'app';
  pattern: string;
  outbound: 'proxy' | 'direct' | 'block';
}

interface RoutingRulesProps {
  onClose: () => void;
}

export function RoutingRules({ onClose }: RoutingRulesProps) {
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', type: 'domain', pattern: 'geosite:cn', outbound: 'direct' },
    { id: '2', type: 'domain', pattern: 'domain:netflix.com', outbound: 'proxy' },
    { id: '3', type: 'ip', pattern: 'geoip:private', outbound: 'direct' },
    { id: '4', type: 'app', pattern: 'com.whatsapp', outbound: 'proxy' },
  ]);

  const [newPattern, setNewPattern] = useState('');
  const [newType, setNewType] = useState<'domain' | 'ip' | 'app'>('domain');
  const [newOutbound, setNewOutbound] = useState<'proxy' | 'direct' | 'block'>('direct');

  const handleAddRule = () => {
    if (!newPattern.trim()) return;
    
    const rule: Rule = {
      id: Date.now().toString(),
      type: newType,
      pattern: newPattern,
      outbound: newOutbound
    };
    
    setRules([rule, ...rules]);
    setNewPattern('');
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'domain': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'ip': return <Navigation className="w-4 h-4 text-emerald-400" />;
      case 'app': return <Smartphone className="w-4 h-4 text-fuchsia-400" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getOutboundBadge = (outbound: string) => {
    switch (outbound) {
      case 'proxy': return <span className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 border px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Proxy</span>;
      case 'direct': return <span className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 border px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Bypass</span>;
      case 'block': return <span className="bg-rose-500/10 text-rose-400 border-rose-500/30 border px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Block</span>;
      default: return null;
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60]"
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 w-full h-[85vh] bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(34,211,238,0.1)] z-[60] flex flex-col"
      >
        <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Split Tunneling Rules</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-20 no-scrollbar">
          
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-cyan-500 h-full"></div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add New Rule
            </h3>
            
            <div className="flex gap-2 mb-3">
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-300 outline-none w-1/3"
              >
                <option value="domain">Domain</option>
                <option value="ip">IP/CIDR</option>
                <option value="app">App (Pkg)</option>
              </select>
              
              <input 
                type="text" 
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="e.g. domain:google.com"
                className="w-2/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={newOutbound}
                onChange={(e) => setNewOutbound(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-300 outline-none block flex-1"
              >
                <option value="proxy">Proxy (Tunnel)</option>
                <option value="direct">Direct (Bypass)</option>
                <option value="block">Block</option>
              </select>
              
              <button 
                onClick={handleAddRule}
                disabled={!newPattern.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 font-medium px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4" /> Active Rules
            </h3>
            
            {rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">No custom rules defined</p>
                <p className="text-xs mt-1">All traffic will follow default settings.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-slate-900 rounded-lg shrink-0">
                        {getTypeIcon(rule.type)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-0.5">
                          {getOutboundBadge(rule.outbound)}
                        </div>
                        <p className="text-xs font-mono text-slate-300 font-medium truncate">{rule.pattern}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeRule(rule.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </motion.div>
    </>
  );
}
