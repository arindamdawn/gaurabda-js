import { Convert, GCMath } from './math';
import { IGregorianDateTime } from './types';

/**
 * Gregorian (Western) calendar date and time with timezone support
 * Handles conversion between Gregorian and Julian calendars
 */
export class GregorianDateTime implements IGregorianDateTime {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  shour: number; // shortened hour (0-1 range, where 1 = 24 hours)
  TimezoneHours: number; // timezone offset in hours

  /**
   * Month data arrays
   */
  private static readonly MONTHS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  private static readonly MONTHS_LEAP = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  private static readonly MONTH_ABBREVIATIONS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private static readonly MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(date?: Date | GregorianDateTime) {
    this.clear();
    if (date !== undefined) {
      this.set(date);
    }
  }

  /**
   * Initialize to current date and time
   */
  clear(): void {
    const d = new Date();
    this.day = d.getDate();
    this.month = d.getMonth() + 1;
    this.year = d.getFullYear();
    this.dayOfWeek = d.getDay();
    this.shour = 0.5;
    this.TimezoneHours = 0.0;
  }

  /**
   * Reset to today
   */
  today(): void {
    this.clear();
  }

  /**
   * Clone this date
   */
  clone(): GregorianDateTime {
    const dt = new GregorianDateTime();
    dt.set(this);
    return dt;
  }

  /**
   * Get triplet representation (YYYY-MM-DD)
   */
  get triplet(): string {
    return `${String(this.year).padStart(4, '0')}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
  }

  /**
   * Create from triplet string (YYYY-MM-DD)
   */
  static fromTriplet(str: string): GregorianDateTime {
    const parts = str.split('-');
    if (parts.length === 3) {
      return GregorianDateTime.fromComponents(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10),
        parseInt(parts[2], 10),
      );
    }
    return new GregorianDateTime();
  }

  /**
   * Create from year, month, day components
   */
  static fromComponents(year: number, month: number, day: number): GregorianDateTime {
    const d = new GregorianDateTime();
    d.year = year;
    d.month = month;
    d.day = day;
    return d;
  }

  /**
   * Clone with day offset
   */
  cloneDays(daysOffset: number): GregorianDateTime {
    const d = new GregorianDateTime();
    d.set(this);
    d.addDays(daysOffset);
    return d;
  }

  /**
   * Create from JavaScript Date
   */
  static fromDate(date: Date): GregorianDateTime {
    return new GregorianDateTime(date);
  }

  /**
   * Set timezone offset
   */
  setOffset(offset: number): GregorianDateTime {
    this.TimezoneHours = offset;
    return this;
  }

  /**
   * Set from another GregorianDateTime or JavaScript Date
   */
  set(source: GregorianDateTime | Date): GregorianDateTime {
    if (source instanceof GregorianDateTime) {
      this.day = source.day;
      this.month = source.month;
      this.year = source.year;
      this.shour = source.shour;
      this.dayOfWeek = source.dayOfWeek;
      this.TimezoneHours = source.TimezoneHours;
    } else if (source instanceof Date) {
      this.day = source.getDate();
      this.month = source.getMonth() + 1;
      this.year = source.getFullYear();
      this.dayOfWeek = source.getDay();
      this.shour = 0.5;
      this.TimezoneHours = 0.0;
    }
    return this;
  }

  /**
   * Set date components
   */
  setDate(year: number, month: number, day: number): void {
    this.day = day;
    this.month = month;
    this.year = year;
    this.shour = 0.5;
    this.TimezoneHours = 0.0;
    this.initWeekDay();
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return this.format('{day} {monthAbr} {year}');
  }

  /**
   * Get long time string
   */
  longTime(): string {
    return this.longTimeString();
  }

  /**
   * Get weekday
   */
  get weekday(): number {
    return this.dayOfWeek;
  }

  /**
   * Short time string (HH:MM)
   */
  shortTimeString(): string {
    return `${String(this.getHour()).padStart(2, '0')}:${String(this.getMinute()).padStart(2, '0')}`;
  }

  /**
   * Long time string (HH:MM:SS)
   */
  longTimeString(): string {
    return `${String(this.getHour()).padStart(2, '0')}:${String(this.getMinute()).padStart(2, '0')}:${String(this.getSecond()).padStart(2, '0')}`;
  }

  /**
   * C-style string representation
   */
  cStr(): string {
    return (
      Convert.formatS2(this.day) +
      ' ' +
      GregorianDateTime.getMonthAbreviation(this.month) +
      ' ' +
      Convert.formatD4(this.year) +
      '  ' +
      Convert.formatD2(this.getHour()) +
      ':' +
      Convert.formatD2(this.getMinute()) +
      ':' +
      Convert.formatD2(this.getSecond())
    );
  }

  /**
   * Full string representation
   */
  fullString(): string {
    return this.cStr();
  }

  /**
   * Get date with relative text (Today, Tomorrow, Yesterday)
   */
  static getDateTextWithTodayExt(vc: GregorianDateTime): string {
    let strRet = `${vc.day} ${vc.month} ${vc.year}`;
    if (
      vc.day > 0 &&
      vc.day < 32 &&
      vc.month > 0 &&
      vc.month < 13 &&
      vc.year >= 1500 &&
      vc.year < 4000
    ) {
      const today = new GregorianDateTime();
      const diff = today.getJulianInteger() - vc.getJulianInteger();
      if (diff === 0) {
        strRet += ' (Today)';
      } else if (diff === -1) {
        strRet += ' (Tomorrow)';
      } else if (diff === 1) {
        strRet += ' (Yesterday)';
      }
    }
    return strRet;
  }

  /**
   * Convert seconds to time string
   */
  static timeSpanToLongString(seconds: number): string {
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    return `${Convert.formatD2(h)}:${Convert.formatD2(m)}:${Convert.formatD2(s)}`;
  }

  /**
   * Format date string with placeholders
   * Supports: {day}, {month}, {monthAbr}, {monthName}, {year}, {hour}, {min}, {minRound}, {sec}
   */
  format(formatStr: string): string {
    let result = formatStr;

    if (result.includes('{day}')) result = result.replace('{day}', this.day.toString());
    if (result.includes('{month}')) result = result.replace('{month}', this.month.toString());
    if (result.includes('{monthAbr}')) result = result.replace('{monthAbr}', GregorianDateTime.getMonthAbreviation(this.month));
    if (result.includes('{monthName}')) result = result.replace('{monthName}', GregorianDateTime.getMonthName(this.month));
    if (result.includes('{hour}')) result = result.replace('{hour}', Convert.formatD2(this.getHour()));
    if (result.includes('{min}')) result = result.replace('{min}', Convert.formatD2(this.getMinute()));
    if (result.includes('{minRound}')) result = result.replace('{minRound}', Convert.formatD2(this.getMinuteRound()));
    if (result.includes('{sec}')) result = result.replace('{sec}', Convert.formatD2(this.getSecond()));
    if (result.includes('{year}')) result = result.replace('{year}', this.year.toString());

    return result;
  }

  /**
   * Get maximum days in a month
   */
  static getMonthMaxDays(year: number, month: number): number {
    return GregorianDateTime.isLeapYear(year) ? GregorianDateTime.MONTHS_LEAP[month] : GregorianDateTime.MONTHS[month];
  }

  /**
   * Check if year is a leap year
   */
  static isLeapYear(year: number): boolean {
    if (year % 4 === 0) {
      if (year % 100 === 0 && year % 400 !== 0) {
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * Get Julian Day Number (integer part)
   */
  getJulianInteger(): number {
    let yy = this.year - Convert.toInt32((12 - this.month) / 10);
    let mm = this.month + 9;

    if (mm >= 12) mm -= 12;

    const k1 = Convert.toInt32(Math.floor(365.25 * (yy + 4712)));
    const k2 = Convert.toInt32(Math.floor(30.6 * mm + 0.5));
    const yy100 = GCMath.intFloor(yy / 100);
    const k3 = Convert.toInt32(Math.floor(Math.floor(yy100 + 49) * 0.75)) - 38;
    let j = k1 + k2 + this.day + 59;
    if (j > 2299160) j -= k3;
    return j;
  }

  /**
   * Get Julian Day Number (floating point)
   */
  getJulian(): number {
    return this.getJulianInteger() * 1.0;
  }

  /**
   * Normalize date values (handle overflow/underflow)
   */
  normalizeValues(): void {
    if (this.shour < 0.0) {
      this.day--;
      this.shour += 1.0;
    } else if (this.shour >= 1.0) {
      this.shour -= 1.0;
      this.day++;
    }

    if (this.day < 1) {
      this.month--;
      if (this.month < 1) {
        this.month = 12;
        this.year--;
      }
      this.day = GregorianDateTime.getMonthMaxDays(this.year, this.month);
    } else if (this.day > GregorianDateTime.getMonthMaxDays(this.year, this.month)) {
      this.month++;
      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
      this.day = 1;
    }
  }

  /**
   * Move to previous day
   */
  previousDay(): GregorianDateTime {
    this.day--;
    if (this.day < 1) {
      this.month--;
      if (this.month < 1) {
        this.month = 12;
        this.year--;
      }
      this.day = GregorianDateTime.getMonthMaxDays(this.year, this.month);
    }
    this.dayOfWeek = (this.dayOfWeek + 6) % 7;
    return this;
  }

  /**
   * Move to next day
   */
  nextDay(): GregorianDateTime {
    this.day++;
    if (this.day > GregorianDateTime.getMonthMaxDays(this.year, this.month)) {
      this.month++;
      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
      this.day = 1;
    }
    this.dayOfWeek = (this.dayOfWeek + 1) % 7;
    return this;
  }

  /**
   * Add days to the date
   */
  addDays(n: number): GregorianDateTime {
    if (n < 0) {
      return this.subtractDays(-n);
    } else {
      for (let i = 0; i < n; i++) {
        this.nextDay();
      }
    }
    return this;
  }

  /**
   * Set date from Julian Day Number
   */
  setFromJulian(julianUtcDate: number): void {
    const z = Math.floor(julianUtcDate + 0.5);
    const f = julianUtcDate + 0.5 - z;

    let A: number;
    if (z < 2299161.0) {
      A = z;
    } else {
      const alpha = Math.floor((z - 1867216.25) / 36524.25);
      A = z + 1.0 + alpha - Math.floor(alpha / 4.0);
    }

    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    this.day = Convert.toInt32(Math.floor(B - D - Math.floor(30.6001 * E) + f));
    this.month = Convert.toInt32(E < 14 ? E - 1 : E - 13);
    this.year = Convert.toInt32(this.month > 2 ? C - 4716 : C - 4715);
    this.TimezoneHours = 0.0;
    this.shour = julianUtcDate + 0.5 - Math.floor(julianUtcDate + 0.5);
  }

  /**
   * Change timezone
   */
  changeTimeZone(tZone: number): void {
    this.shour += (tZone - this.TimezoneHours) / 24;
    this.normalizeValues();
    this.TimezoneHours = tZone;
  }

  /**
   * Subtract days from the date
   */
  subtractDays(n: number): GregorianDateTime {
    if (n < 0) {
      return this.addDays(-n);
    } else {
      for (let i = 0; i < n; i++) {
        this.previousDay();
      }
    }
    return this;
  }

  /**
   * Add hours to the date
   */
  addHours(hours: number): void {
    this.shour += hours / 24.0;
    this.normalizeValues();
  }

  /**
   * Get time with offset
   */
  timeWithOffset(offset: number): GregorianDateTime {
    const dt = this.clone();
    dt.shour += parseFloat(offset.toString());
    dt.normalizeValues();
    return dt;
  }

  /**
   * Get detailed Julian date (with fractional day)
   */
  getJulianDetailed(): number {
    return this.getJulian() - 0.5 + this.shour;
  }

  /**
   * Get complete Julian date (with timezone adjustment)
   */
  getJulianComplete(): number {
    return this.getJulian() - 0.5 + this.shour - this.TimezoneHours / 24.0;
  }

  /**
   * Initialize weekday based on Julian date
   */
  initWeekDay(): GregorianDateTime {
    this.dayOfWeek = (this.getJulianInteger() + 1) % 7;
    return this;
  }

  /**
   * Get hour of day (0-23)
   */
  getHour(): number {
    return Convert.toInt32(Math.floor(this.shour * 24));
  }

  /**
   * Get minute of hour (0-59)
   */
  getMinute(): number {
    return Convert.toInt32(Math.floor((this.shour * 24 - Math.floor(this.shour * 24)) * 60));
  }

  /**
   * Get minute rounded
   */
  getMinuteRound(): number {
    return Convert.toInt32(Math.floor((this.shour * 24 - Math.floor(this.shour * 24)) * 60 + 0.5));
  }

  /**
   * Get second of minute (0-59)
   */
  getSecond(): number {
    return Convert.toInt32(Math.floor((this.shour * 1440 - Math.floor(this.shour * 1440)) * 60));
  }

  /**
   * Get unique integer for date (for comparison)
   */
  getDayInteger(): number {
    return this.year * 384 + this.month * 32 + this.day;
  }

  /**
   * Compare year, month, day only
   */
  compareYMD(other: GregorianDateTime): number {
    if (other instanceof GregorianDateTime) {
      return this.getDayInteger() - other.getDayInteger();
    }
    return 0;
  }

  /**
   * Check if same day
   */
  equalDay(other: GregorianDateTime): boolean {
    return this.day === other.day && this.month === other.month && this.year === other.year;
  }

  /**
   * Compare two dates
   * @returns -1 if this < other, 0 if equal, 1 if this > other, -2 if not both GregorianDateTime
   */
  static compare(a: GregorianDateTime, b: GregorianDateTime): -2 | -1 | 0 | 1 {
    if (a instanceof GregorianDateTime && b instanceof GregorianDateTime) {
      if (a.year < b.year) return -1;
      if (a.year > b.year) return 1;

      if (a.month < b.month) return -1;
      if (a.month > b.month) return 1;

      if (a.day < b.day) return -1;
      if (a.day > b.day) return 1;

      if (a.shour < b.shour) return -1;
      if (a.shour > b.shour) return 1;

      return 0;
    }
    return -2;
  }

  /**
   * Check if less than or equal to another date
   */
  isLessOrEqualsTo(date: GregorianDateTime): boolean {
    const d1 = new GregorianDateTime();
    const d2 = new GregorianDateTime();
    d1.set(this);
    d2.set(date);
    d1.normalizeValues();
    d2.normalizeValues();
    return d1.getDayInteger() <= d2.getDayInteger();
  }

  /**
   * Check if less than another date
   */
  isLessThan(date: GregorianDateTime): boolean {
    const d1 = new GregorianDateTime();
    const d2 = new GregorianDateTime();
    d1.set(this);
    d2.set(date);
    d1.normalizeValues();
    d2.normalizeValues();
    return d1.getDayInteger() < d2.getDayInteger();
  }

  /**
   * Check if before another date
   */
  isBeforeThis(date: GregorianDateTime): boolean {
    return this.isLessThan(date);
  }

  /**
   * Check if dates are equal
   */
  isDateEqual(date: GregorianDateTime): boolean {
    const d1 = new GregorianDateTime();
    const d2 = new GregorianDateTime();
    d1.set(this);
    d2.set(date);
    d1.normalizeValues();
    d2.normalizeValues();
    return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
  }

  /**
   * Get month abbreviation (e.g., "Jan")
   */
  static getMonthAbreviation(month: number): string {
    return GregorianDateTime.MONTH_ABBREVIATIONS[month] || '';
  }

  /**
   * Get full month name (e.g., "January")
   */
  static getMonthName(month: number): string {
    return GregorianDateTime.MONTH_NAMES[month] || '';
  }

  /**
   * Calculate Julian Day for given date
   */
  static calculateJulianDay(year: number, month: number, day: number): number {
    let yy = year - Convert.toInt32((12 - month) / 10);
    let mm = month + 9;

    if (mm >= 12) mm -= 12;

    const k1 = Convert.toInt32(Math.floor(365.25 * (yy + 4712)));
    const k2 = Convert.toInt32(Math.floor(30.6 * mm + 0.5));
    const k3 = Convert.toInt32(Math.floor(Math.floor((yy / 100) + 49) * 0.75)) - 38;
    let j = k1 + k2 + day + 59;
    if (j > 2299160) j -= k3;

    return j * 1.0;
  }

  /**
   * Check if date is equal or after the given weekday in the given week
   * @param weekNumber 1-4 for order of week, 5 for last week of month
   * @param dayNumber 0 for Sunday, 1 for Monday, ..., 6 for Saturday
   */
  isEqualOrAfterWeekdayInWeek(weekNumber: number, dayNumber: number): boolean {
    const xx = [1, 7, 6, 5, 4, 3, 2];
    const dowFirstDay = xx[(7 + this.day - this.dayOfWeek) % 7];
    const firstGivenWeekday = xx[(dowFirstDay - dayNumber + 7) % 7];

    let requiredGivenWeekday: number;
    if (weekNumber < 0 || weekNumber >= 5) {
      requiredGivenWeekday = firstGivenWeekday + 28;
      const lastDayInMonth = GregorianDateTime.getMonthMaxDays(this.year, this.month);
      while (requiredGivenWeekday > lastDayInMonth) {
        requiredGivenWeekday -= 7;
      }
    } else {
      requiredGivenWeekday = Convert.toInt32(firstGivenWeekday + (weekNumber - 1) * 7);
    }

    return this.day >= requiredGivenWeekday;
  }

  /**
   * Get encoded string representation
   */
  getEncodedString(): string {
    return `${this.year}|${this.month}|${this.day}|${this.shour}|${this.TimezoneHours}|${this.dayOfWeek}`;
  }

  /**
   * Set from encoded string
   */
  setEncodedString(value: string): void {
    const parts = value.split('|');
    if (parts.length >= 6) {
      this.year = Convert.toInt32(parts[0]);
      this.month = Convert.toInt32(parts[1]);
      this.day = Convert.toInt32(parts[2]);
      this.shour = Convert.toDouble(parts[3]);
      this.TimezoneHours = Convert.toDouble(parts[4]);
      this.dayOfWeek = Convert.toInt32(parts[5]);
    }
  }
}
