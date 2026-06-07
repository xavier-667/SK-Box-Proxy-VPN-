import React, { useState, useEffect } from 'react';
import { SmartParser } from './components/SmartParser';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { ProtocolGuides } from './components/ProtocolGuides';
import { RoutingRules } from './components/RoutingRules';
import { PayloadMixer } from './components/PayloadMixer';
import { ConfigManager } from './components/ConfigManager';
import { HostChecker } from './components/HostChecker';
import { ManualConfigMenu } from './components/ManualConfigMenu';
import { ParsedProfile } from './utils/parser';
import { AnimatePresence } from 'motion/react';
import { Home, Cloud, Folder, Info, MoreHorizontal, Settings, Shield, Layers, FileCode2, Terminal, Trash2 } from 'lucide-react';

export default function App() {
  const [profiles, setProfiles] = useState<ParsedProfile[]>(() => {
    const saved = localStorage.getItem('skbox_profiles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  
  const [profile, setProfile] = useState<ParsedProfile | null>(() => {
    const saved = localStorage.getItem('skbox_active_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('skbox_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('skbox_active_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('skbox_active_profile');
    }
  }, [profile]);
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [showRouting, setShowRouting] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showHostChecker, setShowHostChecker] = useState(false);
  const [showManualConfig, setShowManualConfig] = useState(false);

  const handleSetProfile = (p: ParsedProfile) => {
    setProfile(p);
    setProfiles(prev => {
      if (!prev.some(existing => existing.raw === p.raw)) {
        return [...prev, p];
      }
      return prev;
    });
  };

  const handleDeleteProfile = (e: React.MouseEvent, pToDelete: ParsedProfile) => {
    e.stopPropagation();
    setProfiles(prev => prev.filter(existing => existing.raw !== pToDelete.raw));
    if (profile && profile.raw === pToDelete.raw) {
      setProfile(null);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'configs', label: 'Configs', icon: Cloud },
    { id: 'subs', label: 'Subs', icon: Folder },
    { id: 'logs', label: 'Logs', icon: Info },
    { id: 'more', label: 'More', icon: MoreHorizontal }
  ];

  return (
    <div className="min-h-screen bg-[#1A1B26] flex justify-center selection:bg-[#7AA2F7]/30">
      <div className="w-full max-w-md bg-[#1A1B26] min-h-screen relative shadow-2xl flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 px-5 pt-8 pb-4 flex flex-col overflow-y-auto no-scrollbar">
          {activeTab === 'home' && (
            <Dashboard 
              activeProfile={profile} 
              onOpenSettings={() => setShowSettings(true)}
              onOpenGuides={() => setShowGuides(true)}
              onOpenConfigs={() => setActiveTab('configs')}
            />
          )}

          {activeTab === 'configs' && (
            <div className="pt-4 pb-4 h-full flex flex-col">
              <h2 className="text-[#C0CAF5] font-bold px-2 mb-4">Configurations</h2>
              <div className="bg-[#24283B] p-4 rounded-2xl mb-6 border border-transparent hover:border-[#3D59A1] transition-colors">
                <div className="flex items-center gap-3 mb-2">
                   <FileCode2 className="w-5 h-5 text-[#7AA2F7]" />
                   <h3 className="text-[#C0CAF5] font-medium text-[15px]">Active Profile</h3>
                </div>
                <p className="text-[#9AA5CE] text-[13px] pl-8">{profile ? profile.name : 'No profile selected'}</p>
              </div>

              {profiles.length > 0 && (
                <div className="mb-6 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-[#C0CAF5] font-bold px-2 mb-3">Saved Profiles ({profiles.length})</h3>
                  {profiles.map((p, i) => (
                    <div 
                      key={i} 
                      onClick={() => setProfile(p)}
                      className={`cursor-pointer bg-[#24283B] p-3 rounded-xl border ${profile === p ? 'border-[#7AA2F7]' : 'border-transparent hover:border-[#3D59A1]/50'} transition-colors flex justify-between items-center group`}
                    >
                       <div className="flex-1 min-w-0 pr-3">
                         <p className="text-[#C0CAF5] text-[13px] font-medium truncate">{p.name}</p>
                         <p className="text-[#565F89] text-[11px] mt-0.5 truncate">{p.protocol} • {p.address}</p>
                       </div>
                       <div className="flex items-center gap-3 shrink-0">
                         {profile === p && <div className="w-2.5 h-2.5 rounded-full bg-[#9ECE6A] shadow-[0_0_8px_rgba(158,206,106,0.6)]" />}
                         <button 
                           onClick={(e) => handleDeleteProfile(e, p)}
                           className="p-1.5 text-[#565F89] hover:text-[#F7768E] hover:bg-[#F7768E]/10 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                           title="Delete profile"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              <SmartParser 
                onProfileStored={handleSetProfile} 
                onOpenMixer={() => setShowMixer(true)}
                onOpenConfigManager={() => setShowConfig(true)}
                onOpenHostChecker={() => setShowHostChecker(true)}
                onOpenManualConfig={() => setShowManualConfig(true)}
              />
            </div>
          )}

          {activeTab === 'subs' && (
            <div className="pt-4 h-full flex flex-col">
               <h2 className="text-[#C0CAF5] font-bold px-2 mb-4">Subscriptions</h2>
               <div className="bg-[#24283B] p-4 rounded-2xl flex items-center gap-3">
                 <input type="text" placeholder="https://example.com/sub" className="bg-[#1A1B26] text-[#C0CAF5] text-[13px] px-3 py-2.5 rounded-xl flex-1 outline-none border border-[#1A1B26] focus:border-[#3D59A1] placeholder:text-[#565F89] transition-colors" />
                 <button className="bg-[#7AA2F7] text-[#1A1B26] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase transition-opacity hover:opacity-90">Add</button>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center text-[#565F89] mt-10">
                 <Folder className="w-12 h-12 mb-3 opacity-60" />
                 <p className="text-[14px]">No subscription links added</p>
               </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="pt-4 pb-4 flex flex-col h-full space-y-4">
              <h2 className="text-[#C0CAF5] font-bold px-2">System Logs</h2>
              <div className="bg-[#24283B] p-4 rounded-xl flex-1 font-mono text-[11px] text-[#9AA5CE] flex flex-col gap-1.5 overflow-y-auto border border-[#1A1B26]">
                <p className="text-[#C0CAF5]">[SYSTEM] Application booted successfully.</p>
                <p className="text-[#9ECE6A]">[INFO] Core module ready.</p>
                <p>[NETWORK] Network interfaces detected.</p>
                {profile && <p className="text-[#7DCFFF]">[PROXY] Profile loaded: {profile.name}</p>}
              </div>
            </div>
          )}

          {activeTab === 'more' && (
            <div className="pt-4 pb-4 flex flex-col space-y-2">
              <h2 className="text-[#C0CAF5] font-bold px-2 mb-2">More Options</h2>
              
              <button onClick={() => setShowSettings(true)} className="flex items-center gap-4 bg-[#24283B] p-4 rounded-2xl text-left hover:bg-[#2A2E44] transition-colors border border-transparent">
                <Settings className="w-6 h-6 text-[#7AA2F7]" strokeWidth={1.8} />
                <div>
                  <h3 className="text-[#C0CAF5] font-medium text-[15px] mb-0.5">App Settings</h3>
                  <p className="text-[#9AA5CE] text-[12px]">DNS, MTU, Protocol options</p>
                </div>
              </button>

              <button onClick={() => setShowRouting(true)} className="flex items-center gap-4 bg-[#24283B] p-4 rounded-2xl text-left hover:bg-[#2A2E44] transition-colors border border-transparent">
                <Shield className="w-6 h-6 text-[#7AA2F7]" strokeWidth={1.8} />
                <div>
                  <h3 className="text-[#C0CAF5] font-medium text-[15px] mb-0.5">Routing Rules</h3>
                  <p className="text-[#9AA5CE] text-[12px]">Split tunneling & App bypass</p>
                </div>
              </button>

              <button onClick={() => setShowMixer(true)} className="flex items-center gap-4 bg-[#24283B] p-4 rounded-2xl text-left hover:bg-[#2A2E44] transition-colors border border-transparent">
                <Layers className="w-6 h-6 text-[#7AA2F7]" strokeWidth={1.8} />
                <div>
                  <h3 className="text-[#C0CAF5] font-medium text-[15px] mb-0.5">Protocol Mixer</h3>
                  <p className="text-[#9AA5CE] text-[12px]">Custom SSH/TLS payloads</p>
                </div>
              </button>
            </div>
          )}
        </main>
        
        {/* Bottom Navigation Navbar */}
        <div className="w-full bg-[#1A1B26] border-t border-[#24283B] flex justify-around items-center px-1 py-1.5 mt-auto z-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 p-2 transition-colors min-w-[64px]"
            >
              <div className={`py-1 px-5 rounded-full transition-colors ${activeTab === tab.id ? 'bg-[#7AA2F7] shadow-[0_0_10px_rgba(122,162,247,0.3)]' : 'bg-transparent'}`}>
                <tab.icon className={`w-[22px] h-[22px] transition-colors ${activeTab === tab.id ? 'text-[#1A1B26] fill-current' : 'text-[#565F89]'}`} strokeWidth={activeTab === tab.id ? 2 : 1.8} />
              </div>
              <span className={`text-[12px] font-medium mt-0.5 tracking-wide ${activeTab === tab.id ? 'text-[#C0CAF5]' : 'text-[#565F89]'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Modals & Drawers */}
        <AnimatePresence>
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} onOpenRouting={() => { setShowSettings(false); setShowRouting(true); }} />}
          {showGuides && <ProtocolGuides onClose={() => setShowGuides(false)} />}
          {showRouting && <RoutingRules onClose={() => { setShowRouting(false); setShowSettings(true); }} />}
          {showMixer && <PayloadMixer onClose={() => setShowMixer(false)} onSave={handleSetProfile} />}
          {showConfig && <ConfigManager 
            onClose={() => setShowConfig(false)} 
            activeProfile={profile} 
            profiles={profiles}
            onImport={handleSetProfile} 
            onImportBulk={(newProfiles) => {
              setProfiles(prev => {
                const updated = [...prev];
                for (const np of newProfiles) {
                  if (!updated.some(existing => existing.raw === np.raw)) {
                    updated.push(np);
                  }
                }
                return updated;
              });
              if (!profile && newProfiles.length > 0) {
                setProfile(newProfiles[0]);
              }
            }}
          />}
          {showHostChecker && <HostChecker onClose={() => setShowHostChecker(false)} />}
          {showManualConfig && <ManualConfigMenu onClose={() => setShowManualConfig(false)} onSave={handleSetProfile} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
