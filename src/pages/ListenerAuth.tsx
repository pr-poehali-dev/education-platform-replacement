import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && position && department) {
      onLogin(fullName, position, department, listenerId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6 rounded-full shadow-2xl">
              <Icon name="GraduationCap" className="h-16 w-16 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">АО "ГРК "Западная""</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-green-200 mt-4 text-sm">Подготовка учебных материалов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900" />
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 text-white/5 text-6xl font-bold">LEARN</div>
        <div className="absolute top-32 right-1/4 text-white/5 text-6xl font-bold">GROW</div>
        <div className="absolute bottom-32 left-1/3 text-white/5 text-6xl font-bold">SAFE</div>
        <Icon name="GraduationCap" className="absolute top-1/4 right-20 h-32 w-32 text-white/5" />
        <Icon name="BookOpen" className="absolute bottom-1/4 left-20 h-32 w-32 text-white/5" />
        <Icon name="Award" className="absolute top-1/2 right-1/4 h-24 w-24 text-white/5" />
      </div>

      <div className={`relative w-full max-w-md z-10 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-75 animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-5 rounded-2xl shadow-2xl">
              <Icon name="GraduationCap" className="h-14 w-14 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mt-6 text-center drop-shadow-lg">
            АО "ГРК "Западная""
          </h1>
          <p className="text-green-200 text-center mt-2 font-medium">
            Охрана труда и пожарная безопасность
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-white/95 shadow-2xl border-white/20 animate-slide-up">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Вход для слушателя
            </CardTitle>
            <CardDescription className="text-center">
              {listenerId 
                ? 'Заполните данные для доступа к назначенным программам' 
                : 'Введите данные для входа в обучающую систему'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-slate-700 font-medium">
                  ФИО полностью
                </Label>
                <div className="relative">
                  <Icon name="User" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="fullname"
                    placeholder="Иванов Иван Иванович"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-green-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-slate-700 font-medium">
                  Должность или профессия
                </Label>
                <div className="relative">
                  <Icon name="Briefcase" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="position"
                    placeholder="Электромонтер, Слесарь, Инженер..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-green-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-slate-700 font-medium">
                  Подразделение
                </Label>
                <div className="relative">
                  <Icon name="Building" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="department"
                    placeholder="Цех №1, Отдел ПТО, Участок..."
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="pl-10 h-11 border-slate-300 focus:border-green-500 transition-all"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 text-base font-medium mt-6 transition-all hover:scale-[1.02]"
              >
                <Icon name="LogIn" className="h-5 w-5 mr-2" />
                Войти в личный кабинет
              </Button>
            </form>

            {listenerId && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 animate-fade-in-delayed">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                    <Icon name="Sparkles" className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Персональное приглашение</p>
                    <p className="text-blue-700">
                      Для вас подготовлена индивидуальная программа обучения по охране труда и пожарной безопасности
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 animate-fade-in-delayed">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Icon name="BookOpen" className="h-6 w-6 text-green-300 mx-auto mb-2" />
              <p className="text-xs text-green-200 font-medium">Обучение</p>
            </div>
            <div>
              <Icon name="ClipboardCheck" className="h-6 w-6 text-green-300 mx-auto mb-2" />
              <p className="text-xs text-green-200 font-medium">Тестирование</p>
            </div>
            <div>
              <Icon name="Award" className="h-6 w-6 text-green-300 mx-auto mb-2" />
              <p className="text-xs text-green-200 font-medium">Сертификат</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center animate-fade-in-delayed">
          <p className="text-sm text-green-200">
            Возникли вопросы? <button className="text-white font-medium underline hover:text-green-300 transition-colors">Обратитесь к администратору</button>
          </p>
        </div>
      </div>
    </div>
  );
}