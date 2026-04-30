export type TopbarApp = 'vault' | 'flow' | 'accounts' | 'note' | 'connect';

export function getTopbarLogoHref(app: TopbarApp) {
  switch (app) {
    case 'vault':
      return '/dashboard';
    case 'flow':
      return '/';
    case 'accounts':
      return '/';
    default:
      return '/';
  }
}

export function getTopbarLabel(app: TopbarApp) {
  switch (app) {
    case 'vault':
      return 'Vault';
    case 'flow':
      return 'Flow';
    case 'accounts':
      return 'Accounts';
    default:
      return 'Kylrix';
  }
}
