// src/components/Sidebar.jsx
// Desktop persistent sidebar navigation

import {
  LayoutDashboard, Car, CalendarCheck, Truck,
  AlertTriangle, Users, ClipboardList, Coins,
  Bell, UserCircle, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'vehicles',       label: 'My Vehicles',      icon: Car },
  { id: 'book-service',   label: 'Book Service',     icon: CalendarCheck },
  { id: 'pickup-drop',    label: 'Pickup & Drop',    icon: Truck },
  { id: 'emergency',      label: 'Emergency',        icon: AlertTriangle },
  { id: 'community-ping', label: 'Community Help',   icon: Users },
  { id: 'service-history',label: 'Service History',  icon: ClipboardList },
  { id: 'credits',        label: 'Credits',          icon: Coins },
  { id: 'notifications',  label: 'Notifications',    icon: Bell },
  { id: 'profile',        label: 'Profile',          icon: UserCircle },
];

export default function Sidebar({ page, onNavigate }) {
  const { state, dispatch } = useApp();
  const { user, notifications, credits } = state;

  const unreadCount = notifications.filter(n => !n.read).length;

  function handleLogout() {
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">CarCare</div>
        <div className="sidebar-logo-sub">Vehicle Services</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = page === id;
          return (
            <button
              key={id}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} className="nav-icon" />
              <span>{label}</span>
              {id === 'notifications' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
              {id === 'credits' && (
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                  {credits}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.initials}</div>
          <div className="sidebar-user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
