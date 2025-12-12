import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AssignTraining from '@/components/AssignTraining';
import InstructionsCatalog from '@/components/InstructionsCatalog';
import TestingInterface from '@/components/TestingInterface';
import AIGenerator from '@/components/AIGenerator';

const API_URL = 'https://functions.poehali.dev/26432853-bc16-442a-aabf-e90c33bae6c2';

interface Instruction {
  id: string;
  title: string;
  category: 'iot' | 'job' | 'equipment';
  industry: string;
  profession: string;
  content?: string;
  lastUpdated: string;
}

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

function App() {
  const [currentUser] = useState({
    name: 'Иванов Иван Иванович',
    role: 'admin' as const,
    position: 'Инженер по охране труда'
  });

  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [customTopicDialog, setCustomTopicDialog] = useState(false);
  const [assignTrainingDialog, setAssignTrainingDialog] = useState(false);
  const [testMode, setTestMode] = useState<'practice' | 'exam' | null>(null);
  const [testSession, setTestSession] = useState<TestSession>({
    questions: [],
    currentQuestion: 0,
    timeRemaining: 0,
    status: 'not-started'
  });
  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolData, setProtocolData] = useState<any>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [stats, setStats] = useState({
    totalInstructions: 324,
    activeStudents: 156,
    completedTests: 892,
    avgScore: 87
  });

  useEffect(() => {
    loadInstructions();
    loadStats();
  }, []);

  const loadInstructions = async () => {
    try {
      const response = await fetch(`${API_URL}?path=instructions`);
      const data = await response.json();
      setInstructions(data.instructions || []);
    } catch (error) {
      console.error('Failed to load instructions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}?path=stats`);
      const data = await response.json();
      setStats({
        totalInstructions: data.totalInstructions || 0,
        activeStudents: data.activeStudents || 0,
        completedTests: data.completedTests || 0,
        avgScore: data.avgScore || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

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
      student: currentUser.name,
      studentPosition: currentUser.position,
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
                  SafetyTraining Pro
                </h1>
                <p className="text-xs text-muted-foreground">Система управления обучением по охране труда</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Icon name="Bell" className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    ИИ
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.position}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего инструкций</CardDescription>
              <CardTitle className="text-3xl">{stats.totalInstructions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Icon name="TrendingUp" className="h-4 w-4" />
                <span>+12% за месяц</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Активных студентов</CardDescription>
              <CardTitle className="text-3xl">{stats.activeStudents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Icon name="Users" className="h-4 w-4" />
                <span>На обучении</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Тестов пройдено</CardDescription>
              <CardTitle className="text-3xl">{stats.completedTests}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Icon name="Award" className="h-4 w-4" />
                <span>Всего за год</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Средний балл</CardDescription>
              <CardTitle className="text-3xl">{stats.avgScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={stats.avgScore} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="catalog">
              <Icon name="BookOpen" className="h-4 w-4 mr-2" />
              Каталог инструкций
            </TabsTrigger>
            <TabsTrigger value="programs">
              <Icon name="GraduationCap" className="h-4 w-4 mr-2" />
              Программы обучения
            </TabsTrigger>
            <TabsTrigger value="testing">
              <Icon name="ClipboardCheck" className="h-4 w-4 mr-2" />
              Тестирование
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Icon name="Award" className="h-4 w-4 mr-2" />
              Сертификаты
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Icon name="BarChart3" className="h-4 w-4 mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <InstructionsCatalog
              instructions={instructions}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedIndustry={selectedIndustry}
              setSelectedIndustry={setSelectedIndustry}
              onGenerateClick={() => setCustomTopicDialog(true)}
            />
          </TabsContent>

          <TabsContent value="programs">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Программы обучения</h2>
                  <p className="text-muted-foreground">Готовые курсы по различным направлениям ОТ</p>
                </div>
                {currentUser.role === 'admin' && (
                  <Button onClick={() => setAssignTrainingDialog(true)} className="bg-gradient-to-r from-green-600 to-green-500">
                    <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                    Назначить обучение
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Работа на высоте',
                    description: 'Комплексное обучение безопасной работе на высоте',
                    duration: '16 часов',
                    modules: 8,
                    students: 45,
                    icon: 'Mountain',
                    color: 'from-orange-500 to-red-500'
                  },
                  {
                    title: 'Электробезопасность',
                    description: 'Правила работы с электроустановками до и выше 1000В',
                    duration: '24 часа',
                    modules: 12,
                    students: 38,
                    icon: 'Zap',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  {
                    title: 'Пожарная безопасность',
                    description: 'ПТМ для руководителей и ответственных лиц',
                    duration: '12 часов',
                    modules: 6,
                    students: 62,
                    icon: 'Flame',
                    color: 'from-red-500 to-pink-500'
                  },
                  {
                    title: 'Охрана труда для руководителей',
                    description: 'Обучение по программе А для руководителей организаций',
                    duration: '40 часов',
                    modules: 20,
                    students: 28,
                    icon: 'Briefcase',
                    color: 'from-blue-500 to-indigo-500'
                  }
                ].map((program, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`bg-gradient-to-br ${program.color} p-3 rounded-xl`}>
                          <Icon name={program.icon} className="h-6 w-6 text-white" />
                        </div>
                        <Badge variant="secondary">{program.duration}</Badge>
                      </div>
                      <CardTitle className="mt-4">{program.title}</CardTitle>
                      <CardDescription>{program.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Модулей</span>
                          <span className="font-medium">{program.modules}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Студентов</span>
                          <span className="font-medium">{program.students}</span>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          <Icon name="Play" className="h-4 w-4 mr-2" />
                          Начать обучение
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
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="certificates">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Сертификаты и удостоверения</h2>
                <p className="text-muted-foreground">История выданных документов</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((cert) => (
                  <Card key={cert} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                          <Icon name="Award" className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Удостоверение №{1000 + cert}</CardTitle>
                          <CardDescription>Работа на высоте</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Выдано</span>
                          <span>15.10.2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Действительно до</span>
                          <span className="font-medium">15.10.2025</span>
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
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Аналитика и отчёты</h2>
                <p className="text-muted-foreground">Статистика обучения и тестирования</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Прогресс обучения</CardTitle>
                    <CardDescription>Статистика по всем программам</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'Работа на высоте', progress: 75, students: 45 },
                      { name: 'Электробезопасность', progress: 60, students: 38 },
                      { name: 'Пожарная безопасность', progress: 85, students: 62 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground">{item.students} чел.</span>
                        </div>
                        <Progress value={item.progress} />
                        <p className="text-xs text-muted-foreground text-right">{item.progress}% завершено</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Результаты тестирования</CardTitle>
                    <CardDescription>Средние баллы по темам</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'Работа на высоте', score: 87 },
                      { name: 'Электробезопасность', score: 92 },
                      { name: 'Пожарная безопасность', score: 85 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant={item.score >= 80 ? "default" : "destructive"}>
                          {item.score}%
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AssignTraining 
        open={assignTrainingDialog}
        onOpenChange={setAssignTrainingDialog}
        onAssignmentCreated={() => {
          loadStats();
        }}
      />

      <AIGenerator
        open={customTopicDialog}
        onOpenChange={setCustomTopicDialog}
        onInstructionCreated={() => {
          loadInstructions();
        }}
      />
    </div>
  );
}

export default App;
