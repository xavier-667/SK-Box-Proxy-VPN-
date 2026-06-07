import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, ChevronRight, Copy, Server, Globe, Shield } from 'lucide-react';

interface GuideProps {
  onClose: () => void;
}

export function ProtocolGuides({ onClose }: GuideProps) {
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const guides = [
    {
      id: 'vmess',
      name: 'VMess / V2Ray',
      icon: <Server className="w-5 h-5 text-emerald-400" />,
      content: `VMess is the primary protocol of V2Ray. It's designed for deep packet inspection bypassing. 
      \nTo add a VMess server:
      1. Get a standard "vmess://..." link from your provider.
      2. Paste it in the URL parser on the main screen.
      3. It will automatically configure Address, Port, UUID, AlterID, and Security.`,
      example: 'vmess://eyJhZGQiOiB... (base64 string)'
    },
    {
      id: 'vless',
      name: 'VLESS',
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      content: `VLESS is a lightweight protocol that avoids encryption/decryption overhead if TLS is handled.
      \nTo setup:
      1. Copy the VLESS URI.
      2. Format: vless://[uuid]@[host]:[port]?encryption=none&security=tls#Name
      3. Paste in the parser. Ensure SNI / peer values are correct if your provider requires them.`,
      example: 'vless://uuid@server:443?security=tls#MyServer'
    },
    {
      id: 'trojan',
      name: 'Trojan',
      icon: <Shield className="w-5 h-5 text-fuchsia-400" />,
      content: `Trojan disguises your footprint as normal HTTPS traffic. It's unidentifiable without the password.
      \nHow to Use:
      1. Provider gives a trojan URI.
      2. Parse it directly. It will extract the Password, SNI, and Address.
      3. You can override the SNI in Advanced Settings if you have a custom host mask.`,
      example: 'trojan://password@server.com:443#TrojanNode'
    }
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 w-full h-[70vh] bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(34,211,238,0.1)] z-50 flex flex-col"
      >
        <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Protocol Guides</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <AnimatePresence mode="wait">
            {!activeGuide ? (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {guides.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGuide(g.id)}
                    className="w-full text-left bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-colors sequence-animation"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-900 rounded-xl">
                        {g.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-200">{g.name}</h4>
                        <p className="text-xs text-slate-500">Setup & Configuration guide</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center gap-2 mb-6">
                  <button 
                    onClick={() => setActiveGuide(null)}
                    className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                </div>
                
                {guides.filter(g => g.id === activeGuide).map(g => (
                  <div key={g.id} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-800 rounded-xl">{g.icon}</div>
                      <h3 className="text-xl font-bold text-slate-100">{g.name}</h3>
                    </div>
                    
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {g.content}
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mt-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Example format</h4>
                      <div className="flex items-center justify-between bg-slate-900 rounded border border-slate-800 p-3">
                        <code className="text-xs text-emerald-400 font-mono break-all line-clamp-1">{g.example}</code>
                        <Copy className="w-4 h-4 text-slate-500 ml-3 shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
