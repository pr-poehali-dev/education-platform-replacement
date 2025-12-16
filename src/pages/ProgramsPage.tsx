import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import AssignTraining from '@/components/AssignTraining';
import { trainingPrograms, type TrainingProgram } from '@/data/trainingPrograms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ProgramsPageProps {
  onBack: () => void;
}

export default function ProgramsPage({ onBack }: ProgramsPageProps) {
  const [assignTrainingDialog, setAssignTrainingDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-xl">
                <Icon name="GraduationCap" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Программы обучения
                </h1>
                <p className="text-xs text-muted-foreground">Готовые курсы по различным направлениям</p>
              </div>
            </div>
            <Button onClick={() => setAssignTrainingDialog(true)} className="bg-gradient-to-r from-green-600 to-emerald-600">
              <Icon name="UserPlus" className="h-4 w-4 mr-2" />
              Назначить обучение
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {trainingPrograms.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-all hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`bg-gradient-to-br ${program.color} p-3 rounded-xl shadow-lg`}>
                    <Icon name={program.icon} className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">{program.totalHours} ч</Badge>
                </div>
                <CardTitle className="mt-4">{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Модулей</span>
                    <span className="font-medium">{program.modules.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Категория</span>
                    <span className="font-medium text-xs">{program.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Действие удостоверения</span>
                    <span className="font-medium text-xs">{program.validityPeriod}</span>
                  </div>
                  <Separator className="my-2" />
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      setSelectedProgram(program);
                      setShowDetails(true);
                    }}
                  >
                    <Icon name="BookOpen" className="h-4 w-4 mr-2" />
                    Подробная программа
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <AssignTraining 
        open={assignTrainingDialog}
        onOpenChange={setAssignTrainingDialog}
        onAssignmentCreated={() => {}}
      />

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedProgram && (
                <>
                  <div className={`bg-gradient-to-br ${selectedProgram.color} p-2 rounded-lg`}>
                    <Icon name={selectedProgram.icon} className="h-5 w-5 text-white" />
                  </div>
                  <span>{selectedProgram.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedProgram?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedProgram && (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Длительность</p>
                          <p className="font-semibold">{selectedProgram.totalHours} часов</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Award" className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-xs text-muted-foreground">Модулей</p>
                          <p className="font-semibold">{selectedProgram.modules.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="Users" className="h-4 w-4" />
                      Целевая аудитория
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedProgram.targetAudience.map((audience, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Icon name="Check" className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="FileText" className="h-4 w-4" />
                      Нормативная база
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedProgram.legislativeBase.map((doc, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Icon name="Scale" className="h-4 w-4 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Icon name="BookOpen" className="h-5 w-5" />
                    Модули программы
                  </h3>
                  <div className="space-y-4">
                    {selectedProgram.modules.map((module) => (
                      <Card key={module.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="bg-primary/10 p-2 rounded-lg h-fit">
                                <span className="font-bold text-primary">{module.id}</span>
                              </div>
                              <div>
                                <CardTitle className="text-base">{module.title}</CardTitle>
                                <CardDescription className="mt-1">{module.description}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary">{module.duration}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Темы модуля:</p>
                            <ul className="space-y-1.5">
                              {module.topics.map((topic, idx) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <Icon name="Circle" className="h-2 w-2 mt-1.5 fill-current" />
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon name="Award" className="h-5 w-5 text-amber-600" />
                      Итоговый документ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{selectedProgram.certification}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>Срок действия: {selectedProgram.validityPeriod}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}