/**
 * Geodesic and mathematical utilities for Qibla calculation
 * Uses WGS84 / Spherical Initial Bearing formula targeting exact Kaaba coordinates.
 */

export const KAABA_COORDS = {
  lat: 21.422487,
  lon: 39.826206,
} as const;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Calculates initial bearing (azimuth) from user GPS location to Kaaba in degrees [0, 360).
 */
export function calculateQiblaBearing(lat: number, lon: number): number {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_COORDS.lat);
  const deltaLambda = toRad(KAABA_COORDS.lon - lon);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

/**
 * Calculates Great-Circle distance to Kaaba in kilometers.
 */
export function calculateKaabaDistanceKm(lat: number, lon: number): number {
  const R = 6371; // Earth mean radius in km
  const dLat = toRad(KAABA_COORDS.lat - lat);
  const dLon = toRad(KAABA_COORDS.lon - lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_COORDS.lat)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns shortest signed angle difference (target - source) in range ]-180, 180].
 */
export function angleDiff(target: number, source: number): number {
  return ((((target - source) % 360) + 540) % 360) - 180;
}

/**
 * Unwraps target angle so continuous interpolation from currentAngle doesn't spin wildly when crossing 0°/360°.
 */
export function unwrapAngle(targetAngle: number, currentAngle: number): number {
  const diff = angleDiff(targetAngle, currentAngle);
  return currentAngle + diff;
}
