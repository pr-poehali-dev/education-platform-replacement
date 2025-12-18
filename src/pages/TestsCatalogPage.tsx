import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface TestsCatalogPageProps {
  onBack: () => void;
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

interface Test {
  id: string;
  title: string;
  category: TestCategory;
  topic?: TestTopic;
  questionCount: number;
  passingScore: number;
  duration: number;
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

const getCategoryIcon = (category: TestCategory): string => {
  const icons: Record<TestCategory, string> = {
    'iot': 'ShieldCheck',
    'job-instruction': 'Briefcase',
    'profession': 'HardHat',
    'program': 'GraduationCap',
    'topic': 'BookOpen'
  };
  return icons[category];
};

const getCategoryColor = (category: TestCategory): string => {
  const colors: Record<TestCategory, string> = {
    'iot': 'from-blue-500 to-cyan-500',
    'job-instruction': 'from-green-500 to-emerald-500',
    'profession': 'from-purple-500 to-pink-500',
    'program': 'from-yellow-500 to-orange-500',
    'topic': 'from-indigo-500 to-purple-500'
  };
  return colors[category];
};

export default function TestsCatalogPage({ onBack }: TestsCatalogPageProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = () => {
    const savedTests = localStorage.getItem('tests_catalog');
    if (savedTests) {
      setTests(JSON.parse(savedTests));
    }
  };

  const filteredTests = tests.filter(test => {
    if (selectedCategory !== 'all' && test.category !== selectedCategory) return false;
    if (selectedTopic !== 'all' && test.topic !== selectedTopic) return false;
    if (searchQuery && !test.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateTest = () => {
    alert('Функция создания теста будет реализована');
  };

  const handleEditTest = (testId: string) => {
    alert(`Редактирование теста ${testId} будет реализовано`);
  };

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
                <Icon name="ClipboardCheck" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Каталог тестов
                </h1>
                <p className="text-xs text-muted-foreground">Разработка и управление тестами</p>
              </div>
            </div>
            <Button onClick={handleCreateTest} className="bg-gradient-to-r from-purple-600 to-pink-500">
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Создать тест
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input 
                placeholder="Поиск по названию теста..." 
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Направление" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все направления</SelectItem>
                <SelectItem value="iot">Тест по ИОТ</SelectItem>
                <SelectItem value="job-instruction">Тест по ДИ</SelectItem>
                <SelectItem value="profession">Тест по профессии</SelectItem>
                <SelectItem value="program">Тест по программе обучения</SelectItem>
                <SelectItem value="topic">Тест по темам</SelectItem>
              </SelectContent>
            </Select>
            {selectedCategory === 'topic' && (
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Тема" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все темы</SelectItem>
                  <SelectItem value="occupational-safety">Охрана труда</SelectItem>
                  <SelectItem value="first-aid">Первая помощь</SelectItem>
                  <SelectItem value="fire-safety">Пожарная безопасность</SelectItem>
                  <SelectItem value="explosives">Взрывное дело</SelectItem>
                  <SelectItem value="underground-mining">Подземные горные выработки</SelectItem>
                  <SelectItem value="work-at-height">Работы на высоте</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const count = tests.filter(t => t.category === key).length;
              return (
                <Card 
                  key={key} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCategory(key)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getCategoryColor(key as TestCategory)} flex items-center justify-center mb-3`}>
                      <Icon name={getCategoryIcon(key as TestCategory)} className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <CardDescription>{count} тестов</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <Icon name="FileX" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Тестов не найдено</p>
              <Button onClick={handleCreateTest} variant="outline">
                <Icon name="Plus" className="h-4 w-4 mr-2" />
                Создать первый тест
              </Button>
            </div>
          )}

          {filteredTests.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Icon name={getCategoryIcon(test.category)} className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{categoryLabels[test.category]}</Badge>
                    </div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    {test.topic && (
                      <CardDescription>{topicLabels[test.topic]}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Вопросов:</span>
                        <span className="font-medium text-foreground">{test.questionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Проходной балл:</span>
                        <span className="font-medium text-foreground">{test.passingScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Длительность:</span>
                        <span className="font-medium text-foreground">{test.duration} мин</span>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs">
                          Обновлено: {new Date(test.lastUpdated).toLocaleDateString('ru-RU')}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTest(test.id)}
                        >
                          <Icon name="Edit" className="h-4 w-4 mr-1" />
                          Открыть
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
