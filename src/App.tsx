import { useState, useEffect } from 'react';
import AdminAuth from '@/pages/AdminAuth';
import ListenerAuth from '@/pages/ListenerAuth';
import AdminHome from '@/pages/AdminHome';
import CatalogPage from '@/pages/CatalogPage';
import ProgramsPage from '@/pages/ProgramsPage';
import TestingPage from '@/pages/TestingPage';
import CertificatesPage from '@/pages/CertificatesPage';
import CertificateBuilder from '@/pages/CertificateBuilder';
import DocumentsPage from '@/pages/DocumentsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ListenerDashboard from '@/pages/ListenerDashboard';
import ListenersManagement from '@/pages/ListenersManagement';
import ListenerProgramsSetup from '@/pages/ListenerProgramsSetup';
import AdminManagement from '@/pages/AdminManagement';

type UserRole = 'admin' | 'listener' | null;

interface AdminUser {
  name: string;
  email: string;
  role: 'ot' | 'pb' | 'superadmin';
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
  | 'admin-home'
  | 'catalog'
  | 'programs'
  | 'testing'
  | 'certificates'
  | 'certificate-builder'
  | 'documents'
  | 'analytics'
  | 'listener-dashboard'
  | 'listeners-management'
  | 'listener-programs-setup'
  | 'admin-management';

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('admin-auth');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [listenerUser, setListenerUser] = useState<ListenerUser | null>(null);
  const [selectedListenerId, setSelectedListenerId] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    let listenerId = urlParams.get('listener');
    
    // Проверяем hash-based routing
    const hash = window.location.hash;
    const hashMatch = hash.match(/\/listener\/([^/]+)/);
    if (hashMatch) {
      listenerId = hashMatch[1];
    }
    
    if (listenerId) {
      setSelectedListenerId(listenerId);
      setCurrentView('listener-auth');
    }
  }, []);

  const handleAdminLogin = (email: string, password: string, name: string, role: 'ot' | 'pb') => {
    const isSuperAdmin = email === 'nshrkonstantin@gmail.com';
    setAdminUser({ 
      name: isSuperAdmin ? 'Шнюков Константин Анатольевич' : name, 
      email, 
      role: isSuperAdmin ? 'superadmin' : role 
    });
    setUserRole('admin');
    setCurrentView('admin-home');
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

  const handleBackToAdminHome = () => {
    setCurrentView('admin-home');
  };

  const handleNavigateToSection = (section: 'catalog' | 'programs' | 'testing' | 'certificates' | 'documents' | 'analytics' | 'listeners' | 'admin-management') => {
    if (section === 'listeners') {
      setCurrentView('listeners-management');
    } else {
      setCurrentView(section);
    }
  };

  const handleConfigureListener = (listenerId: string) => {
    setSelectedListenerId(listenerId);
    setCurrentView('listener-programs-setup');
  };

  const handleGoToListenerAuth = (listenerId: string) => {
    setSelectedListenerId(listenerId);
    setCurrentView('listener-auth');
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

  if (currentView === 'admin-home' && adminUser) {
    return (
      <AdminHome
        user={adminUser}
        onLogout={handleLogout}
        onNavigate={handleNavigateToSection}
      />
    );
  }

  if (currentView === 'catalog' && adminUser) {
    return <CatalogPage onBack={handleBackToAdminHome} />;
  }

  if (currentView === 'programs' && adminUser) {
    return <ProgramsPage onBack={handleBackToAdminHome} />;
  }

  if (currentView === 'testing' && adminUser) {
    return (
      <TestingPage 
        onBack={handleBackToAdminHome} 
        userName={adminUser.name}
        userRole={adminUser.role === 'ot' ? 'Инженер по охране труда' : adminUser.role === 'pb' ? 'Инженер по пожарной безопасности' : 'Главный администратор'}
      />
    );
  }

  if (currentView === 'certificates' && adminUser) {
    return (
      <CertificatesPage 
        onBack={handleBackToAdminHome} 
        onNavigateToBuilder={() => setCurrentView('certificate-builder')}
      />
    );
  }

  if (currentView === 'certificate-builder' && adminUser) {
    return <CertificateBuilder onBack={() => setCurrentView('certificates')} />;
  }

  if (currentView === 'documents' && adminUser) {
    return <DocumentsPage onBack={handleBackToAdminHome} />;
  }

  if (currentView === 'analytics' && adminUser) {
    return <AnalyticsPage onBack={handleBackToAdminHome} />;
  }

  if (currentView === 'admin-management' && adminUser) {
    return <AdminManagement onBack={handleBackToAdminHome} />;
  }

  if (currentView === 'listener-dashboard' && listenerUser) {
    return (
      <ListenerDashboard
        listener={listenerUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'listeners-management' && adminUser) {
    return (
      <ListenersManagement
        onBack={handleBackToAdminHome}
        onConfigureListener={handleConfigureListener}
        onGoToListenerAuth={handleGoToListenerAuth}
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