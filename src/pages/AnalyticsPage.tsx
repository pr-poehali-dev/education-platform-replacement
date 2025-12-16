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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Icon name="BarChart3" className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Нет данных для отображения</h3>
              <p className="text-muted-foreground mb-4">
                Статистика появится после регистрации слушателей и завершения тестирований
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Зарегистрируйте слушателей</p>
                <p>• Назначьте программы обучения</p>
                <p>• Проведите тестирования</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}