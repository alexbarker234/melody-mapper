import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import styles from "./player.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackward, faForward, faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import SlidingBar from "./slidingBar";

export type MusicPlayerRef = {
    addToQueue: (tracks: Track[]) => void;
    clearQueue: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
    playTrack: (track: Track) => void;
} | null;

interface MusicPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
    trackList: Track[];
}

const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(({ trackList, ...props }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [queue, setQueue] = useState<Track[]>([]);
    const [previouslyPlayed, setPreviouslyPlayed] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track>();
    const [isPlaying, setIsPlaying] = useState(false);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // mediasession
    useEffect(() => {
        // Set up Media Session API here
        if (!navigator.mediaSession || !currentTrack) return;
        navigator.mediaSession.metadata = new window.MediaMetadata({
            title: currentTrack.name,
            artist: currentTrack.artist.name,
            album: currentTrack.album.name,
            artwork: [{ src: currentTrack.imageURL, sizes: "640x640", type: "image/png" }],
        });
        navigator.mediaSession.setActionHandler("play", () => {
            if (audioRef.current) audioRef.current.play();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            if (audioRef.current) audioRef.current.pause();
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
            _nextTrack();
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
            _prevTrack();
        });
    }, [currentTrack]);

    const playPauseHandler = () => {
        if (!audioRef.current) return;

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
        _nextTrack();
    };

    // In the handle
    const _addTracksToQueue = (tracks: Track[]) => {
        setQueue((prevQueue) => [...prevQueue, ...tracks]);
    };
    const _clearQueue = () => setQueue([]);

    const _nextTrack = () => {
        if (queue.length == 0) {
            setCurrentTrack(undefined);
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
            return;
        }
        const newQueue = [...queue];
        newQueue.shift();
        setQueue(newQueue);
        setCurrentTrack(queue[0]);
        setIsPlaying(true);
    };
    const _playTrack = (track: Track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };
    const _prevTrack = () => {};

    useImperativeHandle(ref, () => ({
        addToQueue: _addTracksToQueue,
        clearQueue: _clearQueue,
        nextTrack: _nextTrack,
        prevTrack: _prevTrack,
        playTrack: _playTrack,
    }));

    return (
        <footer className={styles["player"]}>
            <audio
                ref={audioRef}
                src={currentTrack?.previewURL}
                onTimeUpdate={timeUpdateHandler}
                onTimeUpdateCapture={timeUpdateHandler}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
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
                    <button onClick={_prevTrack} disabled={currentTrack == undefined}>
                        <FontAwesomeIcon icon={faBackward} />
                    </button>
                    <button onClick={playPauseHandler} disabled={currentTrack == undefined}>
                        {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                    </button>
                    <button onClick={_nextTrack} disabled={currentTrack == undefined}>
                        <FontAwesomeIcon icon={faForward} />
                    </button>
                </div>
                <SlidingBar
                    fillPercent={duration > 0 ? currentTime / duration : 0}
                    onFillChange={(percentage: number) => audioRef.current && (audioRef.current.currentTime = audioRef.current.duration * percentage)}
                    onSlideStart={() => audioRef.current?.pause()}
                    onSlideEnd={() => isPlaying && audioRef.current?.play()}
                >
                    <div className={styles["current"]}>{Math.floor(currentTime)}s</div>
                    <div className={styles["duration"]}>{Math.floor(duration)}s</div>
                </SlidingBar>
            </div>
        </footer>
    );
});

export default MusicPlayer