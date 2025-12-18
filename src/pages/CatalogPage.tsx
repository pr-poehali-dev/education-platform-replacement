import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import InstructionsCatalog from '@/components/InstructionsCatalog';
import AIGenerator from '@/components/AIGenerator';

const API_URL = 'https://functions.poehali.dev/0f54b4eb-703c-4b13-9825-e72b135c9d1b';

interface Instruction {
  id: string;
  title: string;
  category: 'iot' | 'job' | 'equipment';
  industry: string;
  profession: string;
  content?: string;
  lastUpdated: string;
}

interface CatalogPageProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export default function CatalogPage({ onBack, isAdmin = false }: CatalogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [customTopicDialog, setCustomTopicDialog] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      const response = await fetch(`${API_URL}?path=instructions`);
      const data = await response.json();
      setInstructions(data.instructions || []);
    } catch (error) {
      console.error('Failed to load instructions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                <Icon name="BookOpen" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Каталог инструкций
                </h1>
                <p className="text-xs text-muted-foreground">База знаний по охране труда и ПБ</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <InstructionsCatalog
          instructions={instructions}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
          onGenerateClick={() => setCustomTopicDialog(true)}
          isAdmin={isAdmin}
          onInstructionUpdate={loadInstructions}
        />
      </main>

      <AIGenerator
        open={customTopicDialog}
        onOpenChange={setCustomTopicDialog}
        onInstructionCreated={() => {
          loadInstructions();
        }}
      />
    </div>
  );
}