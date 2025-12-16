import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface TestingInterfaceProps {
  testMode: 'practice' | 'exam' | null;
  testSession: TestSession;
  onStartTest: (mode: 'practice' | 'exam') => void;
  onAnswerQuestion: (answerIndex: number) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onFinishTest: () => void;
  showProtocol: boolean;
  setShowProtocol: (show: boolean) => void;
  protocolData: any;
  currentUser: {
    name: string;
    role: 'admin' | 'student';
    position: string;
  };
}

export default function TestingInterface({
  testMode,
  testSession,
  onStartTest,
  onAnswerQuestion,
  onNextQuestion,
  onPrevQuestion,
  onFinishTest,
  showProtocol,
  setShowProtocol,
  protocolData,
  currentUser
}: TestingInterfaceProps) {
  if (testSession.status === 'not-started') {
    if (currentUser.role === 'student') {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
              <Icon name="ClipboardCheck" className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Блок тестирования</h2>
            <p className="text-muted-foreground">Назначенные тесты и экзамены</p>
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Icon name="ClipboardList" className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Нет назначенных тестов</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                У вас пока нет назначенных тестов или экзаменов. Когда администратор назначит вам программу обучения, здесь появятся доступные тесты.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Тестирование знаний</h2>
          <p className="text-muted-foreground">Проверьте свои знания в различных областях охраны труда</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon name="BookOpen" className="h-6 w-6 text-blue-500" />
                <CardTitle>Тренировочный режим</CardTitle>
              </div>
              <CardDescription>Неограниченное время, возможность вернуться к вопросам</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Без ограничения времени</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Можно вернуться к вопросам</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Результаты не сохраняются</span>
                </li>
              </ul>
              <Button onClick={() => onStartTest('practice')} className="w-full">
                Начать тренировку
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon name="Award" className="h-6 w-6 text-yellow-500" />
                <CardTitle>Экзамен</CardTitle>
              </div>
              <CardDescription>Официальное тестирование с ограничением времени</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <Icon name="Clock" className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Ограничение 45 минут</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="FileCheck" className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Результаты сохраняются</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Award" className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Выдаётся протокол</span>
                </li>
              </ul>
              <Button onClick={() => onStartTest('exam')} className="w-full bg-gradient-to-r from-orange-600 to-orange-500">
                Начать экзамен
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (testSession.status === 'in-progress') {
    const currentQ = testSession.questions[testSession.currentQuestion];
    const progress = ((testSession.currentQuestion + 1) / testSession.questions.length) * 100;
    const answeredCount = testSession.questions.filter(q => q.userAnswer !== undefined).length;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {testMode === 'exam' ? 'Экзамен' : 'Тренировочный режим'}
            </h2>
            <p className="text-muted-foreground">Вопрос {testSession.currentQuestion + 1} из {testSession.questions.length}</p>
          </div>
          {testMode === 'exam' && (
            <div className="flex items-center gap-2 text-orange-600">
              <Icon name="Clock" className="h-5 w-5" />
              <span className="font-mono text-lg">
                {Math.floor(testSession.timeRemaining / 60)}:{String(testSession.timeRemaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge variant="outline">Вопрос {testSession.currentQuestion + 1}</Badge>
              <Badge variant={currentQ.userAnswer !== undefined ? "default" : "secondary"}>
                {currentQ.userAnswer !== undefined ? 'Отвечено' : 'Не отвечено'}
              </Badge>
            </div>
            <CardTitle className="text-xl mt-4">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => onAnswerQuestion(idx)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  currentQ.userAnswer === idx
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    currentQ.userAnswer === idx ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}>
                    {currentQ.userAnswer === idx && <Icon name="Check" className="h-4 w-4" />}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Прогресс тестирования</span>
              <span>{answeredCount} из {testSession.questions.length} отвечено</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex justify-between">
            <Button
              onClick={onPrevQuestion}
              disabled={testSession.currentQuestion === 0}
              variant="outline"
            >
              <Icon name="ChevronLeft" className="h-4 w-4 mr-2" />
              Назад
            </Button>

            <div className="flex gap-2">
              {testSession.currentQuestion < testSession.questions.length - 1 ? (
                <Button onClick={onNextQuestion}>
                  Далее
                  <Icon name="ChevronRight" className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onFinishTest}
                  className="bg-gradient-to-r from-green-600 to-green-500"
                  disabled={answeredCount < testSession.questions.length}
                >
                  <Icon name="Check" className="h-4 w-4 mr-2" />
                  Завершить тест
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Навигация по вопросам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {testSession.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {}}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${
                    idx === testSession.currentQuestion
                      ? 'border-primary bg-primary text-primary-foreground'
                      : q.userAnswer !== undefined
                      ? 'border-green-500 bg-green-50'
                      : 'border-border'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Dialog open={showProtocol} onOpenChange={setShowProtocol}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Протокол проверки знаний</DialogTitle>
          <DialogDescription>Результаты тестирования по охране труда</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {protocolData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Протокол {protocolData.number}</p>
                  <p className="text-muted-foreground">от {protocolData.date}</p>
                </div>
                <div className="text-right">
                  <Badge variant={protocolData.passed ? "default" : "destructive"} className="text-base px-4 py-2">
                    {protocolData.passed ? 'СДАЛ' : 'НЕ СДАЛ'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Проверяемый</p>
                  <p className="font-medium">{protocolData.student}</p>
                  <p className="text-sm">{protocolData.studentPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Проверяющий</p>
                  <p className="font-medium">{protocolData.inspector}</p>
                  <p className="text-sm">{protocolData.inspectorPosition}</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Тема тестирования</p>
                <p className="font-medium">{protocolData.testName}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold">{protocolData.totalQuestions}</p>
                    <p className="text-sm text-muted-foreground">Всего вопросов</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold text-green-600">{protocolData.correctAnswers}</p>
                    <p className="text-sm text-muted-foreground">Правильных</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-2xl font-bold">{protocolData.score}%</p>
                    <p className="text-sm text-muted-foreground">Результат</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <p className="font-medium">Результаты по вопросам:</p>
                {protocolData.questions.map((q: TestQuestion, idx: number) => (
                  <div key={q.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        q.userAnswer === q.correctAnswer ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <Icon name={q.userAnswer === q.correctAnswer ? 'Check' : 'X'} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                        {q.userAnswer !== q.correctAnswer && (
                          <div className="space-y-1">
                            <p className="text-red-600">
                              Ваш ответ: {q.options[q.userAnswer || 0]}
                            </p>
                            <p className="text-green-600">
                              Правильный ответ: {q.options[q.correctAnswer]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowProtocol(false)}>
            <Icon name="Download" className="h-4 w-4 mr-2" />
            Скачать PDF
          </Button>
          <Button variant="outline" onClick={() => setShowProtocol(false)}>
            Закрыть
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
  );
}