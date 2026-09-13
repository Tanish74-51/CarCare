// src/components/Layout.jsx
// Wraps all authenticated pages with sidebar + mobile nav

import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import PingListener from './PingListener';

export default function Layout({ page, onNavigate, children }) {
  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={onNavigate} />
      <div className="main-content">
        <MobileNav page={page} onNavigate={onNavigate} />
        <div className="page-wrapper">
          {children}
        </div>
      </div>
      {/* Mounted once, independent of the active page, so "Available to Help"
          keeps listening and can surface a request no matter where you are */}
      <PingListener onNavigate={onNavigate} currentPage={page} />
    </div>
  );
}
