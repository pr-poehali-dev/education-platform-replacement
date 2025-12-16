import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AdminHomeProps {
  user: {
    name: string;
    email: string;
    role: 'ot' | 'pb' | 'superadmin';
  };
  onLogout: () => void;
  onNavigate: (section: 'catalog' | 'programs' | 'testing' | 'certificates' | 'documents' | 'analytics' | 'listeners' | 'admin-management' | 'video-management') => void;
}

export default function AdminHome({ user, onLogout, onNavigate }: AdminHomeProps) {
  const isSuperAdmin = user.email === 'nshrkonstantin@gmail.com';
  const departmentName = user.role === 'ot' ? 'Охрана труда' : user.role === 'pb' ? 'Пожарная безопасность' : 'Главный администратор';
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'new_listener' | 'program_completed' | 'test_failed';
    message: string;
    timestamp: string;
    read: boolean;
    listenerName?: string;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const savedNotifications = localStorage.getItem('admin_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const checkInterval = setInterval(() => {
      const saved = localStorage.getItem('admin_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('admin_notifications');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_listener': return 'UserPlus';
      case 'program_completed': return 'CheckCircle';
      case 'test_failed': return 'AlertCircle';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_listener': return 'text-green-600';
      case 'program_completed': return 'text-blue-600';
      case 'test_failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const menuItems = [
    {
      id: 'catalog',
      title: 'Каталог инструкций',
      description: 'База знаний по охране труда и пожарной безопасности',
      icon: 'BookOpen',
      color: 'from-blue-500 to-cyan-500',
      stats: '0 инструкций'
    },
    {
      id: 'programs',
      title: 'Программы обучения',
      description: 'Готовые курсы по различным направлениям',
      icon: 'GraduationCap',
      color: 'from-green-500 to-emerald-500',
      stats: '0 программ'
    },
    {
      id: 'testing',
      title: 'Тестирование',
      description: 'Создание и проведение тестов и экзаменов',
      icon: 'ClipboardCheck',
      color: 'from-purple-500 to-pink-500',
      stats: '0 тестов'
    },
    {
      id: 'certificates',
      title: 'Сертификаты',
      description: 'Выдача удостоверений и сертификатов',
      icon: 'Award',
      color: 'from-yellow-500 to-orange-500',
      stats: '0 выдано'
    },
    {
      id: 'documents',
      title: 'Документы',
      description: 'Создание инструкций и программ с помощью ИИ',
      icon: 'FileText',
      color: 'from-purple-500 to-pink-500',
      stats: 'ИИ-генератор'
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      description: 'Отчёты и статистика по обучению',
      icon: 'BarChart3',
      color: 'from-indigo-500 to-purple-500',
      stats: '0 отчётов'
    },
    {
      id: 'listeners',
      title: 'Управление слушателями',
      description: 'Регистрация и настройка программ для слушателей',
      icon: 'Users',
      color: 'from-rose-500 to-red-500',
      stats: '0 слушателей'
    },
    {
      id: 'video-management',
      title: 'Видеоматериалы',
      description: 'Загрузка и управление учебными видео',
      icon: 'Video',
      color: 'from-purple-500 to-pink-500',
      stats: '0 видео'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Icon name="ShieldCheck" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  АО "ГРК "Западная""
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isSuperAdmin ? 'Главная панель управления' : `Панель администратора — ${departmentName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Icon name="Bell" className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="end">
                  <div className="bg-white rounded-lg shadow-xl">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Уведомления</h3>
                        <p className="text-xs text-muted-foreground">
                          {unreadCount > 0 ? `${unreadCount} новых` : 'Нет новых уведомлений'}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <div className="flex gap-1">
                          {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                              <Icon name="CheckCheck" className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={clearNotifications}>
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Icon name="Bell" className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Уведомлений пока нет</p>
                        </div>
                      ) : (
                        notifications.slice().reverse().map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.type === 'new_listener') {
                                setShowNotifications(false);
                                onNavigate('listeners');
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} bg-opacity-10`}>
                                <Icon name={getNotificationIcon(notification.type)} className={`h-5 w-5 ${getNotificationColor(notification.type)}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${
                                  !notification.read ? 'font-semibold' : 'font-normal'
                                }`}>
                                  {notification.message}
                                </p>
                                {notification.listenerName && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    {notification.listenerName}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.timestamp).toLocaleString('ru-RU')}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className={`${isSuperAdmin ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'} text-white`}>
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    {isSuperAdmin && <Badge variant="destructive" className="text-xs">SUPER</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{departmentName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <Icon name="LogOut" className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Добро пожаловать{isSuperAdmin ? ', Константин' : ''}!
            </h2>
            <p className="text-lg text-muted-foreground">
              Выберите раздел для работы
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className="group relative animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" 
                     style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                
                <Card className="relative h-full border-2 border-transparent hover:border-white transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
                  </div>
                  
                  <CardContent className="relative p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon name={item.icon} className="h-8 w-8 text-white" />
                      </div>
                      <div className={`bg-gradient-to-br ${item.color} text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                        Открыть
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                        style={{ backgroundImage: `linear-gradient(to right, ${item.color})` }}>
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs font-medium text-slate-600">{item.stats}</span>
                      <Icon name="ArrowRight" className={`h-4 w-4 text-slate-400 transform group-hover:translate-x-1 transition-transform duration-300`} />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {isSuperAdmin && (
            <div className="animate-fade-in-delayed">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                      <Icon name="Shield" className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-purple-900 mb-2">
                        Панель главного администратора
                      </h3>
                      <p className="text-sm text-purple-700 mb-4">
                        Управление администраторами ОТ и ПБ, настройка системы и полный контроль веб-приложения
                      </p>
                      <Button 
                        onClick={() => onNavigate('admin-management')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Icon name="Settings" className="h-4 w-4 mr-2" />
                        Управление администраторами
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}