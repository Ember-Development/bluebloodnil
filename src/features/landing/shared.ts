import { useEffect, useRef, useState } from "react";
import { theme } from "../../theme/theme";

const { colors: themeColors, typography, layout, spacing } = theme;

export const colors = {
  carolina: themeColors.accent,
  carolinaSoft: themeColors.accentSoft,
  carolinaDark: themeColors.accentMuted,
  red: themeColors.danger,
  white: themeColors.white,
  navy: themeColors.background,
  slate300: themeColors.slate300,
  slate400: themeColors.slate400,
  slate500: themeColors.slate500,
  slate600: themeColors.slate600,
  slate700: themeColors.slate700,
  slate800: themeColors.slate800,
  slate900: themeColors.slate900,
  offWhite: themeColors.offWhite,
};

export const fonts = {
  display: typography.display,
  body: typography.body,
};

export const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: layout.contentWidth || "1180px",
  margin: "0 auto",
  padding: `0 ${spacing.lg}`,
  boxSizing: "border-box",
};

export const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 14px",
  borderRadius: 999,
  background: "rgba(98,183,255,0.12)",
  color: colors.carolina,
  border: "1px solid rgba(226,61,61,0.35)",
  letterSpacing: "0.12em",
  fontWeight: 700,
  fontSize: "0.72rem",
  textTransform: "uppercase",
};

export const useScrollReveal = (): [
  React.RefObject<HTMLDivElement>,
  boolean,
] => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Cast ref to the required type to fix type error
  return [ref as React.RefObject<HTMLDivElement>, visible];
};
