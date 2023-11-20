"use client"
import Image from "next/image";
import styles from "./page.module.scss";

interface TrackItemProps {
    track: Track;
    onDoubleClick?: (event: React.MouseEvent) => void;
}

export default function TrackItem({track, onDoubleClick} : TrackItemProps) {
    return (
        <div key={track.id} className={`${styles["track-item"]} ${onDoubleClick ? styles["interactable"]: ""}`} onDoubleClick={onDoubleClick}>
            <Image className={styles["track-image"]} src={track.imageURL} alt={track.name} width={640} height={640} draggable={false}/>
            <div className={styles["track-details"]}>{track.name}</div>
        </div>
    );
}