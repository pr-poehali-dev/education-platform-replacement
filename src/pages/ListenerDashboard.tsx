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
import { getAllProgramsProgress, getProgramStatus } from '@/utils/progressUtils';

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
  onStartLearning?: (programId: string) => void;
  onNavigateToVideos?: () => void;
}

export default function ListenerDashboard({ listener, onLogout, onStartLearning, onNavigateToVideos }: ListenerDashboardProps) {
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
        const progressMap = getAllProgramsProgress(listener.listenerId, programIds);
        
        const programs = programIds
          .map((id: string) => {
            const program = getProgramById(id);
            if (!program) return null;
            
            const progress = progressMap.get(id) || 0;
            const status = getProgramStatus(listener.listenerId!, id);
            
            return {
              ...program,
              progress,
              status,
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')
            };
          })
          .filter(Boolean);
        
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
                  АО "ГРК "Западная""
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
                  <p className="font-semibold text-green-900">АО "ГРК "Западная""</p>
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
          <TabsList className="bg-white grid grid-cols-6 w-full">
            <TabsTrigger value="my-page">
              <Icon name="Home" className="h-4 w-4 mr-2" />
              Моя страница
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Icon name="BookOpen" className="h-4 w-4 mr-2" />
              Блок обучения
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Icon name="Video" className="h-4 w-4 mr-2" />
              Видеобиблиотека
            </TabsTrigger>
            <TabsTrigger value="testing">
              <Icon name="ClipboardCheck" className="h-4 w-4 mr-2" />
              Блок тестирования
            </TabsTrigger>
            <TabsTrigger value="progress">
              <Icon name="TrendingUp" className="h-4 w-4 mr-2" />
              Прогресс
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

              {assignedPrograms.length > 0 && assignedPrograms.some(p => p.status === 'in-progress') && (
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="PlayCircle" className="h-5 w-5 text-blue-600" />
                      Активные программы
                    </CardTitle>
                    <CardDescription>Продолжите изучение начатых курсов</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assignedPrograms.filter(p => p.status === 'in-progress').map((program) => (
                        <Card key={program.id} className="border-2 hover:border-blue-300 transition-all hover:shadow-md cursor-pointer" onClick={() => onStartLearning?.(program.id)}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`bg-gradient-to-br ${program.color} p-2.5 rounded-xl`}>
                                  <Icon name={program.icon} className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-base">{program.title}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm text-muted-foreground">{program.modules?.length || 0} модулей</p>
                                    <Badge variant="outline" className="text-xs">
                                      {program.totalHours}ч
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-600">{program.progress}%</p>
                                  <p className="text-xs text-muted-foreground">завершено</p>
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Icon name="Play" className="h-4 w-4 mr-1" />
                                  Продолжить
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3">
                              <Progress value={program.progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {assignedPrograms.length > 0 && assignedPrograms.some(p => p.status === 'not-started') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="BookOpen" className="h-5 w-5" />
                      Новые программы
                    </CardTitle>
                    <CardDescription>Начните изучение новых курсов</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {assignedPrograms.filter(p => p.status === 'not-started').map((program) => (
                        <Card key={program.id} className="hover:shadow-md transition-all cursor-pointer border-2 hover:border-green-300" onClick={() => onStartLearning?.(program.id)}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className={`bg-gradient-to-br ${program.color} p-2 rounded-lg`}>
                                <Icon name={program.icon} className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{program.title}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {program.modules?.length} модулей
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {program.totalHours}ч
                                  </Badge>
                                </div>
                                <Button size="sm" className="w-full mt-3" variant="outline">
                                  <Icon name="Play" className="h-3 w-3 mr-1" />
                                  Начать
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                          onClick={() => onStartLearning?.(program.id)}
                        >
                          <Icon name={program.status === 'completed' ? 'Check' : 'Play'} className="h-4 w-4 mr-2" />
                          {program.status === 'completed' ? 'Завершено' : program.status === 'in-progress' ? 'Продолжить обучение' : 'Начать обучение'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Видеобиблиотека</h2>
                <p className="text-muted-foreground">Учебные видеоматериалы и плейлисты</p>
              </div>

              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all cursor-pointer" onClick={onNavigateToVideos}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                      <Icon name="PlayCircle" className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Открыть видеобиблиотеку</h3>
                      <p className="text-muted-foreground">
                        Плейлисты и рекомендации учебных видеоматериалов
                      </p>
                    </div>
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Icon name="Video" className="h-5 w-5 mr-2" />
                      Перейти к видео
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                        <Icon name="PlayCircle" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardDescription>Доступно видео</CardDescription>
                        <CardTitle className="text-3xl">25+</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
                        <Icon name="List" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardDescription>Плейлистов</CardDescription>
                        <CardTitle className="text-3xl">5</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl">
                        <Icon name="Star" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardDescription>Рекомендуем</CardDescription>
                        <CardTitle className="text-3xl">3</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
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

          <TabsContent value="progress">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Прогресс обучения</h2>
                <p className="text-muted-foreground">Визуализация пройденных модулей и оставшихся тестов</p>
              </div>

              {assignedPrograms.length === 0 ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Icon name="TrendingUp" className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Нет данных о прогрессе</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Когда администратор назначит вам программы обучения, здесь появится детальная информация о вашем прогрессе.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
                            <Icon name="BookOpen" className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardDescription className="text-blue-700">Всего программ</CardDescription>
                            <CardTitle className="text-3xl text-blue-900">{assignedPrograms.length}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                            <Icon name="CheckCircle" className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardDescription className="text-green-700">Завершено</CardDescription>
                            <CardTitle className="text-3xl text-green-900">
                              {assignedPrograms.filter(p => p.status === 'completed').length}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-3 rounded-xl">
                            <Icon name="Clock" className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardDescription className="text-orange-700">В процессе</CardDescription>
                            <CardTitle className="text-3xl text-orange-900">
                              {assignedPrograms.filter(p => p.status === 'in-progress').length}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Детальный прогресс по программам</CardTitle>
                      <CardDescription>Модули, тесты и общий прогресс</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {assignedPrograms.map((program) => {
                          const completedModules = Math.floor((program.progress / 100) * (program.modules?.length || 0));
                          const totalModules = program.modules?.length || 0;
                          const testAvailable = program.progress === 100;
                          const testCompleted = program.status === 'completed';

                          return (
                            <div key={program.id} className="border-2 rounded-xl p-6 hover:shadow-lg transition-all">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                  <div className={`bg-gradient-to-br ${program.color} p-3 rounded-xl`}>
                                    <Icon name={program.icon} className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-lg mb-1">{program.title}</h3>
                                    <p className="text-sm text-muted-foreground">{program.department}</p>
                                  </div>
                                </div>
                                <Badge variant={program.status === 'completed' ? 'default' : program.status === 'in-progress' ? 'secondary' : 'outline'}>
                                  {program.status === 'completed' ? 'Завершено' : program.status === 'in-progress' ? 'В процессе' : 'Не начато'}
                                </Badge>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Общий прогресс</span>
                                    <span className="text-lg font-bold text-blue-600">{program.progress}%</span>
                                  </div>
                                  <Progress value={program.progress} className="h-3" />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-medium">
                                      <Icon name="BookMarked" className="h-5 w-5 text-blue-600" />
                                      <span>Модули обучения</span>
                                    </div>
                                    <div className="space-y-2 pl-7">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Пройдено модулей</span>
                                        <span className="font-semibold">{completedModules} / {totalModules}</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Часов изучения</span>
                                        <span className="font-semibold">{program.totalHours}ч</span>
                                      </div>
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Срок выполнения</span>
                                        <span className="font-semibold text-orange-600">{program.deadline}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 font-medium">
                                      <Icon name="ClipboardCheck" className="h-5 w-5 text-purple-600" />
                                      <span>Тестирование</span>
                                    </div>
                                    <div className="space-y-2 pl-7">
                                      <div className="flex items-center gap-2 text-sm">
                                        {testCompleted ? (
                                          <>
                                            <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600 font-semibold">Тест успешно пройден</span>
                                          </>
                                        ) : testAvailable ? (
                                          <>
                                            <Icon name="AlertCircle" className="h-4 w-4 text-orange-600" />
                                            <span className="text-orange-600 font-semibold">Тест доступен</span>
                                          </>
                                        ) : (
                                          <>
                                            <Icon name="Lock" className="h-4 w-4 text-gray-400" />
                                            <span className="text-muted-foreground">Недоступен</span>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground pl-6">
                                        {testCompleted 
                                          ? 'Вы успешно прошли итоговое тестирование'
                                          : testAvailable 
                                          ? 'Завершите обучение, чтобы открыть тест'
                                          : `Осталось завершить: ${100 - program.progress}%`
                                        }
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {program.status !== 'completed' && (
                                  <div className="flex items-center gap-3 pt-4 border-t">
                                    <Button 
                                      onClick={() => onStartLearning?.(program.id)}
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                      <Icon name="Play" className="h-4 w-4 mr-2" />
                                      {program.status === 'in-progress' ? 'Продолжить обучение' : 'Начать обучение'}
                                    </Button>
                                    {testAvailable && (
                                      <Button 
                                        onClick={() => {
                                          setActiveTab('testing');
                                        }}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                      >
                                        <Icon name="ClipboardCheck" className="h-4 w-4 mr-2" />
                                        Перейти к тесту
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
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