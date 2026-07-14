import type { TextStyle } from "react-native";

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  } satisfies TextStyle,
  h1: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  } satisfies TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  } satisfies TextStyle,
  h3: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    fontWeight: "400",
    color: "#111827",
  } satisfies TextStyle,
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4B5563",
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    fontWeight: "600",
  } satisfies TextStyle,
} as const;
