// src/components/MobileNav.jsx
// Mobile header with slide-out drawer navigation

import { useState } from 'react';
import { Menu, X,
  LayoutDashboard, Car, CalendarCheck, Truck,
  AlertTriangle, Users, ClipboardList, Coins,
  Bell, UserCircle, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'vehicles',        label: 'My Vehicles',     icon: Car },
  { id: 'book-service',    label: 'Book Service',    icon: CalendarCheck },
  { id: 'pickup-drop',     label: 'Pickup & Drop',   icon: Truck },
  { id: 'emergency',       label: 'Emergency',       icon: AlertTriangle },
  { id: 'community-ping',  label: 'Community Help',  icon: Users },
  { id: 'service-history', label: 'Service History', icon: ClipboardList },
  { id: 'credits',         label: 'Credits',         icon: Coins },
  { id: 'notifications',   label: 'Notifications',   icon: Bell },
  { id: 'profile',         label: 'Profile',         icon: UserCircle },
];

export default function MobileNav({ page, onNavigate }) {
  const [open, setOpen] = useState(false);
  const { state, dispatch } = useApp();
  const { user, notifications } = state;

  const unreadCount = notifications.filter(n => !n.read).length;

  function navigate(id) {
    onNavigate(id);
    setOpen(false);
  }

  return (
    <>
      <header className="mobile-header">
        <span className="mobile-header-logo">CarCare</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button className="mobile-menu-btn" onClick={() => navigate('notifications')}>
              <Bell size={20} />
              <span className="nav-badge" style={{ position: 'absolute' }}>{unreadCount}</span>
            </button>
          )}
          <button className="mobile-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`mobile-nav-overlay${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <nav className={`mobile-nav-drawer${open ? ' open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="sidebar-logo-text">CarCare</div>
            <div className="sidebar-logo-sub">Vehicle Services</div>
          </div>
          <button className="btn-ghost" onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.6)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item${page === id ? ' active' : ''}`}
              onClick={() => navigate(id)}
            >
              <Icon size={16} className="nav-icon" />
              <span>{label}</span>
              {id === 'notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.initials}</div>
            <div className="sidebar-user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={() => { dispatch({ type: 'LOGOUT' }); setOpen(false); }}>
            <LogOut size={14} />
            <span>Log out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
