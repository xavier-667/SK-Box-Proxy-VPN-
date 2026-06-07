import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileDown, FileUp, X, Copy, CheckCircle2, QrCode, Cloud, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ParsedProfile, parseProxyUrl } from '../utils/parser';

interface ConfigManagerProps {
  onClose: () => void;
  activeProfile: ParsedProfile | null;
  profiles?: ParsedProfile[];
  onImport: (profile: ParsedProfile) => void;
  onImportBulk?: (profiles: ParsedProfile[]) => void;
}

export function ConfigManager({ onClose, activeProfile, profiles = [], onImport, onImportBulk }: ConfigManagerProps) {
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [cloudCode, setCloudCode] = useState<string | null>(null);

  const handleExport = () => {
    if (!activeProfile) return;
    const dataToExport = JSON.stringify(activeProfile, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(dataToExport).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error("Clipboard export failed:", err);
        setImportStatus('Copy failed (preview restricted)');
        setTimeout(() => setImportStatus(null), 2000);
      });
    } else {
      setImportStatus('Clipboard not available');
      setTimeout(() => setImportStatus(null), 2000);
    }
  };

  const downloadFile = () => {
    if (!activeProfile) return;
    const blob = new Blob([JSON.stringify(activeProfile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skbox_${activeProfile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCloud = () => {
    // Simulating a cloud export
    setCloudCode(null);
    setTimeout(() => {
      const code = 'SK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setCloudCode(code);
    }, 800);
  };

  const handleImport = () => {
    if (!importData.trim()) return;

    // Check if it's a simulated Cloud code
    if (importData.startsWith('SK-')) {
      setImportStatus('Fetching from cloud...');
      setTimeout(() => {
        setImportStatus('Cloud import not available in preview.');
      }, 1500);
      return;
    }

    try {
      // First try to parse as JSON
      const parsed = JSON.parse(importData);
      
      if (Array.isArray(parsed)) {
        // Bulk import JSON array
        const validProfiles = parsed.filter(p => p && p.address && p.port && p.protocol);
        if (validProfiles.length > 0) {
          if (onImportBulk) {
            onImportBulk(validProfiles as ParsedProfile[]);
          } else {
            onImport(validProfiles[0] as ParsedProfile);
          }
          setImportStatus(`Success! Imported ${validProfiles.length} profiles.`);
          setTimeout(() => onClose(), 1000);
        } else {
          setImportStatus('Invalid Config Format in JSON list');
        }
        return;
      } else if (parsed && parsed.address && parsed.port && parsed.protocol) {
        // Single JSON import
        onImport(parsed as ParsedProfile);
        setImportStatus('Success!');
        setTimeout(() => onClose(), 1000);
        return;
      }
    } catch (e) {
      // Not JSON, fall through to text bulk import
    }

    // Try bulk importing from text/URLs per line
    const lines = importData.split('\n').map(line => line.trim()).filter(line => line);
    const parsedProfiles: ParsedProfile[] = [];
    
    for (const line of lines) {
      const parsed = parseProxyUrl(line);
      if (parsed) {
        parsedProfiles.push(parsed);
      }
    }

    if (parsedProfiles.length > 0) {
      if (onImportBulk && parsedProfiles.length > 1) {
        onImportBulk(parsedProfiles);
        setImportStatus(`Success! Imported ${parsedProfiles.length} profiles.`);
      } else {
        onImport(parsedProfiles[0]);
        setImportStatus('Success!');
      }
      setTimeout(() => onClose(), 1000);
    } else {
      setImportStatus('No valid v2ray/sing-box URLs found');
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
            <Share2 className="w-5 h-5 text-[#7DCFFF]" />
            <h2 className="text-lg font-bold text-[#C0CAF5]">Config Share</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#565F89] hover:text-[#C0CAF5] transition-colors bg-[#24283B]/50 hover:bg-[#24283B] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8 space-y-6">
          
          {/* Export Section */}
          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#565F89] flex items-center gap-2">
                <FileUp className="w-4 h-4" /> Export Active Config
              </h3>
              {activeProfile && (
                <button
                  onClick={() => setShowQr(!showQr)}
                  className={`p-1.5 rounded-lg transition-colors border ${showQr ? 'bg-[#7DCFFF]/20 border-[#7DCFFF]/50 text-[#7DCFFF]' : 'bg-[#1A1B26] border-[#24283B] text-[#565F89] hover:text-[#C0CAF5]'}`}
                >
                  <QrCode className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {activeProfile || profiles.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {showQr && activeProfile && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="bg-white p-4 rounded-xl flex justify-center w-max mx-auto border-4 border-[#24283B]">
                        <QRCodeSVG value={JSON.stringify(activeProfile)} size={160} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {activeProfile && (
                  <div className="bg-[#24283B] border border-[#3D59A1]/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-[#C0CAF5]">{activeProfile.name}</p>
                    <p className="text-xs text-[#9AA5CE] mt-1">{activeProfile.protocol} • {activeProfile.address}:{activeProfile.port}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {activeProfile && (
                    <>
                      <button 
                        onClick={handleExport}
                        className="bg-[#24283B] hover:bg-[#2A2E44] text-[#C0CAF5] font-medium py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-[#9ECE6A]" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy JSON'}
                      </button>
                      <button 
                        onClick={downloadFile}
                        className="bg-[#24283B] hover:bg-[#2A2E44] text-[#C0CAF5] font-medium py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <FileDown className="w-4 h-4" /> Save Active
                      </button>
                    </>
                  )}
                  
                  {profiles.length > 0 && (
                    <button 
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `skbox_profiles_${new Date().toISOString().slice(0, 10)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="col-span-2 bg-[#9ECE6A]/10 hover:bg-[#9ECE6A]/20 text-[#9ECE6A] border border-[#9ECE6A]/30 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-4 h-4" /> Export All Saved Profiles ({profiles.length})
                    </button>
                  )}
                  
                  <button 
                    onClick={exportToCloud}
                    className="col-span-2 bg-[#7AA2F7]/10 hover:bg-[#7AA2F7]/20 text-[#7AA2F7] border border-[#7AA2F7]/30 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Cloud className="w-4 h-4" /> Export to Cloud
                  </button>
                </div>
                
                {cloudCode && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#7AA2F7]/20 border border-[#7AA2F7]/50 rounded-lg p-3 text-center mt-2"
                  >
                    <p className="text-xs text-[#9AA5CE] mb-1">Share this code with friends:</p>
                    <p className="text-xl font-mono font-bold text-[#C0CAF5] tracking-widest">{cloudCode}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#565F89] text-center py-4">No active profile to export.</p>
            )}
          </div>

          {/* Import Section */}
          <div className="bg-[#1A1B26]/50 border border-[#24283B] rounded-xl p-4 flex-1 flex flex-col min-h-[200px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#565F89] mb-3 flex items-center gap-2">
              <FileDown className="w-4 h-4" /> Import Config
            </h3>
            
            <textarea 
              value={importData}
              onChange={e => setImportData(e.target.value)}
              placeholder="Paste JSON config or Cloud Code (e.g. SK-XXXX) here..."
              className="w-full flex-1 bg-[#1A1B26] border border-[#24283B] rounded-lg px-3 py-2 text-xs text-[#9AA5CE] font-mono outline-none focus:border-[#7AA2F7]/50 transition-colors mb-3 resize-none min-h-[100px]"
            />
            
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${importStatus === 'Success!' ? 'text-[#9ECE6A]' : importStatus === 'Fetching from cloud...' ? 'text-[#7AA2F7]' : 'text-[#F7768E]'}`}>
                {importStatus}
              </span>
              <button 
                onClick={handleImport}
                disabled={!importData.trim()}
                className="bg-[#7DCFFF] hover:bg-[#7dcfffd0] text-[#1A1B26] disabled:opacity-50 font-bold px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Import
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}
