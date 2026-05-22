/**
 * Mathematical constants and utilities for calendar calculations
 */

export const MATH_PI = 3.1415926535897932385;
export const MATH_PI2 = 6.2831853071795864769;
export const MATH_RADS = 0.0174532925199432958;

export const MATH_AU = 149597869.0;
export const EARTH_RADIUS = 6378.15; // Radius of the earth
export const MOON_RADIUS = 1737.4;
export const SUN_RADIUS = 695500;
export const J1999 = 2451180.0;
export const J2000 = 2451545.0;

/**
 * Utility class for type conversion
 */
export class Convert {
  static toInt32(a: number | string): number {
    return parseInt(String(a), 10);
  }

  static toDouble(a: number | string): number {
    return parseFloat(String(a));
  }

  static formatS2(a: number): string {
    return a < 10 ? ' ' + a.toString() : a.toString();
  }

  static formatD2(a: number): string {
    return String(a).padStart(2, '0');
  }

  static formatD4(a: number): string {
    return String(a).padStart(4, '0');
  }
}

/**
 * Mathematical utility functions for calendar calculations
 */
export class GCMath {
  static floor(d: number): number {
    return Math.floor(d);
  }

  static intFloor(d: number): number {
    return Convert.toInt32(Math.floor(d));
  }

  static intRound(d: number): number {
    return Convert.toInt32(Math.floor(d + 0.5));
  }

  static cosDeg(x: number): number {
    return Math.cos(x * MATH_RADS);
  }

  static sinDeg(x: number): number {
    return Math.sin(x * MATH_RADS);
  }

  static arccosDeg(x: number): number {
    return Math.acos(x) / MATH_RADS;
  }

  static abs(d: number): number {
    return Math.abs(d);
  }

  static arcTan2Deg(y: number, x: number): number {
    return (Math.atan2(y, x) / MATH_RADS);
  }

  static tanDeg(x: number): number {
    return Math.tan(x * MATH_RADS);
  }

  static arcSinDeg(x: number): number {
    return Math.asin(x) / MATH_RADS;
  }

  static arcTanDeg(x: number): number {
    return Math.atan(x) / MATH_RADS;
  }

  /**
   * Normalize value to range [0, 1)
   */
  static putIn1(v: number): number {
    let v2 = v - Math.floor(v);
    while (v2 < 0.0) v2 += 1.0;
    while (v2 > 1.0) v2 -= 1.0;
    return v2;
  }

  /**
   * Normalize value to range [0, 24)
   */
  static putIn24(id: number): number {
    let d = id;
    while (d >= 24.0) d -= 24.0;
    while (d < 0.0) d += 24.0;
    return d;
  }

  /**
   * Normalize value to range [0, 360)
   */
  static putIn360(id: number): number {
    let d = id;
    while (d >= 360.0) d -= 360.0;
    while (d < 0.0) d += 360.0;
    return d;
  }

  /**
   * Normalize value to range [-180, 180]
   * Used for comparison values around 0 degrees
   */
  static putIn180(in_d: number): number {
    let d = in_d;
    while (d < -180.0) d += 360.0;
    while (d > 180.0) d -= 360.0;
    return d;
  }

  /**
   * Get the sign of a number
   * @returns -1 if d < 0, 0 if d == 0, 1 if d > 0
   */
  static getSign(d: number): -1 | 0 | 1 {
    if (d > 0.0) return 1;
    if (d < 0.0) return -1;
    return 0;
  }

  static deg2rad(x: number): number {
    return x * MATH_RADS;
  }

  static rad2deg(x: number): number {
    return x / MATH_RADS;
  }

  static getFraction(x: number): number {
    return x - Math.floor(x);
  }

  static max<T extends number | object>(a: T, b: T): T {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a > b ? a : b) as T;
    }
    return a;
  }

  static min<T extends number | object>(a: T, b: T): T {
    if (typeof a === 'number' && typeof b === 'number') {
      return (a < b ? a : b) as T;
    }
    return a;
  }

  /**
   * Calculate arc distance between two points in degrees
   */
  static arcDistanceDeg(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const lat1Rad = MATH_PI / 2 - GCMath.deg2rad(lat1);
    const lat2Rad = MATH_PI / 2 - GCMath.deg2rad(lat2);
    const dLon = lon1 - lon2;

    return GCMath.arccosDeg(
      GCMath.cosDeg(lat1) * GCMath.cosDeg(lat2) +
        GCMath.sinDeg(lat1) * GCMath.sinDeg(lat2) * GCMath.cosDeg(dLon),
    );
  }

  /**
   * Convert daytime (0-1) to hours and minutes
   */
  static daytimeToHourMin(shour: number): [number, number] {
    shour *= 24.0;
    const hour = GCMath.intFloor(shour);
    shour = (shour - hour) * 60;
    const minute = GCMath.intRound(shour);
    return [hour, minute];
  }

  /**
   * Convert daytime (0-1) to hours, minutes, and seconds
   */
  static daytimeToHourMinSec(shour: number): [number, number, number] {
    shour *= 24.0;
    const hour = GCMath.intFloor(shour);
    shour = (shour - hour) * 60;
    const minute = GCMath.intFloor(shour);
    shour = (shour - minute) * 60;
    const sec = GCMath.intRound(shour);
    return [hour, minute, sec];
  }
}
