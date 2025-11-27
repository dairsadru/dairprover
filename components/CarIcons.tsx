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
    let stroke = 'stroke-slate-400';
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

  // Realistic Sedan shape coordinates
  const Part = ({ id, d, damageD, label, lx, ly }: { id: CarPartType, d: string, damageD?: string, label?: string, lx?: string, ly?: string }) => (
    <g onClick={() => !readOnly && onSelectPart && onSelectPart(id)} className="group">
      <path id={id} d={d} className={getPartStyle(id)} strokeLinejoin="round" />
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
      viewBox="0 0 300 620" 
      className={`w-full h-full drop-shadow-xl select-none ${className}`} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
        </filter>
      </defs>

      {/* 
         NEW GEOMETRY - REALISTIC TOP VIEW SEDAN
         Center X = 150
      */}

      {/* 1. Передний бампер */}
      <Part id="frontBumper" label="Бампер" lx="150" ly="35"
        d="M 60 55 C 60 55, 90 20, 150 20 C 210 20, 240 55, 240 55 L 245 75 C 245 75, 200 85, 150 85 C 100 85, 55 75, 55 75 L 60 55 Z"
      />

      {/* 2. Капот */}
      <Part id="hood" label="Капот" lx="150" ly="130"
        d="M 58 80 C 100 90, 200 90, 242 80 L 235 170 C 200 178, 100 178, 65 170 L 58 80 Z"
      />

      {/* 6. Крыло Переднее Левое */}
      <Part id="lfFender" label="LF Крыло" lx="40" ly="120"
        d="M 55 78 L 62 168 L 45 165 C 45 165, 30 140, 30 110 C 30 90, 40 80, 55 78 Z"
      />

      {/* 7. Крыло Переднее Правое */}
      <Part id="rfFender" label="RF Крыло" lx="260" ly="120"
        d="M 245 78 L 238 168 L 255 165 C 255 165, 270 140, 270 110 C 270 90, 260 80, 245 78 Z"
      />

      {/* 8. Дверь Передняя Левая */}
      <Part id="lfDoor" label="LF Дверь" lx="40" ly="230"
        d="M 45 170 L 70 175 L 70 270 L 40 265 L 35 210 L 45 170 Z"
      />

      {/* 9. Дверь Передняя Правая */}
      <Part id="rfDoor" label="RF Дверь" lx="260" ly="230"
        d="M 255 170 L 230 175 L 230 270 L 260 265 L 265 210 L 255 170 Z"
      />

      {/* 3. Крыша */}
      <Part id="roof" label="Крыша" lx="150" ly="280"
        d="M 75 220 L 225 220 L 225 330 L 75 330 Z"
      />

      {/* 10. Дверь Задняя Левая */}
      <Part id="lrDoor" label="LR Дверь" lx="40" ly="320"
        d="M 40 270 L 70 275 L 70 360 L 45 355 C 45 355, 35 320, 40 270 Z"
      />

      {/* 11. Дверь Задняя Правая */}
      <Part id="rrDoor" label="RR Дверь" lx="260" ly="320"
        d="M 260 270 L 230 275 L 230 360 L 255 355 C 255 355, 265 320, 260 270 Z"
      />

      {/* 12. Крыло Заднее Левое */}
      <Part id="lrQuarter" label="LR Крыло" lx="45" ly="410"
        d="M 70 365 L 60 460 C 60 460, 35 440, 45 360 L 70 365 Z"
      />

      {/* 13. Крыло Заднее Правое */}
      <Part id="rrQuarter" label="RR Крыло" lx="255" ly="410"
        d="M 230 365 L 240 460 C 240 460, 265 440, 255 360 L 230 365 Z"
      />

      {/* 4. Багажник */}
      <Part id="trunk" label="Багажник" lx="150" ly="410"
        d="M 72 370 L 228 370 L 235 455 C 200 465, 100 465, 65 455 L 72 370 Z"
      />

      {/* 5. Задний бампер */}
      <Part id="rearBumper" label="Бампер" lx="150" ly="490"
        d="M 60 460 C 100 470, 200 470, 240 460 C 240 460, 245 490, 230 505 C 200 515, 100 515, 70 505 C 55 490, 60 460, 60 460 Z"
      />


      {/* --- DECORATIONS (Glass, Mirrors) --- */}
      
      {/* Windshield */}
      <path d="M 65 175 C 100 185, 200 185, 235 175 L 225 215 C 200 205, 100 205, 75 215 Z" className="fill-blue-50 stroke-slate-300 stroke-[1px]" />

      {/* Rear Glass */}
      <path d="M 75 335 C 100 345, 200 345, 225 335 L 228 365 C 200 355, 100 355, 72 365 Z" className="fill-blue-50 stroke-slate-300 stroke-[1px]" />

      {/* Mirrors */}
      <path d="M 50 185 L 25 180 L 25 200 L 50 205 Z" className="fill-slate-200 stroke-slate-400 stroke-[1px]"/>
      <path d="M 250 185 L 275 180 L 275 200 L 250 205 Z" className="fill-slate-200 stroke-slate-400 stroke-[1px]"/>

      {/* Lights Front */}
      <path d="M 60 75 L 55 58 L 75 55 L 85 78 Z" className="fill-white stroke-slate-300" />
      <path d="M 240 75 L 245 58 L 225 55 L 215 78 Z" className="fill-white stroke-slate-300" />

      {/* Lights Rear */}
      <path d="M 60 460 L 65 480 L 85 475 L 80 463 Z" className="fill-red-100 stroke-red-300" />
      <path d="M 240 460 L 235 480 L 215 475 L 220 463 Z" className="fill-red-100 stroke-red-300" />

    </svg>
  );
};