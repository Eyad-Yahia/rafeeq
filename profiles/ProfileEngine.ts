import { AccessibilityProfile, AccessibilityProfileSettings } from "../types";
import { sanitizeProfileSettings } from "../utils/security";

/**
 * Calculates the exact state changes required when transitioning between profiles,
 * ensuring that user preferences are preserved using snapshots.
 * This is a pure function that returns the required state updates.
 * 
 * @param targetProfile - The profile to apply, or null to toggle off.
 * @param currentState - The current accessibility state values.
 * @param currentSnapshot - The snapshot of user values before the current profile was applied.
 * @returns An object containing the `newState` fields to update and the `newSnapshot` to save.
 */
export function calculateProfileTransition(
  targetProfile: AccessibilityProfile | null,
  currentState: Partial<AccessibilityProfileSettings>,
  currentSnapshot: Partial<AccessibilityProfileSettings> | null
): { 
  newState: Partial<AccessibilityProfileSettings>; 
  newSnapshot: Partial<AccessibilityProfileSettings> | null; 
} {
  const baseState = { ...currentState };
  const nextState: Partial<AccessibilityProfileSettings> = {};
  let nextSnapshot: Partial<AccessibilityProfileSettings> | null = null;

  // 1. If we currently have an active profile (snapshot exists), revert it first
  if (currentSnapshot) {
    Object.keys(currentSnapshot).forEach(key => {
      const typedKey = key as keyof AccessibilityProfileSettings;
      (baseState as any)[typedKey] = currentSnapshot[typedKey] as any; // Cast needed because values can be different primitive types
      (nextState as any)[typedKey] = currentSnapshot[typedKey] as any;
    });
  }

  // 2. If we are toggling OFF (targetProfile is null), we just return the reverted state.
  if (!targetProfile) {
    return { newState: nextState, newSnapshot: null };
  }

  // 3. Apply the new profile onto the base state
  const safeSettings = sanitizeProfileSettings(targetProfile.settings);
  nextSnapshot = {};

  Object.keys(safeSettings).forEach((key) => {
    const typedKey = key as keyof AccessibilityProfileSettings;
    // Record the baseState's value into the new snapshot before overriding
    (nextSnapshot as any)[typedKey] = baseState[typedKey] as any;
    // Apply the new profile's value
    (nextState as any)[typedKey] = safeSettings[typedKey] as any;
  });

  return {
    newState: nextState,
    newSnapshot: nextSnapshot
  };
}
