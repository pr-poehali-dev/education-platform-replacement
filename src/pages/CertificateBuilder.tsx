import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  elements?: CertificateElement[];
  backgroundImage?: string | null;
}

interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'logo';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  textAlign?: string;
}

export default function CertificateBuilder({ onBack }: CertificateBuilderProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates'>('templates');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [elements, setElements] = useState<CertificateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'certificate' as 'certificate' | 'diploma' | 'attestation',
    program: '',
  });

  const [templates, setTemplates] = useState<CertificateTemplate[]>(() => {
    const saved = localStorage.getItem('certificate_templates');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: '1',
        name: 'Сертификат работы на высоте',
        type: 'certificate',
        program: 'Работа на высоте',
        createdDate: '15.11.2024',
        usedCount: 45,
      },
      {
        id: '2',
        name: 'Удостоверение электробезопасность',
        type: 'attestation',
        program: 'Электробезопасность',
        createdDate: '10.11.2024',
        usedCount: 38,
      },
      {
        id: '3',
        name: 'Диплом ПБ',
        type: 'diploma',
        program: 'Пожарная безопасность',
        createdDate: '05.11.2024',
        usedCount: 62,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('certificate_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (selectedTemplate) {
      const savedData = localStorage.getItem(`certificate_design_${selectedTemplate.id}`);
      if (savedData) {
        const { elements: savedElements, backgroundImage: savedBg } = JSON.parse(savedData);
        setElements(savedElements || []);
        setBackgroundImage(savedBg || null);
      }
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate) {
      const designData = {
        elements,
        backgroundImage
      };
      localStorage.setItem(`certificate_design_${selectedTemplate.id}`, JSON.stringify(designData));
    }
  }, [elements, backgroundImage, selectedTemplate]);

  const handleCreateTemplate = () => {
    const template: CertificateTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      type: newTemplate.type,
      program: newTemplate.program,
      createdDate: new Date().toLocaleDateString('ru-RU'),
      usedCount: 0,
    };

    setTemplates([template, ...templates]);
    setShowCreateDialog(false);
    setNewTemplate({
      name: '',
      type: 'certificate',
      program: '',
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

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newElement: CertificateElement = {
          id: Date.now().toString(),
          type: 'logo',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          content: event.target?.result as string,
        };
        setElements([...elements, newElement]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextElement = () => {
    const newElement: CertificateElement = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      content: 'Новый текст',
      fontSize: 24,
      fontWeight: 'normal',
      color: '#000000',
      fontFamily: 'Arial',
      textAlign: 'left',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addQRCode = async () => {
    const qrData = `Сертификат №${Date.now()}\nПрограмма: ${selectedTemplate?.program || 'Не указана'}\nДата: ${new Date().toLocaleDateString('ru-RU')}`;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const newElement: CertificateElement = {
        id: Date.now().toString(),
        type: 'qr',
        x: 50,
        y: 300,
        width: 120,
        height: 120,
        content: qrDataUrl,
      };
      setElements([...elements, newElement]);
    } catch (err) {
      console.error('Ошибка генерации QR-кода:', err);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (!canvasRef.current) return;
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - element.x;
    const offsetY = e.clientY - rect.top - element.y;

    setSelectedElement(elementId);
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 50, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(0, Math.min(rect.height - 50, e.clientY - rect.top - dragOffset.y));

    setElements(elements.map(el =>
      el.id === selectedElement ? { ...el, x, y } : el
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSelectedElement = (updates: Partial<CertificateElement>) => {
    if (!selectedElement) return;
    setElements(elements.map(el =>
      el.id === selectedElement ? { ...el, ...updates } : el
    ));
  };

  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setElements(elements.filter(el => el.id !== selectedElement));
    setSelectedElement(null);
  };

  const exportCertificate = () => {
    alert('Экспорт сертификата в разработке. Можно использовать скриншот области.');
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

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
            <TabsTrigger value="builder" disabled={!selectedTemplate}>
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
                          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                            <Icon name={getTypeIcon(template.type)} className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-xs">{template.program}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Тип:</span>
                        <Badge variant="outline">{getTypeName(template.type)}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Создан:</span>
                        <span>{template.createdDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Использован:</span>
                        <Badge>{template.usedCount} раз</Badge>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Icon name="Edit" className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="builder">
            {selectedTemplate && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Холст: {selectedTemplate.name}</CardTitle>
                          <CardDescription>Перетаскивайте элементы для размещения</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Icon name="Undo" className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Icon name="Redo" className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={exportCertificate}>
                            <Icon name="Download" className="h-4 w-4 mr-2" />
                            Экспорт
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div 
                        ref={canvasRef}
                        className="relative w-full aspect-[1.414/1] bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
                        style={{
                          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {!backgroundImage && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <Icon name="Image" className="h-16 w-16 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">Загрузите фон или начните добавлять элементы</p>
                            </div>
                          </div>
                        )}

                        {elements.map((element) => (
                          <div
                            key={element.id}
                            className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-purple-500' : ''}`}
                            style={{
                              left: `${element.x}px`,
                              top: `${element.y}px`,
                              width: element.width ? `${element.width}px` : 'auto',
                              height: element.height ? `${element.height}px` : 'auto',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, element.id)}
                          >
                            {element.type === 'text' && (
                              <div
                                style={{
                                  fontSize: `${element.fontSize}px`,
                                  fontWeight: element.fontWeight,
                                  color: element.color,
                                  fontFamily: element.fontFamily,
                                  textAlign: element.textAlign as any,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            {(element.type === 'logo' || element.type === 'qr' || element.type === 'image') && (
                              <img 
                                src={element.content} 
                                alt="" 
                                className="w-full h-full object-contain"
                                draggable={false}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Добавить элементы</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={addTextElement}
                      >
                        <Icon name="Type" className="h-4 w-4 mr-2" />
                        Добавить текст
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={addQRCode}
                      >
                        <Icon name="QrCode" className="h-4 w-4 mr-2" />
                        Добавить QR-код
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Icon name="Image" className="h-4 w-4 mr-2" />
                        Добавить логотип
                      </Button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Icon name="ImagePlus" className="h-4 w-4 mr-2" />
                        Загрузить фон
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundUpload}
                      />
                    </CardContent>
                  </Card>

                  {selectedElementData && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Настройки элемента</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={deleteSelectedElement}
                          >
                            <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedElementData.type === 'text' && (
                          <>
                            <div className="space-y-2">
                              <Label>Текст</Label>
                              <Input
                                value={selectedElementData.content}
                                onChange={(e) => updateSelectedElement({ content: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Размер шрифта: {selectedElementData.fontSize}px</Label>
                              <Slider
                                value={[selectedElementData.fontSize || 24]}
                                onValueChange={([value]) => updateSelectedElement({ fontSize: value })}
                                min={12}
                                max={96}
                                step={1}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Цвет</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={selectedElementData.color}
                                  onChange={(e) => updateSelectedElement({ color: e.target.value })}
                                  className="w-16 h-10 p-1"
                                />
                                <Input
                                  value={selectedElementData.color}
                                  onChange={(e) => updateSelectedElement({ color: e.target.value })}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Шрифт</Label>
                              <Select
                                value={selectedElementData.fontFamily}
                                onValueChange={(value) => updateSelectedElement({ fontFamily: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Arial">Arial</SelectItem>
                                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                  <SelectItem value="Courier New">Courier New</SelectItem>
                                  <SelectItem value="Verdana">Verdana</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Начертание</Label>
                              <Select
                                value={selectedElementData.fontWeight}
                                onValueChange={(value) => updateSelectedElement({ fontWeight: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Обычный</SelectItem>
                                  <SelectItem value="bold">Жирный</SelectItem>
                                  <SelectItem value="lighter">Тонкий</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Выравнивание</Label>
                              <Select
                                value={selectedElementData.textAlign}
                                onValueChange={(value) => updateSelectedElement({ textAlign: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">По левому краю</SelectItem>
                                  <SelectItem value="center">По центру</SelectItem>
                                  <SelectItem value="right">По правому краю</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        {(selectedElementData.type === 'logo' || selectedElementData.type === 'qr' || selectedElementData.type === 'image') && (
                          <>
                            <div className="space-y-2">
                              <Label>Ширина: {selectedElementData.width}px</Label>
                              <Slider
                                value={[selectedElementData.width || 100]}
                                onValueChange={([value]) => updateSelectedElement({ width: value })}
                                min={50}
                                max={500}
                                step={10}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Высота: {selectedElementData.height}px</Label>
                              <Slider
                                value={[selectedElementData.height || 100]}
                                onValueChange={([value]) => updateSelectedElement({ height: value })}
                                min={50}
                                max={500}
                                step={10}
                              />
                            </div>
                          </>
                        )}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="space-y-1">
                            <Label className="text-xs">X: {Math.round(selectedElementData.x)}</Label>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Y: {Math.round(selectedElementData.y)}</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Список элементов</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {elements.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Элементы не добавлены
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {elements.map((el) => (
                            <button
                              key={el.id}
                              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                                selectedElement === el.id 
                                  ? 'border-purple-500 bg-purple-50' 
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedElement(el.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Icon 
                                  name={el.type === 'text' ? 'Type' : el.type === 'qr' ? 'QrCode' : 'Image'} 
                                  className="h-4 w-4" 
                                />
                                <span className="text-sm font-medium">
                                  {el.type === 'text' 
                                    ? el.content.substring(0, 20) 
                                    : el.type === 'qr' 
                                    ? 'QR-код' 
                                    : el.type === 'logo'
                                    ? 'Логотип'
                                    : 'Изображение'}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый шаблон</DialogTitle>
            <DialogDescription>
              Укажите основные параметры для нового шаблона сертификата
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Название шаблона</Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Например: Сертификат охраны труда"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-type">Тип документа</Label>
              <Select
                value={newTemplate.type}
                onValueChange={(value: any) => setNewTemplate({ ...newTemplate, type: value })}
              >
                <SelectTrigger id="template-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Сертификат</SelectItem>
                  <SelectItem value="diploma">Диплом</SelectItem>
                  <SelectItem value="attestation">Удостоверение</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-program">Программа обучения</Label>
              <Input
                id="template-program"
                value={newTemplate.program}
                onChange={(e) => setNewTemplate({ ...newTemplate, program: e.target.value })}
                placeholder="Например: Охрана труда"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name || !newTemplate.program}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}