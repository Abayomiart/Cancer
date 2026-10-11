import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface DataTransferCardsProps {
  bytesDownloaded: number;
  bytesUploaded: number;
  modeLabel?: string;
  isInjecting?: boolean;
}

export const DataTransferCards: React.FC<DataTransferCardsProps> = ({
  bytesDownloaded,
  bytesUploaded,
  modeLabel = 'INJECT',
  isInjecting = false,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} B`;
  };

  return (
    <div className="w-full bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 flex items-center justify-between shadow-sm">
      {/* Download Column */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <ArrowDown className="w-4 h-4 text-emerald-400 mb-1" />
        <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100 tabular-nums tracking-tight">
          {formatBytes(bytesDownloaded)}
        </span>
        <span className="text-[10px] font-mono tracking-wider text-[#608b73] font-semibold mt-0.5 uppercase">
          DOWNLOADED
        </span>
      </div>

      {/* Middle INJECT Divider & Indicator */}
      <div className="px-4 py-1 border-x border-[#14261c] flex flex-col items-center justify-center">
        <span
          className={`text-sm sm:text-base font-extrabold font-mono tracking-widest ${
            isInjecting ? 'text-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'text-[#507d65]'
          }`}
        >
          {modeLabel}
        </span>
      </div>

      {/* Upload Column */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <ArrowUp className="w-4 h-4 text-cyan-400 mb-1" />
        <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100 tabular-nums tracking-tight">
          {formatBytes(bytesUploaded)}
        </span>
        <span className="text-[10px] font-mono tracking-wider text-[#608b73] font-semibold mt-0.5 uppercase">
          UPLOADED
        </span>
      </div>
    </div>
  );
};
