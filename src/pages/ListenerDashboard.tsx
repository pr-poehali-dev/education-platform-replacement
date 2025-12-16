import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TestingInterface from '@/components/TestingInterface';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

interface TestSession {
  questions: TestQuestion[];
  currentQuestion: number;
  timeRemaining: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface ListenerDashboardProps {
  listener: {
    fullName: string;
    position: string;
    department: string;
    listenerId?: string;
  };
  onLogout: () => void;
}

export default function ListenerDashboard({ listener, onLogout }: ListenerDashboardProps) {
  const [activeTab, setActiveTab] = useState('programs');
  const [testMode, setTestMode] = useState<'practice' | 'exam' | null>(null);
  const [testSession, setTestSession] = useState<TestSession>({
    questions: [],
    currentQuestion: 0,
    timeRemaining: 0,
    status: 'not-started'
  });
  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolData, setProtocolData] = useState<any>(null);

  const assignedPrograms = [
    {
      id: '1',
      title: 'Работа на высоте',
      description: 'Комплексное обучение безопасной работе на высоте',
      duration: '16 часов',
      modules: 8,
      completedModules: 5,
      progress: 62,
      icon: 'Mountain',
      color: 'from-orange-500 to-red-500',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Электробезопасность',
      description: 'Правила работы с электроустановками до и выше 1000В',
      duration: '24 часа',
      modules: 12,
      completedModules: 0,
      progress: 0,
      icon: 'Zap',
      color: 'from-yellow-500 to-orange-500',
      status: 'not-started'
    },
    {
      id: '3',
      title: 'Пожарная безопасность',
      description: 'ПТМ для руководителей и ответственных лиц',
      duration: '12 часов',
      modules: 6,
      completedModules: 6,
      progress: 100,
      icon: 'Flame',
      color: 'from-red-500 to-pink-500',
      status: 'completed'
    }
  ];

  const certificates = [
    {
      id: '1',
      number: '№ 1001',
      program: 'Пожарная безопасность',
      issueDate: '15.10.2024',
      validUntil: '15.10.2025',
      score: 92
    }
  ];

  const sampleQuestions: TestQuestion[] = [
    {
      id: '1',
      question: 'Какова минимальная высота, с которой работы считаются работами на высоте?',
      options: ['1 метр', '1.5 метра', '1.8 метра', '2 метра'],
      correctAnswer: 2
    },
    {
      id: '2',
      question: 'Как часто должна проводиться проверка средств индивидуальной защиты от падения?',
      options: ['Раз в месяц', 'Перед каждым использованием', 'Раз в квартал', 'Раз в год'],
      correctAnswer: 1
    },
    {
      id: '3',
      question: 'Какой максимальный срок действия наряда-допуска на работы на высоте?',
      options: ['1 день', '3 дня', '5 дней', '15 дней'],
      correctAnswer: 3
    }
  ];

  const startTest = (mode: 'practice' | 'exam') => {
    setTestMode(mode);
    setTestSession({
      questions: sampleQuestions.map(q => ({ ...q, userAnswer: undefined })),
      currentQuestion: 0,
      timeRemaining: mode === 'exam' ? 45 * 60 : 0,
      status: 'in-progress'
    });
  };

  const answerQuestion = (answerIndex: number) => {
    setTestSession(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[prev.currentQuestion].userAnswer = answerIndex;
      return { ...prev, questions: newQuestions };
    });
  };

  const nextQuestion = () => {
    if (testSession.currentQuestion < testSession.questions.length - 1) {
      setTestSession(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  const prevQuestion = () => {
    if (testSession.currentQuestion > 0) {
      setTestSession(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    }
  };

  const finishTest = () => {
    const correctAnswers = testSession.questions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / testSession.questions.length) * 100);
    const passed = score >= 80;

    const protocol = {
      number: `№ ${Math.floor(Math.random() * 10000)}`,
      date: new Date().toLocaleDateString('ru-RU'),
      student: listener.fullName,
      studentPosition: listener.position,
      inspector: 'Петрова Анна Сергеевна',
      inspectorPosition: 'Инспектор по охране труда',
      testName: 'Работа на высоте',
      totalQuestions: testSession.questions.length,
      correctAnswers,
      score,
      passed,
      questions: testSession.questions
    };

    setProtocolData(protocol);
    setShowProtocol(true);
    setTestSession(prev => ({ ...prev, status: 'completed' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-xl">
                <Icon name="GraduationCap" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Обучающий портал
                </h1>
                <p className="text-xs text-muted-foreground">Личный кабинет слушателя</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    {listener.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{listener.fullName}</p>
                  <p className="text-xs text-muted-foreground">{listener.position}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <Icon name="LogOut" className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-green-900">
                  Добро пожаловать, {listener.fullName.split(' ')[1]}!
                </h3>
                <p className="text-sm text-green-700">
                  {listener.position} • {listener.department}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(assignedPrograms.reduce((acc, p) => acc + p.progress, 0) / assignedPrograms.length)}%
                </p>
                <p className="text-xs text-green-700">Общий прогресс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="programs">
              <Icon name="BookOpen" className="h-4 w-4 mr-2" />
              Мои программы
            </TabsTrigger>
            <TabsTrigger value="testing">
              <Icon name="ClipboardCheck" className="h-4 w-4 mr-2" />
              Тестирование
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Icon name="Award" className="h-4 w-4 mr-2" />
              Сертификаты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="programs">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Назначенные программы обучения</h2>
                <p className="text-muted-foreground">Программы, которые вы должны пройти</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {assignedPrograms.map((program) => (
                  <Card key={program.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`bg-gradient-to-br ${program.color} p-3 rounded-xl`}>
                          <Icon name={program.icon} className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant={program.status === 'completed' ? 'default' : program.status === 'in-progress' ? 'secondary' : 'outline'}>
                          {program.status === 'completed' ? 'Завершено' : program.status === 'in-progress' ? 'В процессе' : 'Не начато'}
                        </Badge>
                      </div>
                      <CardTitle className="mt-4">{program.title}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Прогресс</span>
                            <span className="font-medium">{program.completedModules}/{program.modules} модулей</span>
                          </div>
                          <Progress value={program.progress} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Длительность</span>
                          <span className="font-medium">{program.duration}</span>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          disabled={program.status === 'completed'}
                        >
                          <Icon name={program.status === 'completed' ? 'Check' : 'Play'} className="h-4 w-4 mr-2" />
                          {program.status === 'completed' ? 'Завершено' : program.status === 'in-progress' ? 'Продолжить' : 'Начать обучение'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testing">
            <TestingInterface
              testMode={testMode}
              testSession={testSession}
              onStartTest={startTest}
              onAnswerQuestion={answerQuestion}
              onNextQuestion={nextQuestion}
              onPrevQuestion={prevQuestion}
              onFinishTest={finishTest}
              showProtocol={showProtocol}
              setShowProtocol={setShowProtocol}
              protocolData={protocolData}
              currentUser={{ name: listener.fullName, role: 'student', position: listener.position }}
            />
          </TabsContent>

          <TabsContent value="certificates">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Мои сертификаты</h2>
                <p className="text-muted-foreground">Полученные сертификаты и удостоверения</p>
              </div>

              {certificates.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                            <Icon name="Award" className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">Удостоверение {cert.number}</CardTitle>
                            <CardDescription>{cert.program}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Выдано</span>
                            <span>{cert.issueDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Действительно до</span>
                            <span className="font-medium">{cert.validUntil}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Балл</span>
                            <Badge variant="default">{cert.score}%</Badge>
                          </div>
                          <Button variant="outline" size="sm" className="w-full mt-2">
                            <Icon name="Download" className="h-4 w-4 mr-2" />
                            Скачать PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="Award" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      У вас пока нет сертификатов. Завершите программу обучения и пройдите тестирование!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
