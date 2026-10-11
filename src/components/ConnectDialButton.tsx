import React from 'react';
import { Power, Loader2, ShieldCheck, Wifi } from 'lucide-react';
import { ConnectionStatus } from '../types/vpn';

interface ConnectDialButtonProps {
  status: ConnectionStatus;
  onToggleConnect: () => void;
  pingMs: number;
}

export const ConnectDialButton: React.FC<ConnectDialButtonProps> = ({
  status,
  onToggleConnect,
  pingMs,
}) => {
  const isConnected = status === 'CONNECTED';
  const isBusy = ['CONNECTING', 'INJECTING', 'HANDSHAKING', 'AUTHENTICATING', 'DISCONNECTING'].includes(status);

  const handleClick = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // Ignore
      }
    }
    onToggleConnect();
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-4 select-none">
      {/* Outer Curved Arc Background Dial matching the screenshot */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* SVG Arc track & dashed speedometer lines */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none transform -rotate-90"
        >
          {/* Background track arc */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#122419"
            strokeWidth="8"
            strokeDasharray="360 160"
            strokeLinecap="round"
          />

          {/* Dashed outer accent arc */}
          <circle
            cx="100"
            cy="100"
            r="93"
            fill="none"
            stroke={isConnected ? '#10b981' : '#173623'}
            strokeWidth="3.5"
            strokeDasharray="6 8"
            strokeLinecap="round"
            className={isConnected ? 'animate-pulse' : ''}
          />

          {/* Active Glowing Progress Arc */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke={isConnected ? '#10b981' : isBusy ? '#f59e0b' : '#059669'}
            strokeWidth="8"
            strokeDasharray="360 160"
            strokeDashoffset={isConnected ? '0' : isBusy ? '180' : '360'}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: isConnected ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.9))' : 'none',
            }}
          />
        </svg>

        {/* Central Glowing Circular Connect Button */}
        <button
          onClick={handleClick}
          type="button"
          aria-label={isConnected ? 'Desconectar VPN' : 'Conectar VPN'}
          className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 shadow-2xl ${
            isConnected
              ? 'bg-gradient-to-b from-[#0f2d1e] to-[#081810] border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
              : isBusy
              ? 'bg-gradient-to-b from-[#2b220d] to-[#120e06] border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-b from-[#0f1d16] to-[#070d0a] border-2 border-[#193d29] hover:border-emerald-600/60 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Inner ring */}
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all ${
              isConnected
                ? 'bg-emerald-950/70 border border-emerald-500/50'
                : isBusy
                ? 'bg-amber-950/60 border border-amber-500/40'
                : 'bg-[#0a130f] border border-[#14281c]'
            }`}
          >
            {isBusy ? (
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-spin" />
            ) : isConnected ? (
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            ) : (
              <Power className="w-10 h-10 sm:w-12 sm:h-12 text-[#467057] hover:text-emerald-400 transition-colors" />
            )}

            <span
              className={`font-mono text-[11px] sm:text-xs font-bold tracking-widest mt-1.5 uppercase ${
                isConnected
                  ? 'text-emerald-300'
                  : isBusy
                  ? 'text-amber-300'
                  : 'text-[#4e7d61]'
              }`}
            >
              {isConnected ? 'PARAR' : isBusy ? 'CONECTANDO' : 'INICIAR'}
            </span>
          </div>
        </button>
      </div>

      {/* Latency & Protocol Telemetry under button */}
      <div className="flex items-center gap-3 text-xs font-mono text-[#5f8f74] mt-1">
        <span className="flex items-center gap-1">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-[#426451]'}`} />
          {isConnected ? `Ping: ${pingMs} ms` : 'Túnel Pronto'}
        </span>
        <span>•</span>
        <span>Modo: SSH-TLS + VpnService</span>
      </div>
    </div>
  );
};
