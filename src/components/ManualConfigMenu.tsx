import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, Server, Shield, Globe } from 'lucide-react';
import { ParsedProfile } from '../utils/parser';

interface ManualConfigMenuProps {
  onClose: () => void;
  onSave: (profile: ParsedProfile) => void;
}

const PROTOCOLS = ['SSH', 'VLESS', 'VMess', 'Trojan', 'Shadowsocks', 'ShadowsocksR', 'Hysteria', 'Hysteria2', 'TUIC', 'WireGuard', 'SOCKS', 'HTTP', 'HTTPS', 'Tor', 'ShadowTLS', 'Naive', 'UDP Custom'];

export function ManualConfigMenu({ onClose, onSave }: ManualConfigMenuProps) {
  const [protocol, setProtocol] = useState('VLESS');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [port, setPort] = useState('');
  const [uuid, setUuid] = useState('');
  const [sni, setSni] = useState('');
  const [host, setHost] = useState('');

  const handleSave = () => {
    onSave({
      protocol: protocol.toLowerCase(),
      name: name || `${protocol} Server`,
      address: address || '127.0.0.1',
      port: port || '443',
      raw: 'manual-config'
    });
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
        className="fixed bottom-0 left-0 w-full h-[85vh] bg-[#1A1B26] border-t border-[#3D59A1]/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(61,89,161,0.1)] z-[70] flex flex-col"
      >
        <div className="bg-[#1A1B26]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10 shrink-0">
          <h2 className="text-[#C0CAF5] font-bold text-lg flex items-center gap-2">
            <Server className="w-5 h-5 text-[#7AA2F7]" />
            Manual Config
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#565F89] hover:text-[#C0CAF5] transition-colors bg-[#24283B]/50 hover:bg-[#24283B] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-6 pb-24">
        <div className="space-y-4">
          <div>
            <label className="text-[#9AA5CE] text-[13px] font-medium mb-1.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7AA2F7]" />
              Protocol
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {PROTOCOLS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`py-2 px-1 text-[13px] rounded-lg transition-colors border ${
                    protocol === p 
                    ? 'bg-[#7AA2F7]/10 text-[#7AA2F7] border-[#7AA2F7]/50' 
                    : 'bg-[#24283B] text-[#9AA5CE] border-transparent hover:border-[#3D59A1]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            
            <motion.div 
              key={protocol}
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1B26] border border-[#24283B] p-3 rounded-xl flex items-start gap-2.5 mb-2"
            >
              <div className="mt-0.5">
                <Globe className="w-4 h-4 text-[#7AA2F7]" />
              </div>
              <p className="text-[12px] text-[#9AA5CE] leading-relaxed">
                {protocol === 'SSH' && "Secure Shell tunneling. Supports custom HTTP payloads and Dropbear for establishing encrypted tunnels over plain SSH."}
                {protocol === 'VLESS' && "Lightweight protocol without built-in encryption. Often paired with XTLS or Websocket + TLS for fast, standard web traffic masking."}
                {protocol === 'VMess' && "Standard V2Ray protocol that includes built-in encryption and time-based authentication. Excellent for highly restricted networks."}
                {protocol === 'Trojan' && "Imitates standard HTTPS traffic perfectly. Needs a valid TLS certificate to work, making it extremely hard to detect."}
                {(protocol === 'Shadowsocks' || protocol === 'ShadowsocksR') && "Classic, secure SOCKS5 proxy protocol designed to be fast and lightweight. Excellent for basic bypassing."}
                {(protocol === 'Hysteria' || protocol === 'Hysteria2') && "Aggressive QUIC-based UDP protocol designed specifically for lossy, high-latency, or throttle networks. Extreme speed."}
                {protocol === 'TUIC' && "Modern QUIC-based protocol focused on low latency overhead and smooth 0-RTT handshakes."}
                {protocol === 'WireGuard' && "Modern, extremely fast UDP VPN protocol using state-of-the-art cryptography. Better for overall system VPN rather than proxying."}
                {protocol === 'UDP Custom' && "Raw UDP forwarding payload usually used to bypass captive portals and DNS-based firewalls over port 53."}
                {['SOCKS', 'HTTP', 'HTTPS', 'Tor', 'ShadowTLS', 'Naive'].includes(protocol) && "Advanced legacy or specialized tunneling protocol. Ensure your upstream server is properly configured."}
              </p>
            </motion.div>
          </div>

          <div className="bg-[#24283B] p-4 rounded-2xl space-y-4 border border-transparent">
            <div>
              <label className="text-[#9AA5CE] text-[12px] font-medium mb-1 block pl-1">Config Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My custom server"
                className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[14px] text-[#C0CAF5] outline-none placeholder:text-[#565F89] transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-[2]">
                <label className="text-[#9AA5CE] text-[12px] font-medium mb-1 block pl-1">Address / IP</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="1.1.1.1"
                  className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[14px] text-[#C0CAF5] outline-none placeholder:text-[#565F89] transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-[#9AA5CE] text-[12px] font-medium mb-1 block pl-1">Port</label>
                <input 
                  type="text" 
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="443"
                  className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[14px] text-[#C0CAF5] outline-none placeholder:text-[#565F89] transition-colors"
                />
              </div>
            </div>

            {(protocol === 'VLESS' || protocol === 'VMess' || protocol === 'Trojan' || protocol === 'Hysteria' || protocol === 'Hysteria2' || protocol === 'TUIC' || protocol === 'Shadowsocks' || protocol === 'ShadowsocksR') && (
              <div>
                <label className="text-[#9AA5CE] text-[12px] font-medium mb-1 block pl-1">UUID / Password</label>
                <input 
                  type="text" 
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[14px] text-[#C0CAF5] outline-none placeholder:text-[#565F89] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-[#9AA5CE] text-[12px] font-medium mb-1 block pl-1 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Host / SNI</label>
              <input 
                type="text" 
                value={sni}
                onChange={(e) => setSni(e.target.value)}
                placeholder="bug.example.com"
                className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[14px] text-[#C0CAF5] outline-none placeholder:text-[#565F89] transition-colors"
              />
            </div>
            
            {protocol === 'SSH' && (
               <div>
                  <label className="text-[#9AA5CE] text-[12px] font-medium mb-1 block pl-1">Custom Payload</label>
                  <textarea 
                     className="w-full bg-[#1A1B26] border border-[#1A1B26] focus:border-[#3D59A1] rounded-xl px-4 py-2.5 text-[13px] text-[#C0CAF5] outline-none placeholder:text-[#565F89] transition-colors font-mono min-h-[80px]"
                     placeholder="GET http://[host]/ HTTP/1.1\nHost: [host]\nConnection: Upgrade"
                  />
               </div>
            )}

          </div>
        </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-[#1A1B26]/90 backdrop-blur-md border-t border-[#3D59A1]/30">
          <button 
            onClick={handleSave}
            className="w-full bg-[#7AA2F7] text-[#1A1B26] font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(122,162,247,0.3)] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>
      </motion.div>
    </>
  );
}
