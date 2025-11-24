
import React from 'react';
import { InspectionData, ScoreResult, TechCheck } from '../types';
import { computeScore, getRecommendation } from '../utils/scoreCalculator';
import { Badge, Button, Card } from './UIComponents';
import { Download, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus, Info, Volume2, Loader2, MapPin, Phone, Database, AlertCircle, FileText, CheckSquare, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CarPartType, InteractiveCarMap } from './CarIcons';
import { generateVoiceReport } from '../utils/aiService';

interface SummaryProps {
  data: InspectionData;
}

// Localization Maps
const STATUS_MAP: Record<string, string> = {
  'OK': 'Завод',
  'Scratched': 'Царапина',
  'Dented': 'Вмятина',
  'Repainted': 'Окрас',
  'Replaced': 'Замена',
  'Rust': 'Коррозия',
  'Defect': 'Дефект'
};

const GLASS_MAP: Record<string, string> = {
  'OK': 'Без дефектов',
  'Scuff': 'Потертости',
  'Chip': 'Сколы',
  'Crack': 'Трещина',
  'Replaced': 'Заменено'
};

export const SummaryReport: React.FC<SummaryProps> = ({ data }) => {
  const reportRef = React.useRef<HTMLDivElement>(null);
  const { score, grade } = computeScore(data);
  const recommendation = getRecommendation(data);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = React.useState(false);

  const generatePdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    window.scrollTo(0, 0); 

    try {
      await new Promise(r => setTimeout(r, 500));
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `Dair_${data.make}_${data.model}_${data.vin || 'report'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Ошибка при создании PDF. Попробуйте еще раз.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleGenerateVoice = async () => {
    setIsGeneratingVoice(true);
    try {
      const text = `Отчет осмотра автомобиля ${data.make} ${data.model}. Общий рейтинг ${score} из 100. ${recommendation.reasons.length > 0 ? 'Основные замечания: ' + recommendation.reasons.join(', ') : 'Автомобиль в отличном состоянии.'}`;
      const audioBlob = await generateVoiceReport(text);
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await (audioBlob as Blob).arrayBuffer();
      const int16Data = new Int16Array(arrayBuffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) float32Data[i] = int16Data[i] / 32768.0;
      
      const buffer = audioCtx.createBuffer(1, float32Data.length, 24000); 
      buffer.getChannelData(0).set(float32Data);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();

    } catch (e) {
      console.error(e);
      alert("Ошибка генерации речи");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const bodyRows = [
    { name: 'Капот', type: 'hood' },
    { name: 'Крыша', type: 'roof' },
    { name: 'Багажник', type: 'trunk' },
    { name: 'Перед. Бампер', type: 'frontBumper' },
    { name: 'Задн. Бампер', type: 'rearBumper' },
    { name: 'Крыло (Л.П.)', type: 'lfFender' },
    { name: 'Крыло (П.П.)', type: 'rfFender' },
    { name: 'Дверь (Л.П.)', type: 'lfDoor' },
    { name: 'Дверь (П.П.)', type: 'rfDoor' },
    { name: 'Дверь (Л.З.)', type: 'lrDoor' },
    { name: 'Дверь (П.З.)', type: 'rrDoor' },
    { name: 'Крыло (Л.З.)', type: 'lrQuarter' },
    { name: 'Крыло (П.З.)', type: 'rrQuarter' },
  ].map(item => ({ ...item, ...data[item.type as CarPartType] }));

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      <div className="flex justify-end mb-6 gap-3 max-w-[210mm] mx-auto">
        <Button onClick={handleGenerateVoice} disabled={isGeneratingVoice} variant="secondary">
           {isGeneratingVoice ? <Loader2 size={18} className="animate-spin mr-2" /> : <Volume2 size={18} className="mr-2" />}
           Аудио отчет
        </Button>
        <Button onClick={generatePdf} disabled={isGenerating}>
          {isGenerating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Download size={18} className="mr-2" />}
          Сохранить PDF
        </Button>
      </div>

      {/* REPORT CONTAINER */}
      <div ref={reportRef} className="bg-white mx-auto shadow-xl print:shadow-none min-h-[297mm] w-[210mm] p-10 font-sans text-slate-900 relative">
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-4 border-blue-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter">ДаирАвтопроверка</h1>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2"><MapPin size={14}/> Профессиональный автоподбор</div>
                <div className="flex items-center gap-2"><Phone size={14}/> +7 931 244 6003</div>
              </div>
            </div>
            <div className="text-right bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px]">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Эксперт</div>
              <div className="font-bold text-lg text-slate-800">{data.expertName}</div>
              <div className="text-blue-600 font-medium text-xs mt-1">Рейтинг авто: {score}/100</div>
              <div className="text-xs text-gray-400 mt-2 pt-2 border-t">Дата: {new Date().toLocaleDateString()}</div>
            </div>
        </div>

        {/* CAR INFO */}
        <div className="grid grid-cols-2 gap-12 mb-10">
           <div>
             <div className="text-gray-400 text-[10px] uppercase font-bold mb-1">Автомобиль</div>
             <div className="text-3xl font-bold text-slate-900 leading-none mb-4">{data.make} {data.model}</div>
             <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
               <div><span className="block text-xs text-gray-500">Год</span> <b className="text-slate-800">{data.year}</b></div>
               <div><span className="block text-xs text-gray-500">Пробег</span> <b className="text-slate-800">{data.mileage} км</b></div>
               <div><span className="block text-xs text-gray-500">Владельцев</span> <b className="text-slate-800">{data.owners}</b></div>
               <div><span className="block text-xs text-gray-500">Цена</span> <b className="text-slate-800">{data.price} ₽</b></div>
             </div>
           </div>
           
           <div>
             <div className="text-gray-400 text-[10px] uppercase font-bold mb-1">Идентификация</div>
             <div className="bg-slate-100 p-3 rounded-lg font-mono font-bold text-lg tracking-widest border border-slate-200 text-center text-slate-700 mb-4">
                {data.vin || 'НЕ УКАЗАН'}
             </div>
             <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
               <div><span className="block text-xs text-gray-500">Двигатель</span> <b className="text-slate-800">{data.engine}</b></div>
               <div><span className="block text-xs text-gray-500">КПП</span> <b className="text-slate-800">{data.transmission}</b></div>
               <div><span className="block text-xs text-gray-500">Привод</span> <b className="text-slate-800">{data.drive}</b></div>
               <div><span className="block text-xs text-gray-500">Цвет</span> <b className="text-slate-800">{data.color}</b></div>
             </div>
           </div>
        </div>

        {/* VERDICT */}
        <div className={`mb-10 p-4 rounded-xl border-l-8 flex items-start gap-4 ${
             recommendation.verdict === 'Recommended' ? 'bg-green-50 border-green-500 text-green-900' : 
             recommendation.verdict === 'Conditional' ? 'bg-yellow-50 border-yellow-500 text-yellow-900' : 
             'bg-red-50 border-red-500 text-red-900'
        }`}>
            {recommendation.verdict === 'Recommended' ? <CheckCircle className="shrink-0 text-green-600 mt-1" /> : <AlertTriangle className="shrink-0 mt-1" />}
            <div>
               <h3 className="font-bold text-lg uppercase tracking-wide mb-1">
                 {recommendation.verdict === 'Recommended' ? 'Рекомендуется к покупке' : 
                  recommendation.verdict === 'Conditional' ? 'Рекомендуется с оговорками' : 'Не рекомендуется'}
               </h3>
               <p className="text-sm opacity-90">{recommendation.reasons.join('. ') || 'Автомобиль в отличном состоянии.'}</p>
            </div>
        </div>

        {/* BODY */}
        <div className="border-t border-b border-gray-200 py-8 mb-8">
            <h3 className="text-gray-400 text-xs uppercase font-bold mb-6">Кузов и ЛКП</h3>
            <div className="flex gap-8">
                <div className="w-1/3">
                    <InteractiveCarMap data={data} readOnly className="h-[300px]" />
                </div>
                <div className="w-2/3">
                    <table className="w-full text-xs text-left">
                        <thead className="text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="pb-2 pl-2">Элемент</th>
                                <th className="pb-2">Состояние</th>
                                <th className="pb-2">ЛКП</th>
                                <th className="pb-2">Прим.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {bodyRows.map((row, i) => (
                                <tr key={i} className={row.status !== 'OK' ? 'bg-red-50/10' : ''}>
                                    <td className="py-2 pl-2 font-semibold text-slate-700">{row.name}</td>
                                    <td className="py-2"><StatusBadge status={row.status} /></td>
                                    <td className="py-2 font-mono text-slate-600">{row.lkp ? `${row.lkp}` : '-'}</td>
                                    <td className="py-2 text-gray-500 max-w-[120px] truncate">{row.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* COMPREHENSIVE CHECKLIST SUMMARY - NOW DETAILED */}
        <div className="mb-8 break-inside-avoid">
             <h3 className="text-gray-400 text-xs uppercase font-bold mb-4">Детальная проверка (Чек-листы)</h3>
             <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-6">
                    <ChecklistSummaryBlock title="Юридическая" category="legal" data={data} />
                    <ChecklistSummaryBlock title="Кузов (Структура)" category="bodyStruct" data={data} />
                    <ChecklistSummaryBlock title="Пробег (Салон)" category="mileage" data={data} />
                 </div>
                 <div className="space-y-6">
                    <ChecklistSummaryBlock title="Технич. (Статика)" category="techStatic" data={data} />
                    <ChecklistSummaryBlock title="Тест-Драйв" category="testDrive" data={data} />
                    <ChecklistSummaryBlock title="Профессиональная" category="professional" data={data} />
                 </div>
             </div>
        </div>

        {/* TECH CHECKLIST - DETAILED GRID */}
        <div className="mb-8">
            <h3 className="text-gray-400 text-xs uppercase font-bold mb-4">Техническое состояние</h3>
            <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">Двигатель и Жидкости</h4>
                   <TechResultRow label="Уровень масла" item={data.engineOilLevel} />
                   <TechResultRow label="Состояние масла" item={data.engineOilCondition} />
                   <TechResultRow label="Антифриз" item={data.coolantLevel} />
                   <TechResultRow label="Звук ДВС" item={data.engineSound} />
                   <TechResultRow label="Дымность" item={data.engineSmoke} />
                   <TechResultRow label="Течи" item={data.engineLeaks} />
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">КПП и Ходовая</h4>
                   <TechResultRow label="Переключения КПП" item={data.gearboxShifting} />
                   <TechResultRow label="Подвеска" item={data.suspensionKnocks} />
                   <TechResultRow label="Рулевое" item={data.steeringPlay} />
                   <div className="mt-4 pt-2 border-t">
                     <h4 className="font-bold text-slate-700 mb-2">Салон</h4>
                     <TechResultRow label="Обивка" item={data.upholstery} />
                     <div className="flex justify-between mt-1"><span className="text-gray-500">Кондиционер</span> <span className="font-bold">{data.acWorking ? 'Работает' : 'Нет'}</span></div>
                   </div>
                </div>
            </div>
        </div>
        
        {/* OTHER SECTIONS */}
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
               <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Остекление</h3>
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Лобовое</span> <span className="font-medium">{GLASS_MAP[data.wsStatus]}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Маркировка</span> <span className="font-medium">{data.wsMarking || '-'}</span></div>
               </div>
            </div>

            <div>
               <h3 className="text-gray-400 text-xs uppercase font-bold mb-3">Базовая Юридическая проверка</h3>
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-2">
                  <CheckRow label="ПТС Оригинал" checked={data.ptsOriginal} />
                  <CheckRow label="VIN совпадает" checked={data.vinMatches} />
                  <CheckRow label="ДТП в базах" checked={data.accidents} inverse />
               </div>
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-10 left-10 right-10 border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
            <span>ДаирАвтопроверка © {new Date().getFullYear()}</span>
            <span>Сгенерировано автоматически</span>
        </div>

      </div>
    </div>
  );
};

// --- Subcomponents ---

const ChecklistSummaryBlock = ({ title, category, data }: { title: string, category: keyof InspectionData['extendedChecklist'], data: InspectionData }) => {
    const items = data.extendedChecklist?.[category] || {};
    const keys = Object.keys(items);
    
    // If no data, show nothing
    if (keys.length === 0) return null;

    return (
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <CheckSquare size={14} className="text-blue-500"/>
                <span className="text-xs font-bold text-slate-700 uppercase">{title}</span>
            </div>
            <ul className="space-y-1.5">
                {keys.map((key) => {
                    const passed = items[key];
                    return (
                        <li key={key} className="flex items-start gap-2 text-[10px] leading-tight">
                            <div className="mt-0.5 shrink-0">
                                {passed ? (
                                    <CheckCircle size={12} className="text-green-600" />
                                ) : (
                                    <XCircle size={12} className="text-gray-300" /> 
                                )}
                            </div>
                            <span className={passed ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                                {key}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    let style = "text-slate-500";
    if (status === 'OK') style = "text-green-600 font-bold";
    else if (status === 'Repainted') style = "text-yellow-600 font-bold";
    else if (['Replaced', 'Rust', 'Defect'].includes(status)) style = "text-red-600 font-bold";
    return <span className={`text-[11px] ${style}`}>{STATUS_MAP[status] || status}</span>;
};

const CheckRow = ({ label, checked, inverse }: { label: string, checked: boolean, inverse?: boolean }) => {
    const isGood = inverse ? !checked : checked;
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-500">{label}</span>
            {isGood ? (
                <span className="flex items-center text-green-600 font-bold text-xs"><CheckCircle size={12} className="mr-1"/> ДА</span>
            ) : (
                <span className="flex items-center text-red-600 font-bold text-xs"><AlertTriangle size={12} className="mr-1"/> НЕТ</span>
            )}
        </div>
    );
};

const TechResultRow = ({ label, item }: { label: string, item: TechCheck }) => {
    let color = "text-green-600";
    let icon = <CheckCircle size={12} />;
    
    if (item.status === 'Fair') { color = "text-yellow-600"; icon = <AlertCircle size={12}/>; }
    if (item.status === 'Bad') { color = "text-red-600"; icon = <AlertTriangle size={12}/>; }

    return (
       <div className="flex justify-between items-center py-1">
          <span className="text-gray-500">{label}</span>
          <span className={`flex items-center font-bold text-xs ${color} gap-1`}>
             {icon} {item.status === 'Good' ? 'Норма' : item.status === 'Fair' ? 'Внимание' : 'Плохо'}
          </span>
       </div>
    );
};
