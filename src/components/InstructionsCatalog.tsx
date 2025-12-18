import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Document, Paragraph, Packer, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface Instruction {
  id: string;
  title: string;
  category: 'iot' | 'job' | 'equipment';
  industry: string;
  profession: string;
  content?: string;
  lastUpdated: string;
}

interface InstructionsCatalogProps {
  instructions: Instruction[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedIndustry: string;
  setSelectedIndustry: (value: string) => void;
  onGenerateClick: () => void;
  isAdmin?: boolean;
  onInstructionUpdate?: () => void;
}

const API_URL = 'https://functions.poehali.dev/0f54b4eb-703c-4b13-9825-e72b135c9d1b';

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    iot: 'ShieldCheck',
    job: 'Briefcase',
    equipment: 'Wrench'
  };
  return icons[category] || 'FileText';
};

export default function InstructionsCatalog({
  instructions,
  selectedCategory,
  setSelectedCategory,
  selectedIndustry,
  setSelectedIndustry,
  onGenerateClick,
  isAdmin = false,
  onInstructionUpdate
}: InstructionsCatalogProps) {
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredInstructions = instructions.filter(inst => {
    if (selectedCategory !== 'all' && inst.category !== selectedCategory) return false;
    if (selectedIndustry !== 'all' && inst.industry !== selectedIndustry) return false;
    return true;
  });

  const handleViewInstruction = async (instruction: Instruction) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?path=instruction&id=${instruction.id}`);
      const data = await response.json();
      setSelectedInstruction(data.instruction);
      setEditedContent(data.instruction.content || '');
      setEditedTitle(data.instruction.title || '');
      setShowPreviewDialog(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to load instruction:', error);
      alert('Не удалось загрузить инструкцию');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInstruction = async () => {
    if (!selectedInstruction) return;

    setIsSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: 'update-instruction',
          id: selectedInstruction.id,
          title: editedTitle,
          content: editedContent
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedInstruction({
          ...selectedInstruction,
          title: editedTitle,
          content: editedContent
        });
        setIsEditing(false);
        onInstructionUpdate?.();
        alert('Инструкция успешно обновлена');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to save instruction:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(selectedInstruction?.content || '');
    setEditedTitle(selectedInstruction?.title || '');
  };

  const handleDeleteInstruction = async () => {
    if (!selectedInstruction) return;

    setIsDeleting(true);
    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedInstruction.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowPreviewDialog(false);
        setShowDeleteConfirm(false);
        onInstructionUpdate?.();
        alert('Инструкция успешно удалена');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to delete instruction:', error);
      alert('Не удалось удалить инструкцию');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!selectedInstruction) return;

    try {
      const contentLines = (selectedInstruction.content || '').split('\n').filter(line => line.trim());
      
      const paragraphs: Paragraph[] = [
        new Paragraph({
          text: selectedInstruction.title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${selectedInstruction.profession} • ${selectedInstruction.industry}`,
              italics: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),
        ...contentLines.map(line => {
          if (line.match(/^\d+\./)) {
            return new Paragraph({
              text: line,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 }
            });
          }
          return new Paragraph({
            text: line,
            spacing: { after: 150 }
          });
        })
      ];

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${selectedInstruction.title}.docx`);
    } catch (error) {
      console.error('Failed to generate Word document:', error);
      alert('Не удалось создать документ Word');
    }
  };

  const handlePrint = () => {
    if (!selectedInstruction) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const contentLines = (selectedInstruction.content || '').split('\n');
    const formattedContent = contentLines.map(line => {
      if (line.match(/^\d+\./)) {
        return `<h2 style="margin-top: 20px; margin-bottom: 10px;">${line}</h2>`;
      }
      return `<p style="margin-bottom: 10px;">${line}</p>`;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedInstruction.title}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
            }
            .subtitle {
              text-align: center;
              font-style: italic;
              color: #666;
              margin-bottom: 40px;
            }
            h2 {
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 10px;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>${selectedInstruction.title}</h1>
          <div class="subtitle">${selectedInstruction.profession} • ${selectedInstruction.industry}</div>
          ${formattedContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Каталог инструкций</h2>
          <p className="text-muted-foreground">Найдите нужную инструкцию или создайте новую</p>
        </div>
        <Button onClick={onGenerateClick} className="bg-gradient-to-r from-blue-600 to-blue-500">
          <Icon name="FileText" className="h-4 w-4 mr-2" />
          Генерация документа
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input placeholder="Поиск по названию..." className="w-full" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            <SelectItem value="iot">Инструкции по ОТ</SelectItem>
            <SelectItem value="job">Должностные</SelectItem>
            <SelectItem value="equipment">По оборудованию</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Отрасль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все отрасли</SelectItem>
            <SelectItem value="construction">Строительство</SelectItem>
            <SelectItem value="manufacturing">Производство</SelectItem>
            <SelectItem value="energy">Энергетика</SelectItem>
            <SelectItem value="transport">Транспорт</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstructions.map((instruction) => (
          <Card key={instruction.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Icon name={getCategoryIcon(instruction.category)} className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{instruction.industry}</Badge>
              </div>
              <CardTitle className="mt-4">{instruction.title}</CardTitle>
              <CardDescription>{instruction.profession}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Обновлено: {new Date(instruction.lastUpdated).toLocaleDateString('ru-RU')}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleViewInstruction(instruction)}
                  disabled={isLoading}
                >
                  <Icon name="Eye" className="h-4 w-4 mr-1" />
                  Открыть
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstructions.length === 0 && (
        <div className="text-center py-12">
          <Icon name="FileX" className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Инструкций не найдено</p>
          <Button onClick={onGenerateClick} variant="outline" className="mt-4">
            Создать новую
          </Button>
        </div>
      )}

      <Dialog open={showPreviewDialog} onOpenChange={(open) => {
        setShowPreviewDialog(open);
        if (!open) {
          setIsEditing(false);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-lg font-semibold"
                placeholder="Название инструкции"
              />
            ) : (
              <DialogTitle>{selectedInstruction?.title}</DialogTitle>
            )}
            <DialogDescription>
              {selectedInstruction?.profession} • {selectedInstruction?.industry}
            </DialogDescription>
          </DialogHeader>

          {selectedInstruction && (
            <div className="flex-1 overflow-y-auto">
              <Textarea
                value={isEditing ? editedContent : selectedInstruction.content || ''}
                onChange={(e) => setEditedContent(e.target.value)}
                readOnly={!isEditing}
                className={`min-h-[500px] font-mono text-sm ${
                  isEditing ? 'border-blue-300 focus:border-blue-500' : ''
                }`}
              />
              
              <div className="flex gap-2 mt-4">
                {isAdmin && !isEditing && (
                  <>
                    <Button 
                      variant="default" 
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Icon name="Edit" className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Icon name="Trash2" className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </>
                )}
                
                {isEditing && (
                  <>
                    <Button 
                      variant="default" 
                      onClick={handleSaveInstruction}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="Save" className="h-4 w-4 mr-2" />
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <Icon name="X" className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </>
                )}
                
                {!isEditing && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleDownloadWord}
                    >
                      <Icon name="Download" className="h-4 w-4 mr-2" />
                      Скачать Word
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handlePrint}
                    >
                      <Icon name="Printer" className="h-4 w-4 mr-2" />
                      Печать
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить инструкцию "{selectedInstruction?.title}"?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteInstruction}
              disabled={isDeleting}
            >
              <Icon name="Trash2" className="h-4 w-4 mr-2" />
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}