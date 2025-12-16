import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
}

const API_URL = 'https://functions.poehali.dev/26432853-bc16-442a-aabf-e90c33bae6c2';

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
  onGenerateClick
}: InstructionsCatalogProps) {
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setShowPreviewDialog(true);
    } catch (error) {
      console.error('Failed to load instruction:', error);
      alert('Не удалось загрузить инструкцию');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Каталог инструкций</h2>
          <p className="text-muted-foreground">Найдите нужную инструкцию или создайте новую</p>
        </div>
        <Button onClick={onGenerateClick} className="bg-gradient-to-r from-blue-600 to-blue-500">
          <Icon name="Sparkles" className="h-4 w-4 mr-2" />
          Сгенерировать с ИИ
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

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedInstruction?.title}</DialogTitle>
            <DialogDescription>
              {selectedInstruction?.profession} • {selectedInstruction?.industry}
            </DialogDescription>
          </DialogHeader>

          {selectedInstruction && (
            <div className="flex-1 overflow-y-auto">
              <Textarea
                value={selectedInstruction.content || ''}
                readOnly
                className="min-h-[500px] font-mono text-sm"
              />
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const blob = new Blob([selectedInstruction.content || ''], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${selectedInstruction.title}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Скачать TXT
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