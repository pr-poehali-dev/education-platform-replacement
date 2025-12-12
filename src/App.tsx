import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

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
  const [testMode, setTestMode] = useState<'practice' | 'exam' | null>(null);
  const [testSession, setTestSession] = useState<TestSession>({
    questions: [],
    currentQuestion: 0,
    timeRemaining: 0,
    status: 'not-started'
  });
  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolData, setProtocolData] = useState<any>(null);

  const [instructions] = useState<Instruction[]>([
    { id: '1', title: 'ИОТ при работе на высоте', category: 'iot', industry: 'Строительство', profession: 'Монтажник', lastUpdated: '2024-11-15' },
    { id: '2', title: 'ИОТ для электриков до 1000В', category: 'iot', industry: 'Энергетика', profession: 'Электрик', lastUpdated: '2024-10-20' },
    { id: '3', title: 'Должностная инструкция инженера ОТ', category: 'job', industry: 'Производство', profession: 'Инженер по ОТ', lastUpdated: '2024-12-01' },
    { id: '4', title: 'Работа с грузоподъемными кранами', category: 'equipment', industry: 'Производство', profession: 'Крановщик', lastUpdated: '2024-11-28' },
    { id: '5', title: 'ИОТ при сварочных работах', category: 'iot', industry: 'Производство', profession: 'Сварщик', lastUpdated: '2024-11-10' },
    { id: '6', title: 'Должностная инструкция мастера участка', category: 'job', industry: 'Производство', profession: 'Мастер', lastUpdated: '2024-10-15' },
    { id: '7', title: 'Работа с угловой шлифмашиной (болгаркой)', category: 'equipment', industry: 'Производство', profession: 'Слесарь', lastUpdated: '2024-12-05' },
    { id: '8', title: 'ИОТ в электроустановках', category: 'iot', industry: 'Энергетика', profession: 'Электромонтер', lastUpdated: '2024-11-22' }
  ]);

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

  const stats = {
    totalInstructions: 324,
    activeStudents: 156,
    completedTests: 892,
    avgScore: 87
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      iot: 'ShieldCheck',
      job: 'Briefcase',
      equipment: 'Wrench'
    };
    return icons[category] || 'FileText';
  };

  const filteredInstructions = instructions.filter(inst => {
    if (selectedCategory !== 'all' && inst.category !== selectedCategory) return false;
    if (selectedIndustry !== 'all' && inst.industry !== selectedIndustry) return false;
    return true;
  });

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

  const generateInstruction = (topic: string) => {
    console.log('Generating instruction for:', topic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Icon name="GraduationCap" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ОЛИМПОКС Pro</h1>
              <p className="text-xs text-muted-foreground">Система обучения и аттестации</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Icon name="Bell" className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                3
              </span>
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.position}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto h-auto p-1">
            <TabsTrigger value="catalog" className="gap-2 py-2.5">
              <Icon name="BookOpen" className="h-4 w-4" />
              <span className="hidden sm:inline">Каталог</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="gap-2 py-2.5">
              <Icon name="ClipboardCheck" className="h-4 w-4" />
              <span className="hidden sm:inline">Тестирование</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 py-2.5">
              <Icon name="Award" className="h-4 w-4" />
              <span className="hidden sm:inline">Сертификаты</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-2 py-2.5">
              <Icon name="FolderOpen" className="h-4 w-4" />
              <span className="hidden sm:inline">Программы</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 py-2.5">
              <Icon name="Settings" className="h-4 w-4" />
              <span className="hidden sm:inline">Админ-панель</span>
            </TabsTrigger>
          </TabsList>

          {/* Catalog Tab */}
          <TabsContent value="catalog" className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                    <Icon name="ShieldCheck" className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">ИОТ</CardTitle>
                  <CardDescription className="text-xs">Инструкции по охране труда</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">156</div>
                  <p className="text-xs text-muted-foreground mt-1">инструкций в базе</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-secondary/20">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 mb-2">
                    <Icon name="Briefcase" className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Должностные</CardTitle>
                  <CardDescription className="text-xs">Должностные инструкции</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">89</div>
                  <p className="text-xs text-muted-foreground mt-1">по всем отраслям</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-2">
                    <Icon name="Wrench" className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Оборудование</CardTitle>
                  <CardDescription className="text-xs">Инструкции по технике</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">79</div>
                  <p className="text-xs text-muted-foreground mt-1">видов оборудования</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-purple-500/20 bg-gradient-to-br from-purple-50 to-background">
                <CardHeader className="pb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-2">
                    <Icon name="Sparkles" className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">ИИ-генератор</CardTitle>
                  <CardDescription className="text-xs">Создать свою инструкцию</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500"
                    onClick={() => setCustomTopicDialog(true)}
                  >
                    <Icon name="Plus" className="h-4 w-4 mr-1" />
                    Создать
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Библиотека инструкций</CardTitle>
                    <CardDescription>Выберите категорию и отрасль для поиска</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        <SelectItem value="iot">ИОТ</SelectItem>
                        <SelectItem value="job">Должностные</SelectItem>
                        <SelectItem value="equipment">Оборудование</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все отрасли</SelectItem>
                        <SelectItem value="Строительство">Строительство</SelectItem>
                        <SelectItem value="Энергетика">Энергетика</SelectItem>
                        <SelectItem value="Производство">Производство</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredInstructions.map((instruction) => (
                    <Card key={instruction.id} className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                            <Icon name={getCategoryIcon(instruction.category)} className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                              {instruction.title}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {instruction.industry}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {instruction.profession}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Обновлено: {instruction.lastUpdated}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Icon name="ExternalLink" className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6 animate-fade-in">
            {testSession.status === 'not-started' ? (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="hover:shadow-xl transition-all border-primary/30">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                          <Icon name="BookMarked" className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Тренировочный режим</CardTitle>
                          <CardDescription>Подготовка к экзамену</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Практикуйтесь без ограничений по времени. Получайте мгновенные подсказки и разбор ошибок.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Check" className="h-4 w-4 text-green-600" />
                          <span>Неограниченное время</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Check" className="h-4 w-4 text-green-600" />
                          <span>Подсказки и пояснения</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Check" className="h-4 w-4 text-green-600" />
                          <span>Неограниченные попытки</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => startTest('practice')}
                      >
                        <Icon name="Play" className="h-4 w-4 mr-2" />
                        Начать тренировку
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all border-accent/30 bg-gradient-to-br from-orange-50/50 to-background">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                          <Icon name="Award" className="h-7 w-7 text-accent" />
                        </div>
                        <div>
                          <CardTitle>Экзаменационный режим</CardTitle>
                          <CardDescription>Официальная аттестация</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Официальное тестирование с протоколом и сертификатом. Результаты фиксируются в системе.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Clock" className="h-4 w-4 text-accent" />
                          <span>45 минут на прохождение</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="FileCheck" className="h-4 w-4 text-accent" />
                          <span>Автоматический протокол</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Award" className="h-4 w-4 text-accent" />
                          <span>Сертификат с QR-кодом</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90" 
                        size="lg"
                        onClick={() => startTest('exam')}
                      >
                        <Icon name="Rocket" className="h-4 w-4 mr-2" />
                        Начать экзамен
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Доступные темы для тестирования</CardTitle>
                    <CardDescription>Выберите тему для прохождения теста</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      {['Работа на высоте', 'Электробезопасность до 1000В', 'Пожарная безопасность', 'Работа с грузоподъемными механизмами', 'Сварочные работы', 'Эксплуатация электроустановок'].map((topic, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-medium text-sm">{topic}</p>
                                <p className="text-xs text-muted-foreground">30 вопросов</p>
                              </div>
                              <Icon name="ChevronRight" className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : testSession.status === 'in-progress' ? (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {testMode === 'exam' ? 'Экзамен' : 'Тренировка'}: Работа на высоте
                      </CardTitle>
                      <CardDescription>
                        Вопрос {testSession.currentQuestion + 1} из {testSession.questions.length}
                      </CardDescription>
                    </div>
                    {testMode === 'exam' && (
                      <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg">
                        <Icon name="Clock" className="h-5 w-5 text-accent" />
                        <span className="font-bold text-lg">45:00</span>
                      </div>
                    )}
                  </div>
                  <Progress 
                    value={((testSession.currentQuestion + 1) / testSession.questions.length) * 100} 
                    className="mt-4"
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-lg font-medium leading-relaxed">
                      {testSession.questions[testSession.currentQuestion]?.question}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {testSession.questions[testSession.currentQuestion]?.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => answerQuestion(idx)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                          testSession.questions[testSession.currentQuestion].userAnswer === idx
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold ${
                            testSession.questions[testSession.currentQuestion].userAnswer === idx
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground/30'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={testSession.currentQuestion === 0}
                    >
                      <Icon name="ChevronLeft" className="h-4 w-4 mr-2" />
                      Назад
                    </Button>
                    
                    {testSession.currentQuestion === testSession.questions.length - 1 ? (
                      <Button
                        onClick={finishTest}
                        className="bg-gradient-to-r from-green-600 to-green-500"
                        size="lg"
                      >
                        Завершить тест
                        <Icon name="Check" className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion}>
                        Далее
                        <Icon name="ChevronRight" className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Настройка сертификатов</CardTitle>
                  <CardDescription>Настройте внешний вид и содержание сертификатов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Название организации</Label>
                    <Input placeholder="ООО &quot;Промбезопасность&quot;" />
                  </div>
                  <div className="space-y-2">
                    <Label>Подписант</Label>
                    <Input placeholder="Директор по обучению" />
                  </div>
                  <div className="space-y-2">
                    <Label>Логотип организации</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" />
                      <Button variant="outline">
                        <Icon name="Upload" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>QR-код на сертификате</Label>
                    <Switch defaultChecked />
                  </div>
                  <Button className="w-full">
                    <Icon name="Save" className="h-4 w-4 mr-2" />
                    Сохранить настройки
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-center">Предпросмотр сертификата</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[1.414/1] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-4 border-primary/20 p-8">
                    <div className="text-center space-y-4">
                      <Icon name="Award" className="h-16 w-16 mx-auto text-primary" />
                      <h2 className="text-2xl font-bold">СЕРТИФИКАТ</h2>
                      <p className="text-sm">Подтверждает, что</p>
                      <p className="text-xl font-semibold">[ФИО сотрудника]</p>
                      <p className="text-sm">прошел(а) обучение по программе</p>
                      <p className="font-medium">[Название программы]</p>
                      <div className="pt-4">
                        <div className="w-24 h-24 bg-white mx-auto rounded-lg flex items-center justify-center">
                          <Icon name="QrCode" className="h-20 w-20 text-gray-400" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">QR-код для проверки</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Выданные сертификаты</CardTitle>
                <CardDescription>История выдачи сертификатов</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i} className="hover:shadow-md transition-all">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                <Icon name="Award" className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">Иванов Иван Иванович</p>
                                <p className="text-sm text-muted-foreground">Электробезопасность • 95%</p>
                                <p className="text-xs text-muted-foreground">Выдан: 2024-12-10 • № 00{i}234</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Icon name="Download" className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Icon name="QrCode" className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Программы обучения</h2>
                <p className="text-muted-foreground">Управление учебными программами и назначениями</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Icon name="Upload" className="h-4 w-4 mr-2" />
                  Загрузить программу
                </Button>
                <Button>
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Создать программу
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: 'Охрана труда базовый курс', duration: '40 часов', students: 45, progress: 78 },
                { title: 'Электробезопасность до 1000В', duration: '24 часа', students: 32, progress: 65 },
                { title: 'Пожарная безопасность', duration: '16 часов', students: 89, progress: 92 },
                { title: 'Работа на высоте (1 группа)', duration: '32 часа', students: 28, progress: 54 },
                { title: 'Первая помощь', duration: '8 часов', students: 156, progress: 87 },
                { title: 'Охрана окружающей среды', duration: '16 часов', students: 67, progress: 71 }
              ].map((program, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Icon name="BookOpen" className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{program.duration}</Badge>
                    </div>
                    <CardTitle className="text-base mt-3">{program.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Обучается</span>
                      <span className="font-semibold">{program.students} чел.</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Прогресс</span>
                        <span className="font-semibold">{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6 animate-fade-in">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активных студентов</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeStudents}</div>
                  <p className="text-xs text-muted-foreground">+12% за месяц</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Пройдено тестов</CardTitle>
                  <Icon name="CheckCircle" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedTests}</div>
                  <p className="text-xs text-muted-foreground">За все время</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средний балл</CardTitle>
                  <Icon name="TrendingUp" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgScore}%</div>
                  <p className="text-xs text-muted-foreground">+3% к прошлому</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Инструкций</CardTitle>
                  <Icon name="BookOpen" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInstructions}</div>
                  <p className="text-xs text-muted-foreground">В базе знаний</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Последние действия</CardTitle>
                  <CardDescription>Активность пользователей в системе</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {[
                        { user: 'Петров П.П.', action: 'завершил тест', subject: 'Электробезопасность', time: '5 мин назад', icon: 'CheckCircle', color: 'text-green-600' },
                        { user: 'Сидорова А.И.', action: 'начала изучение', subject: 'Работа на высоте', time: '12 мин назад', icon: 'BookOpen', color: 'text-blue-600' },
                        { user: 'Козлов М.С.', action: 'получил сертификат', subject: 'Пожарная безопасность', time: '25 мин назад', icon: 'Award', color: 'text-purple-600' },
                        { user: 'Иванова Е.Н.', action: 'провалила тест', subject: 'Охрана труда', time: '1 час назад', icon: 'XCircle', color: 'text-red-600' },
                        { user: 'Морозов Д.В.', action: 'завершил тест', subject: 'Первая помощь', time: '2 часа назад', icon: 'CheckCircle', color: 'text-green-600' },
                        { user: 'Новикова О.П.', action: 'начала тренировку', subject: 'Работа с кранами', time: '3 часа назад', icon: 'Play', color: 'text-blue-600' }
                      ].map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 pb-4 border-b last:border-0">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted ${activity.color}`}>
                            <Icon name={activity.icon as any} className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold">{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-sm text-muted-foreground">{activity.subject}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Управление системой</CardTitle>
                  <CardDescription>Настройки и параметры платформы</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Автообновление инструкций</p>
                        <p className="text-sm text-muted-foreground">Проверять обновления ежедневно</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Уведомления по email</p>
                        <p className="text-sm text-muted-foreground">Отправлять отчеты администраторам</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">ИИ-генерация инструкций</p>
                        <p className="text-sm text-muted-foreground">Использовать проверенные источники</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Проходной балл (%)</Label>
                      <Input type="number" defaultValue="80" min="0" max="100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Время на экзамен (минуты)</Label>
                      <Input type="number" defaultValue="45" min="10" max="120" />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Icon name="Save" className="h-4 w-4 mr-2" />
                    Сохранить настройки
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Generator Dialog */}
      <Dialog open={customTopicDialog} onOpenChange={setCustomTopicDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Sparkles" className="h-5 w-5 text-purple-600" />
              Генерация инструкции с помощью ИИ
            </DialogTitle>
            <DialogDescription>
              Система создаст инструкцию на основе проверенных источников и актуальных нормативов
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Тип инструкции</Label>
              <Select defaultValue="iot">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iot">Инструкция по охране труда (ИОТ)</SelectItem>
                  <SelectItem value="job">Должностная инструкция</SelectItem>
                  <SelectItem value="equipment">Инструкция по оборудованию</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Профессия / Должность</Label>
              <Input placeholder="Например: Слесарь-ремонтник" />
            </div>
            <div className="space-y-2">
              <Label>Отрасль</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отрасль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">Строительство</SelectItem>
                  <SelectItem value="energy">Энергетика</SelectItem>
                  <SelectItem value="production">Производство</SelectItem>
                  <SelectItem value="transport">Транспорт</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Дополнительная информация (необязательно)</Label>
              <Textarea 
                placeholder="Укажите специфические требования, особенности работы, используемое оборудование..."
                rows={4}
              />
            </div>
            <Alert>
              <Icon name="Info" className="h-4 w-4" />
              <AlertDescription>
                Генерация займет 30-60 секунд. Инструкция будет создана на основе актуальных норм охраны труда.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomTopicDialog(false)}>
              Отмена
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-purple-500"
              onClick={() => {
                generateInstruction('custom');
                setCustomTopicDialog(false);
              }}
            >
              <Icon name="Wand2" className="h-4 w-4 mr-2" />
              Сгенерировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Protocol Dialog */}
      <Dialog open={showProtocol} onOpenChange={setShowProtocol}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="FileCheck" className="h-5 w-5 text-primary" />
              Протокол проверки знаний {protocolData?.number}
            </DialogTitle>
            <DialogDescription>
              Результаты экзаменационного тестирования
            </DialogDescription>
          </DialogHeader>
          {protocolData && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Дата проведения</p>
                    <p className="font-semibold">{protocolData.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Тема экзамена</p>
                    <p className="font-semibold">{protocolData.testName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Аттестуемый</p>
                    <p className="font-semibold">{protocolData.student}</p>
                    <p className="text-xs text-muted-foreground">{protocolData.studentPosition}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Проверяющий</p>
                    <p className="font-semibold">{protocolData.inspector}</p>
                    <p className="text-xs text-muted-foreground">{protocolData.inspectorPosition}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm text-muted-foreground">Результат</p>
                    <p className="text-2xl font-bold">{protocolData.score}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Правильных ответов</p>
                    <p className="text-2xl font-bold">{protocolData.correctAnswers} / {protocolData.totalQuestions}</p>
                  </div>
                  <Badge 
                    variant={protocolData.passed ? 'default' : 'destructive'}
                    className="text-lg py-2 px-4"
                  >
                    {protocolData.passed ? 'СДАН' : 'НЕ СДАН'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold">Подробные результаты:</p>
                  {protocolData.questions.map((q: TestQuestion, idx: number) => (
                    <Card key={q.id} className={q.userAnswer === q.correctAnswer ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            q.userAnswer === q.correctAnswer ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            <Icon name={q.userAnswer === q.correctAnswer ? 'Check' : 'X'} className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-sm">{idx + 1}. {q.question}</p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="text-muted-foreground">Ваш ответ:</span>{' '}
                                <span className={q.userAnswer === q.correctAnswer ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                  {q.options[q.userAnswer || 0]}
                                </span>
                              </p>
                              {q.userAnswer !== q.correctAnswer && (
                                <p>
                                  <span className="text-muted-foreground">Правильный ответ:</span>{' '}
                                  <span className="text-green-700 font-medium">{q.options[q.correctAnswer]}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Аттестуемый</p>
                    <div className="border-t-2 border-foreground pt-1">
                      <p>{protocolData.student}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Проверяющий</p>
                    <div className="border-t-2 border-foreground pt-1">
                      <p>{protocolData.inspector}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowProtocol(false)}>
              Закрыть
            </Button>
            <Button variant="outline">
              <Icon name="Download" className="h-4 w-4 mr-2" />
              Скачать PDF
            </Button>
            <Button variant="outline">
              <Icon name="Printer" className="h-4 w-4 mr-2" />
              Печать
            </Button>
            {protocolData?.passed && (
              <Button className="bg-gradient-to-r from-green-600 to-green-500">
                <Icon name="Award" className="h-4 w-4 mr-2" />
                Выдать сертификат
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
