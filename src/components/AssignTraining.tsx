import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = 'https://functions.poehali.dev/26432853-bc16-442a-aabf-e90c33bae6c2';

interface User {
  id: number;
  full_name: string;
  position: string;
  department: string;
  role: string;
}

interface Program {
  id: number;
  title: string;
  duration: string;
}

interface AssignTrainingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentCreated?: () => void;
}

export default function AssignTraining({ open, onOpenChange, onAssignmentCreated }: AssignTrainingProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
      loadPrograms();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}?path=users&role=student`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await fetch(`${API_URL}?path=programs`);
      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (err) {
      console.error('Failed to load programs:', err);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedProgram || !deadline) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}?path=assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(selectedUser),
          program_id: parseInt(selectedProgram),
          assigned_by: 1,
          deadline
        })
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        onAssignmentCreated?.();
        resetForm();
      }, 1500);
    } catch (err) {
      setError('Ошибка при создании назначения');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUser('');
    setSelectedProgram('');
    setDeadline('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPlus" className="h-5 w-5 text-primary" />
            Назначить обучение
          </DialogTitle>
          <DialogDescription>
            Назначьте учебную программу сотруднику с установкой срока прохождения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Сотрудник</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.full_name} - {user.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Программа обучения</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите программу" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={String(program.id)}>
                    {program.title} ({program.duration})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Срок выполнения</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
              <AlertDescription>Обучение успешно назначено!</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                Назначение...
              </>
            ) : (
              <>
                <Icon name="Check" className="h-4 w-4 mr-2" />
                Назначить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
