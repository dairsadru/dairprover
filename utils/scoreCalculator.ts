
import { InspectionData, ScoreResult, RecommendationResult, BodyPart } from '../types';

export function computeScore(data: InspectionData): ScoreResult {
  let penalty = 0;

  // Body parts analysis - ALL parts
  const bodyParts = [
    data.frontBumper, data.rearBumper,
    data.hood, data.roof, data.trunk,
    data.lfFender, data.rfFender,
    data.lfDoor, data.rfDoor,
    data.lrDoor, data.rrDoor,
    data.lrQuarter, data.rrQuarter
  ];
  
  bodyParts.forEach(part => {
    if (part.status === 'Repainted') {
      penalty += 2;
    } else if (part.status === 'Replaced') {
      penalty += 4; // Increased penalty for replacement
    } else if (part.status === 'Defect') {
      switch (part.defectType) {
        case 'Scratched': penalty += 1; break;
        case 'Dented': penalty += 2; break;
        case 'Rust': penalty += 5; break;
        case 'Crack': penalty += 4; break;
        case 'Chip': penalty += 1; break;
        case 'Peeling': penalty += 2; break;
        case 'PoorRepair': penalty += 4; break;
        default: penalty += 2; break;
      }
    }
  });

  // Tech items penalty
  const checkTech = (item: any, weight: number) => {
    if (item.status === 'Bad') penalty += weight;
    if (item.status === 'Fair') penalty += (weight / 2);
  };

  checkTech(data.engineSound, 10);
  checkTech(data.engineSmoke, 10);
  checkTech(data.gearboxShifting, 10);
  checkTech(data.suspensionKnocks, 5);
  checkTech(data.engineOilCondition, 5);

  // Wheels/Tires analysis
  const wheels = [data.flWheel, data.frWheel];
  wheels.forEach(w => {
    if (w.tread < 3 && w.tread > 0) {
      penalty += 2;
    }
  });

  // Glass analysis
  switch (data.wsStatus) {
    case 'Chip': penalty += 1; break;
    case 'Replaced': penalty += 1; break;
    case 'Crack': penalty += 4; break;
    case 'Scuff': penalty += 1; break;
    default: break;
  }

  // OBD analysis
  data.obdCodes.forEach(code => {
    switch (code.severity) {
      case 'Minor': penalty += 1; break;
      case 'Moderate': penalty += 3; break;
      case 'Severe': penalty += 6; break;
    }
  });

  // Calculate final score
  let score = 100 - penalty;
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  // Determine grade
  let grade = 'A';
  if (score < 85) grade = 'B';
  if (score < 70) grade = 'C';
  if (score < 55) grade = 'D';
  if (score < 40) grade = 'E';

  return { score: Math.round(score), grade };
}

export function getRecommendation(data: InspectionData): RecommendationResult {
  const reasons: string[] = [];
  let verdict: RecommendationResult['verdict'] = 'Recommended';

  // Helpers
  const isReplaced = (p: BodyPart) => p.status === 'Replaced';
  const isRepainted = (p: BodyPart) => p.status === 'Repainted';
  const isDefective = (p: BodyPart) => p.status === 'Defect';
  
  // Extract parts
  const {
    frontBumper, rearBumper, hood, roof, trunk,
    lfFender, rfFender,
    lfDoor, rfDoor, lrDoor, rrDoor,
    lrQuarter, rrQuarter
  } = data;

  const allParts = [
    frontBumper, rearBumper, hood, roof, trunk,
    lfFender, rfFender,
    lfDoor, rfDoor, lrDoor, rrDoor,
    lrQuarter, rrQuarter
  ];

  const replacedParts = allParts.filter(isReplaced);
  const repaintedParts = allParts.filter(isRepainted);

  // --- 1. CRITICAL STRUCTURAL & SAFETY ---
  
  // Roof
  if (isReplaced(roof) || (roof.status === 'Defect' && roof.defectType === 'PoorRepair')) {
    verdict = 'Not Recommended';
    reasons.push('Критическое повреждение или замена крыши (Риск для безопасности).');
  }

  // Rear Quarters (Welded parts)
  if (isReplaced(lrQuarter) || isReplaced(rrQuarter)) {
    verdict = 'Not Recommended';
    reasons.push('Вварка задних крыльев (Нарушение силовой структуры).');
  }

  // --- 2. FRONT END IMPACT ANALYSIS (COMBINATORIAL) ---

  const frontParts = [frontBumper, hood, lfFender, rfFender];
  const replacedFrontCount = frontParts.filter(isReplaced).length;

  // Scenario: 3 or 4 Adjacent Front Parts Replaced -> SEVERE
  // e.g. Bumper + Hood + Fender OR Bumper + 2 Fenders + Hood
  if (replacedFrontCount >= 3) {
    verdict = 'Not Recommended';
    reasons.push(`Заменена вся передняя часть (${replacedFrontCount} детали). Вероятность тотального ДТП.`);
  }

  // Scenario: 2 Fenders Replaced, But Hood Original -> OK (Likely not severe)
  if (isReplaced(lfFender) && isReplaced(rfFender) && !isReplaced(hood) && verdict !== 'Not Recommended') {
     // User logic: "If 2 fenders replaced but hood didn't change - not critical"
     if (verdict === 'Recommended') verdict = 'Conditional';
     reasons.push('Заменены оба передних крыла, но капот родной (Вероятно не сильный удар).');
  }

  // Scenario: Hood + Bumper + 1 Fender -> Likely Severe
  // Covered by >=3 logic above.

  // Scenario: Bumper + 1 Fender -> OK/Conditional
  if (isReplaced(frontBumper) && (isReplaced(lfFender) || isReplaced(rfFender)) && replacedFrontCount === 2) {
    if (verdict !== 'Not Recommended') verdict = 'Conditional';
    reasons.push('Замена бампера и одного крыла (ДТП средней тяжести).');
  }

  // --- 3. REPLACEMENT COUNTS ---
  
  // 1 Replaced Part -> OK
  if (replacedParts.length === 1 && verdict === 'Recommended') {
    // Keep Recommended, just add note
    const partName = replacedParts[0] === hood ? 'Капот' : 'Одна деталь';
    reasons.push(`Заменена только одна деталь (${partName}). Не критично.`);
  }
  
  // 2-3 Repainted Parts -> OK
  if (repaintedParts.length > 0 && repaintedParts.length <= 3 && verdict === 'Recommended') {
    reasons.push(`Косметический окрас ${repaintedParts.length} деталей (Норма).`);
  }

  // >3 Repainted Parts -> Conditional
  if (repaintedParts.length > 3 && verdict !== 'Not Recommended') {
    verdict = 'Conditional';
    reasons.push(`Много окрашенных элементов (${repaintedParts.length}).`);
  }

  // --- 4. TECHNICAL STATE (CRITICAL) ---

  // Engine
  if (data.engineSound.status === 'Bad' || data.engineSmoke.status === 'Bad') {
    verdict = 'Not Recommended';
    reasons.push('Критические проблемы с ДВС (Стук или Дым).');
  } else if (data.engineSound.status === 'Fair' && verdict !== 'Not Recommended') {
    verdict = 'Conditional';
    reasons.push('Посторонние шумы в работе двигателя.');
  }

  // Gearbox
  if (data.gearboxShifting.status === 'Bad') {
    verdict = 'Not Recommended';
    reasons.push('Неисправность КПП (Удары/Пинки).');
  }

  // Suspension
  if (data.suspensionKnocks.status === 'Bad' && verdict !== 'Not Recommended') {
     verdict = 'Conditional'; // Usually fixable, so not "Not Recommended" unless car is wreck
     reasons.push('Требуется серьезный ремонт ходовой.');
  }

  // --- 5. MILEAGE & LEGAL ---
  
  if (!data.mileageMatches) {
    if (verdict !== 'Not Recommended') verdict = 'Conditional';
    reasons.push('Признаки скрученного пробега.');
  }

  if (data.accidents && verdict === 'Recommended') {
    verdict = 'Conditional';
    reasons.push('ДТП в базе данных (Требует проверки характера повреждений).');
  }

  // OBD
  if (data.obdCodes.some(c => c.severity === 'Severe')) {
    verdict = 'Not Recommended';
    reasons.push('Активные критические ошибки ЭБУ.');
  }

  // Cleanup
  const uniqueReasons = Array.from(new Set(reasons));

  return { verdict, reasons: uniqueReasons };
}