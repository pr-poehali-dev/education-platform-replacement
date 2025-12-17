import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import VideoUploader from '@/components/VideoUploader';
import { trainingPrograms } from '@/data/trainingPrograms';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VideoManagementProps {
  onBack: () => void;
}

export default function VideoManagement({ onBack }: VideoManagementProps) {
  const [selectedProgram, setSelectedProgram] = useState(trainingPrograms[0]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [customVideos, setCustomVideos] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('custom_videos');
    return saved ? JSON.parse(saved) : {};
  });

  const handleVideoUploaded = (videoUrl: string, videoTitle: string, videoDuration: string) => {
    const key = `${selectedProgram.id}_${selectedModuleId}`;
    const updatedVideos = { ...customVideos, [key]: videoUrl };
    setCustomVideos(updatedVideos);
    localStorage.setItem('custom_videos', JSON.stringify(updatedVideos));
    
    setUploadDialogOpen(false);
    setSelectedModuleId(null);
  };
  
  const getModuleVideoUrl = (programId: string, moduleId: number, defaultUrl?: string) => {
    const key = `${programId}_${moduleId}`;
    return customVideos[key] || defaultUrl;
  };

  const totalVideos = trainingPrograms.reduce(
    (acc, program) => acc + program.modules.filter(m => m.videoUrl).length,
    0
  );

  const totalModules = trainingPrograms.reduce(
    (acc, program) => acc + program.modules.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Icon name="Video" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Управление видеоматериалами
                </h1>
                <p className="text-xs text-muted-foreground">Загрузка и управление учебными видео</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                  <Icon name="Video" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardDescription>Всего видео</CardDescription>
                  <CardTitle className="text-3xl">{totalVideos}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
                  <Icon name="BookOpen" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardDescription>Всего модулей</CardDescription>
                  <CardTitle className="text-3xl">{totalModules}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                  <Icon name="CheckCircle" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardDescription>Заполнено</CardDescription>
                  <CardTitle className="text-3xl">
                    {totalModules > 0 ? Math.round((totalVideos / totalModules) * 100) : 0}%
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Программы обучения</CardTitle>
            <CardDescription>Выберите программу для управления видеоматериалами</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedProgram.id} onValueChange={(value) => {
              const program = trainingPrograms.find(p => p.id === value);
              if (program) setSelectedProgram(program);
            }}>
              <TabsList className="grid grid-cols-4 w-full">
                {trainingPrograms.map((program) => (
                  <TabsTrigger key={program.id} value={program.id} className="text-xs">
                    <Icon name={program.icon} className="h-4 w-4 mr-2" />
                    {program.title.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {trainingPrograms.map((program) => (
                <TabsContent key={program.id} value={program.id} className="mt-6">
                  <div className="space-y-4">
                    <Card className={`bg-gradient-to-br ${program.color} text-white`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">{program.title}</h3>
                            <p className="text-white/90">{program.description}</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                            <Icon name={program.icon} className="h-12 w-12" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-4">
                      {program.modules.map((module) => {
                        const videoUrl = getModuleVideoUrl(program.id, module.id, module.videoUrl);
                        const hasVideo = !!videoUrl;
                        const isCustomVideo = !!customVideos[`${program.id}_${module.id}`];
                        
                        return (
                          <Card key={module.id} className={hasVideo ? 'border-2 border-purple-200' : ''}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex gap-3 flex-1">
                                  <div className="bg-primary/10 p-2 rounded-lg h-fit">
                                    <span className="font-bold text-primary">{module.id}</span>
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-base">{module.title}</CardTitle>
                                    <CardDescription className="mt-1">{module.description}</CardDescription>
                                    <div className="flex items-center gap-3 mt-3">
                                      <Badge variant="secondary">{module.duration}</Badge>
                                      <Badge variant="outline">{module.topics.length} тем</Badge>
                                      {hasVideo ? (
                                        isCustomVideo ? (
                                          <Badge className="bg-green-600">
                                            <Icon name="Upload" className="h-3 w-3 mr-1" />
                                            Своё видео
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-purple-600">
                                            <Icon name="Video" className="h-3 w-3 mr-1" />
                                            Видео загружено
                                          </Badge>
                                        )
                                      ) : (
                                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                                          <Icon name="VideoOff" className="h-3 w-3 mr-1" />
                                          Без видео
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant={hasVideo ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => {
                                      setSelectedModuleId(module.id);
                                      setUploadDialogOpen(true);
                                    }}
                                    className={hasVideo ? '' : 'bg-purple-600 hover:bg-purple-700'}
                                  >
                                    <Icon name={hasVideo ? "RefreshCw" : "Upload"} className="h-4 w-4 mr-2" />
                                    {hasVideo ? 'Заменить' : 'Загрузить'}
                                  </Button>
                                  {isCustomVideo && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const key = `${program.id}_${module.id}`;
                                        const updated = { ...customVideos };
                                        delete updated[key];
                                        setCustomVideos(updated);
                                        localStorage.setItem('custom_videos', JSON.stringify(updated));
                                      }}
                                    >
                                      <Icon name="Trash2" className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            {hasVideo && module.videoUrl && (
                              <CardContent>
                                <Card className="bg-purple-50 border-purple-200">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-purple-100 p-2 rounded-lg">
                                        <Icon name="Video" className="h-5 w-5 text-purple-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{module.videoTitle || 'Учебное видео'}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Длительность: {module.videoDuration}
                                        </p>
                                      </div>
                                      <Button variant="ghost" size="icon">
                                        <Icon name="Play" className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Загрузить видеоматериал</DialogTitle>
            <DialogDescription>
              {selectedModuleId && (
                <>
                  Модуль {selectedModuleId}: {selectedProgram.modules.find(m => m.id === selectedModuleId)?.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedModuleId && (
            <ScrollArea className="max-h-[70vh]">
              <VideoUploader
                programId={selectedProgram.id}
                moduleId={selectedModuleId}
                onVideoUploaded={handleVideoUploaded}
              />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}