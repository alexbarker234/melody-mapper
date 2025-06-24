"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./iconButton.module.scss";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface IconButtonProps {
  className?: string;
  hoverText?: string;
  icon: IconDefinition;
  disabled?: boolean;
  stopPropagation?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export default function IconButton({
  className,
  icon,
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
        <FontAwesomeIcon icon={icon} />
      </button>
      {hoverText && <div className={styles["hover-text"]}>{hoverText}</div>}
    </div>
  );
}
