import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../app/providers/notification-provider';
import { formatNotificationTime } from '../../lib/notifications';
import { useFloatingPanel } from './use-floating-panel';

const severityStyles = {
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
};

const connectionStyles = {
  idle: 'bg-slate-300',
  connecting: 'bg-amber-400 animate-pulse',
  connected: 'bg-emerald-500',
  disconnected: 'bg-rose-500',
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { isOpen, togglePanel, closePanel, wrapperProps } = useFloatingPanel();
  const {
    notifications,
    unreadCount,
    connectionStatus,
    markAllAsRead,
    markAsRead,
    clearNotifications,
  } = useNotifications();
  const totalCount = notifications.length;
  const readCount = totalCount - unreadCount;
  const hasUnreadNotifications = unreadCount > 0;

  const statusLabel = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'Realtime dang ket noi';
      case 'connecting':
        return 'Dang ket noi realtime';
      case 'disconnected':
        return 'Mat ket noi realtime';
      default:
        return 'Realtime tam dung';
    }
  }, [connectionStatus]);

  return (
    <div className="relative" {...wrapperProps}>
      <button
        type="button"
        onClick={togglePanel}
        className={[
          'relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-white/88 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition',
          isOpen ? 'translate-y-0 shadow-[0_18px_45px_rgba(15,23,42,0.14)]' : 'hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]',
          hasUnreadNotifications ? 'animate-[bell-ring_1.2s_ease-in-out_infinite]' : '',
        ].join(' ')}
        aria-label="Thong bao"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={[
            'h-5 w-5 transition',
            hasUnreadNotifications ? 'text-amber-500' : 'text-slate-900',
          ].join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
        <span
          className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${connectionStyles[connectionStatus]}`}
        />
        {hasUnreadNotifications ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-[0_8px_20px_rgba(244,63,94,0.35)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,25rem)] rounded-[2rem] border border-stroke bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-950">Thong bao</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {statusLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                  Tong: {totalCount}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                  Chua doc: {unreadCount}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Da doc: {readCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Da doc het
              </button>
              <button
                type="button"
                onClick={clearNotifications}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Xoa
              </button>
            </div>
          </div>

          <div className="mt-4 grid max-h-[26rem] gap-3 overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    markAsRead(notification.id);
                    const actionPath = typeof notification.metadata?.actionPath === 'string' ? notification.metadata.actionPath : null;
                    if (actionPath) {
                      closePanel();
                      navigate(actionPath);
                    }
                  }}
                  className={[
                    'grid gap-2 rounded-[1.4rem] border px-4 py-4 text-left transition hover:-translate-y-0.5',
                    severityStyles[notification.severity],
                    notification.isRead ? 'opacity-75' : 'shadow-sm ring-1 ring-slate-950/5',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold">{notification.title}</p>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                        {notification.channel}
                      </span>
                      <span
                        className={[
                          'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                          notification.isRead
                            ? 'bg-white/70 text-slate-600'
                            : 'bg-slate-950 text-white',
                        ].join(' ')}
                      >
                        {notification.isRead ? 'Da doc' : 'Chua doc'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-6">{notification.message}</p>
                  <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span>{notification.entityType}</span>
                    <span>{formatNotificationTime(notification.createdAt)}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
                Chua co thong bao nao cho tai khoan nay.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
