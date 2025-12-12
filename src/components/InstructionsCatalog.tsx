import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  const filteredInstructions = instructions.filter(inst => {
    if (selectedCategory !== 'all' && inst.category !== selectedCategory) return false;
    if (selectedIndustry !== 'all' && inst.industry !== selectedIndustry) return false;
    return true;
  });

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
                <Button variant="ghost" size="sm">
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
    </div>
  );
}
