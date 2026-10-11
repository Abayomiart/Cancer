import React, { useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Check } from 'lucide-react';
import { LogEntry } from '../types/vpn';

interface TerminalLogsProps {
  logs: LogEntry[];
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  logs,
  onClear,
  isOpen,
  onClose,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const handleCopy = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full bg-[#050a07] border border-[#14261c] rounded-2xl overflow-hidden shadow-2xl flex flex-col font-mono my-2">
      {/* Terminal Title Bar */}
      <div className="bg-[#0b140f] px-3.5 py-2.5 border-b border-[#14261c] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-emerald-400 tracking-wider">CONSOLE DE CONEXÃO & INJETOR</span>
          <span className="text-[10px] text-slate-400">({logs.length} eventos)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-[#111f18] transition-colors cursor-pointer"
            title="Copiar log completo"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2 py-0.5 rounded bg-[#111f18] transition-colors cursor-pointer"
            title="Limpar console"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpar</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-[#1a2d23]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Content Area */}
      <div
        ref={scrollRef}
        className="p-3 text-[11px] sm:text-xs leading-relaxed max-h-56 overflow-y-auto space-y-1 bg-[#050907] select-text"
      >
        {logs.length === 0 ? (
          <div className="text-slate-500 italic">Aguardando início do túnel SSH-TLS...</div>
        ) : (
          logs.map((log) => {
            let color = 'text-slate-300';
            if (log.level === 'success') color = 'text-emerald-400 font-semibold';
            if (log.level === 'warn') color = 'text-amber-400';
            if (log.level === 'error') color = 'text-rose-400 font-semibold';
            if (log.level === 'inject') color = 'text-cyan-300 font-bold';
            if (log.level === 'net') color = 'text-emerald-300';

            return (
              <div key={log.id} className="flex items-start gap-2 break-all">
                <span className="text-slate-400 tabular-nums select-none shrink-0">
                  {log.timestamp}
                </span>
                <span className={`shrink-0 text-[10px] uppercase font-bold px-1 rounded ${
                  log.level === 'success' ? 'bg-emerald-950 text-emerald-400' :
                  log.level === 'error' ? 'bg-rose-950 text-rose-400' :
                  log.level === 'inject' ? 'bg-cyan-950 text-cyan-400' :
                  log.level === 'warn' ? 'bg-amber-950 text-amber-400' :
                  'bg-[#0d1c14] text-[#55866b]'
                }`}>
                  {log.level}
                </span>
                <span className={`${color}`}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
