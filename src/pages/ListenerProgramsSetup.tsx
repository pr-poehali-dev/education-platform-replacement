import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  icon: string;
  color: string;
}

interface ListenerProgramsSetupProps {
  listenerId: string;
  onBack: () => void;
  onSave: () => void;
}

export default function ListenerProgramsSetup({ listenerId, onBack, onSave }: ListenerProgramsSetupProps) {
  const [listener, setListener] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('listeners');
    if (saved) {
      const listeners = JSON.parse(saved);
      const foundListener = listeners.find((l: any) => l.id === listenerId);
      if (foundListener) {
        setListener(foundListener);
      }
    }
  }, [listenerId]);

  const allPrograms: Program[] = [
    {
      id: '1',
      title: 'Работа на высоте',
      description: 'Комплексное обучение безопасной работе на высоте',
      duration: '16 часов',
      modules: 8,
      icon: 'Mountain',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '2',
      title: 'Электробезопасность',
      description: 'Правила работы с электроустановками до и выше 1000В',
      duration: '24 часа',
      modules: 12,
      icon: 'Zap',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: '3',
      title: 'Пожарная безопасность',
      description: 'ПТМ для руководителей и ответственных лиц',
      duration: '12 часов',
      modules: 6,
      icon: 'Flame',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: '4',
      title: 'Охрана труда для руководителей',
      description: 'Обучение по программе А для руководителей организаций',
      duration: '40 часов',
      modules: 20,
      icon: 'Briefcase',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: '5',
      title: 'Оказание первой помощи',
      description: 'Практические навыки оказания первой помощи пострадавшим',
      duration: '8 часов',
      modules: 4,
      icon: 'Heart',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      title: 'Работа с грузоподъемным оборудованием',
      description: 'Безопасная эксплуатация кранов и подъемников',
      duration: '20 часов',
      modules: 10,
      icon: 'Construction',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(() => {
    const saved = localStorage.getItem(`listener_programs_${listenerId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(`listener_programs_${listenerId}`, JSON.stringify(selectedPrograms));
  }, [selectedPrograms, listenerId]);

  const toggleProgram = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const handleSave = () => {
    const saved = localStorage.getItem('listeners');
    if (saved) {
      const listeners = JSON.parse(saved);
      const updatedListeners = listeners.map((l: any) => 
        l.id === listenerId 
          ? { 
              ...l, 
              assignedPrograms: selectedPrograms.map(id => 
                allPrograms.find(p => p.id === id)?.title || ''
              ),
              totalPrograms: selectedPrograms.length,
              lastActivity: new Date().toISOString()
            }
          : l
      );
      localStorage.setItem('listeners', JSON.stringify(updatedListeners));
    }
    onSave();
  };

  const listenerLink = `${window.location.origin}/listener/${listenerId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Icon name="Settings" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Настройка программ обучения</h1>
              <p className="text-xs text-muted-foreground">Выберите программы для слушателя</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!listener ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center">
                <Icon name="AlertCircle" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Слушатель не найден</h3>
                <p className="text-muted-foreground mb-4">Не удалось найти информацию о слушателе</p>
                <Button onClick={onBack}>
                  <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                  Вернуться назад
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" className="h-5 w-5" />
                  Информация о слушателе
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-lg">
                      {listener.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{listener.fullName}</p>
                    <p className="text-sm text-muted-foreground">{listener.position}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Building" className="h-4 w-4 text-muted-foreground" />
                    <span>{listener.department}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Выбрано программ</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedPrograms.length}</p>
                  <p className="text-sm text-muted-foreground">из {allPrograms.length} доступных</p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium mb-2">Персональная ссылка</p>
                  <div className="p-3 bg-muted rounded-lg break-all text-xs">
                    {listenerLink}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigator.clipboard.writeText(listenerLink)}
                  >
                    <Icon name="Copy" className="h-4 w-4 mr-2" />
                    Скопировать ссылку
                  </Button>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    onClick={handleSave} 
                    className="w-full bg-gradient-to-r from-green-600 to-green-500"
                    disabled={selectedPrograms.length === 0}
                  >
                    <Icon name="Save" className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </Button>
                  <Button variant="outline" onClick={onBack} className="w-full">
                    Отменить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Доступные программы обучения</h2>
              <p className="text-muted-foreground">Выберите программы, которые должен пройти слушатель</p>
            </div>

            <div className="grid gap-4">
              {allPrograms.map((program) => {
                const isSelected = selectedPrograms.includes(program.id);
                return (
                  <Card 
                    key={program.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                    }`}
                    onClick={() => toggleProgram(program.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleProgram(program.id)}
                            className="mt-1"
                          />
                          <div className={`bg-gradient-to-br ${program.color} p-3 rounded-xl`}>
                            <Icon name={program.icon} className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {program.title}
                              {isSelected && (
                                <Badge variant="default" className="ml-2">
                                  Назначено
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">{program.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon name="Clock" className="h-4 w-4 text-muted-foreground" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="BookOpen" className="h-4 w-4 text-muted-foreground" />
                          <span>{program.modules} модулей</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}