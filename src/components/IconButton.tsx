import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./iconButton.module.scss";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useState } from "react";

interface IconButtonProps {
    className?: string;
    hoverText?: string;
    icon: IconDefinition;
    disabled?: boolean
    onClick?: (event: React.MouseEvent) => void;
}

export default function IconButton({ className, icon, hoverText, disabled, onClick }: IconButtonProps) {
    return (
        <div className={`${styles["button-container"]} ${className ?? ""}`}>
            <button className={styles["icon-button"]} onClick={onClick} disabled={disabled}>
                <FontAwesomeIcon icon={icon} />
            </button>
            {hoverText && <div className={styles["hover-text"]}>{hoverText}</div>}
        </div>
    );
}
