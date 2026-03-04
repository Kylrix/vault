import { APPWRITE_CONFIG } from "./appwrite/config";

export interface EcosystemApp {
  id: string;
  label: string;
  subdomain: string;
  type: 'app' | 'accounts' | 'support';
  icon: string;
  color: string;
  description: string;
}

export const NEXT_PUBLIC_DOMAIN = APPWRITE_CONFIG.SYSTEM.DOMAIN || 'kylrix.space';

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  { id: 'note', label: 'Note', subdomain: 'note', type: 'app', icon: '📝', color: '#00F5FF', description: 'Secure notes and research.' },
  { id: 'vault', label: 'Vault', subdomain: 'vault', type: 'app', icon: '🔐', color: '#8b5cf6', description: 'Passwords, 2FA, and keys.' },
  { id: 'flow', label: 'Flow', subdomain: 'flow', type: 'app', icon: '🚀', color: '#10b981', description: 'Tasks and workflows.' },
  { id: 'connect', label: 'Connect', subdomain: 'connect', type: 'app', icon: '💬', color: '#ec4899', description: 'Secure messages and sharing.' },
  { id: 'accounts', label: 'Identity', subdomain: 'accounts', type: 'accounts', icon: '🛡️', color: '#ef4444', description: 'Your Kylrix account.' },
];

export function getEcosystemUrl(subdomain: string) {
  if (!subdomain) {
    return '#';
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    const ports: Record<string, number> = {
      accounts: 3000,
      note: 3001,
      vault: 3002,
      flow: 3003,
      connect: 3004
    };
    return `http://localhost:${ports[subdomain] || ports['accounts']}`;
  }

  return `https://${subdomain}.kylrix.space`;
}
