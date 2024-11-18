export interface Injection {
  id?: string;
  date: string;
  timeOfDay: 'morning' | 'night';
  location: 'VG-D' | 'VG-S' | 'DT-S' | 'DT-D' | 'NO';
  amount: number;
  dayNumber: number;
  weekNumber?: number;
  testEInOil?: number;
  testEReleased?: number;
  serumTLevel?: number;
  isAutoFilled?: boolean;
  isFuture?: boolean;
}

export interface InjectionFormData {
  date: string;
  timeOfDay: 'morning' | 'night';
  location: 'VG-D' | 'VG-S' | 'DT-S' | 'DT-D' | 'NO';
  amount: number;
}

export interface Settings {
  id?: string;
  testDropConstant: number;
}