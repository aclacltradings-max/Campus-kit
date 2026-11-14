import { Capacitor } from '@capacitor/core';

/**
 * True when the app is running inside the native Android/iOS shell rather than a
 * browser. Native plugins (notifications, filesystem, share, status bar) are only
 * available in that case, so every call site needs this check before using them.
 */
export const isNative = Capacitor.isNativePlatform();

export const platform = Capacitor.getPlatform();

/** Narrow helper: resolves a promise but never rejects, so plugin failures cannot break a flow. */
export async function attempt<T>(work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch (error) {
    console.warn('[CampusKit] Native call failed.', error);
    return null;
  }
}
