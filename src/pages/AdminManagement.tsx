import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminManagementProps {
  onBack: () => void;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'ot' | 'pb';
  status: 'active' | 'inactive';
  addedDate: string;
}

export default function AdminManagement({ onBack }: AdminManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'ot' | 'pb'>('ot');

  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '1',
      name: 'Иванова Мария Петровна',
      email: 'ivanova@company.ru',
      role: 'ot',
      status: 'active',
      addedDate: '15.01.2024'
    },
    {
      id: '2',
      name: 'Петров Сергей Александрович',
      email: 'petrov@company.ru',
      role: 'pb',
      status: 'active',
      addedDate: '20.02.2024'
    }
  ]);

  const handleAddAdmin = () => {
    if (newAdminName && newAdminEmail) {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        name: newAdminName,
        email: newAdminEmail,
        role: newAdminRole,
        status: 'active',
        addedDate: new Date().toLocaleDateString('ru-RU')
      };
      setAdmins([...admins, newAdmin]);
      setShowAddDialog(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminRole('ot');
    }
  };

  const toggleAdminStatus = (id: string) => {
    setAdmins(admins.map(admin => 
      admin.id === id 
        ? { ...admin, status: admin.status === 'active' ? 'inactive' : 'active' }
        : admin
    ));
  };

  const deleteAdmin = (id: string) => {
    if (confirm('Удалить администратора?')) {
      setAdmins(admins.filter(admin => admin.id !== id));
    }
  };

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
                <Icon name="Shield" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Управление администраторами
                </h1>
                <p className="text-xs text-muted-foreground">Панель главного администратора</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Icon name="UserPlus" className="h-4 w-4 mr-2" />
              Добавить администратора
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {admins.map((admin) => (
            <Card key={admin.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`${admin.role === 'ot' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-red-500 to-orange-500'} p-3 rounded-xl`}>
                      <Icon name={admin.role === 'ot' ? 'HardHat' : 'Flame'} className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{admin.name}</CardTitle>
                      <CardDescription>{admin.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                    {admin.status === 'active' ? 'Активен' : 'Неактивен'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Отдел</span>
                    <span className="font-medium">
                      {admin.role === 'ot' ? '🛡️ Охрана труда' : '🔥 Пожарная безопасность'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Добавлен</span>
                    <span>{admin.addedDate}</span>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => toggleAdminStatus(admin.id)}
                    >
                      <Icon name={admin.status === 'active' ? 'Ban' : 'Check'} className="h-4 w-4 mr-2" />
                      {admin.status === 'active' ? 'Деактивировать' : 'Активировать'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteAdmin(admin.id)}
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить администратора</DialogTitle>
            <DialogDescription>
              Создайте новый аккаунт для специалиста ОТ или ПБ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">ФИО</Label>
              <Input
                id="admin-name"
                placeholder="Иванов Иван Иванович"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@company.ru"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-role">Отдел</Label>
              <select
                id="admin-role"
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as 'ot' | 'pb')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ot">🛡️ Охрана труда (ОТ)</option>
                <option value="pb">🔥 Пожарная безопасность (ПБ)</option>
              </select>
            </div>
            <Button onClick={handleAddAdmin} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Icon name="UserPlus" className="h-4 w-4 mr-2" />
              Создать администратора
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
