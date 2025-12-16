import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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

interface TestingPageProps {
  onBack: () => void;
  userName: string;
  userRole: string;
}

export default function TestingPage({ onBack, userName, userRole }: TestingPageProps) {
  const [testMode, setTestMode] = useState<'practice' | 'exam' | null>(null);
  const [testSession, setTestSession] = useState<TestSession>({
    questions: [],
    currentQuestion: 0,
    timeRemaining: 0,
    status: 'not-started'
  });
  const [showProtocol, setShowProtocol] = useState(false);
  const [protocolData, setProtocolData] = useState<any>(null);

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
      student: userName,
      studentPosition: userRole,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
              <Icon name="ClipboardCheck" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Тестирование
              </h1>
              <p className="text-xs text-muted-foreground">Создание и проведение тестов</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
          currentUser={{ name: userName, role: 'admin', position: userRole }}
        />
      </main>
    </div>
  );
}
