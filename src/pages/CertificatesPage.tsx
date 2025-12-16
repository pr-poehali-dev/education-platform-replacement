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
  DialogFooter,
} from '@/components/ui/dialog';

interface CertificatesPageProps {
  onBack: () => void;
  onNavigateToBuilder: () => void;
}

interface Certificate {
  id: number;
  number: number;
  program: string;
  listenerName: string;
  listenerPosition: string;
  issued: string;
  valid: string;
  templateType: string;
}

interface Template {
  id: string;
  name: string;
  program: string;
  type: string;
}

export default function CertificatesPage({ onBack, onNavigateToBuilder }: CertificatesPageProps) {
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  const [newCertificate, setNewCertificate] = useState({
    listenerName: '',
    listenerPosition: '',
    program: '',
    templateId: '',
    validityMonths: 12
  });

  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const availableTemplates: Template[] = [
    { id: '1', name: 'Сертификат работы на высоте', program: 'Работа на высоте', type: 'certificate' },
    { id: '2', name: 'Удостоверение электробезопасность', program: 'Электробезопасность', type: 'attestation' },
    { id: '3', name: 'Диплом ПБ', program: 'Пожарная безопасность', type: 'diploma' }
  ];

  const listeners = [
    { id: '1', name: 'Козлов Дмитрий Владимирович', position: 'Монтажник' },
    { id: '2', name: 'Смирнова Елена Петровна', position: 'Мастер участка' },
    { id: '3', name: 'Васильев Андрей Николаевич', position: 'Сварщик' }
  ];

  const handleSelectListener = (listener: typeof listeners[0]) => {
    setNewCertificate({
      ...newCertificate,
      listenerName: listener.name,
      listenerPosition: listener.position
    });
  };

  const handleSelectTemplate = (template: Template) => {
    setNewCertificate({
      ...newCertificate,
      templateId: template.id,
      program: template.program
    });
  };

  const handleIssueCertificate = () => {
    if (!newCertificate.listenerName || !newCertificate.program || !newCertificate.templateId) {
      return;
    }

    const issueDate = new Date();
    const validDate = new Date(issueDate);
    validDate.setMonth(validDate.getMonth() + newCertificate.validityMonths);

    const certificate: Certificate = {
      id: certificates.length + 1,
      number: 1000 + certificates.length + 1,
      program: newCertificate.program,
      listenerName: newCertificate.listenerName,
      listenerPosition: newCertificate.listenerPosition,
      issued: issueDate.toLocaleDateString('ru-RU'),
      valid: validDate.toLocaleDateString('ru-RU'),
      templateType: availableTemplates.find(t => t.id === newCertificate.templateId)?.type || 'certificate'
    };

    setCertificates([certificate, ...certificates]);
    setShowIssueDialog(false);
    setNewCertificate({
      listenerName: '',
      listenerPosition: '',
      program: '',
      templateId: '',
      validityMonths: 12
    });
  };

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setShowPreviewDialog(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certificate': return 'from-blue-500 to-indigo-500';
      case 'diploma': return 'from-red-500 to-pink-500';
      case 'attestation': return 'from-yellow-500 to-orange-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-orange-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-2 rounded-xl">
                <Icon name="Award" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Сертификаты
                </h1>
                <p className="text-xs text-muted-foreground">Выдача удостоверений и сертификатов</p>
              </div>
            </div>
            <Button 
              onClick={onNavigateToBuilder}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Palette" className="h-4 w-4 mr-2" />
              Конструктор шаблонов
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Выданные документы</h2>
            <p className="text-muted-foreground">История сертификатов, дипломов и удостоверений</p>
          </div>
          <Button 
            onClick={() => setShowIssueDialog(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Icon name="Plus" className="h-4 w-4 mr-2" />
            Выдать сертификат
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-all hover:scale-[1.02] duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg">
                    <Icon name="Award" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Удостоверение №{cert.number}</CardTitle>
                    <CardDescription>{cert.program}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ФИО</span>
                    <span className="font-medium">{cert.listenerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Должность</span>
                    <span>{cert.listenerPosition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Выдано</span>
                    <span>{cert.issued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Действительно до</span>
                    <span className="font-medium">{cert.valid}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewCertificate(cert)}
                    >
                      <Icon name="Eye" className="h-4 w-4 mr-1" />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Download" className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Выдать сертификат</DialogTitle>
            <DialogDescription>
              Заполните данные для создания документа
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label>Выберите слушателя или введите вручную</Label>
              <div className="grid grid-cols-3 gap-2">
                {listeners.map((listener) => (
                  <Button
                    key={listener.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectListener(listener)}
                    className={newCertificate.listenerName === listener.name ? 'border-green-500 bg-green-50' : ''}
                  >
                    <Icon name="User" className="h-3 w-3 mr-1" />
                    {listener.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ФИО слушателя</Label>
                <Input
                  id="name"
                  placeholder="Иванов Иван Иванович"
                  value={newCertificate.listenerName}
                  onChange={(e) => setNewCertificate({ ...newCertificate, listenerName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  placeholder="Электромонтер, Слесарь..."
                  value={newCertificate.listenerPosition}
                  onChange={(e) => setNewCertificate({ ...newCertificate, listenerPosition: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Выберите шаблон сертификата</Label>
              <div className="grid grid-cols-3 gap-3">
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      newCertificate.templateId === template.id 
                        ? 'border-green-500 bg-green-50 scale-105' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`bg-gradient-to-br ${getTypeColor(template.type)} p-2 rounded`}>
                        <Icon name="Award" className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.program}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Срок действия (месяцев)</Label>
              <Input
                id="validity"
                type="number"
                min="1"
                max="60"
                value={newCertificate.validityMonths}
                onChange={(e) => setNewCertificate({ ...newCertificate, validityMonths: parseInt(e.target.value) || 12 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleIssueCertificate}
              disabled={!newCertificate.listenerName || !newCertificate.templateId}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Icon name="Award" className="h-4 w-4 mr-2" />
              Выдать сертификат
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр сертификата</DialogTitle>
            <DialogDescription>
              Сертификат №{selectedCertificate?.number}
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate && (
            <div className="py-4">
              <div className={`relative bg-gradient-to-br ${getTypeColor(selectedCertificate.templateType)} p-12 rounded-2xl shadow-2xl text-white aspect-[1.414/1]`}>
                <div className="flex justify-center mb-6">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                    <Icon name="Shield" className="h-12 w-12" />
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold tracking-wider mb-3">
                      СЕРТИФИКАТ
                    </h2>
                    <p className="text-lg opacity-90">
                      о прохождении обучения по охране труда
                    </p>
                  </div>
                  
                  <div className="py-8 border-y border-white/30 space-y-4">
                    <p className="text-xl">настоящим подтверждается, что</p>
                    <p className="text-3xl font-bold uppercase tracking-wide">
                      {selectedCertificate.listenerName}
                    </p>
                    <p className="text-lg opacity-90">должность: {selectedCertificate.listenerPosition}</p>
                    <p className="text-lg opacity-90 mt-4">успешно прошел(а) обучение по программе</p>
                    <p className="text-2xl font-semibold">
                      {selectedCertificate.program}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end text-sm mt-8">
                  <div>
                    <div className="border-b border-white/50 w-40 mb-1"></div>
                    <p className="opacity-75">Подпись руководителя</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">№ {selectedCertificate.number}</p>
                    <p className="opacity-75">Выдан: {selectedCertificate.issued}</p>
                    <p className="opacity-75">Действителен до: {selectedCertificate.valid}</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <Icon name="QrCode" className="h-16 w-16 text-black" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1">
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Скачать PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="Printer" className="h-4 w-4 mr-2" />
                  Распечатать
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="Mail" className="h-4 w-4 mr-2" />
                  Отправить слушателю
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}