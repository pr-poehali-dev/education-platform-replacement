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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'methodist' | 'inspector' | 'student';
  department: string;
}

interface Assignment {
  id: string;
  title: string;
  type: 'instruction' | 'test';
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

interface Instruction {
  id: string;
  title: string;
  industry: string;
  profession: string;
  type: string;
  lastUpdated: string;
}

interface TestResult {
  id: string;
  studentName: string;
  testName: string;
  score: number;
  date: string;
  status: 'passed' | 'failed';
}

function App() {
  const [currentUser] = useState<User>({
    id: '1',
    name: 'Иванов Иван Иванович',
    role: 'admin',
    department: 'Инженерная служба'
  });

  const [assignments] = useState<Assignment[]>([
    { id: '1', title: 'ИОТ при работе на высоте', type: 'instruction', deadline: '2024-12-20', status: 'in-progress', progress: 65 },
    { id: '2', title: 'Экзамен: Электробезопасность', type: 'test', deadline: '2024-12-18', status: 'pending', progress: 0 },
    { id: '3', title: 'Работа с грузоподъемными механизмами', type: 'instruction', deadline: '2024-12-25', status: 'pending', progress: 0 }
  ]);

  const [instructions] = useState<Instruction[]>([
    { id: '1', title: 'Инструкция по охране труда при работе на высоте', industry: 'Строительство', profession: 'Монтажник', type: 'ИОТ', lastUpdated: '2024-11-15' },
    { id: '2', title: 'Электробезопасность до 1000В', industry: 'Энергетика', profession: 'Электрик', type: 'ИОТ', lastUpdated: '2024-10-20' },
    { id: '3', title: 'Работа с грузоподъемными механизмами', industry: 'Производство', profession: 'Крановщик', type: 'По оборудованию', lastUpdated: '2024-12-01' }
  ]);

  const [testResults] = useState<TestResult[]>([
    { id: '1', studentName: 'Петров П.П.', testName: 'Электробезопасность', score: 92, date: '2024-12-10', status: 'passed' },
    { id: '2', studentName: 'Сидоров С.С.', testName: 'Работа на высоте', score: 68, date: '2024-12-09', status: 'failed' },
    { id: '3', studentName: 'Козлов К.К.', testName: 'Пожарная безопасность', score: 88, date: '2024-12-08', status: 'passed' }
  ]);

  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = {
    totalUsers: 247,
    completedTests: 1834,
    avgScore: 84,
    pendingAssignments: 56
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Администратор',
      methodist: 'Методист',
      inspector: 'Инспектор',
      student: 'Обучающийся'
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      'in-progress': 'secondary',
      completed: 'default',
      passed: 'default',
      failed: 'destructive'
    };
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      'in-progress': 'В процессе',
      completed: 'Завершено',
      passed: 'Сдан',
      failed: 'Не сдан'
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Icon name="GraduationCap" className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ПромОбучение</h1>
              <p className="text-xs text-muted-foreground">Система аттестации и обучения</p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Icon name="Bell" className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(currentUser.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" className="h-4 w-4" />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <Icon name="ClipboardList" className="h-4 w-4" />
              <span className="hidden sm:inline">Назначения</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2">
              <Icon name="BookOpen" className="h-4 w-4" />
              <span className="hidden sm:inline">Каталог</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="gap-2">
              <Icon name="FileCheck" className="h-4 w-4" />
              <span className="hidden sm:inline">Тестирование</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Icon name="Settings" className="h-4 w-4" />
              <span className="hidden sm:inline">Админ</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Icon name="BarChart3" className="h-4 w-4" />
              <span className="hidden sm:inline">Отчеты</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Активных сотрудников</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Тестов пройдено</CardTitle>
                  <Icon name="CheckCircle2" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedTests}</div>
                  <p className="text-xs text-muted-foreground">За весь период</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Средний балл</CardTitle>
                  <Icon name="TrendingUp" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgScore}%</div>
                  <p className="text-xs text-muted-foreground">По всем тестам</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ожидают выполнения</CardTitle>
                  <Icon name="Clock" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">Активных назначений</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Последние результаты</CardTitle>
                  <CardDescription>Результаты экзаменационных тестов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{result.studentName}</p>
                        <p className="text-xs text-muted-foreground">{result.testName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold">{result.score}%</span>
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ближайшие дедлайны</CardTitle>
                  <CardDescription>Назначения с истекающим сроком</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignments.filter(a => a.status !== 'completed').map((assignment) => (
                    <div key={assignment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">До {assignment.deadline}</p>
                        </div>
                        <Badge variant={assignment.type === 'test' ? 'default' : 'secondary'}>
                          {assignment.type === 'test' ? 'Тест' : 'Инструкция'}
                        </Badge>
                      </div>
                      <Progress value={assignment.progress} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Мои назначения</CardTitle>
                <CardDescription>Инструкции и тесты для изучения</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <Icon 
                                name={assignment.type === 'test' ? 'FileCheck' : 'BookOpen'} 
                                className="h-5 w-5 text-primary" 
                              />
                              <h3 className="font-semibold">{assignment.title}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Icon name="Calendar" className="h-4 w-4" />
                                <span>Срок: {assignment.deadline}</span>
                              </div>
                              {getStatusBadge(assignment.status)}
                            </div>
                            {assignment.progress > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Прогресс</span>
                                  <span className="font-medium">{assignment.progress}%</span>
                                </div>
                                <Progress value={assignment.progress} />
                              </div>
                            )}
                          </div>
                          <Button>
                            {assignment.status === 'completed' ? 'Просмотр' : assignment.type === 'test' ? 'Пройти тест' : 'Изучить'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Каталог инструкций</CardTitle>
                    <CardDescription>Библиотека учебных материалов</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Отрасль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все отрасли</SelectItem>
                        <SelectItem value="construction">Строительство</SelectItem>
                        <SelectItem value="energy">Энергетика</SelectItem>
                        <SelectItem value="production">Производство</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Icon name="Plus" className="h-4 w-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {instructions.map((instruction) => (
                    <Card key={instruction.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{instruction.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{instruction.industry}</Badge>
                              <Badge variant="outline">{instruction.profession}</Badge>
                              <Badge variant="secondary">{instruction.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Обновлено: {instruction.lastUpdated}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Icon name="MoreVertical" className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <Icon name="BookOpen" className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>Тренировочный режим</CardTitle>
                      <CardDescription>Практика без ограничений</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Проходите тесты в свободном режиме для подготовки к экзамену. Результаты не фиксируются.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="h-4 w-4 text-primary" />
                      Неограниченное время
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="h-4 w-4 text-primary" />
                      Разбор ошибок после каждого вопроса
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Check" className="h-4 w-4 text-primary" />
                      Возможность повторного прохождения
                    </li>
                  </ul>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Начать тренировку</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Выберите тему</DialogTitle>
                        <DialogDescription>Выберите тему для тренировочного тестирования</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тему" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Электробезопасность</SelectItem>
                            <SelectItem value="2">Работа на высоте</SelectItem>
                            <SelectItem value="3">Пожарная безопасность</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="w-full">Начать тестирование</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                      <Icon name="FileCheck" className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Экзаменационный режим</CardTitle>
                      <CardDescription>Официальное тестирование</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Официальное тестирование с фиксацией результата и генерацией протокола проверки знаний.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Icon name="Clock" className="h-4 w-4 text-primary" />
                      Ограниченное время на прохождение
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="FileText" className="h-4 w-4 text-primary" />
                      Автоматическая генерация протокола
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="Award" className="h-4 w-4 text-primary" />
                      Выдача сертификата при успехе
                    </li>
                  </ul>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="default">Начать экзамен</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Подтверждение начала экзамена</DialogTitle>
                        <DialogDescription>
                          Вы уверены, что готовы начать экзаменационное тестирование? Результат будет зафиксирован.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Назначенный тест</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тест" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Экзамен: Электробезопасность</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Количество вопросов:</span>
                            <span className="font-medium">30</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Время на прохождение:</span>
                            <span className="font-medium">45 минут</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Проходной балл:</span>
                            <span className="font-medium">80%</span>
                          </div>
                        </div>
                        <Button className="w-full">Подтвердить и начать</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Управление пользователями</CardTitle>
                    <CardDescription>Добавление и редактирование сотрудников</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Icon name="Upload" className="h-4 w-4 mr-2" />
                      Импорт CSV
                    </Button>
                    <Button>
                      <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Поиск по ФИО..." className="max-w-sm" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все роли</SelectItem>
                        <SelectItem value="student">Обучающийся</SelectItem>
                        <SelectItem value="inspector">Инспектор</SelectItem>
                        <SelectItem value="methodist">Методист</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ФИО</TableHead>
                          <TableHead>Роль</TableHead>
                          <TableHead>Подразделение</TableHead>
                          <TableHead>Назначений</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Петров Петр Петрович</TableCell>
                          <TableCell>Обучающийся</TableCell>
                          <TableCell>Энергоцех №1</TableCell>
                          <TableCell>5 активных</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Icon name="Edit" className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Сидоров Сидор Сидорович</TableCell>
                          <TableCell>Обучающийся</TableCell>
                          <TableCell>Монтажный участок</TableCell>
                          <TableCell>3 активных</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Icon name="Edit" className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Козлов Кирилл Константинович</TableCell>
                          <TableCell>Инспектор</TableCell>
                          <TableCell>Служба охраны труда</TableCell>
                          <TableCell>—</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Icon name="Edit" className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Отчеты и аналитика</CardTitle>
                    <CardDescription>Результаты тестирования и статистика</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Icon name="Download" className="h-4 w-4 mr-2" />
                    Экспорт в Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input type="date" className="max-w-[180px]" />
                    <span className="flex items-center text-muted-foreground">—</span>
                    <Input type="date" className="max-w-[180px]" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Подразделение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все подразделения</SelectItem>
                        <SelectItem value="energy">Энергоцех №1</SelectItem>
                        <SelectItem value="construction">Монтажный участок</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Сотрудник</TableHead>
                          <TableHead>Тест</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Результат</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead className="text-right">Протокол</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.studentName}</TableCell>
                            <TableCell>{result.testName}</TableCell>
                            <TableCell>{result.date}</TableCell>
                            <TableCell>
                              <span className="font-bold">{result.score}%</span>
                            </TableCell>
                            <TableCell>{getStatusBadge(result.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Icon name="FileText" className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Общая успеваемость</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">84%</div>
                  <Progress value={84} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Средний балл по предприятию</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Завершено тестов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">1,834</div>
                  <p className="text-xs text-muted-foreground mt-2">+127 за последний месяц</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Процент успеха</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">91%</div>
                  <Progress value={91} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Сдают с первого раза</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
