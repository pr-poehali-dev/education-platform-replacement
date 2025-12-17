import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { videoProgressService } from '@/services/videoProgressService';
import { getProgramById } from '@/data/trainingPrograms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ListenerData {
  id: string;
  fullName: string;
  position: string;
  department: string;
  assignedPrograms: string[];
}

export default function AdminVideoProgressReport() {
  const [listeners, setListeners] = useState<ListenerData[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [allPrograms, setAllPrograms] = useState<string[]>([]);

  useEffect(() => {
    loadListeners();
  }, []);

  const loadListeners = () => {
    const savedListeners = localStorage.getItem('listeners');
    if (savedListeners) {
      const parsed: ListenerData[] = JSON.parse(savedListeners);
      setListeners(parsed);

      const programs = new Set<string>();
      parsed.forEach(listener => {
        listener.assignedPrograms?.forEach(programId => programs.add(programId));
      });
      setAllPrograms(Array.from(programs));
      
      if (programs.size > 0 && !selectedProgram) {
        setSelectedProgram(Array.from(programs)[0]);
      }
    }
  };

  const getListenerVideoProgress = (listenerId: string, programId: string) => {
    return videoProgressService.getEmployeeProgress(listenerId, programId);
  };

  const calculateAverageProgress = () => {
    if (!selectedProgram) return 0;
    
    const progressValues = listeners
      .filter(l => l.assignedPrograms?.includes(selectedProgram))
      .map(l => getListenerVideoProgress(l.id, selectedProgram)?.overallProgress || 0);

    if (progressValues.length === 0) return 0;
    return Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length);
  };

  const getCompletedListenersCount = () => {
    if (!selectedProgram) return 0;
    
    return listeners
      .filter(l => l.assignedPrograms?.includes(selectedProgram))
      .filter(l => {
        const progress = getListenerVideoProgress(l.id, selectedProgram);
        return progress?.overallProgress === 100;
      }).length;
  };

  const getTotalAssignedCount = () => {
    if (!selectedProgram) return 0;
    return listeners.filter(l => l.assignedPrograms?.includes(selectedProgram)).length;
  };

  const formatLastWatched = (isoDate: string | undefined) => {
    if (!isoDate) return 'Нет данных';
    
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  if (allPrograms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" className="h-5 w-5" />
            Отчёт по просмотру видео
          </CardTitle>
          <CardDescription>
            Нет данных для отображения. Назначьте программы сотрудникам.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedProgramData = selectedProgram ? getProgramById(selectedProgram) : null;
  const assignedListeners = listeners.filter(l => l.assignedPrograms?.includes(selectedProgram || ''));
  const averageProgress = calculateAverageProgress();
  const completedCount = getCompletedListenersCount();
  const totalCount = getTotalAssignedCount();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" className="h-5 w-5 text-purple-600" />
            Отчёт по просмотру видео
          </CardTitle>
          <CardDescription>
            Анализ прогресса просмотра обучающих видео сотрудниками
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Выберите программу:</label>
              <div className="flex flex-wrap gap-2">
                {allPrograms.map(programId => {
                  const program = getProgramById(programId);
                  return (
                    <Button
                      key={programId}
                      variant={selectedProgram === programId ? "default" : "outline"}
                      onClick={() => setSelectedProgram(programId)}
                      className={selectedProgram === programId ? "bg-purple-600" : ""}
                    >
                      {program?.title || programId}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedProgramData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Icon name="Users" className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                        <div className="text-sm text-muted-foreground">Назначено</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Icon name="CheckCircle2" className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                        <div className="text-sm text-muted-foreground">Завершили</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Icon name="TrendingUp" className="h-8 w-8 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{averageProgress}%</div>
                        <div className="text-sm text-muted-foreground">Средний прогресс</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-purple-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Icon name="Video" className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{selectedProgramData.modules.length}</div>
                        <div className="text-sm text-muted-foreground">Видео модулей</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Детальная статистика по сотрудникам</CardTitle>
          <CardDescription>
            Прогресс просмотра видео каждого сотрудника
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedListeners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет сотрудников, назначенных на эту программу
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Отдел</TableHead>
                  <TableHead>Прогресс</TableHead>
                  <TableHead>Просмотрено</TableHead>
                  <TableHead>Последняя активность</TableHead>
                  <TableHead>Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedListeners.map(listener => {
                  const progress = getListenerVideoProgress(listener.id, selectedProgram || '');
                  const completedVideos = progress ? Object.values(progress.videos).filter(v => v.completed).length : 0;
                  const totalVideos = selectedProgramData?.modules.length || 0;
                  const overallProgress = progress?.overallProgress || 0;
                  
                  const lastWatchedDate = progress ? 
                    Object.values(progress.videos)
                      .map(v => new Date(v.lastWatchedAt).getTime())
                      .sort((a, b) => b - a)[0] : undefined;

                  return (
                    <TableRow key={listener.id}>
                      <TableCell className="font-medium">{listener.fullName}</TableCell>
                      <TableCell>{listener.position}</TableCell>
                      <TableCell>{listener.department}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold">{overallProgress}%</span>
                          </div>
                          <Progress value={overallProgress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {completedVideos} / {totalVideos}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lastWatchedDate ? formatLastWatched(new Date(lastWatchedDate).toISOString()) : 'Не начато'}
                      </TableCell>
                      <TableCell>
                        {overallProgress === 100 ? (
                          <Badge className="bg-green-600">
                            <Icon name="CheckCircle2" className="h-3 w-3 mr-1" />
                            Завершено
                          </Badge>
                        ) : overallProgress > 0 ? (
                          <Badge className="bg-blue-600">
                            <Icon name="PlayCircle" className="h-3 w-3 mr-1" />
                            В процессе
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Icon name="Clock" className="h-3 w-3 mr-1" />
                            Не начато
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
