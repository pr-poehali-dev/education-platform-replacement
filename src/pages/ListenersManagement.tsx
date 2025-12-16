import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [newListener, setNewListener] = useState({
    fullName: '',
    position: '',
    department: ''
  });
  const [listeners, setListeners] = useState<Listener[]>(() => {
    const saved = localStorage.getItem('listeners');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('lastAutoBackupDate');
  });
  const [autoBackupStatus, setAutoBackupStatus] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('listeners', JSON.stringify(listeners));
  }, [listeners]);

  useEffect(() => {
    const checkAndCreateBackup = async () => {
      const now = new Date();
      const lastBackup = lastBackupDate ? new Date(lastBackupDate) : null;
      
      const shouldCreateBackup = !lastBackup || 
        (now.getTime() - lastBackup.getTime()) > 7 * 24 * 60 * 60 * 1000;

      if (shouldCreateBackup && listeners.length > 0) {
        try {
          const backupData = {
            listeners: listeners,
            version: '1.0',
            exportDate: now.toISOString(),
            totalListeners: listeners.length,
            autoBackup: true
          };

          const programsData: { [key: string]: string[] } = {};
          listeners.forEach(listener => {
            const savedPrograms = localStorage.getItem(`listener_programs_${listener.id}`);
            if (savedPrograms) {
              programsData[listener.id] = JSON.parse(savedPrograms);
            }
          });
          
          const fullBackup = {
            ...backupData,
            programs: programsData
          };

          const backupKey = `auto_backup_${now.toISOString().split('T')[0]}`;
          localStorage.setItem(backupKey, JSON.stringify(fullBackup));
          localStorage.setItem('lastAutoBackupDate', now.toISOString());
          setLastBackupDate(now.toISOString());
          
          const oldBackups = Object.keys(localStorage).filter(key => 
            key.startsWith('auto_backup_') && key !== backupKey
          );
          oldBackups.sort().reverse();
          oldBackups.slice(4).forEach(key => localStorage.removeItem(key));
          
          setAutoBackupStatus(`Создана резервная копия ${now.toLocaleDateString('ru-RU')}`);
          setTimeout(() => setAutoBackupStatus(''), 5000);
        } catch (error) {
          console.error('Ошибка автоматического резервного копирования:', error);
        }
      }
    };

    const timer = setTimeout(checkAndCreateBackup, 2000);
    const interval = setInterval(checkAndCreateBackup, 24 * 60 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [listeners, lastBackupDate]);

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

  const downloadExampleExcel = () => {
    const exampleData = [
      { 'ФИО': 'Иванов Иван Иванович', 'Должность': 'Электромонтер', 'Подразделение': 'Цех №1' },
      { 'ФИО': 'Петров Петр Петрович', 'Должность': 'Слесарь', 'Подразделение': 'Цех №2' },
      { 'ФИО': 'Сидорова Анна Сергеевна', 'Должность': 'Инженер', 'Подразделение': 'Отдел ПТО' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    
    // Устанавливаем ширину колонок
    worksheet['!cols'] = [
      { wch: 35 }, // ФИО
      { wch: 25 }, // Должность
      { wch: 25 }  // Подразделение
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Слушатели');
    
    XLSX.writeFile(workbook, 'Образец_импорта_слушателей.xlsx');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

        if (jsonData.length === 0) {
          setImportError('Файл пуст или не содержит данных');
          return;
        }

        const newListeners: Listener[] = [];
        let errorCount = 0;

        jsonData.forEach((row, index) => {
          const fullName = row['ФИО'] || row['fullName'] || row['name'];
          const position = row['Должность'] || row['position'] || row['job'];
          const department = row['Подразделение'] || row['department'] || row['unit'];

          if (!fullName || !position || !department) {
            errorCount++;
            return;
          }

          const listenerId = generateListenerId();
          newListeners.push({
            id: listenerId,
            fullName: String(fullName).trim(),
            position: String(position).trim(),
            department: String(department).trim(),
            assignedPrograms: [],
            completedPrograms: 0,
            totalPrograms: 0,
            progress: 0,
            lastActivity: new Date().toISOString()
          });
        });

        if (newListeners.length === 0) {
          setImportError('Не удалось импортировать слушателей. Проверьте формат файла.');
          return;
        }

        setListeners([...listeners, ...newListeners]);
        setImportedCount(newListeners.length);
        
        if (errorCount > 0) {
          setImportError(`Импортировано: ${newListeners.length}. Пропущено строк с ошибками: ${errorCount}`);
        }

        setTimeout(() => {
          setShowImportDialog(false);
          setImportError(null);
          setImportedCount(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 3000);

      } catch (error) {
        setImportError('Ошибка при чтении файла. Убедитесь, что это Excel-файл.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const exportListenersToExcel = () => {
    // Экспортируем отфильтрованный список, если активен поиск
    const dataToExport = searchQuery ? filteredListeners : listeners;
    
    if (dataToExport.length === 0) {
      return;
    }

    const exportData = dataToExport.map((listener, index) => ({
      '№': index + 1,
      'ФИО': listener.fullName,
      'Должность': listener.position,
      'Подразделение': listener.department,
      'Назначенные программы': listener.assignedPrograms.join(', ') || 'Нет',
      'Назначено программ': listener.totalPrograms,
      'Завершено программ': listener.completedPrograms,
      'Прогресс %': listener.progress,
      'Последняя активность': new Date(listener.lastActivity).toLocaleDateString('ru-RU'),
      'Ссылка для входа': `${window.location.origin}/#/listener/${listener.id}`,
      'ID слушателя': listener.id
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Устанавливаем ширину колонок
    worksheet['!cols'] = [
      { wch: 5 },  // №
      { wch: 35 }, // ФИО
      { wch: 25 }, // Должность
      { wch: 25 }, // Подразделение
      { wch: 40 }, // Назначенные программы
      { wch: 18 }, // Назначено программ
      { wch: 18 }, // Завершено программ
      { wch: 12 }, // Прогресс %
      { wch: 20 }, // Последняя активность
      { wch: 60 }, // Ссылка для входа
      { wch: 20 }  // ID слушателя
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Список слушателей');
    
    const currentDate = new Date().toLocaleDateString('ru-RU').replace(/\./g, '_');
    const fileName = searchQuery 
      ? `Слушатели_отфильтровано_${currentDate}.xlsx`
      : `Слушатели_${currentDate}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  const createBackup = () => {
    const backupData = {
      listeners: listeners,
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalListeners: listeners.length
    };

    const programsData: { [key: string]: string[] } = {};
    listeners.forEach(listener => {
      const savedPrograms = localStorage.getItem(`listener_programs_${listener.id}`);
      if (savedPrograms) {
        programsData[listener.id] = JSON.parse(savedPrograms);
      }
    });
    
    const fullBackup = {
      ...backupData,
      programs: programsData
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const currentDate = new Date().toLocaleDateString('ru-RU').replace(/\./g, '_');
    link.href = url;
    link.download = `Резервная_копия_${currentDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAutoBackup = (backupKey: string) => {
    const backupData = localStorage.getItem(backupKey);
    if (!backupData) return;

    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = backupKey.replace('auto_backup_', '');
    link.href = url;
    link.download = `Автокопия_${date.replace(/-/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAutoBackups = () => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('auto_backup_'))
      .sort()
      .reverse()
      .map(key => ({
        key,
        date: key.replace('auto_backup_', ''),
        data: JSON.parse(localStorage.getItem(key) || '{}')
      }));
  };

  const handleBackupFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        if (!backupData.listeners || !Array.isArray(backupData.listeners)) {
          setImportError('Неверный формат файла резервной копии');
          return;
        }

        if (window.confirm(`Загрузить ${backupData.totalListeners} слушателей из резервной копии? Текущие данные будут заменены.`)) {
          setListeners(backupData.listeners);
          localStorage.setItem('listeners', JSON.stringify(backupData.listeners));

          if (backupData.programs) {
            Object.keys(backupData.programs).forEach(listenerId => {
              localStorage.setItem(`listener_programs_${listenerId}`, JSON.stringify(backupData.programs[listenerId]));
            });
          }

          setImportedCount(backupData.listeners.length);
          setTimeout(() => {
            setShowBackupDialog(false);
            setImportError(null);
            setImportedCount(0);
            if (backupFileInputRef.current) {
              backupFileInputRef.current.value = '';
            }
          }, 2500);
        }
      } catch (error) {
        setImportError('Ошибка при чтении файла резервной копии');
      }
    };

    reader.readAsText(file);
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
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              <div className="flex-1 md:w-96 min-w-[200px]">
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
                onClick={exportListenersToExcel}
                variant="outline"
                className="whitespace-nowrap"
                disabled={listeners.length === 0}
                title={searchQuery ? `Экспорт ${filteredListeners.length} отфильтрованных слушателей` : `Экспорт всех ${listeners.length} слушателей`}
              >
                <Icon name="Download" className="h-4 w-4 mr-2" />
                Экспорт Excel
                {searchQuery && filteredListeners.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredListeners.length}
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Icon name="Upload" className="h-4 w-4 mr-2" />
                Импорт Excel
              </Button>
              <Button 
                onClick={() => setShowBackupDialog(true)}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Icon name="Database" className="h-4 w-4 mr-2" />
                Резервная копия
              </Button>
              <Button 
                onClick={() => setShowRegisterDialog(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 whitespace-nowrap"
              >
                <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                Зарегистрировать
              </Button>
            </div>
          </div>

          {autoBackupStatus && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Icon name="CheckCircle" className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">{autoBackupStatus}</p>
                    <p className="text-xs text-green-700">Данные автоматически сохранены</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                    Автоматически
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {lastBackupDate && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Shield" className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900">
                      Последняя автоматическая резервная копия: {new Date(lastBackupDate).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                    {listeners.length} слушателей
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

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

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Info" className="h-5 w-5 text-blue-600" />
                Персональные ссылки
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900 space-y-2">
              <p>• После регистрации система генерирует уникальную ссылку для входа</p>
              <p>• Скопируйте ссылку и отправьте слушателю любым удобным способом</p>
              <p>• Слушатель переходит по ссылке и попадает на страницу входа в личный кабинет</p>
              <p>• Все назначенные программы будут доступны в его личном кабинете</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileSpreadsheet" className="h-5 w-5 text-green-600" />
                Работа с Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-green-900 space-y-2">
              <p>• <strong>Импорт:</strong> Массовая регистрация слушателей из Excel-файла</p>
              <p>• <strong>Экспорт:</strong> Выгрузка всех слушателей с прогрессом обучения</p>
              <p>• <strong>Формат:</strong> ФИО, Должность, Подразделение (обязательные поля)</p>
              <p>• <strong>Образец:</strong> Скачайте шаблон для заполнения через диалог импорта</p>
            </CardContent>
          </Card>
        </div>
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

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileSpreadsheet" className="h-5 w-5" />
              Импорт слушателей из Excel
            </DialogTitle>
            <DialogDescription>
              Загрузите файл Excel с данными слушателей
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-2">Формат файла Excel:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Колонка "ФИО" — полное имя слушателя</li>
                        <li>Колонка "Должность" — должность или профессия</li>
                        <li>Колонка "Подразделение" — цех, отдел, участок</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={downloadExampleExcel}
                    className="w-full"
                  >
                    <Icon name="Download" className="h-4 w-4 mr-2" />
                    Скачать образец таблицы
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Выберите Excel файл</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {importError && (
              <Card className={importedCount > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Icon 
                      name={importedCount > 0 ? "CheckCircle" : "AlertCircle"} 
                      className={`h-5 w-5 mt-0.5 ${importedCount > 0 ? "text-green-600" : "text-red-600"}`} 
                    />
                    <p className={`text-sm ${importedCount > 0 ? "text-green-900" : "text-red-900"}`}>
                      {importError}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {importedCount > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Icon name="Users" className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">{importedCount}</p>
                      <p className="text-sm text-green-700">слушателей импортировано</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowImportDialog(false);
                setImportError(null);
                setImportedCount(0);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Database" className="h-5 w-5 text-blue-600" />
              Резервная копия данных
            </DialogTitle>
            <DialogDescription>
              Создание и восстановление резервных копий всех данных системы
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Download" className="h-5 w-5 text-blue-600" />
                  Создать резервную копию
                </CardTitle>
                <CardDescription>
                  Сохраните все данные в защищённый JSON-файл
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Слушателей в системе:</span>
                    <Badge variant="outline" className="font-bold">{listeners.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Дата создания копии:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-blue-900">
                  <p className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Все данные слушателей (ФИО, должности, подразделения)</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Назначенные программы обучения</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Прогресс и статистика обучения</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Персональные ссылки для входа</span>
                  </p>
                </div>
                <Button 
                  onClick={createBackup}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={listeners.length === 0}
                >
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Скачать резервную копию
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Upload" className="h-5 w-5 text-green-600" />
                  Восстановить из резервной копии
                </CardTitle>
                <CardDescription>
                  Загрузите ранее созданный файл резервной копии
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertTriangle" className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-900">
                      <p className="font-medium mb-1">⚠️ Внимание!</p>
                      <p>Восстановление из резервной копии заменит все текущие данные. Рекомендуется сначала создать резервную копию текущего состояния.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleBackupFileSelect}
                    className="hidden"
                    id="backup-file-input"
                  />
                  <Label 
                    htmlFor="backup-file-input"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-400 transition-colors"
                  >
                    <Icon name="FileJson" className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Выберите файл резервной копии (.json)
                    </span>
                  </Label>
                </div>

                {importError && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-red-900">
                        <Icon name="AlertCircle" className="h-5 w-5" />
                        <p className="text-sm">{importError}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {importedCount > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <Icon name="CheckCircle" className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-900">{importedCount}</p>
                          <p className="text-sm text-green-700">слушателей восстановлено из резервной копии</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {getAutoBackups().length > 0 && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="History" className="h-5 w-5 text-purple-600" />
                    Автоматические резервные копии
                  </CardTitle>
                  <CardDescription>
                    Система автоматически создаёт копии каждую неделю
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getAutoBackups().map((backup) => (
                    <div 
                      key={backup.key}
                      className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Icon name="Database" className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-purple-900">
                            {new Date(backup.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-purple-700">
                            {backup.data.totalListeners || 0} слушателей
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => downloadAutoBackup(backup.key)}
                        variant="outline"
                        size="sm"
                        className="text-purple-700 border-purple-300 hover:bg-purple-50"
                      >
                        <Icon name="Download" className="h-4 w-4 mr-2" />
                        Скачать
                      </Button>
                    </div>
                  ))}
                  <div className="bg-purple-100/50 rounded-lg p-3 text-xs text-purple-800">
                    <div className="flex items-start gap-2">
                      <Icon name="Shield" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>Система хранит последние 4 автоматические копии. Старые копии удаляются автоматически.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Icon name="Info" className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-900 space-y-2">
                    <p className="font-medium">Рекомендации по работе с резервными копиями:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Система автоматически создаёт копии каждую неделю</li>
                      <li>Скачивайте важные автоматические копии на внешние носители</li>
                      <li>Создавайте ручные копии перед важными изменениями</li>
                      <li>Храните файлы копий в надёжном месте (облако, внешний диск)</li>
                      <li>Перед восстановлением убедитесь в правильности выбранного файла</li>
                      <li>После восстановления проверьте корректность данных</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBackupDialog(false);
                setImportError(null);
                setImportedCount(0);
                if (backupFileInputRef.current) {
                  backupFileInputRef.current.value = '';
                }
              }}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}