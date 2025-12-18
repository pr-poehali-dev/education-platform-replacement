import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TestBuilderProps {
  onBack: () => void;
  testId?: string;
}

type TestCategory = 
  | 'iot' 
  | 'job-instruction' 
  | 'profession' 
  | 'program' 
  | 'topic';

type TestTopic = 
  | 'occupational-safety'
  | 'first-aid'
  | 'fire-safety'
  | 'explosives'
  | 'underground-mining'
  | 'work-at-height'
  | 'other';

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
  category: TestCategory;
  topic?: TestTopic;
  questionCount: number;
  passingScore: number;
  duration: number;
  questions: Question[];
  created: string;
  lastUpdated: string;
}

const categoryLabels: Record<TestCategory, string> = {
  'iot': 'Тест по ИОТ',
  'job-instruction': 'Тест по ДИ',
  'profession': 'Тест по профессии',
  'program': 'Тест по программе обучения',
  'topic': 'Тест по темам'
};

const topicLabels: Record<TestTopic, string> = {
  'occupational-safety': 'Охрана труда',
  'first-aid': 'Первая помощь',
  'fire-safety': 'Пожарная безопасность',
  'explosives': 'Взрывное дело',
  'underground-mining': 'Правила безопасного нахождения в подземных горных выработках',
  'work-at-height': 'Работы на высоте',
  'other': 'Другое'
};

const questionTypeLabels: Record<QuestionType, string> = {
  'single': 'Один правильный ответ',
  'multiple': 'Несколько правильных ответов',
  'text': 'Текстовый ответ'
};

export default function TestBuilder({ onBack, testId }: TestBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TestCategory>('iot');
  const [topic, setTopic] = useState<TestTopic>('occupational-safety');
  const [passingScore, setPassingScore] = useState(80);
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (testId) {
      loadTest(testId);
    }
  }, [testId]);

  const loadTest = (id: string) => {
    const savedTests = localStorage.getItem('tests_catalog');
    if (savedTests) {
      const tests: Test[] = JSON.parse(savedTests);
      const test = tests.find(t => t.id === id);
      if (test) {
        setTitle(test.title);
        setDescription(test.description);
        setCategory(test.category);
        setTopic(test.topic || 'occupational-safety');
        setPassingScore(test.passingScore);
        setDuration(test.duration);
        setQuestions(test.questions);
      }
    }
  };

  const handleGenerateTest = async () => {
    if (!title.trim()) {
      alert('Введите название теста для генерации');
      return;
    }

    const questionCount = prompt('Сколько вопросов сгенерировать?', '10');
    if (!questionCount || isNaN(Number(questionCount))) return;

    setIsGenerating(true);

    try {
      const response = await fetch('https://functions.poehali.dev/1bfacdc0-189a-40a3-b9c3-e5215a7de9ed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          topic,
          questionCount: Number(questionCount)
        })
      });

      if (!response.ok) throw new Error('Ошибка генерации');

      const data = await response.json();
      setQuestions(data.questions);
      alert(`Успешно сгенерировано ${data.questions.length} вопросов`);
    } catch (error) {
      console.error(error);
      alert('Ошибка при генерации теста');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTest = () => {
    if (!title.trim()) {
      alert('Введите название теста');
      return;
    }
    if (questions.length === 0) {
      alert('Добавьте хотя бы один вопрос');
      return;
    }

    setIsSaving(true);

    const test: Test = {
      id: testId || `test_${Date.now()}`,
      title,
      description,
      category,
      topic: category === 'topic' ? topic : undefined,
      questionCount: questions.length,
      passingScore,
      duration,
      questions,
      created: testId ? '' : new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const savedTests = localStorage.getItem('tests_catalog');
    const tests: Test[] = savedTests ? JSON.parse(savedTests) : [];
    
    if (testId) {
      const index = tests.findIndex(t => t.id === testId);
      if (index !== -1) {
        test.created = tests[index].created;
        tests[index] = test;
      }
    } else {
      tests.push(test);
    }

    localStorage.setItem('tests_catalog', JSON.stringify(tests));
    
    setIsSaving(false);
    alert('Тест успешно сохранён');
    
    if (testId) {
      loadTest(testId);
    } else {
      onBack();
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'single',
      answers: [
        { id: `a_${Date.now()}_1`, text: '', isCorrect: false },
        { id: `a_${Date.now()}_2`, text: '', isCorrect: false }
      ],
      points: 1
    };
    setCurrentQuestion(newQuestion);
    setShowQuestionDialog(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion({ ...question });
    setShowQuestionDialog(true);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion) return;
    
    if (!currentQuestion.text.trim()) {
      alert('Введите текст вопроса');
      return;
    }

    if (currentQuestion.type !== 'text') {
      const hasCorrect = currentQuestion.answers.some(a => a.isCorrect);
      if (!hasCorrect) {
        alert('Отметьте хотя бы один правильный ответ');
        return;
      }
      const emptyAnswers = currentQuestion.answers.filter(a => !a.text.trim());
      if (emptyAnswers.length > 0) {
        alert('Заполните все варианты ответов');
        return;
      }
    }

    const existingIndex = questions.findIndex(q => q.id === currentQuestion.id);
    if (existingIndex !== -1) {
      const updated = [...questions];
      updated[existingIndex] = currentQuestion;
      setQuestions(updated);
    } else {
      setQuestions([...questions, currentQuestion]);
    }

    setShowQuestionDialog(false);
    setCurrentQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Удалить этот вопрос?')) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const addAnswer = () => {
    if (!currentQuestion) return;
    const newAnswer: Answer = {
      id: `a_${Date.now()}`,
      text: '',
      isCorrect: false
    };
    setCurrentQuestion({
      ...currentQuestion,
      answers: [...currentQuestion.answers, newAnswer]
    });
  };

  const removeAnswer = (answerId: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.answers.length <= 2) {
      alert('Должно быть минимум 2 варианта ответа');
      return;
    }
    setCurrentQuestion({
      ...currentQuestion,
      answers: currentQuestion.answers.filter(a => a.id !== answerId)
    });
  };

  const updateAnswer = (answerId: string, text: string) => {
    if (!currentQuestion) return;
    setCurrentQuestion({
      ...currentQuestion,
      answers: currentQuestion.answers.map(a => 
        a.id === answerId ? { ...a, text } : a
      )
    });
  };

  const toggleAnswerCorrect = (answerId: string) => {
    if (!currentQuestion) return;
    
    if (currentQuestion.type === 'single') {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(a => ({
          ...a,
          isCorrect: a.id === answerId
        }))
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(a => 
          a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a
        )
      });
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Icon name="FileEdit" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {testId ? 'Редактирование теста' : 'Создание теста'}
                </h1>
                <p className="text-xs text-muted-foreground">Конструктор тестов</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {questions.length} {questions.length === 1 ? 'вопрос' : 'вопросов'}
              </Badge>
              <Badge variant="secondary">{totalPoints} баллов</Badge>
              <Button 
                onClick={handleGenerateTest} 
                disabled={isGenerating}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Icon name="Sparkles" className="h-4 w-4 mr-2" />
                {isGenerating ? 'Генерация...' : 'Сгенерировать ИИ'}
              </Button>
              <Button onClick={handleSaveTest} disabled={isSaving} className="bg-gradient-to-r from-green-600 to-emerald-500">
                <Icon name="Save" className="h-4 w-4 mr-2" />
                {isSaving ? 'Сохранение...' : 'Сохранить тест'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Настройки теста</CardTitle>
                <CardDescription>Основные параметры</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Название теста</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Краткое описание теста"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Направление</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as TestCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {category === 'topic' && (
                  <div className="space-y-2">
                    <Label>Тема</Label>
                    <Select value={topic} onValueChange={(val) => setTopic(val as TestTopic)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(topicLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Проходной балл (%)</Label>
                  <Input 
                    type="number" 
                    value={passingScore} 
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Длительность (минуты)</Label>
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Вопросы теста</CardTitle>
                    <CardDescription>Добавьте и настройте вопросы</CardDescription>
                  </div>
                  <Button onClick={handleAddQuestion} className="bg-gradient-to-r from-blue-600 to-cyan-500">
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Добавить вопрос
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon name="FileQuestion" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Вопросов пока нет</p>
                    <Button onClick={handleAddQuestion} variant="outline">
                      <Icon name="Plus" className="h-4 w-4 mr-2" />
                      Добавить первый вопрос
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={question.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Вопрос {index + 1}</Badge>
                                <Badge variant="secondary">{questionTypeLabels[question.type]}</Badge>
                                <Badge>{question.points} {question.points === 1 ? 'балл' : 'балла'}</Badge>
                              </div>
                              <CardTitle className="text-base">{question.text}</CardTitle>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditQuestion(question)}
                              >
                                <Icon name="Edit" className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Icon name="Trash2" className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {question.type !== 'text' && (
                          <CardContent>
                            <div className="space-y-2">
                              {question.answers.map((answer, idx) => (
                                <div key={answer.id} className="flex items-center gap-2">
                                  {answer.isCorrect ? (
                                    <Icon name="CheckCircle2" className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Icon name="Circle" className="h-4 w-4 text-gray-300" />
                                  )}
                                  <span className={answer.isCorrect ? 'font-medium text-green-700' : 'text-muted-foreground'}>
                                    {idx + 1}. {answer.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentQuestion && questions.some(q => q.id === currentQuestion.id) 
                ? 'Редактирование вопроса' 
                : 'Новый вопрос'}
            </DialogTitle>
            <DialogDescription>Заполните информацию о вопросе</DialogDescription>
          </DialogHeader>

          {currentQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Текст вопроса</Label>
                <Textarea 
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  placeholder="Введите вопрос"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип вопроса</Label>
                  <Select 
                    value={currentQuestion.type} 
                    onValueChange={(val) => setCurrentQuestion({ 
                      ...currentQuestion, 
                      type: val as QuestionType,
                      answers: val === 'text' ? [] : currentQuestion.answers
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(questionTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Баллы за вопрос</Label>
                  <Input 
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              {currentQuestion.type !== 'text' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Варианты ответов</Label>
                    <Button onClick={addAnswer} variant="outline" size="sm">
                      <Icon name="Plus" className="h-4 w-4 mr-1" />
                      Добавить вариант
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {currentQuestion.answers.map((answer, idx) => (
                      <div key={answer.id} className="flex items-center gap-2">
                        <Checkbox 
                          checked={answer.isCorrect}
                          onCheckedChange={() => toggleAnswerCorrect(answer.id)}
                        />
                        <Input 
                          value={answer.text}
                          onChange={(e) => updateAnswer(answer.id, e.target.value)}
                          placeholder={`Вариант ${idx + 1}`}
                          className="flex-1"
                        />
                        {currentQuestion.answers.length > 2 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeAnswer(answer.id)}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentQuestion.type === 'single' 
                      ? 'Отметьте один правильный ответ' 
                      : 'Отметьте все правильные ответы'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Пояснение к ответу (необязательно)</Label>
                <Textarea 
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                  placeholder="Объяснение правильного ответа"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveQuestion} className="bg-gradient-to-r from-green-600 to-emerald-500">
              <Icon name="Check" className="h-4 w-4 mr-2" />
              Сохранить вопрос
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}