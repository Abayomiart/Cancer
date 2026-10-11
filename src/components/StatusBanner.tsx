import React from 'react';
import { Wrench, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { ConnectionStatus } from '../types/vpn';

interface StatusBannerProps {
  status: ConnectionStatus;
  uptimeSeconds: number;
  pingMs: number;
  onToggleLogs: () => void;
  showLogs: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  uptimeSeconds,
  pingMs,
  onToggleLogs,
  showLogs,
}) => {
  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'CONNECTED':
        return 'CONECTADO';
      case 'CONNECTING':
        return 'CONECTANDO...';
      case 'INJECTING':
        return 'INJETANDO SNI...';
      case 'HANDSHAKING':
        return 'HANDSHAKE TLS...';
      case 'AUTHENTICATING':
        return 'AUTENTICANDO SSH...';
      case 'DISCONNECTING':
        return 'DESCONECTANDO...';
      case 'ERROR':
        return 'FALHA NA CONEXÃO';
      default:
        return 'NOT CONNECTED';
    }
  };

  const isConnected = status === 'CONNECTED';
  const isBusy = ['CONNECTING', 'INJECTING', 'HANDSHAKING', 'AUTHENTICATING', 'DISCONNECTING'].includes(status);

  return (
    <div
      onClick={onToggleLogs}
      role="button"
      tabIndex={0}
      title="Clique para alternar o terminal de logs em tempo real"
      className={`relative w-full bg-[#0a100d] border ${
        isConnected
          ? 'border-emerald-600/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : status === 'ERROR'
          ? 'border-rose-900/60'
          : 'border-[#14261c]'
      } rounded-2xl py-3 px-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all select-none`}
    >
      {/* Left Icon Badge matching screenshot: Purple wrench circular button */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#6d5dfc] flex items-center justify-center shadow-md shadow-[#6d5dfc]/30 text-white shrink-0">
          <Wrench className="w-4 h-4" />
        </div>

        {/* Center / Left status text */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono font-extrabold tracking-wider text-sm sm:text-base ${
                isConnected
                  ? 'text-emerald-400'
                  : isBusy
                  ? 'text-amber-400'
                  : status === 'ERROR'
                  ? 'text-rose-400'
                  : 'text-[#527d65]'
              }`}
            >
              {getStatusText()}
            </span>
            {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
            {isConnected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
            {status === 'ERROR' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          </div>

          {isConnected && (
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#68947b] mt-0.5">
              <span>Uptime: <strong className="text-slate-200">{formatUptime(uptimeSeconds)}</strong></span>
              <span>·</span>
              <span>Ping: <strong className="text-emerald-400">{pingMs}ms</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Log viewer indicator */}
      <div className="text-[11px] font-mono text-[#527d65] hover:text-emerald-400 flex items-center gap-1">
        <span>{showLogs ? 'Ocultar Log' : 'Ver Log'}</span>
        <span className="text-xs">▾</span>
      </div>
    </div>
  );
};
