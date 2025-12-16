import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentsPageProps {
  onBack: () => void;
}

interface Document {
  id: number;
  title: string;
  type: 'program' | 'iot' | 'di' | 'profession' | 'tool' | 'electro';
  content: string;
  createdAt: string;
  updatedAt: string;
  category: string;
}

const documentTypes = [
  { value: 'program', label: 'Программа обучения', icon: 'GraduationCap', color: 'from-blue-500 to-cyan-500' },
  { value: 'iot', label: 'Инструкция по охране труда (ИОТ)', icon: 'FileText', color: 'from-green-500 to-emerald-500' },
  { value: 'di', label: 'Должностная инструкция (ДИ)', icon: 'Briefcase', color: 'from-purple-500 to-pink-500' },
  { value: 'profession', label: 'Инструкция по профессии', icon: 'UserCog', color: 'from-orange-500 to-red-500' },
  { value: 'tool', label: 'Инструкция по работе с инструментом', icon: 'Wrench', color: 'from-yellow-500 to-orange-500' },
  { value: 'electro', label: 'Инструкция по электроинструменту', icon: 'Zap', color: 'from-indigo-500 to-purple-500' }
];

export default function DocumentsPage({ onBack }: DocumentsPageProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newDocument, setNewDocument] = useState({
    type: '',
    title: '',
    category: '',
    prompt: ''
  });

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      title: 'Программа обучения по охране труда для электромонтеров',
      type: 'program',
      content: 'Содержимое программы обучения...',
      createdAt: '10.12.2024',
      updatedAt: '10.12.2024',
      category: 'Электробезопасность'
    },
    {
      id: 2,
      title: 'ИОТ при работе на высоте',
      type: 'iot',
      content: 'Содержимое инструкции...',
      createdAt: '08.12.2024',
      updatedAt: '09.12.2024',
      category: 'Работа на высоте'
    },
    {
      id: 3,
      title: 'Должностная инструкция инженера по охране труда',
      type: 'di',
      content: 'Содержимое должностной инструкции...',
      createdAt: '05.12.2024',
      updatedAt: '05.12.2024',
      category: 'Администрация'
    }
  ]);

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find(t => t.value === type) || documentTypes[0];
  };

  const handleGenerateDocument = async () => {
    if (!newDocument.type || !newDocument.title || !newDocument.prompt) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://functions.poehali.dev/10e5d546-414f-4059-8c93-a33a547cf157', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: newDocument.type,
          title: newDocument.title,
          category: newDocument.category,
          prompt: newDocument.prompt
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации документа');
      }

      const data = await response.json();
      const generatedContent = data.content;

      const document: Document = {
        id: documents.length + 1,
        title: newDocument.title,
        type: newDocument.type as any,
        content: generatedContent,
        createdAt: new Date().toLocaleDateString('ru-RU'),
        updatedAt: new Date().toLocaleDateString('ru-RU'),
        category: newDocument.category
      };

      setDocuments([document, ...documents]);
      setShowCreateDialog(false);
      setNewDocument({
        type: '',
        title: '',
        category: '',
        prompt: ''
      });
    } catch (error) {
      console.error('Ошибка генерации:', error);
      alert('Не удалось сгенерировать документ. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPreviewDialog(true);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPreviewDialog(true);
  };

  const handleSaveDocument = (updatedContent: string) => {
    if (!selectedDocument) return;

    const updatedDocuments = documents.map(doc =>
      doc.id === selectedDocument.id
        ? { ...doc, content: updatedContent, updatedAt: new Date().toLocaleDateString('ru-RU') }
        : doc
    );

    setDocuments(updatedDocuments);
    setSelectedDocument({ ...selectedDocument, content: updatedContent });
  };

  const handleDownloadDOCX = (doc: Document) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            h2 { font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
            h3 { font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
            p { margin-bottom: 10px; }
            ul, ol { margin-left: 20px; margin-bottom: 10px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
          </style>
        </head>
        <body>
          ${markdownToHTML(doc.content)}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (doc: Document) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Разбиваем текст на строки
    const lines = doc.content.split('\n');

    lines.forEach((line) => {
      // Проверяем, нужно ли добавить новую страницу
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      // Определяем стиль текста
      if (line.startsWith('# ')) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const text = line.replace('# ', '');
        const splitText = pdf.splitTextToSize(text, maxWidth);
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * 10;
      } else if (line.startsWith('## ')) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const text = line.replace('## ', '');
        const splitText = pdf.splitTextToSize(text, maxWidth);
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * 8;
      } else if (line.startsWith('### ')) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const text = line.replace('### ', '');
        const splitText = pdf.splitTextToSize(text, maxWidth);
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * 7;
      } else if (line.trim() === '') {
        yPosition += 5;
      } else if (line.startsWith('---')) {
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const text = '• ' + line.substring(2);
        const splitText = pdf.splitTextToSize(text, maxWidth - 10);
        pdf.text(splitText, margin + 5, yPosition);
        yPosition += splitText.length * 5;
      } else if (line.match(/^\d+\./)) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(line, maxWidth - 10);
        pdf.text(splitText, margin + 5, yPosition);
        yPosition += splitText.length * 5;
      } else if (line.startsWith('|')) {
        // Пропускаем таблицы для упрощения
        yPosition += 5;
      } else {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const splitText = pdf.splitTextToSize(line, maxWidth);
        pdf.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5;
      }
    });

    pdf.save(`${doc.title}.pdf`);
  };

  const markdownToHTML = (markdown: string): string => {
    let html = markdown;

    // Заголовки
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Жирный текст
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Курсив
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Списки
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Нумерованные списки
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

    // Горизонтальная линия
    html = html.replace(/^---$/gim, '<hr />');

    // Таблицы (упрощенная обработка)
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      return '<tr>' + cells.map((cell: string) => `<td>${cell}</td>`).join('') + '</tr>';
    });
    html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

    // Параграфы
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    return html;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Icon name="FileText" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Документы
                </h1>
                <p className="text-xs text-muted-foreground">Создание инструкций и программ с помощью ИИ</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Sparkles" className="h-4 w-4 mr-2" />
              Создать документ с ИИ
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Типы документов</h2>
          <p className="text-muted-foreground mb-6">Выберите тип документа для создания</p>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {documentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setNewDocument({ ...newDocument, type: type.value });
                  setShowCreateDialog(true);
                }}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105 duration-300 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`bg-gradient-to-br ${type.color} p-3 rounded-xl inline-flex mb-2 transform group-hover:rotate-6 transition-transform`}>
                      <Icon name={type.icon} className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs font-medium">{type.label}</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Созданные документы</h2>
          <p className="text-muted-foreground">История созданных инструкций и программ</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const typeInfo = getDocumentTypeInfo(doc.type);
            return (
              <Card key={doc.id} className="hover:shadow-lg transition-all hover:scale-[1.02] duration-300">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`bg-gradient-to-br ${typeInfo.color} p-2 rounded-lg flex-shrink-0`}>
                      <Icon name={typeInfo.icon} className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Создан</span>
                      <span>{doc.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Обновлен</span>
                      <span>{doc.updatedAt}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Icon name="Eye" className="h-4 w-4 mr-1" />
                        Просмотр
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditDocument(doc)}
                      >
                        <Icon name="Edit" className="h-4 w-4 mr-1" />
                        Редактировать
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownloadDOCX(doc)}
                    >
                      <Icon name="Download" className="h-4 w-4 mr-2" />
                      Скачать DOCX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Sparkles" className="h-5 w-5 text-purple-600" />
              Создать документ с помощью ИИ
            </DialogTitle>
            <DialogDescription>
              Заполните параметры, и ИИ-ассистент создаст профессиональный документ
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Тип документа</Label>
              <Select 
                value={newDocument.type} 
                onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип документа" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon name={type.icon} className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Название документа</Label>
              <Input
                id="title"
                placeholder="Например: Инструкция по работе с болгаркой"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория / Направление</Label>
              <Input
                id="category"
                placeholder="Например: Электробезопасность, Работа на высоте"
                value={newDocument.category}
                onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Опишите требования к документу</Label>
              <Textarea
                id="prompt"
                placeholder="Опишите специфику работы, особые требования, нормативные документы, которые нужно учесть..."
                value={newDocument.prompt}
                onChange={(e) => setNewDocument({ ...newDocument, prompt: e.target.value })}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                💡 Чем подробнее описание, тем точнее будет документ
              </p>
            </div>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-900 mb-1">Как работает ИИ-генерация</p>
                    <ul className="text-purple-700 space-y-1 list-disc list-inside">
                      <li>Анализирует ваши требования и тип документа</li>
                      <li>Создает структурированный документ по ГОСТ</li>
                      <li>Учитывает нормы охраны труда и законодательство РФ</li>
                      <li>Вы можете отредактировать результат после создания</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isGenerating}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleGenerateDocument}
              disabled={!newDocument.type || !newDocument.title || !newDocument.prompt || isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  Создание документа...
                </>
              ) : (
                <>
                  <Icon name="Sparkles" className="h-4 w-4 mr-2" />
                  Создать документ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>
              {selectedDocument && getDocumentTypeInfo(selectedDocument.type).label} • {selectedDocument?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="flex-1 overflow-y-auto">
              <Textarea
                value={selectedDocument.content}
                onChange={(e) => handleSaveDocument(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
              />
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => selectedDocument && handleDownloadDOCX(selectedDocument)}
                >
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Скачать DOCX
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => selectedDocument && handleDownloadPDF(selectedDocument)}
                >
                  <Icon name="FileText" className="h-4 w-4 mr-2" />
                  Экспорт в PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.print()}
                >
                  <Icon name="Printer" className="h-4 w-4 mr-2" />
                  Печать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}