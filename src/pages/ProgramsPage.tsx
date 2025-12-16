import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import AssignTraining from '@/components/AssignTraining';

interface ProgramsPageProps {
  onBack: () => void;
}

export default function ProgramsPage({ onBack }: ProgramsPageProps) {
  const [assignTrainingDialog, setAssignTrainingDialog] = useState(false);

  const programs = [
    {
      title: 'Работа на высоте',
      description: 'Комплексное обучение безопасной работе на высоте',
      duration: '16 часов',
      modules: 8,
      students: 45,
      icon: 'Mountain',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Электробезопасность',
      description: 'Правила работы с электроустановками до и выше 1000В',
      duration: '24 часа',
      modules: 12,
      students: 38,
      icon: 'Zap',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Пожарная безопасность',
      description: 'ПТМ для руководителей и ответственных лиц',
      duration: '12 часов',
      modules: 6,
      students: 62,
      icon: 'Flame',
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Охрана труда для руководителей',
      description: 'Обучение по программе А для руководителей организаций',
      duration: '40 часов',
      modules: 20,
      students: 28,
      icon: 'Briefcase',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

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
          {programs.map((program, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-all hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`bg-gradient-to-br ${program.color} p-3 rounded-xl shadow-lg`}>
                    <Icon name={program.icon} className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">{program.duration}</Badge>
                </div>
                <CardTitle className="mt-4">{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Модулей</span>
                    <span className="font-medium">{program.modules}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Слушателей</span>
                    <span className="font-medium">{program.students}</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Icon name="Settings" className="h-4 w-4 mr-2" />
                    Редактировать программу
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
    </div>
  );
}
