import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { videoProgressService } from '@/services/videoProgressService';
import { getProgramById } from '@/data/trainingPrograms';

interface OverallVideoProgressProps {
  employeeId: string;
  programId: string;
}

export default function OverallVideoProgress({ employeeId, programId }: OverallVideoProgressProps) {
  const progress = videoProgressService.getEmployeeProgress(employeeId, programId);
  const program = getProgramById(programId);

  if (!progress || !program) {
    return null;
  }

  const videos = Object.values(progress.videos);
  const completedVideos = videos.filter(v => v.completed).length;
  const totalVideos = program.modules.length;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="TrendingUp" className="h-5 w-5 text-purple-600" />
          Общий прогресс просмотра видео
        </CardTitle>
        <CardDescription>
          Отслеживание вашего прогресса по видеоматериалам программы
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="PlayCircle" className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Просмотрено модулей:</span>
            </div>
            <Badge className="bg-purple-600 text-lg px-3 py-1">
              {completedVideos} / {totalVideos}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="font-semibold">{progress.overallProgress}%</span>
            </div>
            <Progress value={progress.overallProgress} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <Icon name="CheckCircle2" className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Завершено</div>
                <div className="text-xl font-bold text-green-600">{completedVideos}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Icon name="Clock" className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Осталось</div>
                <div className="text-xl font-bold text-blue-600">{totalVideos - completedVideos}</div>
              </div>
            </div>
          </div>

          {progress.overallProgress === 100 && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <div className="flex items-center gap-2">
                <Icon name="Award" className="h-6 w-6" />
                <div>
                  <div className="font-bold">Поздравляем!</div>
                  <div className="text-sm">Вы просмотрели все видеоматериалы программы</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
