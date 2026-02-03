export const colors = {
  bg: "#f5f5f5",
  white: "#fff",
  border: "#ddd",
  primary: "#1a1a2e",
  text: "#333",
  muted: "#666",
  light: "#eee",
  danger: "#dc2626",
  link: "#1a56db",
  success: "#059669",
  warning: "#d97706",
  placeholder: "#999",
  remove: "#c33",
  removeBg: "#fee",
};

export const base = {
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row" as const,
    gap: 6,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.text,
  },
  textMuted: {
    color: colors.muted,
  },
  textActive: {
    color: colors.light,
  },
};
