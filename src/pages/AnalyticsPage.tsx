import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsPageProps {
  onBack: () => void;
}

export default function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  const [reportPeriod, setReportPeriod] = useState('month');

  // Данные для отчёта (в реальном приложении будут из БД)
  const analyticsData = {
    totalListeners: 0,
    completedPrograms: 0,
    inProgressPrograms: 0,
    averageScore: 0,
    certificatesIssued: 0,
    testsPassed: 0,
    testsFailed: 0,
    programsStats: [
      { name: 'Работа на высоте', listeners: 0, completed: 0, avgScore: 0 },
      { name: 'Электробезопасность', listeners: 0, completed: 0, avgScore: 0 },
      { name: 'Пожарная безопасность', listeners: 0, completed: 0, avgScore: 0 },
    ],
    departmentStats: [
      { name: 'Цех №1', listeners: 0, completed: 0, progress: 0 },
      { name: 'Цех №2', listeners: 0, completed: 0, progress: 0 },
      { name: 'Отдел ПТО', listeners: 0, completed: 0, progress: 0 },
    ],
    monthlyProgress: [
      { month: 'Январь', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Февраль', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Март', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Апрель', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Май', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Июнь', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Июль', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Август', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Сентябрь', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Октябрь', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Ноябрь', enrolled: 0, completed: 0, certified: 0 },
      { month: 'Декабрь', enrolled: 0, completed: 0, certified: 0 },
    ],
  };

  const generateExcelReport = () => {
    const workbook = XLSX.utils.book_new();
    const currentDate = new Date().toLocaleDateString('ru-RU').replace(/\./g, '_');

    // Лист 1: Общая статистика
    const summaryData = [
      ['Отчёт по обучению и аттестации'],
      ['Дата формирования', new Date().toLocaleDateString('ru-RU')],
      ['Период', reportPeriod === 'month' ? 'За месяц' : reportPeriod === 'quarter' ? 'За квартал' : 'За год'],
      [],
      ['ОСНОВНЫЕ ПОКАЗАТЕЛИ'],
      ['Показатель', 'Значение'],
      ['Всего слушателей', analyticsData.totalListeners],
      ['Завершенных программ', analyticsData.completedPrograms],
      ['Программ в процессе', analyticsData.inProgressPrograms],
      ['Средний балл тестирования', `${analyticsData.averageScore}%`],
      ['Выдано сертификатов', analyticsData.certificatesIssued],
      ['Тестов сдано', analyticsData.testsPassed],
      ['Тестов не сдано', analyticsData.testsFailed],
      [],
      ['УСПЕВАЕМОСТЬ'],
      ['Процент сдачи тестов', analyticsData.testsPassed > 0 
        ? `${Math.round((analyticsData.testsPassed / (analyticsData.testsPassed + analyticsData.testsFailed)) * 100)}%` 
        : '0%'],
      ['Процент завершения программ', analyticsData.totalListeners > 0 
        ? `${Math.round((analyticsData.completedPrograms / analyticsData.totalListeners) * 100)}%` 
        : '0%'],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 40 },
      { wch: 20 }
    ];

    // Стили для заголовка
    summarySheet['A1'].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center' }
    };

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Общая статистика');

    // Лист 2: Статистика по программам
    const programsData = [
      ['СТАТИСТИКА ПО ПРОГРАММАМ ОБУЧЕНИЯ'],
      [],
      ['Программа', 'Слушателей', 'Завершили', 'Средний балл', 'Процент завершения']
    ];

    analyticsData.programsStats.forEach(program => {
      const completionRate = program.listeners > 0 
        ? `${Math.round((program.completed / program.listeners) * 100)}%` 
        : '0%';
      programsData.push([
        program.name,
        program.listeners,
        program.completed,
        `${program.avgScore}%`,
        completionRate
      ]);
    });

    const programsSheet = XLSX.utils.aoa_to_sheet(programsData);
    programsSheet['!cols'] = [
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, programsSheet, 'По программам');

    // Лист 3: Статистика по подразделениям
    const departmentsData = [
      ['СТАТИСТИКА ПО ПОДРАЗДЕЛЕНИЯМ'],
      [],
      ['Подразделение', 'Слушателей', 'Завершили обучение', 'Прогресс']
    ];

    analyticsData.departmentStats.forEach(dept => {
      departmentsData.push([
        dept.name,
        dept.listeners,
        dept.completed,
        `${dept.progress}%`
      ]);
    });

    const departmentsSheet = XLSX.utils.aoa_to_sheet(departmentsData);
    departmentsSheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, departmentsSheet, 'По подразделениям');

    // Лист 4: Помесячная динамика
    const monthlyData = [
      ['ДИНАМИКА ОБУЧЕНИЯ ПО МЕСЯЦАМ'],
      [],
      ['Месяц', 'Записано на обучение', 'Завершили программы', 'Получили сертификаты']
    ];

    analyticsData.monthlyProgress.forEach(month => {
      monthlyData.push([
        month.month,
        month.enrolled,
        month.completed,
        month.certified
      ]);
    });

    // Добавляем итоговую строку
    const totalEnrolled = analyticsData.monthlyProgress.reduce((sum, m) => sum + m.enrolled, 0);
    const totalCompleted = analyticsData.monthlyProgress.reduce((sum, m) => sum + m.completed, 0);
    const totalCertified = analyticsData.monthlyProgress.reduce((sum, m) => sum + m.certified, 0);
    
    monthlyData.push([]);
    monthlyData.push([
      'ИТОГО',
      totalEnrolled,
      totalCompleted,
      totalCertified
    ]);

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
    monthlySheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 }
    ];

    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Помесячная динамика');

    // Сохранение файла
    const fileName = `Отчёт_обучение_${currentDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl">
                <Icon name="BarChart3" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Аналитика
                </h1>
                <p className="text-xs text-muted-foreground">Отчёты и статистика по обучению</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="quarter">За квартал</SelectItem>
                  <SelectItem value="year">За год</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={generateExcelReport}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Icon name="FileSpreadsheet" className="h-4 w-4 mr-2" />
                Сформировать отчёт Excel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Основные показатели</h2>
          <p className="text-muted-foreground">Сводная статистика по обучению и аттестации</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Всего слушателей</CardDescription>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Icon name="Users" className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.totalListeners}</div>
              <p className="text-xs text-muted-foreground mt-1">Зарегистрировано в системе</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Программ завершено</CardDescription>
                <div className="bg-green-100 p-2 rounded-lg">
                  <Icon name="CheckCircle" className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.completedPrograms}</div>
              <p className="text-xs text-muted-foreground mt-1">Успешно пройдено</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Средний балл</CardDescription>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Icon name="Target" className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">По всем тестированиям</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Сертификатов выдано</CardDescription>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Icon name="Award" className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analyticsData.certificatesIssued}</div>
              <p className="text-xs text-muted-foreground mt-1">Удостоверений оформлено</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по программам обучения</CardTitle>
              <CardDescription>Распределение слушателей по программам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.programsStats.map((program, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{program.name}</span>
                      <Badge variant="outline">{program.listeners} чел.</Badge>
                    </div>
                    <Progress value={program.listeners > 0 ? (program.completed / program.listeners) * 100 : 0} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        Завершили: {program.completed} / Средний балл: {program.avgScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статистика по подразделениям</CardTitle>
              <CardDescription>Прогресс обучения по отделам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.departmentStats.map((dept, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <Badge variant="outline">{dept.listeners} чел.</Badge>
                    </div>
                    <Progress value={dept.progress} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        Завершили: {dept.completed} • Прогресс: {dept.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileSpreadsheet" className="h-5 w-5 text-green-600" />
              Автоматическая генерация отчётов
            </CardTitle>
            <CardDescription>Формирование подробных отчётов в Excel с графиками и статистикой</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-900 mb-3">Что включено в отчёт:</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Общая статистика</strong> — основные показатели и KPI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>По программам</strong> — детализация по каждой программе обучения</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>По подразделениям</strong> — прогресс по отделам и цехам</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Помесячная динамика</strong> — тренды и изменения за период</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-3">Возможности:</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <Icon name="Calendar" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Выбор периода: месяц, квартал, год</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Table" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>4 листа с таблицами и расчётами</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Download" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Готовый Excel-файл для печати и отправки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="TrendingUp" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Автоматические расчёты процентов и итогов</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Готовы сформировать отчёт?</p>
                  <p className="text-xs text-green-700 mt-1">Выберите период в верхней части страницы и нажмите кнопку</p>
                </div>
                <Button 
                  onClick={generateExcelReport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  <Icon name="FileSpreadsheet" className="h-5 w-5 mr-2" />
                  Сформировать отчёт
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {analyticsData.totalListeners === 0 && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Данные появятся после начала работы</p>
                  <p className="text-blue-700">
                    Зарегистрируйте слушателей, назначьте программы обучения и проведите тестирования. 
                    Статистика будет автоматически обновляться, и вы сможете формировать детальные отчёты.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}