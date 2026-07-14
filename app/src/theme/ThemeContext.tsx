import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useReduceMotion } from "../animation/useReduceMotion";
import { motion } from "./motion";
import type { ThemeMode } from "./colorTokens";
import { resolveTheme, type ThemeTokens } from "./theme";
import type { ThemePreference } from "./themePreference";
import { getStoredThemePreference, setStoredThemePreference } from "./themeStorage";

interface ThemeContextValue extends ThemeTokens {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveMode(preference: ThemePreference, systemScheme: ColorSchemeName | null): ThemeMode {
  if (preference === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return preference;
}

function ThemeTransitionShell({ mode, children }: { mode: ThemeMode; children: React.ReactNode }) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(1);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (reduceMotion) {
      opacity.value = 1;
      return;
    }

    opacity.value = 0.94;
    opacity.value = withTiming(1, {
      duration: motion.duration.normal,
      easing: motion.easing.smooth,
    });
  }, [mode, opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}

/**
 * Provides runtime theme tokens and user preference (system / light / dark).
 * Listens to the native Appearance API when preference is "system".
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    () => Appearance.getColorScheme() ?? "light",
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPreference() {
      const stored = await getStoredThemePreference();
      if (isMounted && stored) {
        setPreferenceState(stored);
      }
      if (isMounted) {
        setIsReady(true);
      }
    }

    loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? "light");
    });
    return () => subscription.remove();
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await setStoredThemePreference(next);
  }, []);

  const mode = resolveMode(preference, systemScheme);
  const tokens = useMemo(() => resolveTheme(mode), [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...tokens,
      preference,
      setPreference,
      isReady,
    }),
    [tokens, preference, setPreference, isReady],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeTransitionShell mode={mode}>{children}</ThemeTransitionShell>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/** Status bar style derived from active theme mode. */
export function useStatusBarStyle(): "light" | "dark" {
  const { mode } = useTheme();
  return mode === "dark" ? "light" : "dark";
}
