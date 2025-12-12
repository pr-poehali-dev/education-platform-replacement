import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

const AI_URL = 'https://functions.poehali.dev/be3c82db-379c-4835-a62e-000e73f19cac';
const API_URL = 'https://functions.poehali.dev/26432853-bc16-442a-aabf-e90c33bae6c2';

interface AIGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstructionCreated: () => void;
}

export default function AIGenerator({ open, onOpenChange, onInstructionCreated }: AIGeneratorProps) {
  const [generatingInstruction, setGeneratingInstruction] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    type: 'iot',
    profession: '',
    industry: '',
    additional_info: ''
  });

  const generateInstruction = async () => {
    if (!aiFormData.profession) {
      alert('Укажите профессию или должность');
      return;
    }

    setGeneratingInstruction(true);

    try {
      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiFormData)
      });

      if (!response.ok) throw new Error('AI generation failed');

      const data = await response.json();

      await fetch(`${API_URL}?path=instructions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          category: data.type,
          industry: data.industry,
          profession: data.profession,
          content: data.content,
          created_by: 1
        })
      });

      onOpenChange(false);
      setAiFormData({ type: 'iot', profession: '', industry: '', additional_info: '' });
      onInstructionCreated();
      alert('Инструкция успешно создана!');
    } catch (error) {
      console.error('Failed to generate instruction:', error);
      alert('Ошибка при генерации инструкции. Проверьте API ключ OpenAI.');
    } finally {
      setGeneratingInstruction(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Sparkles" className="h-5 w-5 text-primary" />
            Генерация инструкции с помощью ИИ
          </DialogTitle>
          <DialogDescription>
            Заполните форму, и нейросеть создаст инструкцию специально под вашу отрасль и специальность
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Icon name="Info" className="h-4 w-4" />
          <AlertDescription>
            Для работы генератора требуется API ключ OpenAI. Добавьте его в секреты проекта с именем OPENAI_API_KEY.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип инструкции</Label>
            <Select
              value={aiFormData.type}
              onValueChange={(value) => setAiFormData({ ...aiFormData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iot">Инструкция по охране труда (ИОТ)</SelectItem>
                <SelectItem value="job">Должностная инструкция</SelectItem>
                <SelectItem value="equipment">Инструкция по эксплуатации оборудования</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Профессия / Должность *</Label>
            <Input
              id="profession"
              placeholder="Например: Электрик, Сварщик, Оператор станка"
              value={aiFormData.profession}
              onChange={(e) => setAiFormData({ ...aiFormData, profession: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Отрасль</Label>
            <Input
              id="industry"
              placeholder="Например: Строительство, Машиностроение, Энергетика"
              value={aiFormData.industry}
              onChange={(e) => setAiFormData({ ...aiFormData, industry: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Дополнительная информация</Label>
            <Textarea
              id="additional"
              placeholder="Укажите особенности работы, специфическое оборудование, условия труда..."
              rows={4}
              value={aiFormData.additional_info}
              onChange={(e) => setAiFormData({ ...aiFormData, additional_info: e.target.value })}
            />
          </div>

          <Alert>
            <Icon name="Lightbulb" className="h-4 w-4" />
            <AlertDescription>
              <strong>Совет:</strong> Чем подробнее вы опишете специфику работы, тем точнее будет инструкция.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generatingInstruction}>
            Отмена
          </Button>
          <Button
            onClick={generateInstruction}
            disabled={generatingInstruction || !aiFormData.profession}
            className="bg-gradient-to-r from-blue-600 to-blue-500"
          >
            {generatingInstruction ? (
              <>
                <Icon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Icon name="Sparkles" className="h-4 w-4 mr-2" />
                Сгенерировать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
