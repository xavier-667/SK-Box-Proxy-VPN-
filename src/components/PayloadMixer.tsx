import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Layers, Server, Lock, FileCode2, Save } from 'lucide-react';
import { ParsedProfile } from '../utils/parser';

interface PayloadMixerProps {
  onClose: () => void;
  onSave: (profile: ParsedProfile) => void;
}

export function PayloadMixer({ onClose, onSave }: PayloadMixerProps) {
  const [name, setName] = useState('Custom Mix');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('443');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [useSsh, setUseSsh] = useState(true);
  const [useTls, setUseTls] = useState(false);
  const [sni, setSni] = useState('');
  
  const [usePayload, setUsePayload] = useState(false);
  const [payload, setPayload] = useState('GET / HTTP/1.1[crlf]Host: [host][crlf]Connection: Keep-Alive[crlf][crlf]');

  const handleSave = () => {
    if (!host) return;
    
    let mixProtocol = 'ssh';
    if (useSsh && useTls && usePayload) mixProtocol = 'ssh+tls+payload';
    else if (useSsh && useTls) mixProtocol = 'ssh+tls';
    else if (useSsh && usePayload) mixProtocol = 'ssh+payload';

    const customProfile: ParsedProfile = {
      protocol: mixProtocol,
      name: name,
      address: host,
      port: port,
      raw: JSON.stringify({ host, port, username, password, useTls, sni, usePayload, payload })
    };
    
    onSave(customProfile);
    onClose();
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
        className="fixed bottom-0 left-0 w-full h-[90vh] bg-[#1A1B26] border-t border-[#3D59A1]/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(61,89,161,0.1)] z-[70] flex flex-col"
      >
        <div className="bg-[#1A1B26]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#7DCFFF]" />
            <h2 className="text-lg font-bold text-[#C0CAF5]">Protocol Mixer</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#565F89] hover:text-[#C0CAF5] transition-colors bg-[#24283B]/50 hover:bg-[#24283B] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 space-y-6 no-scrollbar">
          
          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#565F89] mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" /> Server Details
            </h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Config Name (e.g., My Mixed Server)" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Remote Host / IP" 
                  value={host}
                  onChange={e => setHost(e.target.value)}
                  className="w-2/3 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="Port" 
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  className="w-1/3 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#565F89] flex items-center gap-2">
                <Lock className="w-4 h-4" /> SSH Authentication
              </h3>
              <div className="w-9 h-5 rounded-full p-0.5 bg-[#9ECE6A] transition-colors cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-4" />
              </div>
            </div>
            {useSsh && (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-1/2 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-1/2 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3" onClick={() => setUseTls(!useTls)}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#565F89] flex items-center gap-2 cursor-pointer">
                <Layers className="w-4 h-4" /> SSL / TLS (Stunnel)
              </h3>
              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${useTls ? 'bg-[#9ECE6A]' : 'bg-[#24283B]'}`}>
                <motion.div 
                  className="w-4 h-4 bg-[#C0CAF5] rounded-full shadow-md"
                  animate={{ x: useTls ? 16 : 0 }}
                />
              </div>
            </div>
            {useTls && (
              <input 
                type="text" 
                placeholder="SNI Host (e.g., bug.com)" 
                value={sni}
                onChange={e => setSni(e.target.value)}
                className="w-full bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-sm text-[#C0CAF5] outline-none focus:border-[#7AA2F7]/50 transition-colors"
              />
            )}
          </div>

          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3" onClick={() => setUsePayload(!usePayload)}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#565F89] flex items-center gap-2 cursor-pointer">
                <FileCode2 className="w-4 h-4" /> Custom HTTP Payload
              </h3>
              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${usePayload ? 'bg-[#9ECE6A]' : 'bg-[#24283B]'}`}>
                <motion.div 
                  className="w-4 h-4 bg-[#C0CAF5] rounded-full shadow-md"
                  animate={{ x: usePayload ? 16 : 0 }}
                />
              </div>
            </div>
            {usePayload && (
              <textarea 
                rows={4}
                value={payload}
                onChange={e => setPayload(e.target.value)}
                className="w-full bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-xs text-[#7DCFFF] font-mono outline-none focus:border-[#7AA2F7]/50 transition-colors"
              />
            )}
          </div>

        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-[#1A1B26]/90 backdrop-blur-md border-t border-[#3D59A1]/30">
          <button 
            onClick={handleSave}
            disabled={!host}
            className="w-full bg-[#7DCFFF] hover:bg-[#7dcfffd0] text-[#1A1B26] font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Generate Mixed Config
          </button>
        </div>
      </motion.div>
    </>
  );
}
