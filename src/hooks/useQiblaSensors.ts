import { useCallback, useEffect, useRef, useState } from "react";
import {
  angleDiff,
  calculateKaabaDistanceKm,
  calculateQiblaBearing,
  unwrapAngle,
} from "@/lib/qibla-geo";

export type SensorStatus =
  "initializing" | "active" | "denied_location" | "denied_orientation" | "unsupported_sensors";

type ExtendedOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

/**
 * Calculates 3D tilt-compensated compass heading from W3C alpha, beta, gamma angles.
 * Clamps pitch and roll to [-85°, 85°] to prevent gimbal lock and 180° flip inversions when phone is held upright.
 * Returns clockwise azimuth in degrees [0, 360) where 0 = North, 90 = East, 180 = South, 270 = West.
 */
function getTiltCompensatedHeading(alpha: number, beta: number, gamma: number): number {
  const degToRad = Math.PI / 180;
  const radAlpha = (alpha || 0) * degToRad;

  // Clamp pitch (beta) and roll (gamma) to avoid division by zero and sign flips near vertical
  const clampedBeta = Math.max(-85, Math.min(85, beta || 0));
  const clampedGamma = Math.max(-85, Math.min(85, gamma || 0));

  const radBeta = clampedBeta * degToRad;
  const radGamma = clampedGamma * degToRad;

  const cA = Math.cos(radAlpha);
  const sA = Math.sin(radAlpha);
  const cB = Math.cos(radBeta);
  const sB = Math.sin(radBeta);
  const cG = Math.cos(radGamma);
  const sG = Math.sin(radGamma);

  // Projection of Magnetic North vector onto device screen plane (X_right, Y_up)
  const xProj = sA * cG + cA * sB * sG;
  const yProj = cA * cB;

  // Clockwise azimuth from North to top of device (+Y): atan2(-xProj, yProj)
  const headingRad = Math.atan2(-xProj, yProj);
  const headingDeg = headingRad * (180 / Math.PI);

  return ((headingDeg % 360) + 360) % 360;
}

export function useQiblaSensors(fallbackCoords?: { lat: number; lon: number } | null) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState<SensorStatus>("initializing");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isInterferenceDetected, setIsInterferenceDetected] = useState<boolean>(false);

  // Smoothing & Sensor Refs
  const smoothedHeadingRef = useRef<number | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const sensorDetectedRef = useRef<boolean>(false);
  const hasAbsoluteHeadingRef = useRef<boolean>(false);

  // Helper to normalize screen orientation angle (landscape vs portrait)
  const getScreenOrientation = (): number => {
    if (typeof window === "undefined") return 0;
    if (
      window.screen &&
      window.screen.orientation &&
      typeof window.screen.orientation.angle === "number"
    ) {
      return window.screen.orientation.angle;
    }
    if (typeof window.orientation === "number") {
      return Number(window.orientation);
    }
    return 0;
  };

  // --- Geolocation Handler ---
  const requestLocation = useCallback(() => {
    console.log("[QiblaCompass] Requesting location permission and coordinates...");

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      console.warn("[QiblaCompass] Geolocation API unavailable on this browser.");
      setStatus("unsupported_sensors");
      setErrorKey("qiblaGeoUnsupported");
      return;
    }

    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }

    // Reset status when user explicitly re-requests location
    setStatus((prev) =>
      prev === "denied_location" || prev === "unsupported_sensors" ? "initializing" : prev,
    );
    setErrorKey(null);

    const handleSuccess = (pos: GeolocationPosition) => {
      console.log(
        `[QiblaCompass] Location granted & received: lat=${pos.coords.latitude}, lon=${pos.coords.longitude}, accuracy=${pos.coords.accuracy}m`,
      );
      const newCoords = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      };
      setCoords(newCoords);
      setErrorKey(null);

      // Update status once position is received
      setStatus((prev) => {
        if (prev === "denied_location" || prev === "initializing") {
          return sensorDetectedRef.current ? "active" : "initializing";
        }
        return prev;
      });
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn(`[QiblaCompass] Geolocation info: code=${err.code} (${err.message})`);
      if (err.code === err.PERMISSION_DENIED) {
        setStatus("denied_location");
        setErrorKey("qiblaGeoDenied");
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        // Location Services (GPS) disabled on the device
        setStatus("denied_location");
        setErrorKey("qiblaLocationDisabled");
      } else if (err.code === err.TIMEOUT) {
        console.warn(
          "[QiblaCompass] Geolocation request timed out. Trying standard accuracy fallback...",
        );
        try {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (fallbackErr) => {
              console.warn(`[QiblaCompass] Geolocation fallback info: ${fallbackErr.message}`);
              setStatus("denied_location");
              setErrorKey("qiblaGeoError");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
          );
        } catch (e) {
          console.warn("[QiblaCompass] Geolocation fallback exception:", e);
          setStatus("denied_location");
          setErrorKey("qiblaGeoError");
        }
      } else {
        setStatus("denied_location");
        setErrorKey("qiblaGeoError");
      }
    };

    // Trigger fast initial position check, followed by continuous watch
    try {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      });

      geoWatchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      });
    } catch (e) {
      console.error("[QiblaCompass] Error launching geolocation watch:", e);
      setErrorKey("qiblaGeoError");
    }
  }, []);

  // --- Device Orientation Event Listener ---
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const extEvent = e as ExtendedOrientationEvent;
    const webkitHeading = extEvent.webkitCompassHeading;
    const webkitAccuracy = extEvent.webkitCompassAccuracy;

    const hasWebkit = typeof webkitHeading === "number" && !Number.isNaN(webkitHeading);
    const hasAlpha = typeof e.alpha === "number" && e.alpha !== null && !Number.isNaN(e.alpha);

    // If event fired but hardware provided null/NaN orientation values, keep waiting
    if (!hasWebkit && !hasAlpha) {
      return;
    }

    // Mark that valid sensor data is actually being generated by hardware
    sensorDetectedRef.current = true;

    // Detect magnetic interference on iOS or uncalibrated sensors
    if (typeof webkitAccuracy === "number") {
      if (webkitAccuracy < 0 || webkitAccuracy > 25) {
        setIsInterferenceDetected(true);
      } else {
        setIsInterferenceDetected(false);
      }
    }

    let rawHeading: number | null = null;
    const isAbsolute = e.absolute === true || e.type === "deviceorientationabsolute" || hasWebkit;

    if (hasWebkit) {
      // iOS Compass Heading (0 = Magnetic North, clockwise)
      rawHeading = webkitHeading;
      hasAbsoluteHeadingRef.current = true;
    } else if (hasAlpha) {
      // Ignore non-absolute event if we already have absolute heading active
      if (hasAbsoluteHeadingRef.current && !e.absolute && e.type === "deviceorientation") {
        return;
      }
      if (isAbsolute) {
        hasAbsoluteHeadingRef.current = true;
      } else {
        // Non-absolute sensors may have magnetic interference or lack true compass calibration
        setIsInterferenceDetected(true);
      }

      // Calculate 3D tilt-compensated compass heading from alpha, beta, gamma
      rawHeading = getTiltCompensatedHeading(
        e.alpha as number,
        e.beta as number,
        e.gamma as number,
      );
    }

    if (rawHeading === null || Number.isNaN(rawHeading)) return;

    // Compensate for screen rotation angle (landscape vs portrait)
    const screenAngle = getScreenOrientation();
    const compensatedHeading = (rawHeading + screenAngle + 360) % 360;

    // Dynamic exponential low-pass filter with unwrapping for 0°/360° continuity
    const currentSmoothed = smoothedHeadingRef.current;
    if (currentSmoothed === null) {
      smoothedHeadingRef.current = compensatedHeading;
      setHeading(compensatedHeading);
    } else {
      const diff = angleDiff(compensatedHeading, currentSmoothed);
      const absDiff = Math.abs(diff);

      // Fast lerp for quick turns (>15°), tighter smoothing for small jitter (<4°)
      const alphaFactor = absDiff > 15 ? 0.45 : absDiff > 4 ? 0.25 : 0.12;

      const newSmoothed = currentSmoothed + diff * alphaFactor;
      const normalizedSmoothed = ((newSmoothed % 360) + 360) % 360;
      smoothedHeadingRef.current = normalizedSmoothed;
      setHeading(normalizedSmoothed);
    }

    setStatus((prev) =>
      prev === "initializing" || prev === "unsupported_sensors" ? "active" : prev,
    );
  }, []);

  // --- Start Orientation Sensors & Permissions ---
  const startOrientationSensors = useCallback(async () => {
    console.log("[QiblaCompass] Initializing orientation sensors...");

    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      console.warn(
        "[QiblaCompass] DeviceOrientationEvent API not supported on this browser/device.",
      );
      setStatus("unsupported_sensors");
      setErrorKey("qiblaDeviceNotSupported");
      return;
    }

    type DOEWithPermission = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const DOE = DeviceOrientationEvent as DOEWithPermission;

    // iOS 13+ / Sensor permission request
    if (typeof DOE.requestPermission === "function") {
      try {
        console.log("[QiblaCompass] Requesting DeviceOrientationEvent.requestPermission()...");
        const res = await DOE.requestPermission();
        console.log(`[QiblaCompass] DeviceOrientation permission result: ${res}`);
        if (res !== "granted") {
          setStatus("denied_orientation");
          setErrorKey("qiblaCompassDenied");
          return;
        }
      } catch (err) {
        console.warn("[QiblaCompass] DeviceOrientation.requestPermission error:", err);
      }
    }

    // Attach orientation event listeners
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    // Sensor detection timeout (3.5s): Verify if device has magnetometer/accelerometer hardware
    window.setTimeout(() => {
      if (!sensorDetectedRef.current) {
        console.warn(
          "[QiblaCompass] No valid orientation sensor data received within timeout. Device lacks magnetometer/orientation hardware.",
        );
        setStatus("unsupported_sensors");
        setErrorKey("qiblaDeviceNotSupported");
      }
    }, 3500);
  }, [handleOrientation]);

  // --- Check navigator.permissions on Mount & Listen for Screen Orientation Changes ---
  useEffect(() => {
    // Check permission status if API is available
    if (
      typeof navigator !== "undefined" &&
      "permissions" in navigator &&
      navigator.permissions.query
    ) {
      try {
        navigator.permissions
          .query({ name: "geolocation" })
          .then((permissionStatus) => {
            console.log(`[QiblaCompass] Geolocation permission status: ${permissionStatus.state}`);
            if (permissionStatus.state === "denied") {
              setStatus("denied_location");
              setErrorKey("qiblaGeoDenied");
            }
            permissionStatus.onchange = () => {
              console.log(
                `[QiblaCompass] Geolocation permission changed to: ${permissionStatus.state}`,
              );
              if (permissionStatus.state === "granted") {
                requestLocation();
              } else if (permissionStatus.state === "denied") {
                setStatus("denied_location");
                setErrorKey("qiblaGeoDenied");
              }
            };
          })
          .catch((e) => {
            console.log("[QiblaCompass] navigator.permissions.query check caught error:", e);
          });
      } catch (e) {
        console.log("[QiblaCompass] navigator.permissions.query not available:", e);
      }
    }

    // Handle screen orientation change listener
    const handleOrientationChange = () => {
      console.log("[QiblaCompass] Screen orientation changed, resetting smoothed heading ref.");
      smoothedHeadingRef.current = null;
    };

    if (typeof window !== "undefined") {
      window.addEventListener("orientationchange", handleOrientationChange);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.addEventListener("change", handleOrientationChange);
      }
    }

    requestLocation();
    startOrientationSensors();

    return () => {
      if (geoWatchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
        window.removeEventListener("deviceorientation", handleOrientation, true);
        window.removeEventListener("orientationchange", handleOrientationChange);
        if (window.screen && window.screen.orientation) {
          window.screen.orientation.removeEventListener("change", handleOrientationChange);
        }
      }
    };
  }, [requestLocation, startOrientationSensors, handleOrientation]);

  // --- Recalibrate ---
  const recalibrate = useCallback(() => {
    console.log("[QiblaCompass] Recalibrating sensors and location...");
    smoothedHeadingRef.current = null;
    sensorDetectedRef.current = false;
    hasAbsoluteHeadingRef.current = false;
    setIsInterferenceDetected(false);
    setErrorKey(null);
    setStatus("initializing");

    requestLocation();

    if (typeof window !== "undefined") {
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  }, [requestLocation, handleOrientation]);

  // --- Derived Calculations ---
  const activeHeading = heading ?? 0;
  const defaultFallback = { lat: 48.8566, lon: 2.3522 }; // Paris, France (~119.3° Qibla bearing)
  const effectiveCoords = coords ?? fallbackCoords ?? defaultFallback;
  const qiblaBearing = calculateQiblaBearing(effectiveCoords.lat, effectiveCoords.lon);
  const kaabaDistanceKm = calculateKaabaDistanceKm(effectiveCoords.lat, effectiveCoords.lon);

  const angularError = angleDiff(qiblaBearing, activeHeading);
  const isAligned = Math.abs(angularError) <= 3;

  return {
    coords,
    heading: activeHeading,
    rawSensorHeading: heading,
    qiblaBearing,
    kaabaDistanceKm,
    angularError,
    isAligned,
    isInterferenceDetected,
    status,
    errorKey,
    recalibrate,
    requestLocation,
    startOrientationSensors,
  };
}
