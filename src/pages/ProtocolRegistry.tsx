import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProtocolRegistryProps {
  onBack: () => void;
}

interface ProtocolRecord {
  id: string;
  protocolNumber: string;
  testId: string;
  testTitle: string;
  listenerName?: string;
  listenerPosition?: string;
  percentage: number;
  passed: boolean;
  completedAt: string;
  createdAt: string;
}

export default function ProtocolRegistry({ onBack }: ProtocolRegistryProps) {
  const [protocols, setProtocols] = useState<ProtocolRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'name'>('date');

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = () => {
    const registry = localStorage.getItem('protocol_registry');
    if (registry) {
      const records: ProtocolRecord[] = JSON.parse(registry);
      setProtocols(records);
    }
  };

  const filteredProtocols = protocols
    .filter(protocol => {
      if (filterStatus === 'passed' && !protocol.passed) return false;
      if (filterStatus === 'failed' && protocol.passed) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          protocol.protocolNumber.toLowerCase().includes(query) ||
          protocol.testTitle.toLowerCase().includes(query) ||
          protocol.listenerName?.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'number':
          return b.protocolNumber.localeCompare(a.protocolNumber);
        case 'name':
          return (a.listenerName || '').localeCompare(b.listenerName || '');
        default:
          return 0;
      }
    });

  const handleExportToExcel = () => {
    const headers = ['№ протокола', 'Дата', 'Тест', 'ФИО', 'Результат %', 'Статус'];
    const rows = filteredProtocols.map(p => [
      p.protocolNumber,
      new Date(p.completedAt).toLocaleString('ru-RU'),
      p.testTitle,
      p.listenerName || 'Не указано',
      p.percentage,
      p.passed ? 'Пройден' : 'Не пройден'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `protocols_registry_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDeleteProtocol = (id: string) => {
    if (confirm('Удалить этот протокол из реестра?')) {
      const updated = protocols.filter(p => p.id !== id);
      localStorage.setItem('protocol_registry', JSON.stringify(updated));
      setProtocols(updated);
    }
  };

  const stats = {
    total: protocols.length,
    passed: protocols.filter(p => p.passed).length,
    failed: protocols.filter(p => !p.passed).length,
    thisMonth: protocols.filter(p => {
      const date = new Date(p.completedAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Icon name="FileText" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Реестр протоколов тестирования
                </h1>
                <p className="text-xs text-muted-foreground">Учет всех проведенных тестирований</p>
              </div>
            </div>
            <Button onClick={handleExportToExcel} variant="outline">
              <Icon name="Download" className="h-4 w-4 mr-2" />
              Экспорт в Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Всего протоколов</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Тестов пройдено</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.passed}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Тестов не пройдено</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>За текущий месяц</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.thisMonth}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Поиск по номеру, тесту или ФИО..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="passed">Пройдены</SelectItem>
                    <SelectItem value="failed">Не пройдены</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">По дате</SelectItem>
                    <SelectItem value="number">По номеру</SelectItem>
                    <SelectItem value="name">По ФИО</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProtocols.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="FileX" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {protocols.length === 0 
                    ? 'Протоколов пока нет. Они появятся после прохождения тестов.' 
                    : 'Протоколов с такими параметрами не найдено'}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№ Протокола</TableHead>
                      <TableHead>Дата прохождения</TableHead>
                      <TableHead>Название теста</TableHead>
                      <TableHead>ФИО слушателя</TableHead>
                      <TableHead>Должность</TableHead>
                      <TableHead>Результат</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProtocols.map((protocol) => (
                      <TableRow key={protocol.id}>
                        <TableCell className="font-medium">{protocol.protocolNumber}</TableCell>
                        <TableCell>
                          {new Date(protocol.completedAt).toLocaleString('ru-RU')}
                        </TableCell>
                        <TableCell>{protocol.testTitle}</TableCell>
                        <TableCell>{protocol.listenerName || 'Не указано'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {protocol.listenerPosition || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{protocol.percentage}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={protocol.passed ? 'bg-green-600' : 'bg-red-600'}>
                            {protocol.passed ? 'Пройден' : 'Не пройден'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProtocol(protocol.id)}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
