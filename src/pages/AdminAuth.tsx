import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface AdminAuthProps {
  onLogin: (email: string, password: string, name: string, role: 'ot' | 'pb') => void;
}

export default function AdminAuth({ onLogin }: AdminAuthProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'ot' | 'pb'>('ot');
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    
    if (strength <= 40) return { strength, label: 'Слабый', color: 'bg-red-500' };
    if (strength <= 70) return { strength, label: 'Средний', color: 'bg-yellow-500' };
    return { strength, label: 'Сильный', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      onLogin(loginEmail, loginPassword, 'Иванов Иван Иванович', 'ot');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regEmail && regPassword && regName) {
      onLogin(regEmail, regPassword, regName, regRole);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 p-6 rounded-full shadow-2xl">
              <Icon name="ShieldCheck" className="h-16 w-16 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">АО "ГРК "Западная""</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-blue-200 mt-4 text-sm">Загрузка системы безопасности...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 text-white/5 text-6xl font-bold">SAFETY</div>
        <div className="absolute top-32 right-1/4 text-white/5 text-6xl font-bold">FIRST</div>
        <div className="absolute bottom-32 left-1/3 text-white/5 text-6xl font-bold">PROTECT</div>
        <Icon name="HardHat" className="absolute top-1/4 right-20 h-32 w-32 text-white/5" />
        <Icon name="ShieldAlert" className="absolute bottom-1/4 left-20 h-32 w-32 text-white/5" />
        <Icon name="Flame" className="absolute top-1/2 right-1/4 h-24 w-24 text-white/5" />
      </div>

      <div className={`relative w-full max-w-md z-10 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-75 animate-pulse" />
            <div className="relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 p-5 rounded-2xl shadow-2xl">
              <Icon name="ShieldCheck" className="h-14 w-14 text-white drop-shadow-lg" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mt-6 text-center drop-shadow-lg">
            АО "ГРК "Западная""
          </h1>
          <p className="text-blue-200 text-center mt-2 font-medium">
            Система управления охраной труда и пожарной безопасностью
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-white/95 shadow-2xl border-white/20 animate-slide-up">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Вход для специалистов
            </CardTitle>
            <CardDescription className="text-center">
              Охрана труда и пожарная безопасность
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  <Icon name="LogIn" className="h-4 w-4 mr-2" />
                  Вход
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
                  <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-slate-700 font-medium">
                      Email адрес
                    </Label>
                    <div className="relative">
                      <Icon name="Mail" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@company.ru"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-11 border-slate-300 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-slate-700 font-medium">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Icon name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 h-11 border-slate-300 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-base font-medium transition-all hover:scale-[1.02]">
                    <Icon name="LogIn" className="h-5 w-5 mr-2" />
                    Войти в систему
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-slate-700 font-medium">
                      ФИО специалиста
                    </Label>
                    <div className="relative">
                      <Icon name="User" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="reg-name"
                        placeholder="Иванов Иван Иванович"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="pl-10 h-11 border-slate-300 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-slate-700 font-medium">
                      Email адрес
                    </Label>
                    <div className="relative">
                      <Icon name="Mail" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your@company.ru"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="pl-10 h-11 border-slate-300 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-slate-700 font-medium">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Icon name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="pl-10 h-11 border-slate-300 focus:border-green-500"
                        required
                      />
                    </div>
                    {regPassword && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Надёжность пароля:</span>
                          <span className={`font-semibold ${
                            passwordStrength.label === 'Слабый' ? 'text-red-600' :
                            passwordStrength.label === 'Средний' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          Используйте минимум 8 символов, включая заглавные буквы и цифры
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-role" className="text-slate-700 font-medium">
                      Отдел / Служба
                    </Label>
                    <div className="relative">
                      <Icon name="Building" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as 'ot' | 'pb')}
                        className="flex h-11 w-full rounded-md border border-slate-300 bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500"
                      >
                        <option value="ot">🛡️ Охрана труда (ОТ)</option>
                        <option value="pb">🔥 Пожарная безопасность (ПБ)</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 text-base font-medium transition-all hover:scale-[1.02]">
                    <Icon name="UserPlus" className="h-5 w-5 mr-2" />
                    Создать аккаунт
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 animate-fade-in-delayed">
          <div className="flex items-start gap-3">
            <Icon name="ShieldAlert" className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-100">
              <p className="font-semibold text-white mb-1">Безопасность прежде всего</p>
              <p className="text-blue-200">
                Система соответствует требованиям информационной безопасности и стандартам защиты персональных данных
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center animate-fade-in-delayed">
          <p className="text-sm text-blue-200">
            Возникли вопросы? <button className="text-white font-medium underline hover:text-blue-300 transition-colors">Свяжитесь с поддержкой</button>
          </p>
        </div>
      </div>
    </div>
  );
}