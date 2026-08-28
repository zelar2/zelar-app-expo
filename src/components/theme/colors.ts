export const colors = {
  primary: "#2F80ED",
  primaryLight: "#56CCF2",

  success: "#27AE60",
  danger: "#EB5757",

  background: "#F5F7FA",
  surface: "#FFFFFF",

  text: "#333333",
  textSecondary: "#666666",
  textMuted: "#999999",
  textInverse: "#FFFFFF",

  border: "#E5E7EB",
  divider: "#EEF1F5",

  overlay: "rgba(0,0,0,0.35)",
} as const;

export type AppColor = keyof typeof colors;
