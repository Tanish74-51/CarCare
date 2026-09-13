// src/App.jsx
// Root component — handles auth state and page routing via local state

import { useState } from 'react';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyVehicles from './pages/MyVehicles';
import BookService from './pages/BookService';
import PickupDrop from './pages/PickupDrop';
import Emergency from './pages/Emergency';
import CommunityPing from './pages/CommunityPing';
import ServiceHistory from './pages/ServiceHistory';
import Credits from './pages/Credits';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Map page IDs to components
function PageContent({ page, navigate }) {
  switch (page) {
    case 'dashboard':       return <Dashboard onNavigate={navigate} />;
    case 'vehicles':        return <MyVehicles />;
    case 'book-service':    return <BookService onNavigate={navigate} />;
    case 'pickup-drop':     return <PickupDrop />;
    case 'emergency':       return <Emergency onNavigate={navigate} />;
    case 'community-ping':  return <CommunityPing />;
    case 'service-history': return <ServiceHistory />;
    case 'credits':         return <Credits />;
    case 'notifications':   return <Notifications />;
    case 'profile':         return <Profile />;
    default:                return <Dashboard onNavigate={navigate} />;
  }
}

export default function App() {
  const { state } = useApp();
  const [page, setPage] = useState('dashboard');

  if (!state.isLoggedIn) {
    return <Login />;
  }

  return (
    <Layout page={page} onNavigate={setPage}>
      <PageContent page={page} navigate={setPage} />
    </Layout>
  );
}
