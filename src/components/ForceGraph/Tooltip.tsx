import React from "react";
import styles from "./ForceGraph.module.scss";

interface TooltipProps {
  isVisible: boolean;
  text: string;
  position: { x: number; y: number };
}

export const Tooltip: React.FC<TooltipProps> = ({ isVisible, text, position }) => {
  return (
    <div
      className={`${styles.tooltip} ${styles.tooltipVisible}`}
      style={{
        left: position.x + "px",
        top: position.y + "px",
        opacity: isVisible ? 1 : 0
      }}
    >
      {text}
    </div>
  );
};
