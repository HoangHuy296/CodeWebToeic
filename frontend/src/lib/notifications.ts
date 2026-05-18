export function resolveWebSocketUrl(accessToken: string): string | null {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

  const resolvedApiUrl =
    !configuredApiUrl
      ? typeof window === 'undefined'
        ? null
        : `${window.location.origin}/api`
      : /^https?:\/\//i.test(configuredApiUrl)
        ? configuredApiUrl
        : typeof window === 'undefined'
          ? null
          : new URL(configuredApiUrl, window.location.origin).toString();

  if (!resolvedApiUrl) {
    return null;
  }

  const apiUrl = new URL(resolvedApiUrl);
  const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  const pathname = apiUrl.pathname.replace(/\/api\/?$/, '');
  const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  return `${protocol}//${apiUrl.host}${basePath}/ws/notifications?token=${encodeURIComponent(accessToken)}`;
}

export function formatNotificationTime(value: string): string {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
