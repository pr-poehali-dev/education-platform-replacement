import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ListenerAuthProps {
  onLogin: (fullName: string, position: string, department: string, listenerId?: string) => void;
  listenerId?: string;
}

export default function ListenerAuth({ onLogin, listenerId }: ListenerAuthProps) {
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && position && department) {
      onLogin(fullName, position, department, listenerId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl mb-4">
            <Icon name="GraduationCap" className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Обучающий портал
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            Вход для слушателей
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход в личный кабинет</CardTitle>
            <CardDescription>
              {listenerId 
                ? 'Заполните данные для доступа к назначенным программам обучения' 
                : 'Заполните данные для входа. Если вы уже проходили обучение, мы восстановим ваш прогресс'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">ФИО</Label>
                <Input
                  id="fullname"
                  placeholder="Иванов Иван Иванович"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Должность или профессия</Label>
                <Input
                  id="position"
                  placeholder="Электромонтер"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Подразделение</Label>
                <Input
                  id="department"
                  placeholder="Цех №1"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                <Icon name="LogIn" className="h-4 w-4 mr-2" />
                Войти в личный кабинет
              </Button>
            </form>

            {listenerId && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Персональная ссылка</p>
                    <p className="text-blue-700 mt-1">Для вас подготовлены специальные программы обучения</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Возникли проблемы? Обратитесь к администратору
          </p>
        </div>
      </div>
    </div>
  );
}
