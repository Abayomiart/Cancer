import React, { useState } from 'react';
import { Settings, Download, Upload, Shield, Check, Lock, FileText, Cpu, Bell, Smartphone } from 'lucide-react';
import { ExportedConfig, VpnServer, VpnSettings } from '../../types/vpn';

interface ConfigViewProps {
  currentServer: VpnServer;
  currentSni: string;
  settings: VpnSettings;
  onUpdateSettings: (newSettings: Partial<VpnSettings>) => void;
  onImportConfig: (config: ExportedConfig) => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  currentServer,
  currentSni,
  settings,
  onUpdateSettings,
  onImportConfig,
}) => {
  const [configNote, setConfigNote] = useState('TunnelX VPN - Configuração Oficial Angola Unitel');
  const [isLocked, setIsLocked] = useState(false);
  const [configPassword, setConfigPassword] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportConfig = () => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);

    const configData: ExportedConfig = {
      version: '2.4.0',
      server: currentServer,
      sniHost: currentSni,
      payload: settings.customPayload,
      settings: {
        dnsPrimary: settings.dnsPrimary,
        dnsSecondary: settings.dnsSecondary,
        enableUdpBadvpn: settings.enableUdpBadvpn,
        badvpnPort: settings.badvpnPort,
        mtu: settings.mtu,
        autoReconnect: settings.autoReconnect,
        wakeLock: settings.wakeLock,
      },
      note: configNote,
      isLocked,
      expiryDate: expiry.toISOString(),
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TunnelX_${currentServer.countryCode}_${currentSni.replace(/[^a-zA-Z0-9]/g, '_')}.tnlx`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: ExportedConfig = JSON.parse(text);
        if (parsed.server && parsed.sniHost) {
          onImportConfig(parsed);
          alert('Configuração importada com sucesso!');
        } else {
          alert('Arquivo de configuração inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo .tnlx.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full space-y-4 pb-24 font-mono text-xs">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Configurações & Exportador .TNLX
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Gerencie arquivos de configuração, servidores DNS, BadVPN e parâmetros da VpnService
        </p>
      </div>

      {/* Export / Import Card */}
      <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Exportar Arquivo de Configuração (.tnlx)
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Formato Compatível
          </span>
        </div>

        <p className="text-slate-400">
          Exporte esta configuração para compartilhar com outros usuários do TunnelX VPN ou importar no aplicativo Android.
        </p>

        <div>
          <label className="block text-slate-300 mb-1">Mensagem / Nota de Rodapé:</label>
          <input
            type="text"
            value={configNote}
            onChange={(e) => setConfigNote(e.target.value)}
            placeholder="Mensagem para os usuários da config"
            className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 mb-1">Validade (Dias):</label>
            <input
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-slate-100"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="rounded text-emerald-500"
              />
              <span className="truncate">Bloquear Payload / HWID</span>
            </label>
          </div>
        </div>

        <div className="pt-1 flex gap-2">
          <button
            onClick={handleExportConfig}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {exportSuccess ? <Check className="w-4 h-4 text-black" /> : <Download className="w-4 h-4 text-black" />}
            <span>{exportSuccess ? 'Arquivo Baixado!' : 'Exportar Arquivo (.tnlx)'}</span>
          </button>

          <label className="py-2.5 px-4 rounded-xl bg-[#0e1913] hover:bg-[#14261d] border border-[#1b3325] text-emerald-400 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Importar</span>
            <input
              type="file"
              accept=".tnlx,.json,.txt"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* DNS Changer Card */}
      <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Servidores DNS & Proteção Anti-Bloqueio
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { name: 'Cloudflare', p: '1.1.1.1', s: '1.0.0.1' },
            { name: 'Google', p: '8.8.8.8', s: '8.8.4.4' },
            { name: 'AdGuard (Bloqueia Anúncios)', p: '94.140.14.14', s: '94.140.15.15' },
            { name: 'Quad9', p: '9.9.9.9', s: '149.112.112.112' },
          ].map((dns) => {
            const isSelected = settings.dnsPrimary === dns.p;
            return (
              <button
                key={dns.name}
                onClick={() => onUpdateSettings({ dnsPrimary: dns.p, dnsSecondary: dns.s })}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-[#070c09] border-[#183023] text-slate-300 hover:border-emerald-700/50'
                }`}
              >
                <div className="font-bold truncate text-[11px]">{dns.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{dns.p}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced VpnService Parameters */}
      <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Parâmetros do VpnService Android & BadVPN
        </h3>

        <div className="space-y-2.5">
          <label className="flex items-center justify-between p-2.5 bg-[#070c09] border border-[#183023] rounded-xl cursor-pointer">
            <div>
              <div className="font-bold text-slate-200">BadVPN UDPGW Forwarding</div>
              <div className="text-[10px] text-slate-400">
                Permite chamadas de voz WhatsApp, Telegram, Discord e pacotes UDP de jogos
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableUdpBadvpn}
              onChange={(e) => onUpdateSettings({ enableUdpBadvpn: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-[#070c09] border border-[#183023] rounded-xl cursor-pointer">
            <div>
              <div className="font-bold text-slate-200">Auto-Reconexão Inteligente</div>
              <div className="text-[10px] text-slate-400">
                Reconecta o túnel SSH imediatamente se a operadora trocar o IP da torre
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoReconnect}
              onChange={(e) => onUpdateSettings({ autoReconnect: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-[#070c09] border border-[#183023] rounded-xl cursor-pointer">
            <div>
              <div className="font-bold text-slate-200">WakeLock (Prevenir Sono do Android)</div>
              <div className="text-[10px] text-slate-400">
                Impede que a economia de bateria do Android feche a conexão em segundo plano
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.wakeLock}
              onChange={(e) => onUpdateSettings({ wakeLock: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-slate-400 mb-1">MTU Interface TUN:</label>
              <input
                type="number"
                value={settings.mtu}
                onChange={(e) => onUpdateSettings({ mtu: parseInt(e.target.value) || 1500 })}
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-1.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Porta BadVPN UDP:</label>
              <input
                type="number"
                value={settings.badvpnPort}
                onChange={(e) => onUpdateSettings({ badvpnPort: parseInt(e.target.value) || 7300 })}
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-1.5 text-slate-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
