
import React from 'react';
import { InspectionData, BodyPart, Wheel, ObdCode, TechCheck, InspectionAttachment } from '../types';
import { Input, Select, Textarea, Checkbox, Card, Button, Modal, StatusSelector, StatusOption } from './UIComponents';
import { Plus, Trash2, AlertTriangle, Camera, X, Search, Sparkles, Image as ImageIcon, CheckCircle, AlertCircle, Droplets, Gauge, Settings, Wind, Thermometer, Battery, Armchair, Copy, ShieldCheck, Send, Database, Disc, ChevronDown, ChevronUp, FileText, CheckSquare, Tag } from 'lucide-react';
import { CarPartType, InteractiveCarMap } from './CarIcons';
import { analyzeObdCode, analyzeCarImage } from '../utils/aiService';

interface StepProps {
  data: InspectionData;
  onChange: (key: keyof InspectionData, value: any) => void;
  errors?: Record<string, string>;
}

// --- CHECKLIST CONSTANTS ---

const CHECKLIST_I_LEGAL = [
  "Ограничения и аресты (ГИБДД)",
  "Залог / Кредит / Лизинг (ФНП)",
  "Розыск / Угон",
  "История ДТП (Расчеты ремонтов)",
  "Работа в такси / каршеринге",
  "Проверка пробега по базам (ЕАИСТО)",
  "Неоплаченные штрафы",
  "Таможенная задолженность",
  "Сверка VIN на кузове и в документах",
  "Паспорт продавца совпадает с ДКП"
];

const CHECKLIST_II_BODY = [
  "Зазоры равномерны и симметричны",
  "Нет следов кручения болтов",
  "Нет шагрени / подтеков краски",
  "Геометрия проемов в норме (Двери)",
  "Нет коррозии (Арки/Пороги/Днище)",
  "Нет трещин на лобовом (зона щеток)",
  "Нет люфта водительской двери"
];

const CHECKLIST_III_MILEAGE = [
  "Руль (Потертости/Перешив)",
  "Педали (Износ накладок)",
  "Сиденье водителя (Заломы/Просиженность)",
  "Рычаг КПП / Подлокотник",
  "Ремень безопасности (Ворс/Дата)",
  "Кнопка Старт/Стоп (Затертость)",
  "Ковролин под пяткой водителя"
];

const CHECKLIST_IV_TECH_STATIC = [
  "ДВС сухой (нет подтеков)",
  "Патрубки мягкие (без трещин)",
  "Масло без запаха бензина",
  "Антифриз чистый (без масла)",
  "Тест ГБЦ (Нет пузырей в бачке)",
  "Масло АКПП (Цвет/Запах)",
  "Тормозные диски (Износ)",
  "Ремень ГРМ/Навесного (Состояние)",
  "Кондиционер (Холод +5...+12°C)",
  "Все лампочки/индикаторы работают"
];

const CHECKLIST_V_TEST_DRIVE = [
  "Запуск ДВС (С пол-оборота)",
  "Холостой ход ровный",
  "Нет белого/сизого/черного дыма",
  "АКПП: Плавный разгон (без пинков)",
  "МКПП: Сцепление не буксует",
  "Руль не бьет и не тянет",
  "Подвеска: Нет стуков на ямах",
  "Торможение ровное (не тянет)",
  "ШРУСы не хрустят в повороте",
  "Динамика разгона в норме"
];

const CHECKLIST_VI_PRO = [
  "Сканирование всех блоков (DTC)",
  "Сверка пробега в блоках ЭБУ",
  "Осмотр на подъемнике (Снизу)",
  "Замер компрессии",
  "Наличие аптечки/знака/огнетушителя"
];

// --- CONSTANTS ---

const STATUS_3_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Норма', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300 ring-green-400' },
  { value: 'Fair', label: 'Внимание', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-yellow-400' },
  { value: 'Bad', label: 'Плохо', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300 ring-red-400' },
];

const BODY_STATUS_OPTS: StatusOption[] = [
  { value: 'OK', label: 'В родной краске', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300 ring-green-400' },
  { value: 'Repainted', label: 'Окрас (Косметика)', icon: <Sparkles size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-yellow-400' },
  { value: 'Defect', label: 'Дефект / Ремонт', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300 ring-red-400' },
  { value: 'Replaced', label: 'Замена детали', icon: <Settings size={18}/>, colorClass: 'bg-red-100 text-red-800 border-red-300 ring-red-400' },
];

const FLUID_LEVEL_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Норма', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Минимум', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Критично', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

// --- Specific Tech Options ---

const ENGINE_SOUND_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Тихо / Ровно', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Гидрики / Цокот', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Стук / Лязг / Троение', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

const SMOKE_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Нет (Чистый)', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Белый (Пар)', icon: <Wind size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Сизый / Черный', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

const LEAK_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Сухо', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Запотевание', icon: <Droplets size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Течь масла', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

const GEARBOX_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Плавное', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Затягивает', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Пинки / Удары', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

const SUSPENSION_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Тихо / Упруго', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Стук (мелкий)', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Грохот / Люфт', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

const STEERING_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Норма', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Люфт', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Стук рейки / Закус.', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

const UPHOLSTERY_OPTS: StatusOption[] = [
  { value: 'Good', label: 'Чистая / Целая', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Fair', label: 'Потертости / Грязь', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Bad', label: 'Рваная / Прожжена', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
];

// --- Tech Issues Lists ---

const TECH_ISSUES = {
  oilLevel: [
    'Уровень на минимуме',
    'Ниже минимума',
    'Выше максимума (Перелив)',
    'Щуп сухой'
  ],
  oilCond: [
    'Темное (Требует замены)',
    'Черное / Гудрон',
    'Эмульсия (Антифриз)',
    'Присутствует стружка',
    'Запах гари'
  ],
  coolant: [
    'Уровень на минимуме',
    'Ниже минимума',
    'Грязный / Ржавый осадок',
    'Масляная пленка (Эмульсия)',
    'Следы герметика'
  ],
  brake: [
    'Уровень на минимуме',
    'Темная жидкость',
    'Влага > 3% (Требует замены)'
  ],
  sound: [
    'Стук гидрокомпенсаторов (на холодную)',
    'Стук гидрокомпенсаторов (постоянно)',
    'Посторонний шум цепи ГРМ',
    'Дизеление (Фазорегуляторы)',
    'Стук ЦПГ / Шатунный',
    'Троение / Пропуски зажигания',
    'Свист приводного ремня/роликов'
  ],
  smoke: [
    'Сизый дым (Горит масло)',
    'Черный дым (Топливная система)',
    'Белый густой дым (Прокладка ГБЦ)'
  ],
  leaks: [
    'Запотевание клапанной крышки',
    'Течь клапанной крышки',
    'Запотевание стыка ДВС/КПП',
    'Течь сальника коленвала',
    'Течь поддона ДВС',
    'Течь корпуса масляного фильтра',
    'Течь радиатора / патрубков',
    'Течь рулевой рейки / ГУР'
  ],
  gearbox: [
    'Пинки при переключении D/R',
    'Затягивает переключения',
    'Толчки при переключении передач',
    'Вибрация при нагрузке',
    'Посторонний гул/шум',
    'Пробуксовка сцепления'
  ],
  suspension: [
    'Стук спереди',
    'Стук сзади',
    'Люфт стоек стабилизатора',
    'Надрывы сайлентблоков',
    'Течь амортизаторов',
    'Гул ступичного подшипника'
  ],
  steering: [
    'Люфт в рулевом управлении',
    'Стук рулевой рейки',
    'Тугое вращение руля',
    'Гул насоса ГУР'
  ],
  upholstery: [
    'Требует химчистки',
    'Затертость боковой поддержки',
    'Трещины / Заломы на коже',
    'Прожог',
    'Порез / Разрыв материала',
    'Просижен наполнитель'
  ],
  wheel: [
    'Затерт (Соответствует пробегу)',
    'Сильный износ (Не соответствует пробегу)',
    'Перешит (Свежая кожа)',
    'Окрашен (Восстановлен)',
    'Потертости кнопок'
  ],
};

const POPULAR_MAKES = [
  "Acura", "Alfa Romeo", "Audi", "Bentley", "BMW", "Cadillac", "Changan", "Chery", "Chevrolet", 
  "Chrysler", "Citroen", "Daewoo", "Datsun", "Dodge", "Exeed", "FAW", "Fiat", "Ford", 
  "GAC", "Geely", "Genesis", "Great Wall", "Haval", "Honda", "Hongqi", "Hyundai", "Infiniti", 
  "Isuzu", "JAC", "Jaguar", "Jeep", "Jetour", "Kia", "Lada (ВАЗ)", "Land Rover", "Lexus", 
  "Lifan", "Lincoln", "LiXiang", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", 
  "Omoda", "Opel", "Peugeot", "Porsche", "Renault", "Rolls-Royce", "Seat", "Skoda", 
  "Smart", "SsangYong", "Subaru", "Suzuki", "Tank", "Tesla", "Toyota", "Volkswagen", 
  "Volvo", "Voyah", "Zeekr", "ГАЗ", "УАЗ"
];

const REGIONS = [
  "Респ. Дагестан", "Чеченская Респ.", "Кабардино-Балкарская Респ.", "Респ. Северная Осетия",
  "Респ. Ингушетия", "Ставропольский край", "Краснодарский край", "Ростовская обл.",
  "Москва", "Московская обл.", "Санкт-Петербург"
];

const FUEL_TYPES = [
  "Бензин", "Дизель", "Гибрид", "Электро", "ГБО (Газ)"
];

// --- HELPER COMPONENT: CHECKLIST BLOCK ---

const ChecklistBlock = ({ 
  title, 
  items, 
  category, 
  data, 
  onChange 
}: { 
  title: string, 
  items: string[], 
  category: keyof InspectionData['extendedChecklist'], 
  data: InspectionData, 
  onChange: (key: keyof InspectionData, value: any) => void 
}) => {
  // Checklist is ALWAYS open/expanded now
  
  const currentChecks = data.extendedChecklist?.[category] || {};

  const toggleItem = (item: string) => {
    const newVal = { ...currentChecks, [item]: !currentChecks[item] };
    const newExtended = { ...data.extendedChecklist, [category]: newVal };
    onChange('extendedChecklist', newExtended);
  };

  const selectAll = () => {
    const newVal: Record<string, boolean> = {};
    items.forEach(i => newVal[i] = true);
    onChange('extendedChecklist', { ...data.extendedChecklist, [category]: newVal });
  };
  
  const checkedCount = items.filter(i => currentChecks[i]).length;
  const totalCount = items.length;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-600 shadow-sm">
      <div className="flex justify-between items-center py-2 border-b border-gray-100 mb-2">
        <div className="flex items-center gap-3">
          <CheckSquare className="text-blue-600" size={24} />
          <div>
            <h3 className="font-bold text-gray-800 text-base">{title}</h3>
            <p className="text-xs text-gray-500 font-medium">Обязательно к проверке ({checkedCount} из {totalCount})</p>
          </div>
        </div>
        <button onClick={selectAll} className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
            Отметить все
        </button>
      </div>

      <div className="pt-2">
           <div className="grid grid-cols-1 gap-2">
             {items.map((item, idx) => {
               const isChecked = !!currentChecks[item];
               return (
                 <div key={idx} 
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${isChecked ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                      onClick={() => toggleItem(item)}
                 >
                    <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}>
                      {isChecked && <CheckCircle size={16} strokeWidth={3} />}
                    </div>
                    <span className={`text-sm leading-tight ${isChecked ? 'text-green-900 font-bold' : 'text-gray-700 font-medium'}`}>{item}</span>
                 </div>
               );
             })}
           </div>
      </div>
    </Card>
  );
};


// --- Step 1: General ---
export const Step1General: React.FC<StepProps> = ({ data, onChange, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    onChange(name as keyof InspectionData, val);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input 
            label="Марка *" 
            name="make" 
            value={data.make} 
            onChange={handleChange} 
            placeholder="Toyota" 
            list="makes"
            error={errors?.make}
            required
          />
          <datalist id="makes">
            {POPULAR_MAKES.map(m => <option key={m} value={m} />)}
          </datalist>
        </div>
        
        <Input 
            label="Модель *" 
            name="model" 
            value={data.model} 
            onChange={handleChange} 
            placeholder="Camry" 
            error={errors?.model}
            required
        />
        
        <Input 
            label="Год выпуска *" 
            name="year" 
            type="number" 
            value={data.year} 
            onChange={handleChange} 
            placeholder="2018" 
            min={1980} max={2030} 
            error={errors?.year}
            required
        />
        
        <Input 
          label="VIN (17 символов) *" 
          name="vin" 
          value={data.vin} 
          onChange={(e) => onChange('vin', e.target.value.toUpperCase())} 
          placeholder="JTNBF3HK..." 
          maxLength={17} 
          error={errors?.vin}
          required
        />
        
        <Input 
            label="Пробег, км *" 
            name="mileage" 
            type="number" 
            value={data.mileage} 
            onChange={handleChange} 
            placeholder="84500" 
            error={errors?.mileage}
            required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Двигатель (Тип / Объём)</label>
          <div className="flex gap-2">
            <select 
              className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
              onChange={(e) => {
                 // Append Fuel type to engine string if not present
                 const val = e.target.value;
                 const current = String(data.engine).split(' ');
                 const vol = current[0] && !isNaN(parseFloat(current[0])) ? current[0] : '';
                 onChange('engine', `${vol} ${val}`.trim());
              }}
            >
               <option value="">Тип...</option>
               {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <input 
               type="text" 
               className="w-1/2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
               placeholder="2.5"
               onChange={(e) => {
                 const vol = e.target.value;
                 const current = String(data.engine).split(' ');
                 const type = current.length > 1 ? current.slice(1).join(' ') : '';
                 onChange('engine', `${vol} ${type}`.trim());
               }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">Результат: {data.engine}</div>
        </div>
        
        <Select 
          label="Трансмиссия" 
          name="transmission" 
          value={data.transmission} 
          onChange={handleChange}
          options={[
            { value: '', label: 'Не выбрано' },
            { value: 'AT', label: 'Автомат (AT)' },
            { value: 'MT', label: 'Механика (MT)' },
            { value: 'CVT', label: 'Вариатор (CVT)' },
            { value: 'AMT', label: 'Робот (AMT/DCT)' },
          ]}
        />
        
        <Select 
          label="Привод" 
          name="drive" 
          value={data.drive} 
          onChange={handleChange}
          options={[
            { value: '', label: 'Не выбрано' },
            { value: 'FWD', label: 'Передний (FWD)' },
            { value: 'AWD', label: 'Полный (AWD)' },
            { value: 'RWD', label: 'Задний (RWD)' },
          ]}
        />
        
        <Select 
          label="Цвет" 
          name="color" 
          value={data.color} 
          onChange={handleChange}
          options={[
            { value: '', label: 'Не выбрано' },
            { value: 'Белый', label: 'Белый' },
            { value: 'Черный', label: 'Черный' },
            { value: 'Серый', label: 'Серый' },
            { value: 'Серебристый', label: 'Серебристый' },
            { value: 'Синий', label: 'Синий' },
            { value: 'Красный', label: 'Красный' },
            { value: 'Коричневый', label: 'Коричневый' },
            { value: 'Зеленый', label: 'Зеленый' },
            { value: 'Бежевый', label: 'Бежевый' },
            { value: 'Желтый', label: 'Желтый' },
            { value: 'Оранжевый', label: 'Оранжевый' },
            { value: 'Фиолетовый', label: 'Фиолетовый' },
            { value: 'Другой', label: 'Другой' },
          ]}
        />
        
        <Input 
            label="Цена продавца, ₽ *" 
            name="price" 
            type="number" 
            value={data.price} 
            onChange={handleChange} 
            placeholder="2250000" 
            error={errors?.price}
            required
        />
        <Input label="Средняя цена по рынку, ₽" name="averageMarketPrice" type="number" value={data.averageMarketPrice} onChange={handleChange} placeholder="2100000" />
        
        <div>
          <Input 
            label="Регион" 
            name="region" 
            value={data.region} 
            onChange={handleChange} 
            placeholder="Респ. Дагестан" 
            list="regions"
          />
          <datalist id="regions">
            {REGIONS.map(r => <option key={r} value={r} />)}
          </datalist>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Textarea label="Дополнительные заметки" name="generalNotes" value={data.generalNotes} onChange={handleChange} placeholder="Комплектация, ключи, история..." className="flex-1" />
      </div>

      <AttachmentSection title="Материалы к общему осмотру" section="general" data={data} onChange={onChange} />
    </div>
  );
};

const Loader = ({size, className}: {size?: number, className?: string}) => (
    <svg className={className} width={size||24} height={size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.1" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.8" />
    </svg>
);

const AttachmentSection = ({
  title,
  section,
  data,
  onChange,
}: {
  title: string;
  section: keyof InspectionData['inspectionFiles'];
  data: InspectionData;
  onChange: (key: keyof InspectionData, value: any) => void;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const files = data.inspectionFiles?.[section] || [];

  const updateFiles = (nextFiles: InspectionAttachment[]) => {
    onChange('inspectionFiles', {
      ...data.inspectionFiles,
      [section]: nextFiles,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const selected = Array.from(e.target.files);
    try {
      const loadedFiles = await Promise.all(
        selected.map(
          (file) =>
            new Promise<InspectionAttachment>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  name: file.name,
                  type: file.type || 'application/octet-stream',
                  size: file.size,
                  uploadedAt: new Date().toISOString(),
                  url: String(reader.result || ''),
                });
              };
              reader.readAsDataURL(file);
            })
        )
      );

      updateFiles([...(files || []), ...loadedFiles]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const nextFiles = [...files];
    nextFiles.splice(index, 1);
    updateFiles(nextFiles);
  };

  const formatSize = (size: number) =>
    size > 1024 * 1024 ? `${(size / (1024 * 1024)).toFixed(1)} МБ` : `${Math.round(size / 1024)} КБ`;

  return (
    <Card className="border-dashed border-primary-200 bg-primary-50/30">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-sm font-bold text-primary-900">{title}</h4>
        <span className="text-xs text-gray-500">Фото + отчеты (PDF, DOC, XLS)</span>
      </div>

      {files.length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-2">
          {files.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            return (
              <div key={`${file.name}-${idx}`} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2">
                <div className="w-11 h-11 rounded-md overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                  {isImage ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <FileText size={16} className="text-gray-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-[11px] text-gray-500">{formatSize(file.size)}</p>
                </div>
                <button type="button" onClick={() => removeFile(idx)} className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={handleFileUpload} />
      <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
        <Camera size={14} className="mr-1.5" />
        {isUploading ? 'Загружаем...' : 'Добавить файлы'}
      </Button>
    </Card>
  );
};

// --- Step 2: Body ---
const BodyPartForm: React.FC<{ 
  part: BodyPart; 
  onChange: (p: BodyPart) => void;
  partType: CarPartType;
}> = ({ part, onChange, partType }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const updateField = (field: keyof BodyPart, val: any) => {
    onChange({ ...part, [field]: val });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const newImages: string[] = [];
      try {
        await Promise.all(files.map(file => {
          return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                newImages.push(reader.result);
              }
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }));
        onChange({ ...part, images: [...(part.images || []), ...newImages] });
      } catch (err) {
        console.error("Error reading files", err);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(part.images || [])];
    newImages.splice(index, 1);
    onChange({ ...part, images: newImages });
  };
  
  const handleAnalyzeImage = async () => {
     if (!part.images || part.images.length === 0) return;
     setIsAnalyzing(true);
     try {
       const result = await analyzeCarImage(part.images[part.images.length - 1]);
       const newNotes = part.notes ? `${part.notes}\nAI: ${result}` : `AI: ${result}`;
       updateField('notes', newNotes);
     } catch (e) {
       alert("Не удалось проанализировать изображение");
     } finally {
       setIsAnalyzing(false);
     }
  };

  const isDefective = part.status === 'Defect' || part.status === 'Replaced';
  const showWarning = isDefective && (!part.images || part.images.length === 0);

  return (
    <div>
        <div className="mb-4">
            <StatusSelector 
              label="Состояние элемента"
              value={part.status}
              onChange={(val) => updateField('status', val)}
              options={BODY_STATUS_OPTS}
            />
        </div>

        {part.status !== 'OK' && part.status !== 'Replaced' && (
           <div className="mb-4 animate-fade-in-up">
              <Select 
                label="Тип дефекта"
                value={part.defectType || ''}
                onChange={(e) => updateField('defectType', e.target.value)}
                options={[
                  { value: '', label: 'Укажите тип...' },
                  { value: 'Scratched', label: 'Царапина' },
                  { value: 'Dented', label: 'Вмятина' },
                  { value: 'Rust', label: 'Ржавчина / Коррозия' },
                  { value: 'Chip', label: 'Скол' },
                  { value: 'Crack', label: 'Трещина' },
                  { value: 'Peeling', label: 'Лак облезает' },
                  { value: 'PoorRepair', label: 'Плохой ремонт / Шпатлевка' },
                ]}
              />
           </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
            <Input 
              label="Размер дефекта (см)" 
              type="number" 
              value={part.size || ''} 
              onChange={(e) => updateField('size', Number(e.target.value))}
              placeholder="0"
              disabled={part.status === 'OK'}
            />
            <Input 
              label="ЛКП (мкм)" 
              type="number" 
              value={part.lkp || ''} 
              onChange={(e) => updateField('lkp', Number(e.target.value))}
              placeholder="120"
            />
        </div>

        <div className="relative">
            <Textarea 
                label="Заметки по элементу" 
                value={part.notes} 
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Опишите дефект подробнее..."
                className="mb-3"
            />
            {part.images && part.images.length > 0 && (
                <button 
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  className="absolute top-0 right-0 mt-8 mr-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md border border-purple-200 hover:bg-purple-200 flex items-center transition-colors"
                >
                   <Sparkles size={12} className="mr-1" />
                   {isAnalyzing ? 'Анализ...' : 'AI Анализ'}
                </button>
            )}
        </div>

        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                Фотографии {part.images?.length ? `(${part.images.length})` : ''}
                </label>
                {showWarning && (
                    <span className="text-xs text-orange-600 flex items-center font-medium bg-orange-50 px-2 py-1 rounded-md animate-pulse">
                    <AlertTriangle size={14} className="mr-1" /> Нужно фото
                    </span>
                )}
            </div>
            
            {part.images && part.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
                {part.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden group bg-gray-50 shadow-sm">
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white p-1 rounded-full transition-colors backdrop-blur-sm"
                    title="Удалить"
                    >
                    <X size={10} />
                    </button>
                </div>
                ))}
            </div>
            )}

            <div className="flex items-center gap-3">
                <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                />
                <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`text-xs py-1.5 h-9 w-full ${showWarning ? 'border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100' : ''}`}
                >
                {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader size={14} className="animate-spin" />
                        Загрузка...
                    </span>
                ) : (
                    <span className="flex items-center justify-center">
                    <Camera size={14} className="mr-1.5" /> 
                    {part.images && part.images.length > 0 ? 'Добавить еще фото' : 'Добавить фото'}
                    </span>
                )}
                </Button>
            </div>
        </div>
    </div>
  );
};

export const Step2Body: React.FC<StepProps> = ({ data, onChange }) => {
  const [selectedPart, setSelectedPart] = React.useState<CarPartType | null>(null);

  const getPartName = (p: CarPartType): string => {
    const names: Record<CarPartType, string> = {
      hood: 'Капот',
      roof: 'Крыша',
      trunk: 'Багажник / 5-я дверь',
      frontBumper: 'Передний бампер',
      rearBumper: 'Задний бампер',
      lfFender: 'Левое переднее крыло',
      rfFender: 'Правое переднее крыло',
      lfDoor: 'Левая передняя дверь',
      rfDoor: 'Правая передняя дверь',
      lrDoor: 'Левая задняя дверь',
      rrDoor: 'Правая задняя дверь',
      lrQuarter: 'Левое заднее крыло',
      rrQuarter: 'Правое заднее крыло',
    };
    return names[p] || p;
  };

  return (
    <div className="animate-fade-in-up">
      <ChecklistBlock 
        title="II. Кузов и Структурная Целостность" 
        items={CHECKLIST_II_BODY} 
        category="bodyStruct"
        data={data}
        onChange={onChange}
      />

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-center font-medium text-gray-500 mb-4 text-sm">Нажмите на деталь кузова для осмотра</h3>
        
        <div className="flex justify-center mb-6">
          <InteractiveCarMap 
            data={data} 
            onSelectPart={setSelectedPart}
            className="h-[500px]"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-700">
           <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">🟢 Родная</div>
           <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 border border-yellow-200">🟡 Окрас</div>
           <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200">🟠 Дефект</div>
           <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 border border-red-200">🔴 Замена / неоригинал</div>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedPart} 
        onClose={() => setSelectedPart(null)}
        title={selectedPart ? getPartName(selectedPart) : ''}
      >
        {selectedPart && (
          <BodyPartForm 
            part={data[selectedPart]} 
            onChange={(updatedPart) => onChange(selectedPart, updatedPart)} 
            partType={selectedPart}
          />
        )}
      </Modal>

      <AttachmentSection title="Общие фото кузова и документы по кузовной части" section="body" data={data} onChange={onChange} />
    </div>
  );
};

// --- Step 3: Glass ---
export const Step3Glass: React.FC<StepProps> = ({ data, onChange }) => {
  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
      <Card title="Лобовое стекло">
        <StatusSelector 
           label="Состояние"
           value={data.wsStatus}
           onChange={(v) => onChange('wsStatus', v)}
           options={[
             { value: 'OK', label: 'Целое', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700 border-green-300' },
             { value: 'Chip', label: 'Сколы', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
             { value: 'Crack', label: 'Трещина', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700 border-red-300' },
             { value: 'Scuff', label: 'Затертость', icon: <Disc size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
             { value: 'Replaced', label: 'Менялось', icon: <Settings size={18}/>, colorClass: 'bg-blue-100 text-blue-700 border-blue-300' },
           ]}
           className="mb-4"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input 
             label="Маркировка / Год" 
             value={data.wsMarking} 
             onChange={(e) => onChange('wsMarking', e.target.value)}
             placeholder="Pilkington 19..."
           />
           <div className="flex flex-col gap-2 pt-6">
             <Checkbox label="Оригинальное стекло" checked={data.wsOriginal} onChange={(e) => onChange('wsOriginal', e.target.checked)} />
             <Checkbox label="Подогрев работает" checked={data.wsHeated} onChange={(e) => onChange('wsHeated', e.target.checked)} />
           </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select 
          label="Боковые стёкла (Состояние)" 
          value={data.sideGlassStatus} 
          onChange={(e) => onChange('sideGlassStatus', e.target.value)}
          options={[
             {value: '', label: 'Выбрать...'},
             {value: 'Оригинал, без дефектов', label: 'Оригинал, без дефектов'},
             {value: 'Оригинал, есть царапины', label: 'Оригинал, есть царапины'},
             {value: 'Есть замененные', label: 'Есть замененные'},
             {value: 'Все заменены', label: 'Все заменены'},
             {value: 'Разбиты', label: 'Разбиты'},
          ]}
        />
        
        <Select 
          label="Зеркала (Состояние)" 
          value={data.mirrorsStatus} 
          onChange={(e) => onChange('mirrorsStatus', e.target.value)}
          options={[
             {value: '', label: 'Выбрать...'},
             {value: 'Целые, работают', label: 'Целые, работают'},
             {value: 'Притертости / Царапины', label: 'Притертости / Царапины'},
             {value: 'Трещины', label: 'Трещины'},
             {value: 'Не складываются', label: 'Не складываются'},
          ]}
        />
      </div>
      <Textarea 
          label="Общие заметки по остеклению" 
          value={data.glassNotes} 
          onChange={(e) => onChange('glassNotes', e.target.value)}
      />

      <AttachmentSection title="Фото стекол / зеркал и доп. файлы" section="glass" data={data} onChange={onChange} />
    </div>
  );
};

// --- Step 4: Interior & Tech ---

// Helper for Tech Check Item
const TechCheckItem = ({ 
    label, 
    item, 
    onChange, 
    customOptions,
    issueOptions
}: { 
    label: string, 
    item: TechCheck, 
    onChange: (t: TechCheck) => void,
    customOptions?: StatusOption[],
    issueOptions?: string[]
}) => {
    
    // Check if the current comment matches a preset or is custom
    const isPreset = issueOptions?.includes(item.comment || '');
    const isOther = item.comment && !isPreset;

    const handleIssueClick = (issue: string) => {
      // Toggle: if already selected, clear it.
      if (item.comment === issue) {
        onChange({ ...item, comment: '' });
      } else {
        onChange({ ...item, comment: issue });
      }
    };

    return (
        <div className="mb-4 border-b border-gray-100 pb-4 last:border-0">
            <StatusSelector 
                label={label}
                value={item.status}
                onChange={(v) => onChange({ ...item, status: v as any })}
                options={customOptions || STATUS_3_OPTS}
                className="mb-2"
            />
            {item.status !== 'Good' && (
                <div className="mt-2 animate-fade-in-up p-3 bg-gray-50 rounded-lg">
                   {issueOptions && (
                     <div className="mb-3">
                       <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Выберите дефект:</label>
                       <div className="flex flex-wrap gap-2">
                         {issueOptions.map(opt => {
                           const isSelected = item.comment === opt;
                           return (
                             <button
                               key={opt}
                               type="button"
                               onClick={() => handleIssueClick(opt)}
                               className={`
                                 text-xs px-3 py-1.5 rounded-full border transition-all
                                 ${isSelected 
                                   ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold shadow-sm' 
                                   : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                 }
                               `}
                             >
                               {opt}
                             </button>
                           );
                         })}
                         <button
                           type="button"
                           onClick={() => onChange({ ...item, comment: isOther ? '' : 'Другое' })} // Simple toggle logic, user will type in input
                           className={`
                             text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1
                             ${isOther
                               ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold' 
                               : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'
                             }
                           `}
                         >
                           <Tag size={12}/> Другое
                         </button>
                       </div>
                     </div>
                   )}
                   
                   {/* Show input if "Other" is implicit (not in list) or list doesn't exist */}
                   {(!issueOptions || isOther || item.comment === 'Другое') && (
                       <Input 
                          label="Описание проблемы (вручную)"
                          value={item.comment === 'Другое' ? '' : (item.comment || '')} 
                          onChange={(e) => onChange({ ...item, comment: e.target.value })} 
                          placeholder="Опишите проблему..."
                          className="text-sm mt-2"
                          autoFocus
                       />
                   )}
                </div>
            )}
        </div>
    );
};

const WheelCard: React.FC<{ 
  title: string; 
  wheel: Wheel; 
  onChange: (w: Wheel) => void 
}> = ({ title, wheel, onChange }) => {
  const updateField = (field: keyof Wheel, val: any) => {
    onChange({ ...wheel, [field]: val });
  };
  return (
    <Card title={title} className="border border-gray-200">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <Input label="Протектор (мм)" type="number" value={wheel.tread} onChange={(e) => updateField('tread', Number(e.target.value))} />
            <Input label="DOT год" type="number" value={wheel.dot} onChange={(e) => updateField('dot', Number(e.target.value))} />
        </div>
        <StatusSelector 
           label="Износ"
           value={wheel.wear}
           onChange={(v) => updateField('wear', v)}
           options={[
             {value: 'Even', label: 'Равн.', icon: <CheckCircle size={14}/>, colorClass: 'bg-green-100 border-green-200'},
             {value: 'Outer', label: 'Внеш.', icon: <AlertCircle size={14}/>, colorClass: 'bg-yellow-100 border-yellow-200'},
             {value: 'Inner', label: 'Внут.', icon: <AlertCircle size={14}/>, colorClass: 'bg-yellow-100 border-yellow-200'},
           ]}
        />
      </div>
    </Card>
  );
};

export const Step4Interior: React.FC<StepProps> = ({ data, onChange }) => {
  const updateTech = (key: keyof InspectionData, val: TechCheck) => onChange(key, val);

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* CHECKLISTS */}
      <ChecklistBlock 
        title="III. Признаки скрученного пробега" 
        items={CHECKLIST_III_MILEAGE} 
        category="mileage"
        data={data}
        onChange={onChange}
      />

      <ChecklistBlock 
        title="IV. Техническое состояние (Статика)" 
        items={CHECKLIST_IV_TECH_STATIC} 
        category="techStatic"
        data={data}
        onChange={onChange}
      />
      
      <ChecklistBlock 
        title="V. Динамические Испытания (Тест-Драйв)" 
        items={CHECKLIST_V_TEST_DRIVE} 
        category="testDrive"
        data={data}
        onChange={onChange}
      />

      {/* 1. TECHNICAL INSPECTION DETAILED */}
      <Card title="Техническая часть (Подробно)">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <h4 className="font-bold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2"><Droplets size={16}/> Жидкости</h4>
               <TechCheckItem 
                 label="Уровень масла ДВС" 
                 item={data.engineOilLevel} 
                 onChange={(v) => updateTech('engineOilLevel', v)} 
                 customOptions={FLUID_LEVEL_OPTS}
                 issueOptions={TECH_ISSUES.oilLevel}
               />
               <TechCheckItem 
                 label="Состояние масла (Чистота)" 
                 item={data.engineOilCondition} 
                 onChange={(v) => updateTech('engineOilCondition', v)} 
                 customOptions={[
                    { value: 'Good', label: 'Чистое', icon: <CheckCircle size={18}/>, colorClass: 'bg-green-100 text-green-700' },
                    { value: 'Fair', label: 'Темное', icon: <AlertCircle size={18}/>, colorClass: 'bg-yellow-100 text-yellow-700' },
                    { value: 'Bad', label: 'Эмульсия/Грязь', icon: <AlertTriangle size={18}/>, colorClass: 'bg-red-100 text-red-700' },
                 ]}
                 issueOptions={TECH_ISSUES.oilCond}
               />
               <TechCheckItem 
                 label="Антифриз" 
                 item={data.coolantLevel} 
                 onChange={(v) => updateTech('coolantLevel', v)} 
                 customOptions={FLUID_LEVEL_OPTS}
                 issueOptions={TECH_ISSUES.coolant}
               />
               <TechCheckItem 
                 label="Тормозная жидкость" 
                 item={data.brakeFluidLevel} 
                 onChange={(v) => updateTech('brakeFluidLevel', v)} 
                 customOptions={FLUID_LEVEL_OPTS}
                 issueOptions={TECH_ISSUES.brake}
               />
            </div>
            <div>
               <h4 className="font-bold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2"><Settings size={16}/> Работа двигателя</h4>
               <TechCheckItem 
                 label="Звук работы ДВС" 
                 item={data.engineSound} 
                 onChange={(v) => updateTech('engineSound', v)} 
                 customOptions={ENGINE_SOUND_OPTS} 
                 issueOptions={TECH_ISSUES.sound}
               />
               <TechCheckItem 
                 label="Дымность выхлопа" 
                 item={data.engineSmoke} 
                 onChange={(v) => updateTech('engineSmoke', v)} 
                 customOptions={SMOKE_OPTS} 
                 issueOptions={TECH_ISSUES.smoke}
               />
               <TechCheckItem 
                 label="Течи / Запотевания" 
                 item={data.engineLeaks} 
                 onChange={(v) => updateTech('engineLeaks', v)} 
                 customOptions={LEAK_OPTS} 
                 issueOptions={TECH_ISSUES.leaks}
               />
            </div>
         </div>
      </Card>

      <Card title="Ходовая и Трансмиссия">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechCheckItem 
              label="Переключения КПП" 
              item={data.gearboxShifting} 
              onChange={(v) => updateTech('gearboxShifting', v)} 
              customOptions={GEARBOX_OPTS} 
              issueOptions={TECH_ISSUES.gearbox}
            />
            <TechCheckItem 
              label="Подвеска (Стуки)" 
              item={data.suspensionKnocks} 
              onChange={(v) => updateTech('suspensionKnocks', v)} 
              customOptions={SUSPENSION_OPTS} 
              issueOptions={TECH_ISSUES.suspension}
            />
            <TechCheckItem 
              label="Рулевое (Люфт)" 
              item={data.steeringPlay} 
              onChange={(v) => updateTech('steeringPlay', v)} 
              customOptions={STEERING_OPTS} 
              issueOptions={TECH_ISSUES.steering}
            />
         </div>
      </Card>

      {/* 2. INTERIOR */}
      <Card title="Салон и Электрика (Подробно)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
           <div>
              <h4 className="font-bold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2"><Armchair size={16}/> Состояние</h4>
              <TechCheckItem 
                label="Обивка сидений" 
                item={data.upholstery} 
                onChange={(v) => updateTech('upholstery', v)} 
                customOptions={UPHOLSTERY_OPTS} 
                issueOptions={TECH_ISSUES.upholstery}
              />
              <TechCheckItem 
                label="Руль (Износ)" 
                item={data.steeringWheelWear} 
                onChange={(v) => updateTech('steeringWheelWear', v)} 
                issueOptions={TECH_ISSUES.wheel}
              />
              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Запах в салоне</label>
                  <div className="grid grid-cols-4 gap-2">
                     {['Neutral', 'Smoke', 'Damp', 'Fragrance'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => onChange('smell', opt)}
                          className={`text-xs py-2 rounded border ${data.smell === opt ? 'bg-blue-100 border-blue-400 text-blue-800 font-bold' : 'bg-white border-gray-200'}`}
                        >
                            {opt === 'Neutral' && 'Нейтр.'}
                            {opt === 'Smoke' && 'Табак'}
                            {opt === 'Damp' && 'Сырость'}
                            {opt === 'Fragrance' && 'Аромат.'}
                        </button>
                     ))}
                  </div>
              </div>
           </div>
           <div>
              <h4 className="font-bold text-sm text-gray-500 uppercase mb-3 flex items-center gap-2"><Battery size={16}/> Электрика</h4>
              <div className="space-y-3">
                 <Checkbox label="Кондиционер холодит" checked={data.acWorking} onChange={(e) => onChange('acWorking', e.target.checked)} />
                 <Checkbox label="Печка греет" checked={data.heaterWorking} onChange={(e) => onChange('heaterWorking', e.target.checked)} />
                 <Checkbox label="Стеклоподъемники работают" checked={data.windowsWorking} onChange={(e) => onChange('windowsWorking', e.target.checked)} />
                 <Checkbox label="Подогрев сидений работает" checked={data.seatHeatingWorking} onChange={(e) => onChange('seatHeatingWorking', e.target.checked)} />
              </div>
           </div>
        </div>
      </Card>

      {/* 3. WHEELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WheelCard title="Переднее левое (FL)" wheel={data.flWheel} onChange={(w) => onChange('flWheel', w)} />
        <WheelCard title="Переднее правое (FR)" wheel={data.frWheel} onChange={(w) => onChange('frWheel', w)} />
      </div>
      
      <Textarea label="Заметки по ходовой/колёсам" value={data.wheelsNotes} onChange={(e) => onChange('wheelsNotes', e.target.value)} />
      <AttachmentSection title="Фото салона, техчасти и прочие вложения" section="interior" data={data} onChange={onChange} />
    </div>
  );
};

// --- Step 5: History & OBD ---
const SEVERITY_MAP: Record<string, string> = {
  'Minor': 'Незначительная',
  'Moderate': 'Средняя',
  'Severe': 'Критическая',
};

export const Step5History: React.FC<StepProps> = ({ data, onChange }) => {
  const [newObd, setNewObd] = React.useState<ObdCode>({
    code: '', severity: 'Minor', module: 'ECM', description: ''
  });
  const [isAnalyzingObd, setIsAnalyzingObd] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleAddObd = () => {
    if (!newObd.code || !newObd.description) return;
    onChange('obdCodes', [...data.obdCodes, newObd]);
    setNewObd({ code: '', severity: 'Minor', module: 'ECM', description: '' });
  };

  const removeObd = (idx: number) => {
    const next = [...data.obdCodes];
    next.splice(idx, 1);
    onChange('obdCodes', next);
  };

  const handleAnalyzeObd = async () => {
    if (!newObd.code) return;
    setIsAnalyzingObd(true);
    try {
        const { text } = await analyzeObdCode(newObd.code, data.make, data.model, data.year);
        setNewObd(prev => ({ ...prev, description: text }));
    } catch (e) {
        alert("Не удалось найти информацию по коду.");
    } finally {
        setIsAnalyzingObd(false);
    }
  };

  const openBot = () => {
    if (!data.vin) {
      alert("Сначала введите VIN");
      return;
    }
    copyVin();
    window.open('https://t.me/AVskp_Bot', '_blank');
  };

  const copyVin = () => {
    if(data.vin) {
      navigator.clipboard.writeText(data.vin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* CHECKLISTS */}
      <ChecklistBlock 
        title="I. Юридическая чистота и документы" 
        items={CHECKLIST_I_LEGAL} 
        category="legal"
        data={data}
        onChange={onChange}
      />

      <ChecklistBlock 
        title="VI. Профессиональная / Инструментальная проверка" 
        items={CHECKLIST_VI_PRO} 
        category="professional"
        data={data}
        onChange={onChange}
      />

      {/* Database Check Section */}
      <Card title="Комплексная проверка истории" className="border-blue-200 ring-1 ring-blue-100 shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 space-y-4">
             <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-gray-700">{data.vin || 'VIN не указан'}</span>
                <button onClick={copyVin} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Копировать VIN">
                   {copied ? <CheckCircle size={16}/> : <Copy size={16}/>}
                </button>
             </div>
             <div className="bg-blue-600 rounded-xl overflow-hidden shadow-lg text-white">
                <div className="p-4 bg-blue-700 border-b border-blue-600 flex items-center gap-2">
                  <ShieldCheck size={20}/> 
                  <span className="font-bold">Полный отчет AVinfo</span>
                </div>
                <div className="p-5 text-center space-y-4">
                  <p className="text-blue-100 text-sm">
                    Используйте нашего партнера <strong>@AVskp_Bot</strong> для получения полной истории.
                  </p>
                  <button 
                    onClick={openBot}
                    className="w-full bg-white text-blue-700 font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-50 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    <span>Открыть и проверить</span>
                  </button>
                </div>
             </div>
          </div>
          
          <div className="w-full md:w-2/3 flex flex-col gap-4">
             <div className="flex-1">
                <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <Database size={14} className="text-green-600"/> 
                  Данные из отчета (Для PDF)
                </label>
                <div className="bg-yellow-50 p-2 rounded text-[10px] text-yellow-800 mb-1">
                  💡 Скопируйте результат из Telegram бота и вставьте сюда.
                </div>
                <Textarea 
                  className="w-full h-64 p-3 text-xs font-mono border-green-200 focus:border-green-500 focus:ring-green-500"
                  value={data.expertNotes}
                  onChange={(e) => onChange('expertNotes', e.target.value)}
                  placeholder="Вставьте сюда текст отчета из бота..."
                />
             </div>
          </div>
        </div>
      </Card>

      <Card title="Юридическая чистота (Чек-лист)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input label="Кол-во владельцев" type="number" value={data.owners} onChange={(e) => onChange('owners', Number(e.target.value))} />
          <div>
            <Input 
              label="Регион регистрации" 
              value={data.regRegion} 
              onChange={(e) => onChange('regRegion', e.target.value)}
              list="regions"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Checkbox label="ПТС оригинал" checked={data.ptsOriginal} onChange={(e) => onChange('ptsOriginal', e.target.checked)} />
          <Checkbox label="VIN совпадает везде" checked={data.vinMatches} onChange={(e) => onChange('vinMatches', e.target.checked)} />
          <Checkbox label="Пробег выглядит честным" checked={data.mileageMatches} onChange={(e) => onChange('mileageMatches', e.target.checked)} />
          <Checkbox label="Есть ДТП в базах" checked={data.accidents} onChange={(e) => onChange('accidents', e.target.checked)} />
          <Checkbox label="Растаможен" checked={data.customsCleared} onChange={(e) => onChange('customsCleared', e.target.checked)} />
          <Checkbox label="Сервисная история" checked={data.serviceRecords} onChange={(e) => onChange('serviceRecords', e.target.checked)} />
        </div>
      </Card>

      <Card title="Компактное резюме для клиента (обязательно)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Бюджет вложений сразу, от (₽)"
            type="number"
            value={data.immediateBudgetFrom}
            onChange={(e) => onChange('immediateBudgetFrom', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="25000"
          />
          <Input
            label="Бюджет вложений сразу, до (₽)"
            type="number"
            value={data.immediateBudgetTo}
            onChange={(e) => onChange('immediateBudgetTo', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="40000"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-900">
          Формат резюме: 1) документы и VIN, 2) юридические блокеры, 3) кузов/безопасность,
          4) дорогие техриски, 5) итог и торг.
        </div>

        <Textarea
          label="Итоговое заключение для клиента (кратко, 3–6 строк)"
          value={data.clientConclusion}
          onChange={(e) => onChange('clientConclusion', e.target.value)}
          placeholder="Юридических блокеров не выявлено... Критичных рисков не найдено... Рекомендуется при торге..."
        />
      </Card>

      <Card title="Коды ошибок (OBD-II)">
        <div className="space-y-4">
          {data.obdCodes.length > 0 ? (
            <div className="space-y-2">
              {data.obdCodes.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    <span className="font-bold font-mono text-red-700">{c.code}</span>
                    <span className="px-2 py-0.5 bg-white rounded border text-xs font-medium">{c.module}</span>
                    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${
                      c.severity === 'Severe' ? 'bg-red-200 text-red-900' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {SEVERITY_MAP[c.severity] || c.severity}
                    </span>
                    <span className="text-gray-600">{c.description}</span>
                  </div>
                  <button onClick={() => removeObd(idx)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic text-center py-2">Кодов неисправностей не добавлено</div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Добавить код</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="relative">
                <Input 
                    label="Код" 
                    value={newObd.code} 
                    onChange={(e) => setNewObd({...newObd, code: e.target.value.toUpperCase()})} 
                    placeholder="P0123"
                />
                <button 
                    onClick={handleAnalyzeObd}
                    disabled={!newObd.code || isAnalyzingObd}
                    className="absolute right-0 top-6 mt-1.5 mr-1 p-1 text-blue-600 hover:text-blue-800 disabled:opacity-30"
                    title="Найти описание с помощью AI"
                    type="button"
                >
                    {isAnalyzingObd ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>
              <Select 
                label="Тяжесть"
                value={newObd.severity}
                onChange={(e) => setNewObd({...newObd, severity: e.target.value as any})}
                options={[
                    {value: 'Minor', label: 'Незначительная'},
                    {value: 'Moderate', label: 'Средняя'},
                    {value: 'Severe', label: 'Критическая'},
                ]}
              />
              <Select 
                label="Модуль"
                value={newObd.module}
                onChange={(e) => setNewObd({...newObd, module: e.target.value})}
                options={[
                    {value: 'ECM', label: 'ECM'},
                    {value: 'TCM', label: 'TCM'},
                    {value: 'ABS', label: 'ABS'},
                    {value: 'SRS', label: 'SRS'},
                    {value: 'BCM', label: 'BCM'},
                ]}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <Input 
                label="Описание" 
                className="w-full"
                value={newObd.description} 
                onChange={(e) => setNewObd({...newObd, description: e.target.value})} 
                placeholder="Описание ошибки..."
              />
              <Button onClick={handleAddObd} variant="secondary" className="whitespace-nowrap" type="button">
                <Plus size={16} className="mr-1" /> Добавить
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AttachmentSection title="Фото VIN/документов/диагностики и внешние отчёты" section="history" data={data} onChange={onChange} />
    </div>
  );
};
