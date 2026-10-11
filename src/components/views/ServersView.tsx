import React, { useState } from 'react';
import { Server, Plus, RefreshCw, Check, Shield, Wifi, Globe, Trash2 } from 'lucide-react';
import { ProtocolType, VpnServer } from '../../types/vpn';

interface ServersViewProps {
  servers: VpnServer[];
  selectedServer: VpnServer;
  onSelectServer: (server: VpnServer) => void;
  onAddServer: (newServer: VpnServer) => void;
  onDeleteCustomServer: (id: string) => void;
  onRefreshPings: () => void;
  isPinging: boolean;
}

export const ServersView: React.FC<ServersViewProps> = ({
  servers,
  selectedServer,
  onSelectServer,
  onAddServer,
  onDeleteCustomServer,
  onRefreshPings,
  isPinging,
}) => {
  const [filterRegion, setFilterRegion] = useState<'all' | 'africa' | 'europe' | 'americas'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New server form state
  const [formName, setFormName] = useState('');
  const [formHost, setFormHost] = useState('');
  const [formPort, setFormPort] = useState(443);
  const [formProtocol, setFormProtocol] = useState<ProtocolType>('SSH-TLS');
  const [formSni, setFormSni] = useState('unitelmoney.com');
  const [formUser, setFormUser] = useState('tunnelx');
  const [formPassword, setFormPassword] = useState('');

  const filteredServers = servers.filter((s) => {
    if (filterRegion === 'africa') return ['AO', 'MZ', 'ZA'].includes(s.countryCode);
    if (filterRegion === 'europe') return ['DE', 'PT', 'FR', 'UK'].includes(s.countryCode);
    if (filterRegion === 'americas') return ['BR', 'US'].includes(s.countryCode);
    return true;
  });

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHost.trim()) return;

    const newServer: VpnServer = {
      id: `custom-${Date.now()}`,
      name: formName.trim() || `Custom SSH (${formHost})`,
      country: 'Personalizado',
      countryCode: 'VPS',
      flag: '⚡',
      host: formHost.trim(),
      port: formPort,
      protocol: formProtocol,
      pingMs: 45,
      loadPercent: 10,
      sniHost: formSni.trim() || 'unitelmoney.com',
      username: formUser.trim() || 'root',
      password: formPassword,
      isCustom: true,
    };

    onAddServer(newServer);
    setIsAddModalOpen(false);
    // Reset form
    setFormName('');
    setFormHost('');
  };

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            Servidores de Túnel SSH
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Nós otimizados com suporte a SSH, TLS e BadVPN UDP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshPings}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1913] border border-[#1b3325] text-xs font-mono text-emerald-400 hover:bg-[#14261d] active:scale-95 transition-all cursor-pointer"
            title="Testar ping de todos os servidores"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Testando...' : 'Testar Ping'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-mono font-bold active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Region Filter Tabs */}
      <div className="flex bg-[#0a120e] p-1 rounded-xl border border-[#14261c] gap-1">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'africa', label: 'África 🇦🇴' },
          { id: 'europe', label: 'Europa 🇪🇺' },
          { id: 'americas', label: 'Américas 🌎' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterRegion(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
              filterRegion === tab.id
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Servers List */}
      <div className="space-y-2.5">
        {filteredServers.map((server) => {
          const isSelected = selectedServer.id === server.id;
          return (
            <div
              key={server.id}
              onClick={() => onSelectServer(server)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-[#0a100d] border-[#14261c] hover:border-[#1e3b2b] hover:bg-[#0e1713]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none">{server.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-100">{server.name}</span>
                    {server.isCustom && (
                      <span className="text-[9px] font-mono uppercase bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">
                        VPS
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#58876c] mt-0.5">
                    <span>{server.host}:{server.port}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">{server.protocol}</span>
                    <span>•</span>
                    <span className="text-slate-400 truncate max-w-[110px]">SNI: {server.sniHost}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Latency & Load Indicator */}
                <div className="flex flex-col items-end text-right font-mono text-xs">
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      server.pingMs < 80
                        ? 'text-emerald-400'
                        : server.pingMs < 150
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    <Wifi className="w-3 h-3" />
                    {server.pingMs} ms
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Carga: <strong className="text-slate-300">{server.loadPercent}%</strong>
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : server.isCustom ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomServer(server.id);
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    title="Excluir servidor personalizado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Server Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0b1310] border border-emerald-600/40 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-[#14261c] flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Adicionar Servidor SSH Próprio (VPS)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="p-5 space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nome do Servidor:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ex: Minha VPS Angola Luanda"
                  className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Host / IP VPS:</label>
                  <input
                    type="text"
                    required
                    value={formHost}
                    onChange={(e) => setFormHost(e.target.value)}
                    placeholder="144.91.72.243 ou seu-dominio.com"
                    className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Porta:</label>
                  <input
                    type="number"
                    value={formPort}
                    onChange={(e) => setFormPort(parseInt(e.target.value) || 443)}
                    className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Protocolo:</label>
                <select
                  value={formProtocol}
                  onChange={(e) => setFormProtocol(e.target.value as ProtocolType)}
                  className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                >
                  <option value="SSH-TLS">SSH-TLS (Porta 443 Stunnel)</option>
                  <option value="SSH-DIRECT">SSH Direct (Porta 22)</option>
                  <option value="SSH-WS-TLS">SSH-WS-TLS (WebSocket 443)</option>
                  <option value="SSL-STUNNEL">SSL-STUNNEL (Direto)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Bug Host / SNI Spoofing:</label>
                <input
                  type="text"
                  value={formSni}
                  onChange={(e) => setFormSni(e.target.value)}
                  placeholder="unitelmoney.com"
                  className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Usuário SSH:</label>
                  <input
                    type="text"
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                    placeholder="tunnelx ou root"
                    className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Senha SSH:</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Senha do usuário"
                    className="w-full bg-[#070c09] border border-[#1b3325] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[#13241b] text-slate-300 hover:bg-[#1a3024]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold"
                >
                  Salvar Servidor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
