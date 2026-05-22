/**
 * Core type definitions for Gaurabda Calendar
 */

export interface IDateComponents {
  year: number;
  month: number;
  day: number;
}

export interface IGaurabdaDate {
  tithi: number;
  masa: number;
  gyear: number;
}

export interface IGregorianDateTime extends IDateComponents {
  dayOfWeek: number;
  shour: number; // shortened hour (0-1 range)
  TimezoneHours: number;
}

export interface IAstroData {
  GaurabdaYear: number;
  sunRise: any; // Will be properly typed when converting full files
}

export type PeriodUnitType = 'Days' | 'Weeks' | 'Months' | 'Years' | 'Tithis' | 'Masas' | 'Gaurabda';
