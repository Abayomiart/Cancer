export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'RESOLVING'
  | 'CONNECTING'
  | 'INJECTING'
  | 'HANDSHAKING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'DISCONNECTING'
  | 'ERROR';

export type ProtocolType = 'SSH-TLS' | 'SSH-DIRECT' | 'SSH-WS-TLS' | 'SSL-STUNNEL' | 'SSH-PROXY';

export interface VpnServer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  host: string;
  port: number;
  protocol: ProtocolType;
  pingMs: number;
  loadPercent: number;
  sniHost: string;
  username: string;
  password?: string;
  isCustom?: boolean;
}

export interface BugHostPreset {
  id: string;
  name: string;
  host: string;
  country: string;
  countryCode: string;
  flag: string;
  carrier: string;
  port: number;
  method: 'HEAD' | 'GET' | 'CONNECT';
  recommendedProtocol: ProtocolType;
  testedStatus?: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'net' | 'inject';
  message: string;
}

export interface PublicIpInfo {
  clientIp: string;
  country: string;
  countryCode: string;
  isp: string;
  org?: string;
  as?: string;
  city?: string;
}

export interface VpnSettings {
  dnsPrimary: string;
  dnsSecondary: string;
  enableUdpBadvpn: boolean;
  badvpnPort: number;
  mtu: number;
  autoReconnect: boolean;
  wakeLock: boolean;
  compression: boolean;
  customPayload: string;
  vpsUsername: string;
  vpsPassword: string;
}

export interface ExportedConfig {
  version: string;
  server: VpnServer;
  sniHost: string;
  payload: string;
  settings: Partial<VpnSettings>;
  note?: string;
  isLocked?: boolean;
  lockHwid?: string;
  expiryDate?: string;
}
