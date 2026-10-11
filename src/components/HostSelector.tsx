import React, { useState } from 'react';
import { MapPin, ChevronDown, Repeat, Shield, Check, Globe } from 'lucide-react';
import { BugHostPreset, ProtocolType, VpnServer } from '../types/vpn';
import { BUG_HOST_PRESETS } from '../data/vpnPresets';

interface HostSelectorProps {
  currentServer: VpnServer;
  currentSni: string;
  currentProtocol: ProtocolType;
  currentPort: number;
  onSelectBugHost: (preset: BugHostPreset) => void;
  onCustomSniChange: (sni: string) => void;
  onProtocolChange: (proto: ProtocolType, port: number) => void;
  disabled?: boolean;
}

export const HostSelector: React.FC<HostSelectorProps> = ({
  currentServer,
  currentSni,
  currentProtocol,
  currentPort,
  onSelectBugHost,
  onCustomSniChange,
  onProtocolChange,
  disabled = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customInput, setCustomInput] = useState(currentSni);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'protocol'>('presets');

  const handleApplyCustom = () => {
    if (customInput.trim()) {
      onCustomSniChange(customInput.trim());
      setIsModalOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Main Host Selector Card (Green border matching screenshot) */}
      <button
        onClick={() => !disabled && setIsModalOpen(true)}
        disabled={disabled}
        type="button"
        className={`w-full bg-[#0a100d] border-2 border-emerald-500 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all ${
          disabled ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99] hover:border-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin className="w-4 h-4 fill-emerald-500/30 text-emerald-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-base font-bold font-mono text-slate-100">
              <span>{currentServer.countryCode || 'Ao'}</span>
              <span className="text-sm">{currentServer.flag || '🇦🇴'}</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 tracking-tight flex items-center gap-1 truncate max-w-[220px] sm:max-w-xs">
              <span className="text-xs">🇦🇴</span>
              <span className="truncate">{currentSni || 'unitelmoney.com'}</span>
            </div>
          </div>
        </div>

        <ChevronDown className="w-5 h-5 text-emerald-400 shrink-0" />
      </button>

      {/* Protocol Banner matching screenshot: <-> Protocol: SSH-TLS • Port: 443 */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setActiveTab('protocol');
            setIsModalOpen(true);
          }
        }}
        disabled={disabled}
        className="w-full bg-[#0a100d] border border-[#14261c] hover:border-[#1d3829] rounded-xl py-2 px-3.5 flex items-center justify-center gap-2 text-xs font-mono text-emerald-400/90 transition-colors cursor-pointer"
      >
        <Repeat className="w-3.5 h-3.5 text-cyan-400" />
        <span className="tracking-wide">
          Protocol: <strong className="text-emerald-300 font-bold">{currentProtocol}</strong>
        </span>
        <span className="text-emerald-600 font-bold">•</span>
        <span className="tracking-wide">
          Port: <strong className="text-emerald-300 font-bold">{currentPort}</strong>
        </span>
      </button>

      {/* Host / SNI / Protocol Modal Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b1310] border border-emerald-600/40 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#14261c] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Configurar Payload / SNI Host
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Túnel SSH-TLS com injeção de Bug Host para bypass de dados
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex border-b border-[#14261c] bg-[#070c09] p-1 gap-1">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === 'presets' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bug Hosts Populares
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === 'custom' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SNI Customizado
              </button>
              <button
                onClick={() => setActiveTab('protocol')}
                className={`flex-1 py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
                  activeTab === 'protocol' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Protocolo & Porta
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {activeTab === 'presets' && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-emerald-500 font-semibold mb-2">
                    SELECIONE UM BUG HOST VERIFICADO:
                  </div>
                  {BUG_HOST_PRESETS.map((preset) => {
                    const isSelected = currentSni.toLowerCase() === preset.host.toLowerCase();
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          onSelectBugHost(preset);
                          setIsModalOpen(false);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 shadow-sm'
                            : 'bg-[#0e1713] border-[#14261c] hover:border-emerald-700/50 hover:bg-[#121f19]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{preset.flag}</span>
                          <div>
                            <div className="text-sm font-bold font-mono text-slate-100 flex items-center gap-1.5">
                              <span>{preset.name}</span>
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-[#16291e] text-emerald-300">
                                {preset.carrier}
                              </span>
                            </div>
                            <div className="text-xs font-mono text-emerald-400 mt-0.5">
                              {preset.host}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
                            Port {preset.port}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-mono text-emerald-400 mb-1.5 font-semibold">
                      INFORME O HOST / SNI (DOMÍNIO OU IP):
                    </label>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="ex: unitelmoney.com ou portal.operadora.ao"
                      className="w-full bg-[#080d0a] border border-emerald-700/60 rounded-xl px-4 py-2.5 font-mono text-sm text-slate-100 focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                      Este domínio será injetado no cabeçalho TLS Server Name Indication (SNI) e no HTTP Host Header.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0e1713] border border-[#14261c] text-xs font-mono text-slate-300 space-y-1">
                    <div className="text-emerald-400 font-bold">Dicas de SNI Bug Hosts:</div>
                    <div>• Angola: unitelmoney.com, portal.unitel.ao, internet.africell.ao</div>
                    <div>• Moçambique: movitel.co.mz, vm.co.mz</div>
                    <div>• Brasil: recarga.claro.com.br, meutim.tim.com.br, internet.vivo.com.br</div>
                  </div>

                  <button
                    onClick={handleApplyCustom}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-900/30"
                  >
                    Salvar e Aplicar SNI
                  </button>
                </div>
              )}

              {activeTab === 'protocol' && (
                <div className="space-y-3 py-1">
                  <div className="text-xs font-mono text-emerald-400 font-semibold mb-2">
                    ESCOLHA O PROTOCOLO DE TÚNEL:
                  </div>

                  {[
                    { proto: 'SSH-TLS', port: 443, label: 'SSH via TLS/SSL Stunnel (Recomendado)', desc: 'Encapsula SSH dentro de TLS na porta 443 com SNI Spoofing' },
                    { proto: 'SSH-WS-TLS', port: 443, label: 'SSH via WebSocket + TLS', desc: 'Conexão HTTP Upgrade WebSocket com proxy reverso e Cloudflare' },
                    { proto: 'SSH-DIRECT', port: 22, label: 'SSH Direct', desc: 'Conexão SSH direta sem encapsulamento TLS' },
                    { proto: 'SSL-STUNNEL', port: 443, label: 'SSL Stunnel Puro', desc: 'Túnel TLS direto para proxy SOCKS5' },
                    { proto: 'SSH-PROXY', port: 8080, label: 'SSH via HTTP Proxy / Squid', desc: 'Injeção de Payload HTTP CONNECT via proxy intermediário' },
                  ].map((item) => (
                    <div
                      key={item.proto}
                      onClick={() => {
                        onProtocolChange(item.proto as ProtocolType, item.port);
                        setIsModalOpen(false);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        currentProtocol === item.proto
                          ? 'bg-emerald-950/60 border-emerald-500'
                          : 'bg-[#0e1713] border-[#14261c] hover:border-emerald-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-slate-100">{item.label}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#16291e] text-emerald-300">
                          Port {item.port}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
