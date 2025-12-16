import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CertificatesPageProps {
  onBack: () => void;
  onNavigateToBuilder: () => void;
}

export default function CertificatesPage({ onBack, onNavigateToBuilder }: CertificatesPageProps) {
  const certificates = [
    { id: 1, number: 1001, program: 'Работа на высоте', issued: '15.10.2024', valid: '15.10.2025' },
    { id: 2, number: 1002, program: 'Электробезопасность', issued: '20.09.2024', valid: '20.09.2025' },
    { id: 3, number: 1003, program: 'Пожарная безопасность', issued: '05.11.2024', valid: '05.11.2025' }
  ];

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Выданные документы</h2>
          <p className="text-muted-foreground">История сертификатов, дипломов и удостоверений</p>
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
                    <span className="text-muted-foreground">Выдано</span>
                    <span>{cert.issued}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Действительно до</span>
                    <span className="font-medium">{cert.valid}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Icon name="Download" className="h-4 w-4 mr-2" />
                    Скачать PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}