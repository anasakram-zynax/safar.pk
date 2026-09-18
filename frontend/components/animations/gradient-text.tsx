import type { ReactNode } from "react";
import styles from "./gradient-text.module.css";

// Adapted from React Bits GradientText (TS/CSS), with a light palette and CSS-only motion.
// https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/TextAnimations/GradientText
export function GradientText({ children }: { children: ReactNode }) {
  return <span className={styles.text}>{children}</span>;
}
