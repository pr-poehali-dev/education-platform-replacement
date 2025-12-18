import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TestResultsHistoryProps {
  onBack: () => void;
  testId?: string;
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
  answers: Array<{
    questionId: string;
    selectedAnswers: string[];
    textAnswer?: string;
  }>;
}

export default function TestResultsHistory({ onBack, testId }: TestResultsHistoryProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>(testId || 'all');
  const [uniqueTests, setUniqueTests] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [selectedTestId, results]);

  const loadResults = () => {
    const savedResults = localStorage.getItem('test_results');
    if (savedResults) {
      const allResults: TestResult[] = JSON.parse(savedResults);
      setResults(allResults);

      const tests = new Map<string, string>();
      allResults.forEach(r => {
        if (!tests.has(r.testId)) {
          tests.set(r.testId, r.testTitle);
        }
      });

      setUniqueTests(Array.from(tests.entries()).map(([id, title]) => ({ id, title })));
    }
  };

  const filterResults = () => {
    if (selectedTestId === 'all') {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter(r => r.testId === selectedTestId));
    }
  };

  const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs} сек`;
    return `${minutes} мин ${secs} сек`;
  };

  const handleDeleteResult = (index: number) => {
    if (confirm('Удалить этот результат?')) {
      const newResults = [...results];
      const globalIndex = results.indexOf(filteredResults[index]);
      newResults.splice(globalIndex, 1);
      localStorage.setItem('test_results', JSON.stringify(newResults));
      setResults(newResults);
    }
  };

  const handleClearAll = () => {
    if (confirm('Удалить все результаты? Это действие нельзя отменить.')) {
      localStorage.removeItem('test_results');
      setResults([]);
      setFilteredResults([]);
    }
  };

  const stats = {
    total: filteredResults.length,
    passed: filteredResults.filter(r => r.passed).length,
    failed: filteredResults.filter(r => !r.passed).length,
    avgScore: filteredResults.length > 0
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length)
      : 0,
    avgTime: filteredResults.length > 0
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.timeSpent, 0) / filteredResults.length)
      : 0
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
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl">
                <Icon name="BarChart3" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  История прохождений
                </h1>
                <p className="text-xs text-muted-foreground">Результаты тестирований</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.total} прохождений</Badge>
              {results.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearAll}>
                  <Icon name="Trash2" className="h-4 w-4 mr-2" />
                  Очистить всё
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {uniqueTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Фильтр</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите тест" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все тесты</SelectItem>
                    {uniqueTests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {filteredResults.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Всего попыток</CardDescription>
                    <CardTitle className="text-2xl">{stats.total}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Пройдено</CardDescription>
                    <CardTitle className="text-2xl text-green-600">{stats.passed}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Не пройдено</CardDescription>
                    <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Средний балл</CardDescription>
                    <CardTitle className="text-2xl text-blue-600">{stats.avgScore}%</CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Среднее время</CardDescription>
                    <CardTitle className="text-2xl text-purple-600">
                      {formatTimeSpent(stats.avgTime)}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Все результаты</CardTitle>
                  <CardDescription>История прохождений тестов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Дата</TableHead>
                          <TableHead>Тест</TableHead>
                          <TableHead className="text-center">Результат</TableHead>
                          <TableHead className="text-center">Баллы</TableHead>
                          <TableHead className="text-center">Время</TableHead>
                          <TableHead className="text-center">Статус</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(result.completedAt).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{result.testTitle}</TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={result.percentage >= 80 ? 'default' : result.percentage >= 60 ? 'secondary' : 'destructive'}
                              >
                                {result.percentage}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {result.earnedPoints} / {result.totalPoints}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {result.timeSpent > 0 ? formatTimeSpent(result.timeSpent) : '—'}
                            </TableCell>
                            <TableCell className="text-center">
                              {result.passed ? (
                                <Badge className="bg-green-600">
                                  <Icon name="CheckCircle2" className="h-3 w-3 mr-1" />
                                  Пройден
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <Icon name="XCircle" className="h-3 w-3 mr-1" />
                                  Не пройден
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteResult(index)}
                              >
                                <Icon name="Trash2" className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {filteredResults.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Icon name="Inbox" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {results.length === 0 
                    ? 'Результатов пока нет. Пройдите первый тест!' 
                    : 'Результатов по этому тесту не найдено'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
