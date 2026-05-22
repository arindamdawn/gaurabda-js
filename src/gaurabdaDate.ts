import { IGaurabdaDate } from './types';

/**
 * Represents a date in the Gaurabda (Hindu lunar) calendar
 */
export class GaurabdaDate implements IGaurabdaDate {
  tithi: number; // lunar day (0-29)
  masa: number; // lunar month (0-11)
  gyear: number; // Gaurabda year

  constructor(tithi: number = 0, masa: number = 0, gyear: number = 500) {
    this.tithi = tithi;
    this.masa = masa;
    this.gyear = gyear;
  }

  /**
   * Set date components
   */
  set(tithi: number, masa: number, gyear: number): void;
  set(other: GaurabdaDate): void;
  set(tithiOrOther: number | GaurabdaDate, masa?: number, gyear?: number): void {
    if (typeof tithiOrOther === 'object' && tithiOrOther instanceof GaurabdaDate) {
      this.tithi = tithiOrOther.tithi;
      this.masa = tithiOrOther.masa;
      this.gyear = tithiOrOther.gyear;
    } else if (typeof tithiOrOther === 'number' && masa !== undefined && gyear !== undefined) {
      this.tithi = tithiOrOther;
      this.masa = masa;
      this.gyear = gyear;
    }
  }

  /**
   * Move to the next tithi (lunar day)
   */
  next(): void {
    this.tithi++;
    if (this.tithi >= 30) {
      this.tithi %= 30;
      this.masa++;
    }
    if (this.masa >= 12) {
      this.masa %= 12;
      this.gyear++;
    }
  }

  /**
   * Move to the previous tithi (lunar day)
   */
  prev(): void {
    if (this.tithi === 0) {
      if (this.masa === 0) {
        this.masa = 11;
        this.tithi = 29;
        this.gyear--;
      } else {
        this.masa--;
        this.tithi = 29;
      }
    } else {
      this.tithi--;
    }
  }

  /**
   * Clone this date
   */
  clone(): GaurabdaDate {
    return new GaurabdaDate(this.tithi, this.masa, this.gyear);
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `${this.gyear}-${String(this.masa + 1).padStart(2, '0')}-${String(this.tithi + 1).padStart(2, '0')}`;
  }
}
