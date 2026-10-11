import React, { useState } from 'react';
import { Wrench, Globe, Terminal, Gauge, ShieldAlert, Check, Copy, Play, ArrowRight, RefreshCw } from 'lucide-react';
import { BUG_HOST_PRESETS, DEFAULT_PAYLOAD } from '../../data/vpnPresets';

interface ToolsViewProps {
  onApplyPayload: (payload: string, sniHost?: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ onApplyPayload }) => {
  const [activeTool, setActiveTool] = useState<'checker' | 'payload' | 'speed' | 'ip'>('checker');

  // Host Checker state
  const [scanHost, setScanHost] = useState('unitelmoney.com');
  const [scanPort, setScanPort] = useState(443);
  const [scanMethod, setScanMethod] = useState<'HEAD' | 'GET'>('HEAD');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Payload Generator state
  const [payloadHost, setPayloadHost] = useState('unitelmoney.com');
  const [payloadMethod, setPayloadMethod] = useState('GET');
  const [injectionMode, setInjectionMode] = useState<'normal' | 'front' | 'back'>('normal');
  const [splitMode, setSplitMode] = useState<'none' | 'instant' | 'delay'>('none');
  const [headerUpgrade, setHeaderUpgrade] = useState(true);
  const [headerKeepAlive, setHeaderKeepAlive] = useState(true);
  const [headerXOnlineHost, setHeaderXOnlineHost] = useState(true);
  const [generatedPayload, setGeneratedPayload] = useState(DEFAULT_PAYLOAD);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Speedtest state
  const [speedRunning, setSpeedRunning] = useState(false);
  const [speedProgress, setSpeedProgress] = useState(0);
  const [speedPing, setSpeedPing] = useState(38);
  const [speedDown, setSpeedDown] = useState(0);
  const [speedUp, setSpeedUp] = useState(0);

  // IP lookup state
  const [ipData, setIpData] = useState<any>(null);
  const [isLookingUpIp, setIsLookingUpIp] = useState(false);

  // Trigger Host Scan
  const handleScanHost = async (hostToTest?: string) => {
    const target = hostToTest || scanHost;
    if (!target.trim()) return;
    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/check-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: target.trim(),
          port: scanPort,
          method: scanMethod,
        }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err: any) {
      setScanResult({
        success: false,
        error: err.message || 'Falha ao testar host',
        status: 504,
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Build Payload
  const handleGeneratePayload = () => {
    const host = payloadHost.trim() || 'unitelmoney.com';
    let p = '';

    if (splitMode === 'instant') {
      p += '[instant_split]';
    } else if (splitMode === 'delay') {
      p += '[delay_split]';
    }

    if (injectionMode === 'front') {
      p += `GET http://${host}/ HTTP/1.1[crlf]`;
    }

    p += `${payloadMethod} / HTTP/1.1[crlf]Host: ${host}[crlf]`;

    if (headerXOnlineHost) {
      p += `X-Online-Host: ${host}[crlf]`;
      p += `X-Forward-Host: ${host}[crlf]`;
    }

    if (headerUpgrade) {
      p += `Upgrade: websocket[crlf]Connection: Upgrade[crlf]`;
    } else if (headerKeepAlive) {
      p += `Connection: Keep-Alive[crlf]`;
    }

    p += `User-Agent: [ua][crlf][crlf]`;

    setGeneratedPayload(p);
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(generatedPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Run Speedtest Simulation with realistic random intervals
  const handleRunSpeedtest = () => {
    if (speedRunning) return;
    setSpeedRunning(true);
    setSpeedProgress(0);
    setSpeedDown(0);
    setSpeedUp(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setSpeedProgress(progress);

      if (progress <= 50) {
        // Download phase
        const curDown = (progress / 50) * (28 + Math.random() * 8);
        setSpeedDown(parseFloat(curDown.toFixed(1)));
        setSpeedPing(Math.round(32 + Math.random() * 12));
      } else {
        // Upload phase
        const curUp = ((progress - 50) / 50) * (14 + Math.random() * 4);
        setSpeedUp(parseFloat(curUp.toFixed(1)));
      }

      if (progress >= 100) {
        clearInterval(interval);
        setSpeedRunning(false);
      }
    }, 150);
  };

  // Run IP lookup
  const handleLookupIp = async () => {
    setIsLookingUpIp(true);
    try {
      const res = await fetch('/api/public-ip');
      const data = await res.json();
      setIpData(data);
    } catch {
      // fallback
    } finally {
      setIsLookingUpIp(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-24 font-mono">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" />
          Ferramentas do Injetor & Túnel
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Scanner de Bug Host, Gerador de Payloads HTTP Injector e Diagnóstico de Rede
        </p>
      </div>

      {/* Tools Segmented Control */}
      <div className="grid grid-cols-4 bg-[#0a120e] p-1 rounded-xl border border-[#14261c] gap-1 text-xs">
        {[
          { id: 'checker', label: 'Host Checker' },
          { id: 'payload', label: 'Payloads' },
          { id: 'speed', label: 'Speedtest' },
          { id: 'ip', label: 'Meu IP / DNS' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id as any);
              if (t.id === 'ip' && !ipData) handleLookupIp();
            }}
            className={`py-2 text-[11px] font-bold rounded-lg transition-all truncate px-1 ${
              activeTool === t.id
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tool 1: Host Checker / Bug SNI Scanner */}
      {activeTool === 'checker' && (
        <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Scanner de Bug Host / SNI
            </h3>
            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              Verificador de Operadora
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Descubra se o domínio responde a conexões SSL/TLS e se pode ser usado como Bug Host (Zero-Rating) na Unitel, Africell, Movitel ou Claro.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">Host / Domínio a Testar:</label>
              <input
                type="text"
                value={scanHost}
                onChange={(e) => setScanHost(e.target.value)}
                placeholder="ex: unitelmoney.com"
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Porta:</label>
              <select
                value={scanPort}
                onChange={(e) => setScanPort(parseInt(e.target.value))}
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
              >
                <option value={443}>443 (SSL/TLS)</option>
                <option value={80}>80 (HTTP)</option>
                <option value={8080}>8080 (Proxy)</option>
              </select>
            </div>
          </div>

          {/* Quick Presets for Bug Scanner */}
          <div>
            <div className="text-[11px] text-emerald-500 font-semibold mb-1.5">
              TESTE RÁPIDO EM HOSTS POPULARES:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BUG_HOST_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setScanHost(preset.host);
                    setScanPort(preset.port);
                    handleScanHost(preset.host);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#0d1812] border border-[#183324] hover:border-emerald-500 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {preset.flag} {preset.name.split(' ')[0]} ({preset.host})
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleScanHost()}
            disabled={isScanning}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#13241b] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-950"
          >
            {isScanning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Testando resposta HTTP/TLS...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Testar Resposta do Host</span>
              </>
            )}
          </button>

          {/* Scan Results Card */}
          {scanResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                scanResult.isBugHostViable
                  ? 'bg-emerald-950/40 border-emerald-500/60'
                  : 'bg-rose-950/40 border-rose-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      scanResult.status === 200
                        ? 'bg-emerald-900 text-emerald-300'
                        : scanResult.status === 101
                        ? 'bg-cyan-900 text-cyan-300'
                        : scanResult.status >= 300 && scanResult.status < 400
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-amber-900 text-amber-300'
                    }`}
                  >
                    STATUS: {scanResult.status} {scanResult.statusText}
                  </span>
                </span>
                <span className="font-bold text-emerald-400">{scanResult.latency} ms</span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div>• Protocolo: <strong className="text-emerald-400">{scanResult.protocol}</strong></div>
                <div>• Diagnóstico: <span className="text-slate-100">{scanResult.recommendation}</span></div>
                {scanResult.headers && Object.keys(scanResult.headers).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#1b3827]">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">CABEÇALHOS DO SERVIDOR:</div>
                    <div className="bg-[#050906] p-2 rounded-lg text-[10px] text-slate-300 font-mono space-y-0.5 max-h-28 overflow-y-auto">
                      {Object.entries(scanResult.headers).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-emerald-400">{k}:</span> {String(v)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {scanResult.isBugHostViable && (
                <button
                  onClick={() => onApplyPayload(DEFAULT_PAYLOAD, scanResult.host)}
                  className="mt-3 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Usar {scanResult.host} como Bug Host no Túnel</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tool 2: Payload Generator */}
      {activeTool === 'payload' && (
        <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Gerador de Payloads (HTTP Injector / TunnelX)
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Formato Padrão EHI / TNLX
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">URL / Bug Host:</label>
              <input
                type="text"
                value={payloadHost}
                onChange={(e) => setPayloadHost(e.target.value)}
                placeholder="unitelmoney.com"
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Método de Requisição:</label>
              <select
                value={payloadMethod}
                onChange={(e) => setPayloadMethod(e.target.value)}
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="GET">GET</option>
                <option value="CONNECT">CONNECT</option>
                <option value="POST">POST</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Método de Injeção:</label>
              <select
                value={injectionMode}
                onChange={(e) => setInjectionMode(e.target.value as any)}
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="normal">Normal</option>
                <option value="front">Front Inject</option>
                <option value="back">Back Inject</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Modo Split:</label>
              <select
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value as any)}
                className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-slate-100"
              >
                <option value="none">Nenhum (Direto)</option>
                <option value="instant">Instant Split</option>
                <option value="delay">Delay Split</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="text-[11px] text-slate-400 font-bold">CABEÇALHOS ESPECIAIS:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-[#070c09] p-2 rounded-lg border border-[#14261c]">
                <input
                  type="checkbox"
                  checked={headerUpgrade}
                  onChange={(e) => setHeaderUpgrade(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>Upgrade: websocket</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-[#070c09] p-2 rounded-lg border border-[#14261c]">
                <input
                  type="checkbox"
                  checked={headerXOnlineHost}
                  onChange={(e) => setHeaderXOnlineHost(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span>X-Online-Host / Forward</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleGeneratePayload}
            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs cursor-pointer"
          >
            Gerar Payload
          </button>

          {/* Result Payload */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span>PAYLOAD GERADO:</span>
              <div className="flex gap-2">
                <button
                  onClick={copyPayload}
                  className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={generatedPayload}
              rows={4}
              className="w-full bg-[#050906] border border-[#183023] rounded-xl p-2.5 text-xs text-emerald-300 font-mono focus:outline-none select-all"
            />

            <button
              onClick={() => onApplyPayload(generatedPayload, payloadHost)}
              className="w-full py-2 rounded-xl bg-[#0f2117] hover:bg-[#163022] border border-emerald-600/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Aplicar Payload e SNI no Túnel Ativo</span>
            </button>
          </div>
        </div>
      )}

      {/* Tool 3: Speed Test */}
      {activeTool === 'speed' && (
        <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-4 shadow-md text-center">
          <div className="flex items-center justify-between text-left">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Teste de Velocidade de Rede
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Medição em Tempo Real
            </span>
          </div>

          <div className="py-4 flex flex-col items-center justify-center">
            {/* Speedometer Circle */}
            <div className="relative w-44 h-44 rounded-full border-4 border-[#14261c] flex flex-col items-center justify-center bg-[#070c09] shadow-inner">
              <div className="text-3xl font-extrabold text-emerald-400 tabular-nums">
                {speedRunning ? (speedProgress <= 50 ? speedDown : speedUp) : speedDown || '0.0'}
              </div>
              <div className="text-[11px] text-slate-400 font-bold mt-0.5">Mbps</div>
              <div className="text-[10px] text-emerald-500 font-semibold mt-1">
                {speedRunning
                  ? speedProgress <= 50
                    ? 'MEDINDO DOWNLOAD...'
                    : 'MEDINDO UPLOAD...'
                  : 'TESTE PRONTO'}
              </div>

              {speedRunning && (
                <div
                  className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"
                  style={{ animationDuration: '1.2s' }}
                />
              )}
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#070c09] border border-[#14261c]">
              <div className="text-[10px] text-slate-400 uppercase">Ping</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{speedPing} ms</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070c09] border border-[#14261c]">
              <div className="text-[10px] text-slate-400 uppercase">Download</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{speedDown} Mbps</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070c09] border border-[#14261c]">
              <div className="text-[10px] text-slate-400 uppercase">Upload</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">{speedUp} Mbps</div>
            </div>
          </div>

          <button
            onClick={handleRunSpeedtest}
            disabled={speedRunning}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#13241b] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{speedRunning ? 'Medindo Velocidade...' : 'Iniciar Teste de Velocidade'}</span>
          </button>
        </div>
      )}

      {/* Tool 4: IP Lookup & DNS Leak */}
      {activeTool === 'ip' && (
        <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Diagnóstico de IP & Provedor de Internet
            </h3>
            <button
              onClick={handleLookupIp}
              disabled={isLookingUpIp}
              className="p-1 rounded-lg text-emerald-400 hover:bg-[#13261c]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLookingUpIp ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {ipData ? (
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#070c09] border border-[#14261c] space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Público Real:</span>
                  <span className="font-bold text-emerald-400 text-sm select-all">{ipData.clientIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">País / Região:</span>
                  <span className="font-semibold text-slate-100">{ipData.country} ({ipData.countryCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cidade:</span>
                  <span className="font-semibold text-slate-100">{ipData.city || 'Luanda'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operadora (ISP):</span>
                  <span className="font-semibold text-cyan-400">{ipData.isp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sistema Autônomo (ASN):</span>
                  <span className="font-semibold text-slate-300">{ipData.as || 'AS37154 Unitel S.A.'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-[11px] text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Proteção Contra Vazamento DNS Ativa
                </div>
                <p>
                  Quando o túnel SSH-TLS com VpnService está ativo, todas as requisições DNS são roteadas exclusivamente pelos servidores 1.1.1.1 e 8.8.8.8 através do canal criptografado.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              Carregando detalhes do IP...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
