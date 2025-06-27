"use client";
import { Track } from "@/types/types";
import Image from "next/image";
import styles from "./trackItem.module.scss";

interface TrackItemProps {
  track: Track;
  onClick?: (event: React.MouseEvent) => void;
}

export default function TrackItem({ track, onClick }: TrackItemProps) {
  return (
    <div className={`${styles["track-item"]} ${onClick ? styles["interactable"] : ""}`} onClick={onClick}>
      <Image
        className={styles["track-image"]}
        src={track.imageURL}
        alt={track.name}
        width={640}
        height={640}
        draggable={false}
      />
      <div className={styles["track-details"]}>{track.name}</div>
    </div>
  );
}
