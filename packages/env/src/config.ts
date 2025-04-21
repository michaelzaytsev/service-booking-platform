export const appEnvMap: Record<string, string[]> = {
  api: ['NODE_ENV', 'DB_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'API_PORT'],
  admin: ['NODE_ENV', 'ADMIN_PORT'],
  org: ['NODE_ENV', 'ORG_PORT'],
  landing: ['NODE_ENV', 'LANDING_PORT'],
  widget: ['NODE_ENV', 'WIDGET_PORT'],
};

export const appRootMap: Record<string, string> = {
  api: '../../../apps/api',
  admin: '../../../apps/ui/admin',
  org: '../../../apps/ui/org',
  landing: '../../../apps/ui/landing',
  widget: '../../../apps/ui/widget',
};
