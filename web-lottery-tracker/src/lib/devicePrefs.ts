import { useSyncExternalStore } from "react";

/**
 * Device-local accessibility & session preferences (never synced — they only
 * matter on the device you're holding). Stored under "ltn:" keys like the rest
 * of the local cache.
 */

export interface DevicePrefs {
  /** Minutes of inactivity before auto sign-out; 0 = never. */
  idleTimeoutMinutes: number;
  /** Short vibration feedback on key actions (supported Android browsers). */
  haptics: boolean;
}

export const IDLE_OPTIONS = [0, 5, 15, 30, 60] as const;

const KEY_IDLE = "ltn:idle-timeout";
const KEY_HAPTICS = "ltn:haptics";
const EVENT = "ltn:device-prefs";

function read(): DevicePrefs {
  let idle = 15;
  let haptics = true;
  try {
    const rawIdle = localStorage.getItem(KEY_IDLE);
    if (rawIdle !== null && IDLE_OPTIONS.includes(Number(rawIdle) as (typeof IDLE_OPTIONS)[number])) idle = Number(rawIdle);
    const rawHaptics = localStorage.getItem(KEY_HAPTICS);
    if (rawHaptics !== null) haptics = rawHaptics === "1";
  } catch {
    /* private mode etc. — defaults are fine */
  }
  return { idleTimeoutMinutes: idle, haptics };
}

let prefs: DevicePrefs = read();
const listeners = new Set<() => void>();

function write(next: Partial<DevicePrefs>) {
  prefs = { ...prefs, ...next };
  try {
    if ("idleTimeoutMinutes" in next) localStorage.setItem(KEY_IDLE, String(prefs.idleTimeoutMinutes));
    if ("haptics" in next) localStorage.setItem(KEY_HAPTICS, prefs.haptics ? "1" : "0");
  } catch {
    /* non-fatal */
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => prefs;

export function useDevicePrefs(): DevicePrefs {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function setIdleTimeoutMinutes(minutes: number) {
  write({ idleTimeoutMinutes: minutes });
}

export function setHaptics(enabled: boolean) {
  write({ haptics: enabled });
}

/**
 * Fire-and-forget haptic tick. Safe everywhere: no-ops on browsers without
 * the Vibration API (all iOS browsers) or when the user turned it off.
 */
export function buzz(pattern: number | number[] = 10) {
  if (!prefs.haptics) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
