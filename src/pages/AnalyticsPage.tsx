import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AnalyticsPageProps {
  onBack: () => void;
}

export default function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl">
              <Icon name="BarChart3" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Аналитика
              </h1>
              <p className="text-xs text-muted-foreground">Отчёты и статистика по обучению</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
      </main>
    </div>
  );
}
