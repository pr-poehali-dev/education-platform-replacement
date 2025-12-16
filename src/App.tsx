import { useState, useEffect } from 'react';
import AdminAuth from '@/pages/AdminAuth';
import ListenerAuth from '@/pages/ListenerAuth';
import AdminDashboard from '@/pages/AdminDashboard';
import ListenerDashboard from '@/pages/ListenerDashboard';
import ListenersManagement from '@/pages/ListenersManagement';
import ListenerProgramsSetup from '@/pages/ListenerProgramsSetup';

type UserRole = 'admin' | 'listener' | null;

interface AdminUser {
  name: string;
  email: string;
  role: 'ot' | 'pb';
}

interface ListenerUser {
  fullName: string;
  position: string;
  department: string;
  listenerId?: string;
}

type CurrentView = 
  | 'admin-auth'
  | 'listener-auth'
  | 'admin-dashboard'
  | 'listener-dashboard'
  | 'listeners-management'
  | 'listener-programs-setup';

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('admin-auth');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [listenerUser, setListenerUser] = useState<ListenerUser | null>(null);
  const [selectedListenerId, setSelectedListenerId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const listenerId = urlParams.get('listener');
    
    if (listenerId) {
      setSelectedListenerId(listenerId);
      setCurrentView('listener-auth');
    }
  }, []);

  const handleAdminLogin = (email: string, password: string, name: string, role: 'ot' | 'pb') => {
    setAdminUser({ name, email, role });
    setUserRole('admin');
    setCurrentView('admin-dashboard');
  };

  const handleListenerLogin = (fullName: string, position: string, department: string, listenerId?: string) => {
    setListenerUser({ fullName, position, department, listenerId });
    setUserRole('listener');
    setCurrentView('listener-dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setAdminUser(null);
    setListenerUser(null);
    setCurrentView('admin-auth');
  };

  const handleSwitchToListener = () => {
    setCurrentView('listener-auth');
  };

  const handleManageListeners = () => {
    setCurrentView('listeners-management');
  };

  const handleBackToAdminDashboard = () => {
    setCurrentView('admin-dashboard');
  };

  const handleConfigureListener = (listenerId: string) => {
    setSelectedListenerId(listenerId);
    setCurrentView('listener-programs-setup');
  };

  const handleSaveListenerPrograms = () => {
    setCurrentView('listeners-management');
  };

  if (currentView === 'admin-auth') {
    return <AdminAuth onLogin={handleAdminLogin} />;
  }

  if (currentView === 'listener-auth') {
    return (
      <ListenerAuth 
        onLogin={handleListenerLogin}
        listenerId={selectedListenerId || undefined}
      />
    );
  }

  if (currentView === 'admin-dashboard' && adminUser) {
    return (
      <AdminDashboard
        user={adminUser}
        onLogout={handleLogout}
        onSwitchToListener={handleSwitchToListener}
        onManageListeners={handleManageListeners}
      />
    );
  }

  if (currentView === 'listener-dashboard' && listenerUser) {
    return (
      <ListenerDashboard
        listener={listenerUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'listeners-management') {
    return (
      <ListenersManagement
        onBack={handleBackToAdminDashboard}
        onConfigureListener={handleConfigureListener}
      />
    );
  }

  if (currentView === 'listener-programs-setup' && selectedListenerId) {
    return (
      <ListenerProgramsSetup
        listenerId={selectedListenerId}
        onBack={() => setCurrentView('listeners-management')}
        onSave={handleSaveListenerPrograms}
      />
    );
  }

  return <AdminAuth onLogin={handleAdminLogin} />;
}

export default App;
