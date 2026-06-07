import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Globe, Radio, MoveRight, Settings2, Smartphone, Cpu, Check, Box, Fingerprint, Zap, Ghost, Scissors, Lock } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
  onOpenRouting?: () => void;
}

export function SettingsPanel({ onClose, onOpenRouting }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    bypassLan: true,
    blockQuic: true,
    wakelock: false,
    mux: false,
    ipv6: false,
    sniffing: true,
    tcpFastOpen: false,
    fakeDns: true,
    dns: '1.1.1.1',
    customDnsUrl: 'https://dns.google/dns-query',
    mtu: 9000,
    utls: 'chrome',
    cipher: 'auto',
    tlsWrapper: true,
    fragmentation: false,
    wsObfuscation: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setDns = (dns: string) => {
    setSettings(prev => ({ ...prev, dns }));
  };

  const setUtls = (utls: string) => {
    setSettings(prev => ({ ...prev, utls }));
  };

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
        className="fixed bottom-0 left-0 w-full h-[90vh] bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl shadow-[0_-10px_40px_rgba(34,211,238,0.1)] z-50 flex flex-col"
      >
        <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Advanced Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-6 pb-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
          {/* Routing Group */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <RouteIcon className="w-4 h-4" /> System & Routing
            </h3>
            
            <SettingToggle 
              icon={<Shield className="w-5 h-5 text-fuchsia-400" />}
              title="Bypass LAN"
              description="Exclude local network traffic from VPN"
              checked={settings.bypassLan}
              onChange={() => toggleSetting('bypassLan')}
            />
            
            <SettingToggle 
              icon={<Globe className="w-5 h-5 text-blue-400" />}
              title="Enable IPv6"
              description="Route IPv6 traffic through the proxy"
              checked={settings.ipv6}
              onChange={() => toggleSetting('ipv6')}
            />

            <SettingToggle 
              icon={<Box className="w-5 h-5 text-emerald-400" />}
              title="Fake DNS"
              description="Prevent DNS leaks and speed up initial lookup"
              checked={settings.fakeDns}
              onChange={() => toggleSetting('fakeDns')}
            />
            
            <div 
              onClick={() => onOpenRouting && onOpenRouting()}
              className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Split Tunneling</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Rules & Apps routing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">Configure</span>
                <MoveRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <SettingToggle 
              icon={<Shield className="w-5 h-5 text-amber-400" />}
              title="Block QUIC"
              description="Drop UDP/443 to force fallback to standard TCP TLS"
              checked={settings.blockQuic}
              onChange={() => toggleSetting('blockQuic')}
            />

            <SettingToggle 
              icon={<Globe className="w-5 h-5 text-indigo-400" />}
              title="Bypass LAN"
              description="Skip proxy for local network and private IPs"
              checked={settings.bypassLan}
              onChange={() => toggleSetting('bypassLan')}
            />
            
            {/* MTU Slider */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-200">MTU Size</span>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{settings.mtu}</span>
              </div>
              <input 
                type="range" 
                min="1200" 
                max="9000" 
                step="100" 
                value={settings.mtu}
                onChange={(e) => setSettings(prev => ({ ...prev, mtu: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                <span>Standard (1500)</span>
                <span>Jumbo (9000)</span>
              </div>
            </div>
          </section>

          {/* Core Settings Group */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Tuning & Obfuscation
            </h3>
            
            <SettingToggle 
              icon={<Radio className="w-5 h-5 text-amber-400" />}
              title="Traffic Sniffing"
              description="Detect protocol and override destination"
              checked={settings.sniffing}
              onChange={() => toggleSetting('sniffing')}
            />
            
            <SettingToggle 
              icon={<MoveRight className="w-5 h-5 text-cyan-400" />}
              title="Multiplexer (Mux)"
              description="Reduce latency with connection multiplexing"
              checked={settings.mux}
              onChange={() => toggleSetting('mux')}
            />
            
            <SettingToggle 
              icon={<Zap className="w-5 h-5 text-rose-400" />}
              title="TCP Fast Open"
              description="Skip TCP handshake on subsequent connections"
              checked={settings.tcpFastOpen}
              onChange={() => toggleSetting('tcpFastOpen')}
            />

            <SettingToggle 
              icon={<Shield className="w-5 h-5 text-emerald-400" />}
              title="Keep-Alive Wakelock"
              description="Prevent OS from putting background proxy to sleep"
              checked={settings.wakelock}
              onChange={() => toggleSetting('wakelock')}
            />

            {/* Security Section */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Encryption Cipher</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Recommended: Auto or ChaCha20</p>
                </div>
              </div>
              <select 
                value={settings.cipher || 'auto'}
                onChange={(e) => setSettings(prev => ({ ...prev, cipher: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="auto">Auto (Best Performance)</option>
                <option value="chacha20-poly1305">ChaCha20-Poly1305</option>
                <option value="aes-256-gcm">AES-256-GCM</option>
                <option value="aes-128-gcm">AES-128-GCM</option>
                <option value="none">None (Plain text)</option>
              </select>
            </div>

            {/* uTLS section */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-slate-900 rounded-xl">
                  <Fingerprint className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">TLS Fingerprint (uTLS)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Mimic standard browser handshakes</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['chrome', 'firefox', 'safari', 'ios', 'randomized'].map(tls => (
                  <button
                    key={tls}
                    onClick={() => setUtls(tls)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border flex justify-center capitalize transition-colors ${
                      settings.utls === tls 
                        ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {tls}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Anti-DPI & Traffic Camouflage */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Ghost className="w-4 h-4" /> Anti-DPI & Camouflage
            </h3>
            
            <SettingToggle 
              icon={<Lock className="w-5 h-5 text-indigo-400" />}
              title="TLS Wrapper (Stunnel)"
              description="Wrap insecure protocols in TLS to hide from carriers"
              checked={settings.tlsWrapper}
              onChange={() => toggleSetting('tlsWrapper')}
            />

            <SettingToggle 
              icon={<Scissors className="w-5 h-5 text-rose-400" />}
              title="TLS/SNI Fragmentation"
              description="Split ClientHello packets to defeat ISP DPI"
              checked={settings.fragmentation}
              onChange={() => toggleSetting('fragmentation')}
            />

            <SettingToggle 
              icon={<Globe className="w-5 h-5 text-cyan-400" />}
              title="WebSocket Camouflage"
              description="Masquerade VPN traffic as standard web traffic"
              checked={settings.wsObfuscation}
              onChange={() => toggleSetting('wsObfuscation')}
            />
          </section>

          {/* DNS Group */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Remote DNS
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'System Default', ip: 'system' },
                { name: 'Cloudflare', ip: '1.1.1.1' },
                { name: 'Google', ip: '8.8.8.8' },
                { name: 'Custom DoH/DoT', ip: 'custom' }
              ].map(dns => (
                <button
                  key={dns.ip}
                  onClick={() => setDns(dns.ip)}
                  className={`relative p-3 rounded-xl border flex flex-col items-start transition-all ${
                    settings.dns === dns.ip 
                      ? 'bg-cyan-500/10 border-cyan-500/50' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {settings.dns === dns.ip && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  )}
                  <span className={`text-xs font-medium mb-1 ${settings.dns === dns.ip ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {dns.name}
                  </span>
                  {dns.ip !== 'custom' && dns.ip !== 'system' && (
                     <span className="text-xs font-mono text-slate-500">{dns.ip}</span>
                  )}
                  {dns.ip === 'system' && (
                     <span className="text-[10px] text-slate-500">Auto Assign</span>
                  )}
                  {dns.ip === 'custom' && (
                     <span className="text-[10px] text-slate-500">Manual Entry</span>
                  )}
                </button>
              ))}
            </div>
            
            <AnimatePresence>
              {settings.dns === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
                    <label className="text-xs text-slate-400 font-medium mb-2 block">Custom Endpoint (DoH / DoT)</label>
                    <input 
                      type="url" 
                      value={settings.customDnsUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, customDnsUrl: e.target.value }))}
                      placeholder="https://dns.google/dns-query"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/50 transition-colors font-mono"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </motion.div>
    </>
  );
}

// Simple internal icon
function RouteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="19" r="3"/>
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
      <circle cx="18" cy="5" r="3"/>
    </svg>
  )
}

function SettingToggle({ icon, title, description, checked, onChange }: { icon: React.ReactNode, title: string, description: string, checked: boolean, onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-900 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-900 rounded-xl shadow-inner">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-200">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className={`shrink-0 w-11 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-cyan-500' : 'bg-slate-800'}`}>
        <motion.div 
          className="w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}
