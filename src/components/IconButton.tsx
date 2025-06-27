"use client";
import { IconType } from "react-icons";
import styles from "./iconButton.module.scss";

interface IconButtonProps {
  className?: string;
  hoverText?: string;
  icon: IconType;
  disabled?: boolean;
  stopPropagation?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export default function IconButton({
  className,
  icon: Icon,
  hoverText,
  disabled,
  stopPropagation = true,
  onClick
}: IconButtonProps) {
  const clickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) event.stopPropagation();
    if (onClick) onClick(event);
  };

  return (
    <div className={`${styles["button-container"]} ${className ?? ""}`}>
      <button className={styles["icon-button"]} onClick={clickHandler} disabled={disabled}>
        <Icon />
      </button>
      {hoverText && <div className={styles["hover-text"]}>{hoverText}</div>}
    </div>
  );
}
