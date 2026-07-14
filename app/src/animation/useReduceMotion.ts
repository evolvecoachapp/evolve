import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Subscribes to the system reduce-motion preference.
 * Decorative animations should be disabled or simplified when true.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.() ?? false)
      .then((enabled) => {
        if (isMounted) {
          setReduceMotion(Boolean(enabled));
        }
      })
      .catch(() => {
        if (isMounted) {
          setReduceMotion(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      (enabled) => {
        setReduceMotion(enabled);
      },
    );

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}
