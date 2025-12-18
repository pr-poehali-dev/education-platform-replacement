import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TestRunnerProps {
  onBack: () => void;
  testId: string;
  listenerName?: string;
  listenerPosition?: string;
}

type QuestionType = 'single' | 'multiple' | 'text';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  explanation?: string;
  points: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  passingScore: number;
  duration: number;
  questions: Question[];
}

interface UserAnswer {
  questionId: string;
  selectedAnswers: string[];
  textAnswer?: string;
}

interface TestResult {
  testId: string;
  testTitle: string;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
  answers: UserAnswer[];
}

interface ProtocolRecord {
  id: string;
  protocolNumber: string;
  testId: string;
  testTitle: string;
  listenerName?: string;
  listenerPosition?: string;
  percentage: number;
  passed: boolean;
  completedAt: string;
  createdAt: string;
}

export default function TestRunner({ onBack, testId, listenerName, listenerPosition }: TestRunnerProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState<string>('');

  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
    if (isStarted && !isFinished && timerEnabled && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, isFinished, timeRemaining, timerEnabled]);

  const loadTest = () => {
    const savedTests = localStorage.getItem('tests_catalog');
    if (savedTests) {
      const tests: Test[] = JSON.parse(savedTests);
      const foundTest = tests.find(t => t.id === testId);
      if (foundTest) {
        setTest(foundTest);
        setTimeRemaining(foundTest.duration * 60);
      }
    }
  };

  const handleStartTest = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (questionId: string, answerId: string, checked: boolean) => {
    const currentAnswer = userAnswers.get(questionId) || { questionId, selectedAnswers: [] };
    
    if (currentQuestion?.type === 'single') {
      currentAnswer.selectedAnswers = [answerId];
    } else {
      if (checked) {
        currentAnswer.selectedAnswers = [...currentAnswer.selectedAnswers, answerId];
      } else {
        currentAnswer.selectedAnswers = currentAnswer.selectedAnswers.filter(id => id !== answerId);
      }
    }

    setUserAnswers(new Map(userAnswers.set(questionId, currentAnswer)));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    const currentAnswer = userAnswers.get(questionId) || { questionId, selectedAnswers: [] };
    currentAnswer.textAnswer = text;
    setUserAnswers(new Map(userAnswers.set(questionId, currentAnswer)));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishTest = () => {
    if (!test) return;

    let earnedPoints = 0;
    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);

    test.questions.forEach((question) => {
      const userAnswer = userAnswers.get(question.id);
      
      if (question.type === 'text') {
        if (userAnswer?.textAnswer && userAnswer.textAnswer.trim().length > 0) {
          earnedPoints += question.points;
        }
      } else {
        const correctAnswers = question.answers
          .filter(a => a.isCorrect)
          .map(a => a.id)
          .sort();
        
        const selectedAnswers = (userAnswer?.selectedAnswers || []).sort();
        
        if (JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers)) {
          earnedPoints += question.points;
        }
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= test.passingScore;
    const timeSpent = timerEnabled ? (test.duration * 60 - timeRemaining) : 0;

    const testResult: TestResult = {
      testId: test.id,
      testTitle: test.title,
      totalPoints,
      earnedPoints,
      percentage,
      passed,
      timeSpent,
      completedAt: new Date().toISOString(),
      answers: Array.from(userAnswers.values())
    };

    setResult(testResult);
    setIsFinished(true);

    saveResult(testResult);
  };

  const generateProtocolNumber = (): string => {
    const registry = localStorage.getItem('protocol_registry');
    const records: ProtocolRecord[] = registry ? JSON.parse(registry) : [];
    
    const year = new Date().getFullYear();
    const yearRecords = records.filter(r => r.protocolNumber.startsWith(`${year}-`));
    const nextNumber = yearRecords.length + 1;
    
    return `${year}-${String(nextNumber).padStart(4, '0')}`;
  };

  const saveToProtocolRegistry = (result: TestResult, protocolNum: string) => {
    const registry = localStorage.getItem('protocol_registry');
    const records: ProtocolRecord[] = registry ? JSON.parse(registry) : [];
    
    const newRecord: ProtocolRecord = {
      id: `protocol_${Date.now()}`,
      protocolNumber: protocolNum,
      testId: result.testId,
      testTitle: result.testTitle,
      listenerName: listenerName,
      listenerPosition: listenerPosition,
      percentage: result.percentage,
      passed: result.passed,
      completedAt: result.completedAt,
      createdAt: new Date().toISOString()
    };
    
    records.push(newRecord);
    localStorage.setItem('protocol_registry', JSON.stringify(records));
  };

  const saveResult = (result: TestResult) => {
    const savedResults = localStorage.getItem('test_results');
    const results: TestResult[] = savedResults ? JSON.parse(savedResults) : [];
    results.push(result);
    localStorage.setItem('test_results', JSON.stringify(results));
    
    const protocolNum = generateProtocolNumber();
    setProtocolNumber(protocolNum);
    saveToProtocolRegistry(result, protocolNum);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs} сек`;
    return `${minutes} мин ${secs} сек`;
  };

  const handlePrintProtocol = () => {
    setShowProtocol(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Тест не найден</CardTitle>
            <CardDescription>Не удалось загрузить данные теста</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onBack}>Вернуться</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentAnswer = userAnswers.get(currentQuestion?.id || '');
  const answeredCount = userAnswers.size;
  const progress = (answeredCount / test.questions.length) * 100;

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Icon name="FileCheck" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Прохождение теста
                </h1>
                <p className="text-xs text-muted-foreground">Подготовка к тестированию</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-2xl">{test.title}</CardTitle>
              {test.description && <CardDescription className="text-base">{test.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Icon name="FileQuestion" className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Вопросов</p>
                    <p className="text-2xl font-bold">{test.questionCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Icon name="Target" className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Проходной балл</p>
                    <p className="text-2xl font-bold">{test.passingScore}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <Icon name="Clock" className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Длительность</p>
                    <p className="text-2xl font-bold">{test.duration} мин</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Icon name="Award" className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Макс. баллов</p>
                    <p className="text-2xl font-bold">
                      {test.questions.reduce((sum, q) => sum + q.points, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Checkbox 
                  id="timer-toggle"
                  checked={timerEnabled}
                  onCheckedChange={(checked) => setTimerEnabled(checked as boolean)}
                />
                <Label htmlFor="timer-toggle" className="cursor-pointer">
                  Включить таймер ({test.duration} минут)
                </Label>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="Info" className="h-4 w-4 text-blue-600" />
                  Правила прохождения:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                  <li>Внимательно читайте каждый вопрос</li>
                  <li>Некоторые вопросы могут иметь несколько правильных ответов</li>
                  {timerEnabled && <li>После истечения времени тест завершится автоматически</li>}
                  <li>Вы можете перемещаться между вопросами</li>
                  <li>Результат будет показан сразу после завершения</li>
                </ul>
              </div>

              <Button 
                onClick={handleStartTest} 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-lg h-12"
              >
                <Icon name="Play" className="h-5 w-5 mr-2" />
                Начать тестирование
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isFinished && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${result.passed ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'}`}>
                <Icon name={result.passed ? "CheckCircle2" : "XCircle"} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Результаты тестирования</h1>
                <p className="text-xs text-muted-foreground">{test.title}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Icon 
                    name={result.passed ? "CheckCircle2" : "XCircle"} 
                    className={`h-12 w-12 ${result.passed ? 'text-green-600' : 'text-red-600'}`}
                  />
                </div>
                <div>
                  <CardTitle className="text-3xl">
                    {result.passed ? 'Тест пройден!' : 'Тест не пройден'}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {result.passed 
                      ? 'Поздравляем! Вы успешно прошли тестирование' 
                      : 'К сожалению, вы не набрали проходной балл'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Ваш результат</p>
                  <p className="text-3xl font-bold text-blue-600">{result.percentage}%</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Проходной балл</p>
                  <p className="text-3xl font-bold text-purple-600">{test.passingScore}%</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Набрано баллов</p>
                  <p className="text-3xl font-bold text-green-600">
                    {result.earnedPoints} / {result.totalPoints}
                  </p>
                </div>

                {timerEnabled && (
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Время прохождения</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {formatTimeSpent(result.timeSpent)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Детальная статистика:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Правильных ответов:</span>
                    <Badge variant="secondary">
                      {test.questions.filter(q => {
                        const userAnswer = userAnswers.get(q.id);
                        if (q.type === 'text') return userAnswer?.textAnswer;
                        const correct = q.answers.filter(a => a.isCorrect).map(a => a.id).sort();
                        const selected = (userAnswer?.selectedAnswers || []).sort();
                        return JSON.stringify(correct) === JSON.stringify(selected);
                      }).length} / {test.questions.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Процент правильных ответов:</span>
                    <Badge variant="secondary">{result.percentage}%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Дата прохождения:</span>
                    <Badge variant="secondary">
                      {new Date(result.completedAt).toLocaleString('ru-RU')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={onBack} variant="outline" className="flex-1">
                  <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                  Вернуться
                </Button>
                <Button 
                  onClick={handlePrintProtocol}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
                >
                  <Icon name="Printer" className="h-4 w-4 mr-2" />
                  Распечатать протокол
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (showProtocol && result) {
    return (
      <div className="min-h-screen bg-white p-8 print:p-0">
        <style>
          {`
            @media print {
              body { margin: 0; padding: 20mm; }
              @page { size: A4; margin: 0; }
              .no-print { display: none !important; }
              .print-container { page-break-inside: avoid; }
            }
          `}
        </style>
        
        <div className="max-w-4xl mx-auto print-container">
          <div className="no-print mb-4 flex justify-end gap-2">
            <Button onClick={() => setShowProtocol(false)} variant="outline">
              <Icon name="X" className="h-4 w-4 mr-2" />
              Закрыть
            </Button>
            <Button onClick={() => window.print()} className="bg-blue-600">
              <Icon name="Printer" className="h-4 w-4 mr-2" />
              Печать
            </Button>
          </div>

          <div className="border-2 border-black p-8 space-y-6">
            <div className="text-center space-y-2 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold uppercase">ПРОТОКОЛ</h1>
              <p className="text-lg">проверки знаний требований охраны труда</p>
              <p className="text-sm">№ {protocolNumber} от {new Date().toLocaleDateString('ru-RU')}</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[150px,1fr] gap-2">
                <span className="font-medium">Организация:</span>
                <span>АО "ГРК "Западная""</span>
              </div>
              {listenerName && (
                <>
                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <span className="font-medium">ФИО слушателя:</span>
                    <span>{listenerName}</span>
                  </div>
                  {listenerPosition && (
                    <div className="grid grid-cols-[150px,1fr] gap-2">
                      <span className="font-medium">Должность:</span>
                      <span>{listenerPosition}</span>
                    </div>
                  )}
                </>
              )}
              <div className="grid grid-cols-[150px,1fr] gap-2">
                <span className="font-medium">Название теста:</span>
                <span>{test.title}</span>
              </div>
              <div className="grid grid-cols-[150px,1fr] gap-2">
                <span className="font-medium">Дата проведения:</span>
                <span>{new Date(result.completedAt).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="grid grid-cols-[150px,1fr] gap-2">
                <span className="font-medium">Время проведения:</span>
                <span>{new Date(result.completedAt).toLocaleTimeString('ru-RU')}</span>
              </div>
            </div>

            <div className="border-t-2 border-black pt-4 space-y-3">
              <h2 className="font-bold text-lg">Результаты тестирования:</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-black p-3">
                  <p className="text-sm text-gray-600">Всего вопросов:</p>
                  <p className="text-xl font-bold">{test.questions.length}</p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-sm text-gray-600">Правильных ответов:</p>
                  <p className="text-xl font-bold">
                    {test.questions.filter(q => {
                      const userAnswer = userAnswers.get(q.id);
                      if (q.type === 'text') return userAnswer?.textAnswer;
                      const correct = q.answers.filter(a => a.isCorrect).map(a => a.id).sort();
                      const selected = (userAnswer?.selectedAnswers || []).sort();
                      return JSON.stringify(correct) === JSON.stringify(selected);
                    }).length}
                  </p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-sm text-gray-600">Набрано баллов:</p>
                  <p className="text-xl font-bold">{result.earnedPoints} из {result.totalPoints}</p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-sm text-gray-600">Результат:</p>
                  <p className="text-xl font-bold">{result.percentage}%</p>
                </div>
              </div>
              
              <div className={`border-2 p-4 text-center ${
                result.passed ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
              }`}>
                <p className="text-xl font-bold uppercase ${
                  result.passed ? 'text-green-800' : 'text-red-800'
                }">
                  {result.passed ? '✓ ТЕСТ ПРОЙДЕН' : '✗ ТЕСТ НЕ ПРОЙДЕН'}
                </p>
                <p className="text-sm mt-1">
                  Проходной балл: {test.passingScore}%
                </p>
              </div>
            </div>

            <div className="border-t-2 border-black pt-6 space-y-8">
              <div className="space-y-2">
                <p className="font-medium">Тестируемый:</p>
                <div className="border-b-2 border-black pt-8 pb-2 flex justify-between">
                  <span className="text-sm text-gray-600">___________________</span>
                  <span className="text-sm text-gray-600">_______________________________</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>(подпись)</span>
                  <span>(Фамилия И.О.)</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Проверяющий (инспектор по охране труда):</p>
                <div className="border-b-2 border-black pt-8 pb-2 flex justify-between">
                  <span className="text-sm text-gray-600">___________________</span>
                  <span className="text-sm text-gray-600">_______________________________</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>(подпись)</span>
                  <span>(Фамилия И.О.)</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-300">
              <p>Протокол сгенерирован автоматически системой тестирования АО "ГРК "Западная""</p>
              <p>Документ действителен только при наличии подписей тестируемого и проверяющего</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowExitDialog(true)}
              >
                <Icon name="X" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">{test.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Вопрос {currentQuestionIndex + 1} из {test.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {timerEnabled && (
                <Badge 
                  variant={timeRemaining < 300 ? "destructive" : "secondary"}
                  className="text-lg px-4 py-2"
                >
                  <Icon name="Clock" className="h-4 w-4 mr-2" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
              <Badge variant="secondary" className="text-sm">
                <Icon name="CheckCircle2" className="h-4 w-4 mr-1" />
                {answeredCount} / {test.questions.length}
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="mb-3">
                    {currentQuestion.type === 'single' 
                      ? 'Один правильный ответ' 
                      : currentQuestion.type === 'multiple'
                      ? 'Несколько правильных ответов'
                      : 'Текстовый ответ'}
                  </Badge>
                  <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                </div>
                <Badge variant="outline" className="ml-4">
                  {currentQuestion.points} {currentQuestion.points === 1 ? 'балл' : 'балла'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {currentQuestion.type === 'text' ? (
                <Textarea
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Введите ваш ответ..."
                  rows={5}
                  className="w-full"
                />
              ) : currentQuestion.type === 'single' ? (
                <RadioGroup
                  value={currentAnswer?.selectedAnswers[0] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value, true)}
                >
                  <div className="space-y-3">
                    {currentQuestion.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <RadioGroupItem value={answer.id} id={answer.id} />
                        <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                          {answer.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        id={answer.id}
                        checked={currentAnswer?.selectedAnswers.includes(answer.id) || false}
                        onCheckedChange={(checked) => 
                          handleAnswerChange(currentQuestion.id, answer.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                        {answer.text}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <Icon name="ChevronLeft" className="h-4 w-4 mr-2" />
              Назад
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === test.questions.length - 1 ? (
                <Button
                  onClick={handleFinishTest}
                  className="bg-gradient-to-r from-green-600 to-emerald-500"
                >
                  <Icon name="CheckCircle2" className="h-4 w-4 mr-2" />
                  Завершить тест
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  Далее
                  <Icon name="ChevronRight" className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm">Навигация по вопросам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {test.questions.map((_, index) => {
                  const answered = userAnswers.has(test.questions[index].id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <Button
                      key={index}
                      variant={isCurrent ? "default" : answered ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className="w-12 h-12"
                    >
                      {answered && !isCurrent && (
                        <Icon name="Check" className="h-3 w-3 absolute top-1 right-1" />
                      )}
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Прервать тестирование?</DialogTitle>
            <DialogDescription>
              Ваш прогресс не будет сохранен. Вы уверены, что хотите выйти?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Продолжить тест
            </Button>
            <Button variant="destructive" onClick={onBack}>
              Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}