// src/pages/Notifications.jsx
// Notifications list with read/unread state

import { Bell, Wrench, Users, CheckCircle, Coins, AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TYPE_CONFIG = {
  reminder:     { icon: Bell,         bg: 'var(--color-blue-bg)',   color: 'var(--color-blue)' },
  ping:         { icon: Users,        bg: 'var(--color-amber-bg)',  color: 'var(--color-amber)' },
  ping_accepted:{ icon: CheckCircle,  bg: 'var(--color-green-bg)',  color: 'var(--color-green)' },
  service:      { icon: Wrench,       bg: 'var(--color-surface2)',  color: 'var(--color-text-muted)' },
  credit:       { icon: Coins,        bg: 'var(--color-amber-bg)',  color: 'var(--color-amber)' },
  emergency:    { icon: AlertTriangle,bg: 'var(--color-red-bg)',    color: 'var(--color-red)' },
};

export default function Notifications() {
  const { state, dispatch } = useApp();
  const { notifications } = state;

  const unreadCount = notifications.filter(n => !n.read).length;

  function markAllRead() {
    dispatch({ type: 'MARK_ALL_READ' });
  }

  function handleClick(id) {
    dispatch({ type: 'MARK_NOTIF_READ', payload: id });
  }

  function handleDelete(e, id) {
    e.stopPropagation(); // don't also trigger the row's mark-as-read click
    dispatch({ type: 'DELETE_NOTIF', payload: id });
  }

  function handleDeleteAll() {
    dispatch({ type: 'DELETE_ALL_NOTIFS' });
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {(unreadCount > 0 || notifications.length > 0) && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {unreadCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={markAllRead} id="btn-mark-all-read">
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={handleDeleteAll} id="btn-clear-all-notifs">
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={32} className="empty-state-icon" />
            <div className="empty-state-title">No notifications</div>
            <div className="empty-state-desc">You're all caught up. New activity will appear here.</div>
          </div>
        ) : (
          notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.service;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className={`notif-item${!n.read ? ' unread' : ''}`}
                onClick={() => handleClick(n.id)}
                id={`notif-${n.id}`}
              >
                <div className="notif-icon-wrap" style={{ background: cfg.bg }}>
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>
                <div className="notif-content" style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-body">{n.body}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span className="notif-time">{n.time}</span>
                  {!n.read && <div className="unread-dot" />}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => handleDelete(e, n.id)}
                  aria-label="Delete notification"
                  id={`btn-delete-notif-${n.id}`}
                  style={{ padding: 4, color: 'var(--color-text-muted)', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
