export const colors = {
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F7FA",
  card: "#FFFFFF",

  primary: "#2F80ED",
  primaryLight: "#56CCF2",
  primaryDark: "#1C6ED5",
  primaryPressed: "#1558B0",

  success: "#27AE60",
  successLight: "#6FCF97",

  danger: "#EB5757",
  warning: "#EB5757",

  disabled: "#BDBDBD",

  text: "#333333",
  textSecondary: "#666666",
  textMuted: "#999999",
  textInverse: "#FFFFFF",

  border: "#E2E8F0",
} as const;

export type ColorName = keyof typeof colors;
