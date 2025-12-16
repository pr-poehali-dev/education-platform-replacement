import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProgramById, type TrainingProgram, type TrainingModule } from '@/data/trainingPrograms';
import VideoPlayer from '@/components/VideoPlayer';

interface ModuleLearningProps {
  programId: string;
  listenerId: string;
  onBack: () => void;
  onComplete: () => void;
}

interface ModuleProgress {
  moduleId: number;
  completed: boolean;
  topicsCompleted: number[];
  timeSpent: number;
  lastAccessed: string;
  videoProgress?: number;
}

interface ProgramProgress {
  programId: string;
  modules: ModuleProgress[];
  overallProgress: number;
  startedAt: string;
  lastAccessed: string;
}

export default function ModuleLearning({ programId, listenerId, onBack, onComplete }: ModuleLearningProps) {
  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [progress, setProgress] = useState<ProgramProgress | null>(null);
  const [isModuleComplete, setIsModuleComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const loadedProgram = getProgramById(programId);
    setProgram(loadedProgram || null);

    if (loadedProgram) {
      loadProgress(loadedProgram);
    }
  }, [programId, listenerId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      
      if (progress && progress.modules[currentModuleIndex]) {
        const updatedProgress = { ...progress };
        updatedProgress.modules[currentModuleIndex].timeSpent += 1;
        updatedProgress.lastAccessed = new Date().toISOString();
        saveProgress(updatedProgress);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [progress, currentModuleIndex]);

  const loadProgress = (loadedProgram: TrainingProgram) => {
    const savedProgress = localStorage.getItem(`module_progress_${listenerId}_${programId}`);
    
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress(parsed);
      
      const lastIncompleteModule = parsed.modules.findIndex((m: ModuleProgress) => !m.completed);
      if (lastIncompleteModule !== -1) {
        setCurrentModuleIndex(lastIncompleteModule);
      }
    } else {
      const newProgress: ProgramProgress = {
        programId,
        modules: loadedProgram.modules.map(m => ({
          moduleId: m.id,
          completed: false,
          topicsCompleted: [],
          timeSpent: 0,
          lastAccessed: new Date().toISOString()
        })),
        overallProgress: 0,
        startedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };
      setProgress(newProgress);
      saveProgress(newProgress);
    }
  };

  const saveProgress = (updatedProgress: ProgramProgress) => {
    localStorage.setItem(`module_progress_${listenerId}_${programId}`, JSON.stringify(updatedProgress));
    setProgress(updatedProgress);
  };

  const toggleTopicComplete = (topicIndex: number) => {
    if (!progress || !program) return;

    const updatedProgress = { ...progress };
    const currentModuleProgress = updatedProgress.modules[currentModuleIndex];
    
    if (currentModuleProgress.topicsCompleted.includes(topicIndex)) {
      currentModuleProgress.topicsCompleted = currentModuleProgress.topicsCompleted.filter(t => t !== topicIndex);
    } else {
      currentModuleProgress.topicsCompleted.push(topicIndex);
    }

    const allTopicsCompleted = currentModuleProgress.topicsCompleted.length === program.modules[currentModuleIndex].topics.length;
    currentModuleProgress.completed = allTopicsCompleted;
    setIsModuleComplete(allTopicsCompleted);

    const completedModules = updatedProgress.modules.filter(m => m.completed).length;
    updatedProgress.overallProgress = Math.round((completedModules / program.modules.length) * 100);
    updatedProgress.lastAccessed = new Date().toISOString();

    saveProgress(updatedProgress);
  };

  const completeModule = () => {
    if (!progress || !program) return;

    const updatedProgress = { ...progress };
    updatedProgress.modules[currentModuleIndex].completed = true;
    
    const completedModules = updatedProgress.modules.filter(m => m.completed).length;
    updatedProgress.overallProgress = Math.round((completedModules / program.modules.length) * 100);

    saveProgress(updatedProgress);

    if (currentModuleIndex < program.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setIsModuleComplete(false);
    } else {
      onComplete();
    }
  };

  const goToModule = (index: number) => {
    setCurrentModuleIndex(index);
    setIsModuleComplete(progress?.modules[index]?.completed || false);
  };

  if (!program || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Загрузка программы...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentModule = program.modules[currentModuleIndex];
  const currentModuleProgress = progress.modules[currentModuleIndex];
  const topicsProgress = Math.round((currentModuleProgress.topicsCompleted.length / currentModule.topics.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className={`bg-gradient-to-br ${program.color} p-2 rounded-xl`}>
                <Icon name={program.icon} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{program.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Модуль {currentModuleIndex + 1} из {program.modules.length} • Прогресс: {progress.overallProgress}%
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              {progress.overallProgress}% завершено
            </Badge>
          </div>
          <div className="mt-3">
            <Progress value={progress.overallProgress} className="h-2" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="List" className="h-4 w-4" />
                  Содержание курса
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2 pr-4">
                    {program.modules.map((module, index) => {
                      const moduleProgress = progress.modules[index];
                      const isActive = index === currentModuleIndex;
                      
                      return (
                        <button
                          key={module.id}
                          onClick={() => goToModule(index)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-blue-100 border-2 border-blue-500' 
                              : moduleProgress.completed 
                                ? 'bg-green-50 hover:bg-green-100 border-2 border-green-300'
                                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`p-1.5 rounded-lg mt-0.5 ${
                              moduleProgress.completed 
                                ? 'bg-green-500' 
                                : isActive 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-300'
                            }`}>
                              {moduleProgress.completed ? (
                                <Icon name="Check" className="h-3 w-3 text-white" />
                              ) : (
                                <span className="text-white text-xs font-bold">{module.id}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium line-clamp-2 ${
                                isActive ? 'text-blue-900' : 'text-gray-700'
                              }`}>
                                {module.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {module.duration}
                                </Badge>
                                {moduleProgress.completed && (
                                  <Badge className="bg-green-600 text-xs">
                                    <Icon name="CheckCircle" className="h-3 w-3 mr-1" />
                                    Завершено
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <span className="text-2xl font-bold text-blue-600">{currentModule.id}</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{currentModule.title}</CardTitle>
                      <CardDescription className="mt-2 text-base">{currentModule.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {currentModule.duration}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <VideoPlayer
              videoUrl={currentModule.videoUrl}
              videoTitle={currentModule.title}
              videoDuration={currentModule.duration}
              initialProgress={currentModuleProgress.videoProgress || 0}
              onProgressUpdate={(videoProgress) => {
                if (!progress) return;
                const updatedProgress = { ...progress };
                updatedProgress.modules[currentModuleIndex].videoProgress = videoProgress;
                saveProgress(updatedProgress);
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" className="h-5 w-5" />
                  Темы модуля
                </CardTitle>
                <CardDescription>
                  Отметьте изученные темы. Прогресс: {topicsProgress}%
                </CardDescription>
                <Progress value={topicsProgress} className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentModule.topics.map((topic, index) => {
                    const isCompleted = currentModuleProgress.topicsCompleted.includes(index);
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          isCompleted 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => toggleTopicComplete(index)}
                      >
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => toggleTopicComplete(index)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                              {topic}
                            </p>
                            {isCompleted && (
                              <Badge className="bg-green-600 shrink-0">
                                <Icon name="CheckCircle" className="h-3 w-3 mr-1" />
                                Изучено
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Icon name="Lightbulb" className="h-5 w-5" />
                  Рекомендации по изучению
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-amber-900">
                <div className="flex items-start gap-2">
                  <Icon name="Circle" className="h-2 w-2 mt-2 fill-current" />
                  <p>Внимательно изучите каждую тему модуля перед тем, как отметить её как выполненную</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Circle" className="h-2 w-2 mt-2 fill-current" />
                  <p>Делайте заметки по ключевым моментам для лучшего запоминания материала</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Circle" className="h-2 w-2 mt-2 fill-current" />
                  <p>После завершения модуля вы сможете перейти к следующему</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Circle" className="h-2 w-2 mt-2 fill-current" />
                  <p>Все модули необходимо пройти для допуска к итоговому тестированию</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Прогресс модуля</p>
                    <p className="text-3xl font-bold text-blue-600">{topicsProgress}%</p>
                    <p className="text-sm text-muted-foreground">
                      {currentModuleProgress.topicsCompleted.length} из {currentModule.topics.length} тем изучено
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentModuleIndex > 0) {
                          goToModule(currentModuleIndex - 1);
                        }
                      }}
                      disabled={currentModuleIndex === 0}
                    >
                      <Icon name="ChevronLeft" className="h-4 w-4 mr-2" />
                      Предыдущий
                    </Button>
                    
                    {topicsProgress === 100 ? (
                      <Button
                        onClick={completeModule}
                        className="bg-gradient-to-r from-green-600 to-emerald-600"
                      >
                        {currentModuleIndex < program.modules.length - 1 ? (
                          <>
                            Следующий модуль
                            <Icon name="ChevronRight" className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Завершить курс
                            <Icon name="CheckCircle" className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          if (currentModuleIndex < program.modules.length - 1) {
                            goToModule(currentModuleIndex + 1);
                          }
                        }}
                        variant="outline"
                        disabled={currentModuleIndex === program.modules.length - 1}
                      >
                        Следующий
                        <Icon name="ChevronRight" className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}