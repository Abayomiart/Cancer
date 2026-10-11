import React, { useState } from 'react';
import { Laptop, Terminal, Play, Copy, Check, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

export const VpsManagerView: React.FC = () => {
  // Test probe state
  const [probeHost, setProbeHost] = useState('144.91.72.243');
  const [probePort, setProbePort] = useState(443);
  const [probeSni, setProbeSni] = useState('unitelmoney.com');
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);

  // Script installer config state
  const [scriptSshPort, setScriptSshPort] = useState(22);
  const [scriptSslPort, setScriptSslPort] = useState(443);
  const [scriptUdpPort, setScriptUdpPort] = useState(7300);
  const [scriptPassword, setScriptPassword] = useState('TunnelX2026!');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleRunProbe = async () => {
    if (!probeHost.trim()) return;
    setIsProbing(true);
    setProbeResult(null);

    try {
      const res = await fetch('/api/test-ssh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: probeHost.trim(),
          port: probePort,
          sni: probeSni.trim(),
        }),
      });
      const data = await res.json();
      setProbeResult(data);
    } catch (err: any) {
      setProbeResult({
        success: false,
        error: err.message || 'Falha ao conectar no host',
        latency: 0,
      });
    } finally {
      setIsProbing(false);
    }
  };

  const getFullScript = () => {
    return `#!/bin/bash
# TunnelX VPN - 1-Click SSH + TLS Stunnel4 + BadVPN Installer
# Compatível com Ubuntu 20.04/22.04/24.04 e Debian 11/12
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get install -y openssh-server stunnel4 dropbear cmake git net-tools ufw

# Porta SSH
sed -i 's/#Port 22/Port ${scriptSshPort}/g' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
systemctl restart ssh || systemctl restart sshd

# Certificado SSL com SNI
mkdir -p /etc/stunnel
openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 \\
  -subj "/C=AO/ST=Luanda/L=Luanda/O=TunnelX/CN=unitelmoney.com" \\
  -keyout /etc/stunnel/stunnel.pem -out /etc/stunnel/stunnel.pem

cat << 'EOF' > /etc/stunnel/stunnel.conf
pid = /var/run/stunnel4/stunnel.pid
client = no
[ssh-tls]
accept = ${scriptSslPort}
cert = /etc/stunnel/stunnel.pem
connect = 127.0.0.1:${scriptSshPort}
EOF

sed -i 's/ENABLED=0/ENABLED=1/g' /etc/default/stunnel4
systemctl restart stunnel4

# BadVPN UDPGW na porta ${scriptUdpPort} para chamadas e jogos
cd /tmp && git clone https://github.com/ambrop72/badvpn.git && cd badvpn
mkdir -p build && cd build && cmake .. -DBUILD_NOTHING_BY_DEFAULT=1 -DBUILD_UDPGW=1 && make install
nohup /usr/local/bin/badvpn-udpgw --listen-addr 127.0.0.1:${scriptUdpPort} --max-clients 500 > /dev/null 2>&1 &

# Firewall & Usuário
ufw allow ${scriptSshPort}/tcp && ufw allow ${scriptSslPort}/tcp && ufw allow ${scriptUdpPort}/udp
useradd -m -s /bin/false tunnelx || true
echo "tunnelx:${scriptPassword}" | chpasswd

echo "[✓] TunnelX VPN Instalado! Host: $(curl -s ifconfig.me) Porta TLS: ${scriptSslPort} Porta SSH: ${scriptSshPort}"`;
  };

  const curlCommand = `curl -sSL https://${typeof window !== 'undefined' ? window.location.host : 'tunnelx.app'}/api/vps-install-script | bash`;

  const copyScriptText = () => {
    navigator.clipboard.writeText(getFullScript());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyCurlText = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="w-full space-y-5 pb-24 font-mono">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <Laptop className="w-5 h-5 text-emerald-400" />
          Gerenciador & Instalador VPS
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure seu próprio servidor Linux ou teste a conectividade de portas SSH e TLS em tempo real.
        </p>
      </div>

      {/* Real Handshake & Port Probe Card */}
      <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Teste de Porta & Handshake SSH/TLS</h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Probe em Tempo Real
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 mb-1">Host VPS / IP:</label>
            <input
              type="text"
              value={probeHost}
              onChange={(e) => setProbeHost(e.target.value)}
              placeholder="144.91.72.243 ou seu-servidor.com"
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Porta:</label>
            <select
              value={probePort}
              onChange={(e) => setProbePort(parseInt(e.target.value))}
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
            >
              <option value={443}>443 (TLS / Stunnel)</option>
              <option value={22}>22 (SSH Direct)</option>
              <option value={80}>80 (HTTP / WS)</option>
              <option value={8080}>8080 (Proxy)</option>
              <option value={7300}>7300 (BadVPN)</option>
            </select>
          </div>
        </div>

        {probePort === 443 && (
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              SNI Spoofing Test (Domínio injetado no handshake TLS):
            </label>
            <input
              type="text"
              value={probeSni}
              onChange={(e) => setProbeSni(e.target.value)}
              placeholder="unitelmoney.com"
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-400"
            />
          </div>
        )}

        <button
          onClick={handleRunProbe}
          disabled={isProbing}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#13241b] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-950"
        >
          {isProbing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Conectando e medindo handshake...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Testar Conexão do Servidor Agora</span>
            </>
          )}
        </button>

        {/* Probe Result Box */}
        {probeResult && (
          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              probeResult.success
                ? 'bg-emerald-950/40 border-emerald-500/60 text-slate-200'
                : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold flex items-center gap-1.5">
                {probeResult.success ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Servidor Ativo & Porta Aberta!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-400">Falha ao Conectar</span>
                  </>
                )}
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {probeResult.latency} ms
              </span>
            </div>

            {probeResult.success ? (
              <div className="space-y-1 text-[11px] text-slate-300 mt-2">
                <div>• Modo: <strong className="text-emerald-400">{probeResult.mode}</strong></div>
                {probeResult.banner && (
                  <div>• Resposta/Banner: <code className="text-cyan-300">{probeResult.banner}</code></div>
                )}
                {probeResult.tlsVersion && (
                  <div>• Criptografia: <strong>{probeResult.tlsVersion}</strong> ({probeResult.cipher})</div>
                )}
                {probeResult.certificate && (
                  <div>• Certificado SSL: <span>{probeResult.certificate.subject} (Emissor: {probeResult.certificate.issuer})</span></div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-rose-300 mt-1">
                Motivo: {probeResult.error || 'A porta não respondeu ou foi bloqueada pelo firewall.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1-Click Ubuntu Script Generator Card */}
      <div className="bg-[#0a100d] border border-[#14261c] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Instalador 1-Click (Ubuntu / Debian)</h3>
          </div>
          <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            OpenSSH + Stunnel + BadVPN
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Transforme qualquer VPS (DigitalOcean, Contabo, AWS, Oracle, Linode) em um servidor TunnelX VPN com suporte a SSH, TLS e BadVPN UDP para voz/jogos.
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Porta SSH:</label>
            <input
              type="number"
              value={scriptSshPort}
              onChange={(e) => setScriptSshPort(parseInt(e.target.value) || 22)}
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-2.5 py-1.5 text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Porta TLS (SSL):</label>
            <input
              type="number"
              value={scriptSslPort}
              onChange={(e) => setScriptSslPort(parseInt(e.target.value) || 443)}
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-2.5 py-1.5 text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Porta BadVPN:</label>
            <input
              type="number"
              value={scriptUdpPort}
              onChange={(e) => setScriptUdpPort(parseInt(e.target.value) || 7300)}
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-2.5 py-1.5 text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Senha Padrão:</label>
            <input
              type="text"
              value={scriptPassword}
              onChange={(e) => setScriptPassword(e.target.value)}
              className="w-full bg-[#070c09] border border-[#183023] rounded-xl px-2.5 py-1.5 text-slate-100 text-xs"
            />
          </div>
        </div>

        {/* Script Command Display */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] text-emerald-400 font-bold">
            Comando de Instalação Rápida (Cole no terminal root da VPS):
          </label>
          <div className="flex items-center gap-2 bg-[#050906] border border-[#183023] rounded-xl p-2.5">
            <code className="text-[11px] text-emerald-300 truncate flex-1 select-all">
              {curlCommand}
            </code>
            <button
              onClick={copyCurlText}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-black text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCurl ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Full Script Viewer */}
        <div className="pt-2">
          <button
            onClick={copyScriptText}
            className="w-full py-2 rounded-xl bg-[#0f1d16] hover:bg-[#152a20] border border-[#1b3827] text-slate-300 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copiar Script Bash Completo (.sh)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
