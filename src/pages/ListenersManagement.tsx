import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Listener {
  id: string;
  fullName: string;
  position: string;
  department: string;
  assignedPrograms: string[];
  completedPrograms: number;
  totalPrograms: number;
  progress: number;
  lastActivity: string;
}

interface ListenersManagementProps {
  onBack: () => void;
  onConfigureListener: (listenerId: string) => void;
  onGoToListenerAuth: (listenerId: string) => void;
}

export default function ListenersManagement({ onBack, onConfigureListener, onGoToListenerAuth }: ListenersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newListener, setNewListener] = useState({
    fullName: '',
    position: '',
    department: ''
  });
  const [listeners, setListeners] = useState<Listener[]>([]);

  const filteredListeners = listeners.filter(listener => 
    listener.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listener.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listener.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateListenerId = () => {
    return 'L' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleRegisterListener = () => {
    if (!newListener.fullName || !newListener.position || !newListener.department) return;
    
    const listenerId = generateListenerId();
    const newListenerData: Listener = {
      id: listenerId,
      fullName: newListener.fullName,
      position: newListener.position,
      department: newListener.department,
      assignedPrograms: [],
      completedPrograms: 0,
      totalPrograms: 0,
      progress: 0,
      lastActivity: new Date().toISOString()
    };
    
    setListeners([...listeners, newListenerData]);
    setNewListener({ fullName: '', position: '', department: '' });
    setShowRegisterDialog(false);
  };

  const copyListenerLink = (listenerId: string) => {
    const link = `${window.location.origin}/#/listener/${listenerId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(listenerId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Icon name="Users" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Управление слушателями</h1>
              <p className="text-xs text-muted-foreground">Создание и настройка персональных кабинетов</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Список слушателей</h2>
              <p className="text-muted-foreground">Всего слушателей: {listeners.length}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="flex-1 md:w-96">
                <div className="relative">
                  <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по ФИО, должности, подразделению..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                onClick={() => setShowRegisterDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 whitespace-nowrap"
              >
                <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                Зарегистрировать
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredListeners.map((listener) => (
              <Card key={listener.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {listener.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{listener.fullName}</CardTitle>
                        <CardDescription>{listener.position} • {listener.department}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={listener.progress === 100 ? 'default' : listener.progress > 0 ? 'secondary' : 'outline'}>
                      {listener.progress}% завершено
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Назначено программ</p>
                        <p className="font-medium">{listener.totalPrograms}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Завершено</p>
                        <p className="font-medium">{listener.completedPrograms}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Последняя активность</p>
                        <p className="font-medium">{new Date(listener.lastActivity).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Программы обучения:</p>
                      <div className="flex flex-wrap gap-2">
                        {listener.assignedPrograms.map((program, idx) => (
                          <Badge key={idx} variant="outline">{program}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={() => onConfigureListener(listener.id)}
                        className="flex-1 min-w-[200px]"
                      >
                        <Icon name="Settings" className="h-4 w-4 mr-2" />
                        Настроить программы
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => copyListenerLink(listener.id)}
                        className="flex-1 min-w-[180px]"
                      >
                        {copiedId === listener.id ? (
                          <>
                            <Icon name="Check" className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-green-600">Скопировано!</span>
                          </>
                        ) : (
                          <>
                            <Icon name="Link" className="h-4 w-4 mr-2" />
                            Скопировать ссылку
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => onGoToListenerAuth(listener.id)}
                        className="flex-1 min-w-[180px]"
                      >
                        <Icon name="LogIn" className="h-4 w-4 mr-2" />
                        Выход в ЛК
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListeners.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Users" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {listeners.length === 0 
                    ? 'Пока нет зарегистрированных слушателей' 
                    : 'Слушатели не найдены. Попробуйте изменить условия поиска.'}
                </p>
                {listeners.length === 0 && (
                  <Button 
                    onClick={() => setShowRegisterDialog(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                    Зарегистрировать первого слушателя
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" className="h-5 w-5 text-blue-600" />
              Как работают персональные ссылки
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>• После регистрации система генерирует уникальную ссылку для входа</p>
            <p>• Скопируйте ссылку и отправьте слушателю любым удобным способом</p>
            <p>• Слушатель переходит по ссылке и попадает на страницу входа в личный кабинет</p>
            <p>• Все назначенные программы будут доступны в его личном кабинете</p>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="UserPlus" className="h-5 w-5" />
              Регистрация нового слушателя
            </DialogTitle>
            <DialogDescription>
              Заполните данные для создания личного кабинета
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ФИО полностью</Label>
              <Input
                id="fullName"
                placeholder="Иванов Иван Иванович"
                value={newListener.fullName}
                onChange={(e) => setNewListener({ ...newListener, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Должность / Профессия</Label>
              <Input
                id="position"
                placeholder="Электромонтер, Слесарь, Инженер..."
                value={newListener.position}
                onChange={(e) => setNewListener({ ...newListener, position: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Подразделение</Label>
              <Input
                id="department"
                placeholder="Цех №1, Отдел ПТО, Участок..."
                value={newListener.department}
                onChange={(e) => setNewListener({ ...newListener, department: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleRegisterListener}
              disabled={!newListener.fullName || !newListener.position || !newListener.department}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Icon name="Check" className="h-4 w-4 mr-2" />
              Зарегистрировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}