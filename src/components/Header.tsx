import React from 'react';
import { Globe, Smartphone, ShieldCheck } from 'lucide-react';
import { PublicIpInfo } from '../types/vpn';

interface HeaderProps {
  publicIp: PublicIpInfo | null;
  onOpenAndroidModal: () => void;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ publicIp, onOpenAndroidModal, isConnected }) => {
  return (
    <header className="w-full bg-[#070d09] border-b border-[#12241a] px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <div className={`w-8 h-8 rounded-full border border-emerald-500/60 flex items-center justify-center bg-emerald-950/40 ${isConnected ? 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}`}>
            <div className={`w-4 h-4 rounded-full bg-emerald-400 ${isConnected ? 'animate-pulse bg-emerald-300' : 'opacity-80'}`} />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-extrabold tracking-tight text-lg leading-none font-mono">
              TunnelX VPN
            </span>
          </div>
          <div className="text-[10px] tracking-widest text-emerald-600 font-mono uppercase mt-0.5 font-medium">
            SSH · TLS · TUNNEL
          </div>
        </div>
      </div>

      {/* Right Zone: IP Badge & Android VpnService Trigger */}
      <div className="flex items-center gap-2">
        {/* Real IP Badge */}
        <div className="flex items-center gap-1.5 bg-[#0d1712] border border-[#1b3325] px-2.5 py-1 rounded-full text-xs font-mono text-emerald-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="tabular-nums tracking-tight text-[11px] font-semibold">
            {publicIp?.clientIp || '144.91.72.243'}
          </span>
        </div>

        {/* Android Native VpnService Button */}
        <button
          onClick={onOpenAndroidModal}
          title="Ver Código Android VpnService & Gerar APK"
          className="flex items-center gap-1 bg-emerald-950/50 hover:bg-emerald-900/60 active:scale-95 text-emerald-400 border border-emerald-700/50 px-2 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">VpnService</span>
        </button>
      </div>
    </header>
  );
};
