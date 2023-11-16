import { useEffect, useRef, useState } from "react";
import styles from "./player.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faForward, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";

export default function Player({
    currentTrack,
    isPlaying,
    setIsPlaying,
    nextTrack,
    prevTrack,
}: {
    currentTrack: Track | undefined;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    nextTrack: () => void;
    prevTrack: () => void;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const playPauseHandler = () => {
        if (!audioRef.current) return;

        setIsPlaying(!isPlaying);
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const timeUpdateHandler = () => {
        if (!audioRef.current) return;

        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
    };

    const endedHandler = () => {
        if (!audioRef.current) return;
        nextTrack();
    };

    const calculateProgressBarWidth = () => {
        if (duration > 0) {
            return (currentTime / duration) * 100 + "%";
        } else {
            return "0%";
        }
    };
    return (
        <footer className={styles["player"]}>
            <audio
                ref={audioRef}
                src={currentTrack?.previewURL}
                onTimeUpdate={timeUpdateHandler}
                onTimeUpdateCapture={timeUpdateHandler}
                onEnded={endedHandler}
                autoPlay={isPlaying}
            ></audio>
            <img src={currentTrack?.imageURL} />
            <div className={styles["track-details"]}>
                <div className={styles["track-name"]}>{currentTrack?.name}</div>
                <div className={styles["artist-name"]}>{currentTrack?.artist.name}</div>
            </div>
            <div className={styles["controls"]}>
                <div className={styles["buttons"]}>
                    <button onClick={prevTrack} disabled={currentTrack == undefined}>
                        <FontAwesomeIcon icon={faBackward} />
                    </button>
                    <button onClick={playPauseHandler} disabled={currentTrack == undefined}>
                        {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                    </button>
                    <button onClick={nextTrack} disabled={currentTrack == undefined}>
                        <FontAwesomeIcon icon={faForward} />
                    </button>
                </div>
                <div className={styles["progress-bar"]}>
                    <div
                        className={styles["progress-bar-inner"]}
                        style={{
                            width: calculateProgressBarWidth(),
                        }}
                    ></div>
                    <div style={{ marginTop: "10px" }}>
                        {Math.floor(currentTime)}s / {Math.floor(duration)}s
                    </div>
                </div>
            </div>
        </footer>
    );
}
