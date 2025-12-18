import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface TrainingModeProps {
  onBack: () => void;
  listenerId: string;
  assignedTests: any[];
}

interface TrainingResult {
  testId: string;
  testTitle: string;
  questionCount: number;
  correctAnswers: number;
  percentage: number;
  completedAt: string;
  questions: Array<{
    id: string;
    text: string;
    answers: any[];
    userAnswer?: string[];
    correctAnswers: string[];
    isCorrect: boolean;
  }>;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  answers: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export default function TrainingMode({ onBack, listenerId, assignedTests }: TrainingModeProps) {
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [trainingQuestions, setTrainingQuestions] = useState<Question[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentResult, setCurrentResult] = useState<TrainingResult | null>(null);
  const [savedResults, setSavedResults] = useState<TrainingResult[]>([]);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [reviewResultId, setReviewResultId] = useState<string>('');

  useEffect(() => {
    loadSavedResults();
  }, [listenerId]);

  const loadSavedResults = () => {
    const saved = localStorage.getItem(`training_results_${listenerId}`);
    if (saved) {
      setSavedResults(JSON.parse(saved));
    }
  };

  const getShuffledQuestions = (testId: string, count: number): Question[] => {
    const savedTests = localStorage.getItem('tests_catalog');
    if (!savedTests) return [];
    
    const tests = JSON.parse(savedTests);
    const test = tests.find((t: any) => t.id === testId);
    if (!test || !test.questions) return [];

    const shuffled = [...test.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, 20, shuffled.length));
  };

  const handleStartTraining = () => {
    if (!selectedTestId) return;
    
    const questions = getShuffledQuestions(selectedTestId, questionCount);
    setTrainingQuestions(questions);
    setUserAnswers(new Map());
    setCurrentQuestionIndex(0);
    setIsStarted(true);
    setShowResults(false);
  };

  const handleAnswerChange = (questionId: string, answerId: string, checked: boolean) => {
    const currentQuestion = trainingQuestions[currentQuestionIndex];
    const currentAnswers = userAnswers.get(questionId) || [];
    
    let newAnswers: string[];
    if (currentQuestion.type === 'single') {
      newAnswers = [answerId];
    } else {
      if (checked) {
        newAnswers = [...currentAnswers, answerId];
      } else {
        newAnswers = currentAnswers.filter(id => id !== answerId);
      }
    }
    
    setUserAnswers(new Map(userAnswers.set(questionId, newAnswers)));
  };

  const handleFinishTraining = () => {
    const test = assignedTests.find(t => t.id === selectedTestId);
    if (!test) return;

    const questionsWithResults = trainingQuestions.map(q => {
      const userAnswer = userAnswers.get(q.id) || [];
      const correctAnswers = q.answers.filter(a => a.isCorrect).map(a => a.id).sort();
      const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers);
      
      return {
        id: q.id,
        text: q.text,
        answers: q.answers,
        userAnswer,
        correctAnswers,
        isCorrect
      };
    });

    const correctCount = questionsWithResults.filter(q => q.isCorrect).length;
    const percentage = Math.round((correctCount / trainingQuestions.length) * 100);

    const result: TrainingResult = {
      testId: selectedTestId,
      testTitle: test.title,
      questionCount: trainingQuestions.length,
      correctAnswers: correctCount,
      percentage,
      completedAt: new Date().toISOString(),
      questions: questionsWithResults
    };

    const updated = [...savedResults, result];
    localStorage.setItem(`training_results_${listenerId}`, JSON.stringify(updated));
    setSavedResults(updated);
    
    setCurrentResult(result);
    setShowResults(true);
  };

  const handleRetake = () => {
    handleStartTraining();
  };

  const handleReviewResult = (result: TrainingResult) => {
    setCurrentResult(result);
    setReviewResultId(result.completedAt);
    setShowReviewMode(true);
  };

  const handleClearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить историю тренировок? Это действие нельзя отменить.')) {
      localStorage.removeItem(`training_results_${listenerId}`);
      setSavedResults([]);
    }
  };

  const currentQuestion = trainingQuestions[currentQuestionIndex];
  const currentUserAnswers = currentQuestion ? userAnswers.get(currentQuestion.id) || [] : [];

  if (showReviewMode && currentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setShowReviewMode(false)}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Icon name="Eye" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Просмотр ошибок</h1>
                <p className="text-xs text-muted-foreground">{currentResult.testTitle}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Результат: {currentResult.percentage}%</CardTitle>
                    <CardDescription>
                      Правильных ответов: {currentResult.correctAnswers} из {currentResult.questionCount}
                    </CardDescription>
                  </div>
                  <Badge className={currentResult.percentage >= 80 ? 'bg-green-600' : 'bg-red-600'}>
                    {currentResult.percentage >= 80 ? 'Зачет' : 'Незачет'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {currentResult.questions.map((q, index) => (
              <Card key={q.id} className={!q.isCorrect ? 'border-red-300 bg-red-50/30' : 'border-green-300 bg-green-50/30'}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Вопрос {index + 1}</Badge>
                        {q.isCorrect ? (
                          <Badge className="bg-green-600">
                            <Icon name="Check" className="h-3 w-3 mr-1" />
                            Правильно
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600">
                            <Icon name="X" className="h-3 w-3 mr-1" />
                            Ошибка
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{q.text}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.answers.map((answer) => {
                    const isUserAnswer = q.userAnswer?.includes(answer.id);
                    const isCorrectAnswer = q.correctAnswers.includes(answer.id);
                    
                    return (
                      <div
                        key={answer.id}
                        className={`p-3 rounded-lg border-2 ${
                          isCorrectAnswer
                            ? 'border-green-500 bg-green-50'
                            : isUserAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrectAnswer && (
                            <Icon name="CheckCircle2" className="h-5 w-5 text-green-600" />
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <Icon name="XCircle" className="h-5 w-5 text-red-600" />
                          )}
                          <span className={isCorrectAnswer || isUserAnswer ? 'font-medium' : ''}>
                            {answer.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (showResults && currentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${currentResult.percentage >= 80 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'}`}>
                <Icon name={currentResult.percentage >= 80 ? "CheckCircle2" : "XCircle"} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Результаты тренировки</h1>
                <p className="text-xs text-muted-foreground">{currentResult.testTitle}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${currentResult.percentage >= 80 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Icon 
                    name={currentResult.percentage >= 80 ? "CheckCircle2" : "XCircle"} 
                    className={`h-12 w-12 ${currentResult.percentage >= 80 ? 'text-green-600' : 'text-red-600'}`}
                  />
                </div>
                <div>
                  <CardTitle className="text-3xl">
                    {currentResult.percentage >= 80 ? 'Отлично!' : 'Нужно еще потренироваться'}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Вы ответили правильно на {currentResult.correctAnswers} из {currentResult.questionCount} вопросов
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Ваш результат</p>
                  <p className="text-3xl font-bold text-blue-600">{currentResult.percentage}%</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Правильных ответов</p>
                  <p className="text-3xl font-bold text-green-600">
                    {currentResult.correctAnswers} / {currentResult.questionCount}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={onBack} variant="outline" className="flex-1">
                  <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                  К списку
                </Button>
                <Button 
                  onClick={() => {
                    setShowResults(false);
                    setShowReviewMode(true);
                  }}
                  variant="outline" 
                  className="flex-1"
                >
                  <Icon name="Eye" className="h-4 w-4 mr-2" />
                  Просмотр ошибок
                </Button>
                <Button 
                  onClick={handleRetake}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
                >
                  <Icon name="RotateCw" className="h-4 w-4 mr-2" />
                  Пройти заново
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isStarted && currentQuestion) {
    const progress = ((currentQuestionIndex + 1) / trainingQuestions.length) * 100;
    const answeredCount = userAnswers.size;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <header className="bg-white border-b shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (confirm('Вы уверены, что хотите прервать тренировку? Прогресс не будет сохранен.')) {
                      setIsStarted(false);
                    }
                  }}
                >
                  <Icon name="X" className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-bold">Тренировочный режим</h1>
                  <p className="text-xs text-muted-foreground">
                    Вопрос {currentQuestionIndex + 1} из {trainingQuestions.length}
                  </p>
                </div>
              </div>

              <Badge variant="secondary" className="text-sm">
                <Icon name="CheckCircle2" className="h-4 w-4 mr-1" />
                {answeredCount} / {trainingQuestions.length}
              </Badge>
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
                        : 'Несколько правильных ответов'}
                    </Badge>
                    <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {currentQuestion.type === 'single' ? (
                  <RadioGroup
                    value={currentUserAnswers[0] || ''}
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
                          checked={currentUserAnswers.includes(answer.id)}
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
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <Icon name="ChevronLeft" className="h-4 w-4 mr-2" />
                Назад
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === trainingQuestions.length - 1 ? (
                  <Button
                    onClick={handleFinishTraining}
                    className="bg-gradient-to-r from-green-600 to-emerald-500"
                  >
                    <Icon name="CheckCircle2" className="h-4 w-4 mr-2" />
                    Завершить тренировку
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
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
                  {trainingQuestions.map((q, index) => {
                    const answered = userAnswers.has(q.id);
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <Button
                        key={q.id}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
              <Icon name="Dumbbell" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Тренировочный режим
              </h1>
              <p className="text-xs text-muted-foreground">Практика без ограничения времени</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {savedResults.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Всего попыток</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="BarChart3" className="h-8 w-8 text-blue-600" />
                    <span className="text-3xl font-bold">{savedResults.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Средний результат</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="h-8 w-8 text-green-600" />
                    <span className="text-3xl font-bold">
                      {Math.round(savedResults.reduce((acc, r) => acc + r.percentage, 0) / savedResults.length)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Лучший результат</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="Award" className="h-8 w-8 text-yellow-600" />
                    <span className="text-3xl font-bold">
                      {Math.max(...savedResults.map(r => r.percentage))}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">Успешных тренировок</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle2" className="h-8 w-8 text-emerald-600" />
                    <span className="text-3xl font-bold">
                      {savedResults.filter(r => r.percentage >= 80).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройка тренировки</CardTitle>
                <CardDescription>Выберите тест и количество вопросов для практики</CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Выберите тест</Label>
                <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тест для тренировки" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedTests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.title} ({test.questionCount} вопросов)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Количество вопросов: {questionCount}</Label>
                <Slider
                  value={[questionCount]}
                  onValueChange={(value) => setQuestionCount(value[0])}
                  min={5}
                  max={20}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20 (макс.)</span>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-900">
                  <Icon name="Info" className="h-4 w-4" />
                  <span className="font-medium text-sm">Особенности тренировки:</span>
                </div>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                  <li>Вопросы выбираются случайно и не повторяются</li>
                  <li>Нет ограничения по времени</li>
                  <li>Можно вернуться к предыдущим вопросам</li>
                  <li>После завершения можно просмотреть ошибки</li>
                  <li>Результаты сохраняются в истории</li>
                </ul>
              </div>

              <Button 
                onClick={handleStartTraining}
                disabled={!selectedTestId}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
              >
                <Icon name="Play" className="h-5 w-5 mr-2" />
                Начать тренировку
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>История тренировок</CardTitle>
                  <CardDescription>Ваши результаты и ошибки для повторения</CardDescription>
                </div>
                {savedResults.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearHistory}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Icon name="Trash2" className="h-4 w-4 mr-1" />
                    Очистить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {savedResults.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="BookOpen" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    История тренировок пуста. Пройдите первую тренировку!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {savedResults.slice().reverse().map((result, index) => (
                    <Card 
                      key={result.completedAt}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleReviewResult(result)}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{result.testTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(result.completedAt).toLocaleString('ru-RU')}
                              </p>
                            </div>
                            <Badge className={result.percentage >= 80 ? 'bg-green-600' : 'bg-red-600'}>
                              {result.percentage}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {result.correctAnswers} / {result.questionCount} правильно
                            </span>
                            <Button size="sm" variant="ghost">
                              <Icon name="Eye" className="h-4 w-4 mr-1" />
                              Просмотр
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
}