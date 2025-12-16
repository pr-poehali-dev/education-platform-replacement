import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import TestingInterface from '@/components/TestingInterface';
import { trainingPrograms, getProgramById } from '@/data/trainingPrograms';
import { getRandomQuestions } from '@/data/testQuestions';

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
  const [activeTab, setActiveTab] = useState('my-page');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [testMode, setTestMode] = useState<'practice' | 'exam' | null>(null);
  const [testSession, setTestSession] = useState<TestSession>({
    questions: [],
    currentQuestion: 0,
    timeRemaining: 0,
    status: 'not-started'
  });
  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolData, setProtocolData] = useState<any>(null);
  const [assignedPrograms, setAssignedPrograms] = useState<any[]>([]);

  const certificates: any[] = [];

  useEffect(() => {
    if (listener.listenerId) {
      const saved = localStorage.getItem(`listener_programs_${listener.listenerId}`);
      if (saved) {
        const programIds = JSON.parse(saved);
        const programs = programIds
          .map((id: string) => getProgramById(id))
          .filter(Boolean)
          .map((program: any, index: number) => ({
            ...program,
            progress: Math.floor(Math.random() * 100),
            status: Math.random() > 0.5 ? 'in-progress' : 'not-started',
            deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')
          }));
        setAssignedPrograms(programs);
      }
    }
  }, [listener.listenerId]);

  const sampleQuestions: TestQuestion[] = getRandomQuestions(20).map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer
  }));

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

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
                  ГорТех Аттестация
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
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-green-900">
                    Добро пожаловать, {listener.fullName.split(' ')[1]}!
                  </h3>
                  <p className="text-xs text-green-700">
                    {currentTime.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {currentTime.toLocaleTimeString('ru-RU')}
                  </p>
                </div>
                <Badge className="bg-green-600 text-white">
                  <Icon name="User" className="h-3 w-3 mr-1" />
                  Слушатель
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-green-200">
                <div>
                  <p className="text-xs text-green-700 mb-1">Предприятие</p>
                  <p className="font-semibold text-green-900">ГорТех Аттестация</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">ФИО</p>
                  <p className="font-semibold text-green-900">{listener.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Должность</p>
                  <p className="font-semibold text-green-900">{listener.position}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 mb-1">Подразделение</p>
                  <p className="font-semibold text-green-900">{listener.department}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white grid grid-cols-4 w-full">
            <TabsTrigger value="my-page">
              <Icon name="Home" className="h-4 w-4 mr-2" />
              Моя страница
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Icon name="BookOpen" className="h-4 w-4 mr-2" />
              Блок обучения
            </TabsTrigger>
            <TabsTrigger value="testing">
              <Icon name="ClipboardCheck" className="h-4 w-4 mr-2" />
              Блок тестирования
            </TabsTrigger>
            <TabsTrigger value="instructions">
              <Icon name="FileText" className="h-4 w-4 mr-2" />
              Инструкции
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-page">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Моя страница</h2>
                <p className="text-muted-foreground">Личная информация и прогресс обучения</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
                        <Icon name="BookOpen" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardDescription>Программ назначено</CardDescription>
                        <CardTitle className="text-3xl">{assignedPrograms.length}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                        <Icon name="CheckCircle" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardDescription>Программ завершено</CardDescription>
                        <CardTitle className="text-3xl">{assignedPrograms.filter(p => p.status === 'completed').length}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl">
                        <Icon name="Award" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardDescription>Сертификатов получено</CardDescription>
                        <CardTitle className="text-3xl">{certificates.length}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Личная информация</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Предприятие</Label>
                        <p className="text-lg font-medium">ГорТех Аттестация</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">ФИО полностью</Label>
                        <p className="text-lg font-medium">{listener.fullName}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Роль</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-green-600">
                            <Icon name="User" className="h-3 w-3 mr-1" />
                            Слушатель
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-muted-foreground">Должность</Label>
                        <p className="text-lg font-medium">{listener.position}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Подразделение</Label>
                        <p className="text-lg font-medium">{listener.department}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Дата и время</Label>
                        <p className="text-lg font-medium">
                          {currentTime.toLocaleDateString('ru-RU')} • {currentTime.toLocaleTimeString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {assignedPrograms.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Активные программы</CardTitle>
                    <CardDescription>Программы, которые вы проходите сейчас</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignedPrograms.filter(p => p.status === 'in-progress').map((program) => (
                        <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`bg-gradient-to-br ${program.color} p-2 rounded-lg`}>
                              <Icon name={program.icon} className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{program.title}</p>
                              <p className="text-sm text-muted-foreground">{program.modules?.length || 0} модулей • {program.totalHours} часов</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold">{program.progress}%</p>
                              <p className="text-xs text-muted-foreground">Прогресс</p>
                            </div>
                            <Button size="sm" onClick={() => setActiveTab('programs')}>
                              <Icon name="Play" className="h-4 w-4 mr-1" />
                              Продолжить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

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
                            <span className="font-medium">{program.progress}%</span>
                          </div>
                          <Progress value={program.progress} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Модули</span>
                          <span className="font-medium">{program.modules?.length || 0} модулей</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Длительность</span>
                          <span className="font-medium">{program.totalHours} часов</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Срок сдачи</span>
                          <span className="font-medium text-orange-600">{program.deadline}</span>
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

          <TabsContent value="instructions">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Инструкции</h2>
                <p className="text-muted-foreground">Инструкции по охране труда и пожарной безопасности</p>
              </div>

              <Card>
                <CardContent className="py-12 text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Icon name="FileText" className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Инструкции будут доступны</h3>
                  <p className="text-muted-foreground mb-4">
                    После назначения программ обучения здесь появятся необходимые инструкции
                  </p>
                </CardContent>
              </Card>
            </div>
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