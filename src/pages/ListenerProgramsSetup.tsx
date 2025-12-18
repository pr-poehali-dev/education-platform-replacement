import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { trainingPrograms, type TrainingProgram } from '@/data/trainingPrograms';

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

  const allPrograms = trainingPrograms;

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(() => {
    const saved = localStorage.getItem(`listener_programs_${listenerId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTests, setSelectedTests] = useState<string[]>(() => {
    const saved = localStorage.getItem(`listener_tests_${listenerId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [availableTests, setAvailableTests] = useState<any[]>([]);
  
  const [testDeadlines, setTestDeadlines] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`listener_test_deadlines_${listenerId}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const savedTests = localStorage.getItem('tests_catalog');
    if (savedTests) {
      setAvailableTests(JSON.parse(savedTests));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`listener_programs_${listenerId}`, JSON.stringify(selectedPrograms));
  }, [selectedPrograms, listenerId]);

  useEffect(() => {
    localStorage.setItem(`listener_tests_${listenerId}`, JSON.stringify(selectedTests));
  }, [selectedTests, listenerId]);

  useEffect(() => {
    localStorage.setItem(`listener_test_deadlines_${listenerId}`, JSON.stringify(testDeadlines));
  }, [testDeadlines, listenerId]);

  const toggleProgram = (programId: string) => {
    setSelectedPrograms(prev => 
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const toggleTest = (testId: string) => {
    setSelectedTests(prev => {
      const isRemoving = prev.includes(testId);
      if (isRemoving) {
        // Remove deadline when unchecking
        setTestDeadlines(current => {
          const updated = { ...current };
          delete updated[testId];
          return updated;
        });
        return prev.filter(id => id !== testId);
      } else {
        // Set default deadline (30 days from now) when checking
        const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        setTestDeadlines(current => ({
          ...current,
          [testId]: defaultDeadline
        }));
        return [...prev, testId];
      }
    });
  };

  const handleDeadlineChange = (testId: string, deadline: string) => {
    setTestDeadlines(prev => ({
      ...prev,
      [testId]: deadline
    }));
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

                <div className="pt-4 border-t space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Выбрано программ</p>
                    <p className="text-3xl font-bold text-blue-600">{selectedPrograms.length}</p>
                    <p className="text-sm text-muted-foreground">из {allPrograms.length} доступных</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Выбрано тестов</p>
                    <p className="text-3xl font-bold text-purple-600">{selectedTests.length}</p>
                    <p className="text-sm text-muted-foreground">из {availableTests.length} доступных</p>
                  </div>
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
                          <span>{program.totalHours} часов</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="BookOpen" className="h-4 w-4 text-muted-foreground" />
                          <span>{program.modules.length} модулей</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Award" className="h-4 w-4 text-muted-foreground" />
                          <span>{program.category}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Назначение тестов</h2>
                <p className="text-muted-foreground">Выберите тесты для проверки знаний слушателя</p>
              </div>

              {availableTests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Icon name="FileX" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Тестов пока нет. Создайте тесты в каталоге.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {availableTests.map((test) => {
                    const isSelected = selectedTests.includes(test.id);
                    return (
                      <Card 
                        key={test.id} 
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                        }`}
                        onClick={() => toggleTest(test.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Checkbox 
                                checked={isSelected}
                                onCheckedChange={() => toggleTest(test.id)}
                                className="mt-1"
                              />
                              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                                <Icon name="FileCheck" className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {test.title}
                                  {isSelected && (
                                    <Badge className="ml-2 bg-purple-600">
                                      Назначено
                                    </Badge>
                                  )}
                                </CardTitle>
                                {test.description && (
                                  <CardDescription className="mt-1">{test.description}</CardDescription>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Icon name="FileQuestion" className="h-4 w-4 text-muted-foreground" />
                                <span>{test.questionCount} вопросов</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Clock" className="h-4 w-4 text-muted-foreground" />
                                <span>{test.duration} минут</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Icon name="Target" className="h-4 w-4 text-muted-foreground" />
                                <span>Проходной балл: {test.passingScore}%</span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="pt-3 border-t">
                                <label className="block text-sm font-medium mb-2">
                                  <Icon name="Calendar" className="h-4 w-4 inline mr-2 text-purple-600" />
                                  Крайний срок сдачи:
                                </label>
                                <input
                                  type="date"
                                  value={testDeadlines[test.id] || ''}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleDeadlineChange(test.id, e.target.value);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}