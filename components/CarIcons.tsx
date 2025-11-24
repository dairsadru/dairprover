
import React from 'react';
import { BodyPart, InspectionData } from '../types';

export type CarPartType = 
  | 'frontBumper' | 'rearBumper'
  | 'hood' | 'roof' | 'trunk'
  | 'lfFender' | 'rfFender'
  | 'lfDoor' | 'rfDoor'
  | 'lrDoor' | 'rrDoor'
  | 'lrQuarter' | 'rrQuarter';

interface InteractiveCarMapProps {
  data: InspectionData;
  onSelectPart?: (part: CarPartType) => void;
  className?: string;
  readOnly?: boolean;
}

export const InteractiveCarMap: React.FC<InteractiveCarMapProps> = ({ data, onSelectPart, className, readOnly = false }) => {
  
  // Helper to determine style based on status
  const getPartStyle = (partId: CarPartType) => {
    const part = data[partId];
    const status = part?.status || 'OK';
    const defect = part?.defectType;
    
    // Base styles
    let fill = 'fill-white';
    let stroke = 'stroke-slate-500';
    let hover = readOnly ? '' : 'hover:fill-slate-50';

    if (status === 'OK') {
        fill = 'fill-white';
    } else if (status === 'Repainted') {
        fill = 'fill-yellow-100';
        stroke = 'stroke-yellow-600';
        hover = readOnly ? '' : 'hover:fill-yellow-200';
    } else if (status === 'Replaced') {
        fill = 'fill-red-100';
        stroke = 'stroke-red-600';
        hover = readOnly ? '' : 'hover:fill-red-200';
    } else if (status === 'Defect') {
        if (defect === 'Rust') {
             fill = 'fill-red-100';
             stroke = 'stroke-red-600';
             hover = readOnly ? '' : 'hover:fill-red-200';
        } else {
             // Scratched, Dented, Chip, Crack, etc -> Warning/Orange
             fill = 'fill-orange-100';
             stroke = 'stroke-orange-500';
             hover = readOnly ? '' : 'hover:fill-orange-200';
        }
    }

    return `${fill} ${stroke} stroke-[1.5px] transition-all duration-200 ${readOnly ? '' : 'cursor-pointer'} ${hover}`;
  };

  const isDamaged = (partId: CarPartType) => {
    const status = data[partId]?.status;
    return status !== 'OK' && status !== 'Repainted'; // Show hatch pattern for actual physical damage
  };

  const Part = ({ id, d, damageD, label, lx, ly }: { id: CarPartType, d: string, damageD?: string, label?: string, lx?: string, ly?: string }) => (
    <g onClick={() => !readOnly && onSelectPart && onSelectPart(id)} className="group">
      <path id={id} d={d} className={getPartStyle(id)} />
      {/* Damage Overlay (Hatching) */}
      {isDamaged(id) && damageD && (
        <path d={damageD} className="stroke-black stroke-[1px] fill-none opacity-20 pointer-events-none" strokeLinecap="round"/>
      )}
      {/* Label on Hover */}
      {!readOnly && label && lx && ly && (
        <text x={lx} y={ly} textAnchor="middle" className="text-[8px] font-bold fill-slate-500 pointer-events-none uppercase select-none opacity-0 group-hover:opacity-100 transition-opacity">
          {label}
        </text>
      )}
    </g>
  );

  return (
    <svg 
      viewBox="0 0 300 600" 
      className={`w-full h-full drop-shadow-xl select-none ${className}`} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
        </filter>
      </defs>

      {/* 1. Передний бампер */}
      <Part id="frontBumper" label="Бампер" lx="150" ly="55"
        d="M 40 70 C 40 70, 90 40, 150 40 C 210 40, 260 70, 260 70 C 260 70, 265 85, 260 95 C 210 110, 90 110, 40 95 C 35 85, 40 70, 40 70 Z"
        damageD="M 100 60 L 120 80 M 200 60 L 180 80"
      />

      {/* 2. Капот */}
      <Part id="hood" label="Капот" lx="150" ly="140"
        d="M 45 100 C 90 112, 210 112, 255 100 L 245 190 C 210 200, 90 200, 55 190 Z"
        damageD="M 120 140 L 140 160 M 180 140 L 160 160"
      />

      {/* 3. Крыша */}
      <Part id="roof" label="Крыша" lx="150" ly="300"
        d="M 65 250 C 100 240, 200 240, 235 250 L 235 340 C 200 350, 100 350, 65 340 Z"
        damageD="M 120 290 L 160 300"
      />

      {/* 4. Багажник */}
      <Part id="trunk" label="Багажник" lx="150" ly="430"
        d="M 60 390 C 100 380, 200 380, 240 390 L 245 460 C 200 470, 100 470, 55 460 Z"
        damageD="M 130 420 L 170 430"
      />

      {/* 5. Задний бампер */}
      <Part id="rearBumper" label="Бампер" lx="150" ly="490"
        d="M 50 465 C 100 480, 200 480, 250 465 C 250 465, 255 490, 245 510 C 200 525, 100 525, 55 510 C 45 490, 50 465, 50 465 Z"
        damageD="M 100 490 L 120 505"
      />

      {/* 6. Крыло Переднее Левое */}
      <Part id="lfFender" label="LF Крыло" lx="35" ly="140"
        d="M 40 100 L 50 190 C 50 190, 20 180, 15 120 C 15 120, 25 105, 40 100 Z"
        damageD="M 25 140 L 40 160"
      />

      {/* 7. Крыло Переднее Правое */}
      <Part id="rfFender" label="RF Крыло" lx="265" ly="140"
        d="M 260 100 L 250 190 C 250 190, 280 180, 285 120 C 285 120, 275 105, 260 100 Z"
        damageD="M 275 140 L 260 160"
      />

      {/* 8. Дверь Передняя Левая */}
      <Part id="lfDoor" label="LF Дверь" lx="35" ly="235"
        d="M 15 200 L 60 205 L 60 285 L 15 280 Z"
        damageD="M 25 240 L 45 260"
      />

      {/* 9. Дверь Передняя Правая */}
      <Part id="rfDoor" label="RF Дверь" lx="265" ly="235"
        d="M 285 200 L 240 205 L 240 285 L 285 280 Z"
        damageD="M 275 240 L 255 260"
      />

      {/* 10. Дверь Задняя Левая */}
      <Part id="lrDoor" label="LR Дверь" lx="35" ly="325"
        d="M 15 285 L 60 290 L 65 370 L 20 365 Z"
        damageD="M 25 320 L 45 340"
      />

      {/* 11. Дверь Задняя Правая */}
      <Part id="rrDoor" label="RR Дверь" lx="265" ly="325"
        d="M 285 285 L 240 290 L 235 370 L 280 365 Z"
        damageD="M 275 320 L 255 340"
      />

      {/* 12. Крыло Заднее Левое */}
      <Part id="lrQuarter" label="LR Крыло" lx="40" ly="415"
        d="M 65 375 L 50 460 C 50 460, 20 440, 20 370 L 65 375 Z"
        damageD="M 35 410 L 50 430"
      />

      {/* 13. Крыло Заднее Правое */}
      <Part id="rrQuarter" label="RR Крыло" lx="260" ly="415"
        d="M 235 375 L 250 460 C 250 460, 280 440, 280 370 L 235 375 Z"
        damageD="M 265 410 L 250 430"
      />

      {/* --- NON-INTERACTIVE DECORATION --- */}
      
      {/* Лобовое стекло */}
      <path d="M 55 195 C 100 205, 200 205, 245 195 L 235 245 C 200 235, 100 235, 65 245 Z" className="fill-blue-50 stroke-slate-300 stroke-[1px]" />

      {/* Заднее стекло */}
      <path d="M 65 345 C 100 355, 200 355, 235 345 L 240 385 C 200 375, 100 375, 60 385 Z" className="fill-blue-50 stroke-slate-300 stroke-[1px]" />

      {/* Зеркала */}
      <path d="M 50 210 L 10 200 L 10 220 L 50 225 Z" className="fill-slate-200 stroke-slate-400 stroke-[1px]"/>
      <path d="M 250 210 L 290 200 L 290 220 L 250 225 Z" className="fill-slate-200 stroke-slate-400 stroke-[1px]"/>

      {/* Фары */}
      <path d="M 45 95 L 40 75 L 65 75 C 60 85, 50 90, 45 95 Z" className="fill-white stroke-slate-300 stroke-[1px]" />
      <path d="M 255 95 L 260 75 L 235 75 C 240 85, 250 90, 255 95 Z" className="fill-white stroke-slate-300 stroke-[1px]" />

      {/* Стопари */}
      <path d="M 50 465 L 55 485 L 80 480 L 60 463 Z" className="fill-red-100 stroke-red-300 stroke-[1px]" />
      <path d="M 250 465 L 245 485 L 220 480 L 240 463 Z" className="fill-red-100 stroke-red-300 stroke-[1px]" />
    </svg>
  );
};