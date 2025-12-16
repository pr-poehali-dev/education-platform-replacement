import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface CertificateBuilderProps {
  onBack: () => void;
}

interface CertificateTemplate {
  id: string;
  name: string;
  type: 'certificate' | 'diploma' | 'attestation';
  program: string;
  createdDate: string;
  usedCount: number;
  color: string;
  fields: {
    title: string;
    subtitle: string;
    hasLogo: boolean;
    hasQR: boolean;
    hasSignature: boolean;
  };
}

export default function CertificateBuilder({ onBack }: CertificateBuilderProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates'>('templates');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'certificate' as 'certificate' | 'diploma' | 'attestation',
    program: '',
    title: '',
    subtitle: '',
    hasLogo: true,
    hasQR: true,
    hasSignature: true,
    color: 'from-blue-500 to-indigo-500'
  });

  const [templates, setTemplates] = useState<CertificateTemplate[]>([
    {
      id: '1',
      name: 'Сертификат работы на высоте',
      type: 'certificate',
      program: 'Работа на высоте',
      createdDate: '15.11.2024',
      usedCount: 45,
      color: 'from-orange-500 to-red-500',
      fields: {
        title: 'СЕРТИФИКАТ',
        subtitle: 'о прохождении обучения по охране труда',
        hasLogo: true,
        hasQR: true,
        hasSignature: true
      }
    },
    {
      id: '2',
      name: 'Удостоверение электробезопасность',
      type: 'attestation',
      program: 'Электробезопасность',
      createdDate: '10.11.2024',
      usedCount: 38,
      color: 'from-yellow-500 to-orange-500',
      fields: {
        title: 'УДОСТОВЕРЕНИЕ',
        subtitle: 'о проверке знаний электробезопасности',
        hasLogo: true,
        hasQR: false,
        hasSignature: true
      }
    },
    {
      id: '3',
      name: 'Диплом ПБ',
      type: 'diploma',
      program: 'Пожарная безопасность',
      createdDate: '05.11.2024',
      usedCount: 62,
      color: 'from-red-500 to-pink-500',
      fields: {
        title: 'ДИПЛОМ',
        subtitle: 'о прохождении пожарно-технического минимума',
        hasLogo: true,
        hasQR: true,
        hasSignature: true
      }
    }
  ]);

  const handleCreateTemplate = () => {
    const template: CertificateTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      type: newTemplate.type,
      program: newTemplate.program,
      createdDate: new Date().toLocaleDateString('ru-RU'),
      usedCount: 0,
      color: newTemplate.color,
      fields: {
        title: newTemplate.title,
        subtitle: newTemplate.subtitle,
        hasLogo: newTemplate.hasLogo,
        hasQR: newTemplate.hasQR,
        hasSignature: newTemplate.hasSignature
      }
    };

    setTemplates([template, ...templates]);
    setShowCreateDialog(false);
    setNewTemplate({
      name: '',
      type: 'certificate',
      program: '',
      title: '',
      subtitle: '',
      hasLogo: true,
      hasQR: true,
      hasSignature: true,
      color: 'from-blue-500 to-indigo-500'
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleEditTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('builder');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate': return 'FileCheck';
      case 'diploma': return 'ScrollText';
      case 'attestation': return 'Shield';
      default: return 'Award';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'certificate': return 'Сертификат';
      case 'diploma': return 'Диплом';
      case 'attestation': return 'Удостоверение';
      default: return 'Документ';
    }
  };

  const colorOptions = [
    { value: 'from-blue-500 to-indigo-500', label: 'Синий', preview: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { value: 'from-green-500 to-emerald-500', label: 'Зелёный', preview: 'bg-gradient-to-r from-green-500 to-emerald-500' },
    { value: 'from-orange-500 to-red-500', label: 'Оранжевый', preview: 'bg-gradient-to-r from-orange-500 to-red-500' },
    { value: 'from-purple-500 to-pink-500', label: 'Фиолетовый', preview: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { value: 'from-yellow-500 to-orange-500', label: 'Жёлтый', preview: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { value: 'from-red-500 to-pink-500', label: 'Красный', preview: 'bg-gradient-to-r from-red-500 to-pink-500' }
  ];

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
                <Icon name="Palette" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Конструктор сертификатов
                </h1>
                <p className="text-xs text-muted-foreground">Создание и управление шаблонами документов</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Создать шаблон
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="bg-white mb-6">
            <TabsTrigger value="templates">
              <Icon name="Layout" className="h-4 w-4 mr-2" />
              Библиотека шаблонов
            </TabsTrigger>
            <TabsTrigger value="builder">
              <Icon name="Palette" className="h-4 w-4 mr-2" />
              Конструктор
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Сохранённые шаблоны</h2>
                  <p className="text-muted-foreground">Всего шаблонов: {templates.length}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-all hover:scale-[1.02] duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`bg-gradient-to-br ${template.color} p-2 rounded-lg`}>
                            <Icon name={getTypeIcon(template.type)} className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription>{template.program}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">{getTypeName(template.type)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Создан</span>
                          <span>{template.createdDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Использован</span>
                          <span className="font-medium">{template.usedCount} раз</span>
                        </div>
                        
                        <div className="flex gap-2 pt-3 border-t">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Icon name="Edit" className="h-4 w-4 mr-1" />
                            Изменить
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="builder">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройка шаблона</CardTitle>
                  <CardDescription>
                    {selectedTemplate ? `Редактирование: ${selectedTemplate.name}` : 'Создайте новый шаблон через кнопку "Создать шаблон"'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplate ? (
                    <>
                      <div className="space-y-2">
                        <Label>Название шаблона</Label>
                        <Input value={selectedTemplate.name} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Заголовок</Label>
                        <Input value={selectedTemplate.fields.title} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Подзаголовок</Label>
                        <Input value={selectedTemplate.fields.subtitle} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Элементы дизайна</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.fields.hasLogo && (
                            <Badge variant="secondary">
                              <Icon name="Image" className="h-3 w-3 mr-1" />
                              Логотип
                            </Badge>
                          )}
                          {selectedTemplate.fields.hasQR && (
                            <Badge variant="secondary">
                              <Icon name="QrCode" className="h-3 w-3 mr-1" />
                              QR-код
                            </Badge>
                          )}
                          {selectedTemplate.fields.hasSignature && (
                            <Badge variant="secondary">
                              <Icon name="PenTool" className="h-3 w-3 mr-1" />
                              Подпись
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Palette" className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Выберите шаблон из библиотеки для редактирования</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Предпросмотр</CardTitle>
                  <CardDescription>Как будет выглядеть сертификат</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className={`relative bg-gradient-to-br ${selectedTemplate.color} p-8 rounded-lg shadow-2xl text-white aspect-[1.414/1] flex flex-col justify-between`}>
                      {selectedTemplate.fields.hasLogo && (
                        <div className="flex justify-center mb-4">
                          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                            <Icon name="Shield" className="h-8 w-8" />
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-wider">
                          {selectedTemplate.fields.title}
                        </h2>
                        <p className="text-sm opacity-90">
                          {selectedTemplate.fields.subtitle}
                        </p>
                        
                        <div className="py-6 border-y border-white/30">
                          <p className="text-lg mb-2">настоящим подтверждается, что</p>
                          <p className="text-2xl font-bold mb-2">ИВАНОВ ИВАН ИВАНОВИЧ</p>
                          <p className="text-sm opacity-90">успешно прошел(а) обучение по программе</p>
                          <p className="text-xl font-semibold mt-2">{selectedTemplate.program}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-end text-xs">
                        {selectedTemplate.fields.hasSignature && (
                          <div>
                            <div className="border-b border-white/50 w-32 mb-1"></div>
                            <p className="opacity-75">Подпись</p>
                          </div>
                        )}
                        <div>
                          <p className="opacity-75">№ 0001</p>
                          <p className="opacity-75">01.01.2025</p>
                        </div>
                        {selectedTemplate.fields.hasQR && (
                          <div className="bg-white p-2 rounded">
                            <Icon name="QrCode" className="h-12 w-12 text-black" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-lg aspect-[1.414/1] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Icon name="FileQuestion" className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p>Предпросмотр будет здесь</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создать новый шаблон</DialogTitle>
            <DialogDescription>
              Настройте параметры документа
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название шаблона</Label>
                <Input
                  id="name"
                  placeholder="Сертификат работы на высоте"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Тип документа</Label>
                <select
                  id="type"
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="certificate">Сертификат</option>
                  <option value="diploma">Диплом</option>
                  <option value="attestation">Удостоверение</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Программа обучения</Label>
              <Input
                id="program"
                placeholder="Работа на высоте"
                value={newTemplate.program}
                onChange={(e) => setNewTemplate({ ...newTemplate, program: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Заголовок документа</Label>
              <Input
                id="title"
                placeholder="СЕРТИФИКАТ"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Подзаголовок</Label>
              <Input
                id="subtitle"
                placeholder="о прохождении обучения по охране труда"
                value={newTemplate.subtitle}
                onChange={(e) => setNewTemplate({ ...newTemplate, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Цветовая схема</Label>
              <div className="grid grid-cols-3 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewTemplate({ ...newTemplate, color: color.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      newTemplate.color === color.value ? 'border-purple-500 scale-105' : 'border-transparent'
                    }`}
                  >
                    <div className={`h-8 rounded ${color.preview}`} />
                    <p className="text-xs mt-2 text-center">{color.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Элементы дизайна</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.hasLogo}
                    onChange={(e) => setNewTemplate({ ...newTemplate, hasLogo: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Добавить логотип</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.hasQR}
                    onChange={(e) => setNewTemplate({ ...newTemplate, hasQR: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Добавить QR-код</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTemplate.hasSignature}
                    onChange={(e) => setNewTemplate({ ...newTemplate, hasSignature: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Добавить место для подписи</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !newTemplate.program || !newTemplate.title}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Save" className="h-4 w-4 mr-2" />
              Создать шаблон
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
