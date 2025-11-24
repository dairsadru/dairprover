
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
      penalty += 3;
    } else if (part.status === 'Defect') {
      switch (part.defectType) {
        case 'Scratched': penalty += 0.5; break;
        case 'Dented': penalty += 1.5; break;
        case 'Rust': penalty += 3; break;
        case 'Crack': penalty += 3; break;
        case 'Chip': penalty += 0.5; break;
        case 'Peeling': penalty += 1; break;
        case 'PoorRepair': penalty += 2.5; break;
        default: penalty += 1; break;
      }
    }
  });

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
    case 'Replaced': penalty += 1.5; break;
    case 'Crack': penalty += 3; break;
    case 'Scuff': penalty += 0.5; break;
    default: break;
  }

  // OBD analysis
  data.obdCodes.forEach(code => {
    switch (code.severity) {
      case 'Minor': penalty += 1; break;
      case 'Moderate': penalty += 2; break;
      case 'Severe': penalty += 3; break;
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

  // Extract parts for easier access
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

  // --- 1. Structural Integrity Check (Most Important) ---
  // Roof and Quarter panels are critical structure
  const roofDefective = roof.status === 'Defect' && (roof.defectType === 'Dented' || roof.defectType === 'Rust');
  
  if (isReplaced(roof) || isRepainted(roof) || roofDefective) {
    verdict = 'Not Recommended';
    reasons.push('Серьезные дефекты или ремонт крыши (риск нарушения геометрии кузова).');
  }
  if (isReplaced(lrQuarter) || isReplaced(rrQuarter)) {
    verdict = 'Not Recommended';
    reasons.push('Заменены задние крылья (нарушение заводской силовой структуры).');
  }
  
  // --- 2. Severe Frontal Impact Check ---
  // "If the front fenders and bumper are replaced, then the impact was likely severe."
  const frontImpact = isReplaced(frontBumper) && (isReplaced(lfFender) || isReplaced(rfFender));
  const severeFrontImpact = isReplaced(frontBumper) && isReplaced(lfFender) && isReplaced(rfFender);

  if (severeFrontImpact) {
    verdict = 'Not Recommended';
    reasons.push('Заменены бампер и оба передних крыла (вероятность тяжелого лобового ДТП).');
  } else if (frontImpact) {
    if (verdict !== 'Not Recommended') verdict = 'Conditional';
    reasons.push('Заменены бампер и крыло (вероятно ДТП в переднюю часть).');
  }

  // --- 3. Hood Replacement Logic ---
  // "If the hood is replaced, but the fenders and bumper are intact... likely replaced due to scratches."
  if (isReplaced(hood)) {
    const frontEndsOk = !isReplaced(frontBumper) && !isReplaced(lfFender) && !isReplaced(rfFender);
    if (frontEndsOk) {
      reasons.push('Капот заменен, но бампер и крылья родные (вероятен косметический ремонт).');
      // Does not degrade verdict purely on this
    } else {
      if (verdict !== 'Not Recommended') verdict = 'Conditional';
      reasons.push('Замена капота совместно с другими элементами переда.');
    }
  }

  // --- 4. Doors Analysis ---
  // "If only the doors are replaced, and the threshold and roof are intact, the car is in normal condition."
  const doors = [lfDoor, rfDoor, lrDoor, rrDoor];
  const replacedDoorsCount = doors.filter(isReplaced).length;
  const replacedNonDoorsCount = replacedParts.length - replacedDoorsCount;

  // If we have multiple replaced parts, check if they are ONLY doors
  if (replacedParts.length >= 2) {
    if (replacedNonDoorsCount === 0) {
       // Only doors replaced. Structure assumed OK (checked above).
       // We keep it Conditional (just to be safe) or Recommended depending on quantity.
       // User says "Normal condition", so we avoid 'Not Recommended'.
       if (verdict !== 'Not Recommended') {
         verdict = 'Conditional';
         reasons.push(`Заменены двери (${replacedDoorsCount} шт.), но стойки и проемы визуально целы.`);
       }
    } else {
       // Mixed parts replaced -> "More parts replaced... not recommended"
       verdict = 'Not Recommended';
       reasons.push(`Множественная замена разнородных кузовных элементов (${replacedParts.length} шт.).`);
    }
  }

  // --- 5. Paint Count Logic ---
  // "If more parts have been painted... car is not recommended."
  // Threshold: > 3 painted parts
  if (repaintedParts.length > 3) {
    verdict = 'Not Recommended';
    reasons.push(`Слишком много окрашенных элементов (${repaintedParts.length}).`);
  }

  // --- 6. Other Factors ---
  if (data.obdCodes.some(c => c.severity === 'Severe')) {
    verdict = 'Not Recommended';
    reasons.push('Критические ошибки диагностики (OBD).');
  }

  if (data.accidents && verdict === 'Recommended') {
    verdict = 'Conditional';
    reasons.push('Автомобиль числится в базах ДТП.');
  }

  // Cleanup: If verdict is Recommended but there are some repairs (not enough to ban), make it Conditional
  if (verdict === 'Recommended' && (replacedParts.length > 0 || repaintedParts.length > 0)) {
     // Exception: If it was just the hood cosmetic replacement logic above, we might stay Recommended.
     // But generally, any replacement implies non-factory state.
     const cosmeticHoodOnly = isReplaced(hood) && replacedParts.length === 1 && !isReplaced(frontBumper) && !isReplaced(lfFender) && !isReplaced(rfFender);
     
     if (!cosmeticHoodOnly) {
        verdict = 'Conditional';
     }
  }

  // Remove duplicates from reasons
  const uniqueReasons = Array.from(new Set(reasons));

  return { verdict, reasons: uniqueReasons };
}