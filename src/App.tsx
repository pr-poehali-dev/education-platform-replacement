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
import ModuleLearning from '@/pages/ModuleLearning';
import VideoManagement from '@/pages/VideoManagement';
import VideoLibrary from '@/pages/VideoLibrary';
import VideoPlayerPage from '@/pages/VideoPlayer';
import TestsCatalogPage from '@/pages/TestsCatalogPage';
import TestBuilder from '@/pages/TestBuilder';
import TestRunner from '@/pages/TestRunner';

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
  | 'admin-management'
  | 'module-learning'
  | 'video-management'
  | 'video-library'
  | 'video-player'
  | 'tests-catalog'
  | 'test-builder'
  | 'test-runner';

function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('admin-auth');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [listenerUser, setListenerUser] = useState<ListenerUser | null>(null);
  const [selectedListenerId, setSelectedListenerId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем hash для прямого входа слушателя
    const hash = window.location.hash;
    if (hash === '#/listener-direct') {
      const tempLoginData = localStorage.getItem('temp_listener_login');
      if (tempLoginData) {
        const listenerData = JSON.parse(tempLoginData);
        setListenerUser(listenerData);
        setUserRole('listener');
        setCurrentView('listener-dashboard');
        localStorage.removeItem('temp_listener_login');
        window.location.hash = '';
        return;
      }
    }

    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    let listenerId = urlParams.get('listener');
    
    // Проверяем hash-based routing для обычного входа
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
    // Сохраняем слушателя в список, если его там нет
    const savedListeners = localStorage.getItem('listeners');
    const listeners = savedListeners ? JSON.parse(savedListeners) : [];
    
    // Проверяем, есть ли уже такой слушатель
    const existingListener = listeners.find((l: { id: string; fullName: string }) => 
      l.id === listenerId || l.fullName === fullName
    );
    
    if (!existingListener) {
      const newListener = {
        id: listenerId || `listener_${Date.now()}`,
        fullName,
        position,
        department,
        assignedPrograms: [],
        completedPrograms: 0,
        totalPrograms: 0,
        progress: 0,
        lastActivity: new Date().toISOString()
      };
      listeners.push(newListener);
      localStorage.setItem('listeners', JSON.stringify(listeners));
      
      // Создаём уведомление для администратора
      const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'new_listener',
        message: 'Новый слушатель зарегистрировался в системе',
        listenerName: fullName,
        timestamp: new Date().toISOString(),
        read: false
      };
      notifications.push(newNotification);
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    } else {
      // Обновляем последнюю активность
      existingListener.lastActivity = new Date().toISOString();
      localStorage.setItem('listeners', JSON.stringify(listeners));
    }
    
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

  const handleNavigateToSection = (section: 'catalog' | 'programs' | 'testing' | 'certificates' | 'documents' | 'analytics' | 'listeners' | 'admin-management' | 'video-management' | 'tests-catalog') => {
    if (section === 'listeners') {
      setCurrentView('listeners-management');
    } else if (section === 'video-management') {
      setCurrentView('video-management');
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

  const handleDirectListenerLogin = (listenerId: string) => {
    const savedListeners = localStorage.getItem('listeners');
    const listeners = savedListeners ? JSON.parse(savedListeners) : [];
    
    const listener = listeners.find((l: any) => l.id === listenerId);
    if (!listener) return;

    const listenerData = {
      fullName: listener.fullName,
      position: listener.position,
      department: listener.department,
      listenerId: listener.id
    };

    localStorage.setItem('temp_listener_login', JSON.stringify(listenerData));
    
    const newWindow = window.open(window.location.origin + '/#/listener-direct', '_blank');
    
    if (!newWindow) {
      alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
    }
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
    return <CatalogPage onBack={handleBackToAdminHome} isAdmin={true} />;
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
        onStartLearning={(programId) => {
          setSelectedProgramId(programId);
          setCurrentView('module-learning');
        }}
        onNavigateToVideos={() => setCurrentView('video-library')}
      />
    );
  }

  if (currentView === 'listeners-management' && adminUser) {
    return (
      <ListenersManagement
        onBack={handleBackToAdminHome}
        onConfigureListener={handleConfigureListener}
        onGoToListenerAuth={handleGoToListenerAuth}
        onDirectLogin={handleDirectListenerLogin}
        isSuperAdmin={adminUser.email === 'nshrkonstantin@gmail.com'}
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

  if (currentView === 'module-learning' && selectedProgramId && listenerUser?.listenerId) {
    return (
      <ModuleLearning
        programId={selectedProgramId}
        listenerId={listenerUser.listenerId}
        onBack={() => setCurrentView('listener-dashboard')}
        onComplete={() => {
          setCurrentView('listener-dashboard');
        }}
      />
    );
  }

  if (currentView === 'video-management' && adminUser) {
    return <VideoManagement onBack={handleBackToAdminHome} />;
  }

  if (currentView === 'video-library') {
    return (
      <VideoLibrary
        onBack={() => setCurrentView(userRole === 'admin' ? 'admin-home' : 'listener-dashboard')}
        onPlayVideo={(videoId) => {
          setSelectedVideoId(videoId);
          setCurrentView('video-player');
        }}
      />
    );
  }

  if (currentView === 'video-player' && selectedVideoId) {
    return (
      <VideoPlayerPage
        videoId={selectedVideoId}
        onBack={() => setCurrentView('video-library')}
        onPlayVideo={(videoId) => {
          setSelectedVideoId(videoId);
        }}
      />
    );
  }

  if (currentView === 'tests-catalog' && adminUser) {
    return (
      <TestsCatalogPage 
        onBack={handleBackToAdminHome}
        onCreateTest={() => {
          setSelectedTestId(null);
          setCurrentView('test-builder');
        }}
        onEditTest={(testId) => {
          setSelectedTestId(testId);
          setCurrentView('test-builder');
        }}
        onRunTest={(testId) => {
          setSelectedTestId(testId);
          setCurrentView('test-runner');
        }}
      />
    );
  }

  if (currentView === 'test-builder' && adminUser) {
    return (
      <TestBuilder 
        onBack={() => setCurrentView('tests-catalog')}
        testId={selectedTestId || undefined}
      />
    );
  }

  if (currentView === 'test-runner' && selectedTestId) {
    return (
      <TestRunner 
        onBack={() => setCurrentView('tests-catalog')}
        testId={selectedTestId}
      />
    );
  }

  return <AdminAuth onLogin={handleAdminLogin} />;
}

export default App;