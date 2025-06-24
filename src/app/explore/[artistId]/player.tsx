"use client";
import IconButton from "@/components/IconButton";
import { Track } from "@/types/types";
import Image from "next/image";
import {
  RefObject,
  SyntheticEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState
} from "react";
import { FaBackward, FaChevronDown, FaVolumeMute } from "react-icons/fa";
import { FaBars, FaForward, FaPause, FaPlay, FaVolumeHigh, FaVolumeLow, FaVolumeOff } from "react-icons/fa6";
import styles from "./player.module.scss";
import SlidingBar from "./slidingBar";
export type MusicPlayerRef = {
  addToQueue: (tracks: Track[]) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playTrack: (track: Track) => void;
} | null;

export interface PlayerState {
  queue: Track[];
  previouslyPlayed: Track[];
  currentTrack?: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
}

type PlayerAction =
  // QUEUE
  | { type: "SET_QUEUE"; payload: Track[] }
  | { type: "ADD_TO_QUEUE"; payload: Track[] }
  | { type: "CLEAR_QUEUE" }
  // PAUSE / PLAY
  | { type: "PAUSE" }
  | { type: "PLAY" }
  // OTHER
  | { type: "SET_PREVIOUSLY_PLAYED"; payload: Track[] }
  | { type: "SET_CURRENT_TRACK"; payload: Track | undefined }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_MUTED"; payload: boolean };

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    // QUEUE
    case "SET_QUEUE":
      return { ...state, queue: action.payload };
    case "ADD_TO_QUEUE":
      return { ...state, queue: [...state.queue, ...action.payload] };
    case "CLEAR_QUEUE":
      return { ...state, queue: [] };
    // PAUSE / PLAY
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "PLAY":
      return { ...state, isPlaying: true };
    // OTHER
    case "SET_PREVIOUSLY_PLAYED":
      return { ...state, previouslyPlayed: action.payload };
    case "SET_CURRENT_TRACK":
      return { ...state, currentTrack: action.payload };
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "SET_MUTED":
      return { ...state, muted: action.payload };
    default:
      return state;
  }
}

const initialPlayerState: PlayerState = {
  queue: [],
  previouslyPlayed: [],
  currentTrack: undefined,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false
};
interface MusicPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  trackList: Track[];
  setPlayerTrackDetails?: (details: PlayerState) => void;
  queueOpen: boolean;
  setQueueOpen?: (value: boolean) => void;
}
const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(
  ({ trackList, setPlayerTrackDetails, setQueueOpen, queueOpen, ...props }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playerState, dispatch] = useReducer(playerReducer, initialPlayerState);
    const { queue, previouslyPlayed, currentTrack, isPlaying, currentTime, duration, volume, muted } = playerState;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 600);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    // mediasession
    useEffect(() => {
      if (!navigator.mediaSession || !currentTrack) return;
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.artist.name,
        album: currentTrack.album.name,
        artwork: [{ src: currentTrack.imageURL, sizes: "640x640", type: "image/png" }]
      });
      navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("nexttrack", () => _nextTrack());
      navigator.mediaSession.setActionHandler("previoustrack", () => _prevTrack());
    }, [currentTrack]);

    // export track details
    useEffect(() => {
      if (setPlayerTrackDetails) setPlayerTrackDetails(playerState);
    }, [playerState]);

    const playPauseHandler = () => {
      audioRef.current?.[audioRef.current.paused ? "play" : "pause"]();
    };

    const timeUpdateHandler = (event: SyntheticEvent<HTMLAudioElement>) => {
      dispatch({ type: "SET_CURRENT_TIME", payload: event.currentTarget.currentTime });
      dispatch({ type: "SET_DURATION", payload: event.currentTarget.duration });
    };
    const volumeChangeHandler = (event: SyntheticEvent<HTMLAudioElement>) => {
      dispatch({ type: "SET_VOLUME", payload: event.currentTarget.volume });
      dispatch({ type: "SET_MUTED", payload: event.currentTarget.muted });
    };

    // In the handle
    const _nextTrack = () => {
      if (queue.length == 0) {
        dispatch({ type: "SET_CURRENT_TRACK", payload: undefined });
        dispatch({ type: "PAUSE" });

        if (audioRef.current) audioRef.current.pause();
      } else {
        const newQueue = [...queue];
        newQueue.shift();
        dispatch({ type: "SET_QUEUE", payload: newQueue });
        dispatch({ type: "SET_CURRENT_TRACK", payload: queue[0] });
        dispatch({ type: "PLAY" });
      }
    };
    const _playTrack = (track: Track) => {
      dispatch({ type: "SET_CURRENT_TRACK", payload: track });
      dispatch({ type: "PLAY" });
    };
    const _prevTrack = () => {};

    useImperativeHandle(ref, () => ({
      addToQueue: (tracks: Track[]) => dispatch({ type: "ADD_TO_QUEUE", payload: tracks }),
      clearQueue: () => dispatch({ type: "CLEAR_QUEUE" }),
      nextTrack: _nextTrack,
      prevTrack: _prevTrack,
      playTrack: _playTrack
    }));

    return (
      <footer className={styles["player"]}>
        <audio
          ref={audioRef}
          src={currentTrack?.previewURL}
          onTimeUpdate={timeUpdateHandler}
          onTimeUpdateCapture={timeUpdateHandler}
          onVolumeChange={volumeChangeHandler}
          onPlay={() => dispatch({ type: "PLAY" })}
          onPause={() => dispatch({ type: "PAUSE" })}
          onEnded={_nextTrack}
          autoPlay={isPlaying}
        ></audio>
        {isMobile ? (
          <MobilePlayer
            playerState={playerState}
            audioRef={audioRef}
            queueOpen={queueOpen}
            playPauseHandler={playPauseHandler}
            nextTrack={_nextTrack}
            prevTrack={_prevTrack}
            setQueueOpen={setQueueOpen}
          />
        ) : (
          <DesktopPlayer
            playerState={playerState}
            audioRef={audioRef}
            queueOpen={queueOpen}
            playPauseHandler={playPauseHandler}
            nextTrack={_nextTrack}
            prevTrack={_prevTrack}
            setQueueOpen={setQueueOpen}
          />
        )}
      </footer>
    );
  }
);

export default MusicPlayer;

// TODO: probably touch up on the practice here
interface DevicePlayerProps {
  playerState: PlayerState;
  audioRef: RefObject<HTMLAudioElement | null>;
  queueOpen: boolean;
  setQueueOpen?: (value: boolean) => void;
  playPauseHandler: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

const DesktopPlayer = ({
  playerState,
  audioRef,
  queueOpen,
  setQueueOpen,
  playPauseHandler,
  nextTrack,
  prevTrack
}: DevicePlayerProps) => {
  const { queue, previouslyPlayed, currentTrack, isPlaying, currentTime, duration, volume, muted } = playerState;
  return (
    <>
      <div className={styles["img-container"]}>
        {currentTrack && <Image src={currentTrack.imageURL} alt={currentTrack.name} width={640} height={640} />}
      </div>
      <div className={styles["track-details"]}>
        <div className={styles["track-name"]}>{currentTrack?.name}</div>
        <div className={styles["artist-name"]}>{currentTrack?.artist.name}</div>
      </div>
      <div className={styles["controls"]}>
        <div className={styles["buttons"]}>
          {/* <IconButton  onClick={prevTrack} disabled={currentTrack == undefined} icon={faBackward} /> */}
          <IconButton
            onClick={playPauseHandler}
            disabled={currentTrack == undefined}
            icon={isPlaying ? FaPlay : FaPause}
          />
          <IconButton onClick={nextTrack} disabled={currentTrack == undefined} icon={FaForward} />
        </div>
        <SlidingBar
          className={styles["progress-bar"]}
          fillPercent={duration > 0 ? currentTime / duration : 0}
          onFillChange={(percentage: number) =>
            audioRef.current && (audioRef.current.currentTime = audioRef.current.duration * percentage)
          }
          onSlideStart={() => audioRef.current?.pause()}
          onSlideEnd={() => isPlaying && audioRef.current?.play()}
        >
          <div className={styles["current"]}>{Math.floor(currentTime)}s</div>
          <div className={styles["duration"]}>{Math.floor(duration)}s</div>
        </SlidingBar>
        <div className={styles["right-controls"]}>
          <IconButton
            className={`${styles["queue-button"]} ${styles["control-button"]} ${queueOpen ? styles["highlighted"] : ""}`}
            onClick={() => setQueueOpen && setQueueOpen(!queueOpen)}
            icon={FaBars}
            hoverText="Queue"
          />
          <IconButton
            icon={muted ? FaVolumeMute : volume > 0.5 ? FaVolumeHigh : volume > 0 ? FaVolumeLow : FaVolumeOff}
            className={`${styles["volume-button"]} ${styles["control-button"]}`}
            onClick={() => audioRef.current && (audioRef.current.muted = !audioRef.current.muted)}
            hoverText="Mute"
          />
          <SlidingBar
            className={styles["volume-bar"]}
            fillPercent={volume}
            onFillChange={(percentage: number) => audioRef.current && (audioRef.current.volume = percentage)}
          />
        </div>
      </div>
    </>
  );
};
const MobilePlayer = ({
  playerState,
  audioRef,
  queueOpen,
  setQueueOpen,
  playPauseHandler,
  nextTrack,
  prevTrack
}: DevicePlayerProps) => {
  const { queue, previouslyPlayed, currentTrack, isPlaying, currentTime, duration, volume, muted } = playerState;

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={styles["mobile-click-manager"]} onClick={() => currentTrack && setMenuOpen(true)} />
      <div className={styles["img-container"]}>
        {currentTrack && <Image src={currentTrack.imageURL} alt={currentTrack.name} width={640} height={640} />}
      </div>
      <div className={styles["track-details"]}>
        <div className={styles["track-name"]}>{currentTrack?.name}</div>
        <div className={styles["artist-name"]}>{currentTrack?.artist.name}</div>
      </div>
      <div className={styles["controls"]}>
        <SlidingBar
          className={`${styles["progress-bar"]} ${styles["mobile"]}`}
          fillPercent={duration > 0 ? currentTime / duration : 0}
          interactable={false}
        ></SlidingBar>
        <div className={styles["right-controls"]}>
          <IconButton
            className={`${styles["queue-button"]} ${styles["control-button"]} ${queueOpen ? styles["highlighted"] : ""}`}
            onClick={() => setQueueOpen && setQueueOpen(!queueOpen)}
            icon={FaBars}
          />
          <IconButton
            className={styles["control-button"]}
            onClick={playPauseHandler}
            disabled={currentTrack == undefined}
            icon={isPlaying ? FaPause : FaPlay}
          />
        </div>
      </div>
      <div className={`${styles["mobile-screen"]} ${menuOpen ? styles["open"] : ""}`}>
        <IconButton className={styles["screen-close"]} onClick={() => setMenuOpen(false)} icon={FaChevronDown} />
        <div className={styles["img-container"]}>
          {currentTrack && <Image src={currentTrack.imageURL} alt={currentTrack.name} width={640} height={640} />}
        </div>
        <div className={styles["bottom-container"]}>
          <div className={styles["track-details"]}>
            <div className={styles["track-name"]}>{currentTrack?.name}</div>
            <div className={styles["artist-name"]}>{currentTrack?.artist.name}</div>
          </div>
          <div className={styles["buttons"]}>
            <IconButton onClick={prevTrack} disabled={currentTrack == undefined} icon={FaBackward} />
            <IconButton
              onClick={playPauseHandler}
              disabled={currentTrack == undefined}
              icon={isPlaying ? FaPause : FaPlay}
            />
            <IconButton onClick={nextTrack} disabled={currentTrack == undefined} icon={FaForward} />
          </div>
        </div>
      </div>
    </>
  );
};
