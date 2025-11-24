

export interface ObdCode {
  code: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  module: string;
  description: string;
}

export interface BodyPart {
  status: 'OK' | 'Repainted' | 'Defect' | 'Replaced'; // Simplified main status
  defectType?: 'Scratched' | 'Dented' | 'Rust' | 'Crack' | 'Chip' | 'Peeling' | 'PoorRepair'; // Specifics
  size: number;
  lkp: number;
  notes: string;
  images: string[];
}

export interface Wheel {
  tread: number;
  dot: number;
  wear: 'Even' | 'Outer' | 'Inner' | 'Center' | 'Cupping';
  rimCondition: 'Good' | 'Scratched' | 'Bent' | 'Welded';
}

export interface TechCheck {
  status: 'Good' | 'Fair' | 'Bad';
  comment?: string;
}

export interface InspectionData {
  expertName: string;
  
  // Step 1: General
  make: string;
  model: string;
  year: number | '';
  vin: string;
  mileage: number | '';
  engine: string;
  transmission: string;
  drive: string;
  color: string;
  price: number | '';
  averageMarketPrice: number | ''; 
  region: string;
  generalNotes: string;

  // Step 2: Body - ALL PARTS
  frontBumper: BodyPart;
  rearBumper: BodyPart;
  hood: BodyPart;
  roof: BodyPart;
  trunk: BodyPart;
  
  lfFender: BodyPart;
  rfFender: BodyPart;
  lfDoor: BodyPart;
  rfDoor: BodyPart;
  lrDoor: BodyPart;
  rrDoor: BodyPart;
  lrQuarter: BodyPart;
  rrQuarter: BodyPart;

  // Step 3: Glass
  wsStatus: 'OK' | 'Chip' | 'Crack' | 'Scuff' | 'Replaced';
  wsHeated: boolean;
  wsOriginal: boolean;
  wsMarking: string;
  glassNotes: string;
  sideGlassStatus: string;
  mirrorsStatus: string;
  
  // Step 4: Tech & Interior (Expanded)
  // Engine
  engineOilLevel: TechCheck;
  engineOilCondition: TechCheck; // Clean vs Dirty
  coolantLevel: TechCheck;
  brakeFluidLevel: TechCheck;
  engineSound: TechCheck; // Quiet vs Noise
  engineSmoke: TechCheck; // None vs Smoke
  engineLeaks: TechCheck; // Dry vs Wet
  
  // Gearbox
  gearboxShifting: TechCheck;
  
  // Suspension
  suspensionKnocks: TechCheck;
  steeringPlay: TechCheck;
  
  // Interior
  upholstery: TechCheck; // Clean vs Worn
  steeringWheelWear: TechCheck;
  pedalWear: TechCheck;
  smell: 'Neutral' | 'Smoke' | 'Damp' | 'Fragrance';
  
  // Electrics
  acWorking: boolean;
  heaterWorking: boolean;
  windowsWorking: boolean;
  seatHeatingWorking: boolean;
  
  // Wheels
  flWheel: Wheel;
  frWheel: Wheel;
  rlWheel: Wheel; // Added rears for completeness if needed, sticking to 2 for now based on UI
  rrWheel: Wheel;
  wheelsNotes: string;

  // Step 5: History & OBD
  owners: number | '';
  ptsOriginal: boolean;
  vinMatches: boolean;
  mileageMatches: boolean;
  accidents: boolean;
  regRegion: string;
  customsCleared: boolean;
  serviceRecords: boolean;
  expertNotes: string;
  obdCodes: ObdCode[];

  // NEW: Comprehensive Checklists
  extendedChecklist: {
    legal: Record<string, boolean>;      // I. Legal
    bodyStruct: Record<string, boolean>; // II. Body & Structure
    mileage: Record<string, boolean>;    // III. Mileage Signs
    techStatic: Record<string, boolean>; // IV. Tech Static
    testDrive: Record<string, boolean>;  // V. Dynamic
    professional: Record<string, boolean>; // VI. Professional
  };

  [key: string]: any;
}

export const INITIAL_BODY_PART: BodyPart = {
  status: 'OK',
  size: 0,
  lkp: 120,
  notes: '',
  images: []
};

export const INITIAL_TECH: TechCheck = {
  status: 'Good',
  comment: ''
};

export const INITIAL_WHEEL: Wheel = {
  tread: 6,
  dot: 2022,
  wear: 'Even',
  rimCondition: 'Good'
};

export const INITIAL_DATA: InspectionData = {
  expertName: '',
  
  make: '',
  model: '',
  year: '',
  vin: '',
  mileage: '',
  engine: '',
  transmission: '',
  drive: '',
  color: '',
  price: '',
  averageMarketPrice: '',
  region: '',
  generalNotes: '',
  
  // Body Parts
  frontBumper: { ...INITIAL_BODY_PART, lkp: 0 },
  rearBumper: { ...INITIAL_BODY_PART, lkp: 0 },
  hood: { ...INITIAL_BODY_PART },
  roof: { ...INITIAL_BODY_PART },
  trunk: { ...INITIAL_BODY_PART },
  
  lfFender: { ...INITIAL_BODY_PART },
  rfFender: { ...INITIAL_BODY_PART },
  lfDoor: { ...INITIAL_BODY_PART },
  rfDoor: { ...INITIAL_BODY_PART },
  lrDoor: { ...INITIAL_BODY_PART },
  rrDoor: { ...INITIAL_BODY_PART },
  lrQuarter: { ...INITIAL_BODY_PART },
  rrQuarter: { ...INITIAL_BODY_PART },

  wsStatus: 'OK',
  wsHeated: false,
  wsOriginal: true,
  wsMarking: '',
  glassNotes: '',
  sideGlassStatus: '',
  mirrorsStatus: '',

  // Tech
  engineOilLevel: { ...INITIAL_TECH },
  engineOilCondition: { ...INITIAL_TECH },
  coolantLevel: { ...INITIAL_TECH },
  brakeFluidLevel: { ...INITIAL_TECH },
  engineSound: { ...INITIAL_TECH },
  engineSmoke: { ...INITIAL_TECH },
  engineLeaks: { ...INITIAL_TECH },
  gearboxShifting: { ...INITIAL_TECH },
  suspensionKnocks: { ...INITIAL_TECH },
  steeringPlay: { ...INITIAL_TECH },
  
  // Interior
  upholstery: { ...INITIAL_TECH },
  steeringWheelWear: { ...INITIAL_TECH },
  pedalWear: { ...INITIAL_TECH },
  smell: 'Neutral',
  
  acWorking: true,
  heaterWorking: true,
  windowsWorking: true,
  seatHeatingWorking: true,

  flWheel: { ...INITIAL_WHEEL },
  frWheel: { ...INITIAL_WHEEL },
  rlWheel: { ...INITIAL_WHEEL },
  rrWheel: { ...INITIAL_WHEEL },
  wheelsNotes: '',

  owners: 1,
  ptsOriginal: true,
  vinMatches: true,
  mileageMatches: true,
  accidents: false,
  regRegion: '',
  customsCleared: true,
  serviceRecords: false,
  expertNotes: '',
  obdCodes: [],

  extendedChecklist: {
    legal: {},
    bodyStruct: {},
    mileage: {},
    techStatic: {},
    testDrive: {},
    professional: {}
  }
};

export interface ScoreResult {
  score: number;
  grade: string;
}

export interface RecommendationResult {
  verdict: 'Recommended' | 'Conditional' | 'Not Recommended';
  reasons: string[];
}