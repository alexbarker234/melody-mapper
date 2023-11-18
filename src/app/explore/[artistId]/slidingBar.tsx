import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./slidingBar.module.scss";

interface SlidingBarProps {
    children: ReactNode;
    fillPercent: number;
    disabled?: boolean;
    onFillChange?: (percent: number) => void;
    onSlideStart?: () => void;
    onSlideEnd?: () => void;
}

const SlidingBar = ({ children, disabled, fillPercent: progressPercent, onSlideStart, onSlideEnd, onFillChange }: SlidingBarProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // if (!currentTrack) return;
        const handleMouseMove = (event: MouseEvent) => {
            if (isDragging && progressRef.current) {
                const clickX = event.clientX - progressRef.current.getBoundingClientRect().left;
                const elementWidth = progressRef.current.offsetWidth;
                const percentage = clickX / elementWidth;
                if (onFillChange) onFillChange(percentage);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            if (onSlideEnd) onSlideEnd();

            // if (audioRef.current && isPlaying) audioRef.current.play();
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove, true);
            document.addEventListener("mouseup", handleMouseUp, true);
        } else {
            document.removeEventListener("mousemove", handleMouseMove, true);
            document.removeEventListener("mouseup", handleMouseUp, true);
        }
        return () => {
            document.removeEventListener("mousemove", handleMouseMove, true);
            document.removeEventListener("mouseup", handleMouseUp, true);
        };
    }, [isDragging]);

    const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return;
        const clickX = event.clientX - progressRef.current.getBoundingClientRect().left;
        const elementWidth = progressRef.current.offsetWidth;
        const percentage = clickX / elementWidth;
        if (onFillChange) onFillChange(percentage);
        if (onSlideEnd) onSlideEnd();
    };

    return (
        <div className={`${styles["sliding-bar"]} ${disabled ? styles["disabled"] : ""}`} ref={progressRef}>
            <div
                className={styles["sliding-bar-inner"]}
                style={{
                    width: `${progressPercent * 100}%`,
                }}
            />

            <div
                className={styles["sliding-bar-clickable"]}
                onMouseDown={() => {
                    setIsDragging(true);
                    if (onSlideStart) onSlideStart();
                }}
                onClick={handleSeek}
            />
            <div
                className={styles["ball"]}
                style={{
                    left: `${progressPercent * 100}%`,
                }}
            />

            {children}
        </div>
    );
};

export default SlidingBar;
