import React, { useState } from 'react';
import { INITIAL_DATA, InspectionData } from './types';
import { Step1General, Step2Body, Step3Glass, Step4Interior, Step5History } from './components/StepForms';
import { SummaryReport } from './components/SummaryReport';
import { Button } from './components/UIComponents';
import { Car, ChevronRight, ChevronLeft, CheckCircle, LogOut, AlertCircle } from 'lucide-react';
import { Login } from './components/Login';
import { ChatBot } from './components/ChatBot';

const STEPS = [
  'Общее',
  'Кузов',
  'Стёкла',
  'Салон',
  'История',
  'Отчёт',
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<InspectionData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = (name: string) => {
    setFormData(prev => ({ ...prev, expertName: name }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentStep(0);
    setFormData(INITIAL_DATA);
    setErrors({});
  };

  const updateFormData = (key: keyof InspectionData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear specific error if touched
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Helper
    const req = (key: keyof InspectionData, msg: string = 'Обязательное поле') => {
      if (!formData[key]) {
        newErrors[key] = msg;
        isValid = false;
      }
    };

    if (step === 0) {
      req('make');
      req('model');
      req('year');
      req('mileage');
      req('price');
      req('vin');

      // VIN Regex
      if (formData.vin) {
        const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
        if (!vinRegex.test(formData.vin)) {
          newErrors.vin = 'VIN должен быть 17 символов (латиница + цифры)';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1General data={formData} onChange={updateFormData} errors={errors} />;
      case 1: return <Step2Body data={formData} onChange={updateFormData} />;
      case 2: return <Step3Glass data={formData} onChange={updateFormData} />;
      case 3: return <Step4Interior data={formData} onChange={updateFormData} />;
      case 4: return <Step5History data={formData} onChange={updateFormData} />;
      case 5: return <SummaryReport data={formData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
              <Car size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">ДаирАвто • Автопроверка</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Эксперт: {formData.expertName}</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
             <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
               Шаг {currentStep + 1} из {STEPS.length}
             </span>
             <button onClick={handleLogout} className="text-gray-400 hover:text-red-500" title="Выход">
               <LogOut size={20} />
             </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 w-full">
          <div 
            className="h-full bg-primary-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
           <h2 className="text-2xl font-bold text-gray-900">{STEPS[currentStep]}</h2>
           <p className="text-gray-500 mt-1 text-sm">
             {currentStep === 5 ? 'Проверьте данные и скачайте PDF' : 'Заполните данные осмотра внимательно'}
           </p>
        </div>

        <div className="mb-6 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-primary-900">
            <strong>Проверка авто «ДаирАвто»</strong> — профессиональный осмотр перед покупкой.
          </p>
          <a href="tel:+79312446003" className="text-sm font-bold text-primary-700 hover:text-primary-900">
            📞 8 (931) 244-60-03
          </a>
        </div>
        
        {/* Validation Error Banner */}
        {Object.keys(errors).length > 0 && (
           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3 animate-pulse">
             <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
             <div>
               <p className="text-sm font-bold text-red-800">Есть незаполненные обязательные поля!</p>
               <p className="text-xs text-red-600 mt-1">Пожалуйста, проверьте форму и исправьте ошибки.</p>
             </div>
           </div>
        )}

        {/* Alert Banner on first steps */}
        {currentStep < 5 && Object.keys(errors).length === 0 && (
           <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
             <CheckCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
             <p className="text-sm text-orange-800">
               <strong>Внимание:</strong> Поля, отмеченные звездочкой (*), обязательны для заполнения.
             </p>
           </div>
        )}

        {renderStep()}
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button 
            variant="secondary" 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="w-32"
          >
            <ChevronLeft size={18} className="mr-1" /> Назад
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={handleNext} className="w-32">
              Далее <ChevronRight size={18} className="ml-1" />
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(0)} variant="outline" className="w-32 text-xs">
              В начало
            </Button>
          )}
        </div>
      </footer>

      {/* AI Chat Bot */}
      <ChatBot />
    </div>
  );
}
