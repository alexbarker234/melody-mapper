"use client";
import Loading from "@/app/loading";
import IconButton from "@/components/IconButton";
import { Artist, Track } from "@/types/types";
import Image from "next/image";
import { use, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ArtistNodeGraph } from "./graph";
import styles from "./page.module.scss";
import MusicPlayer, { MusicPlayerRef, PlayerState } from "./player";
import TrackItem from "./trackItem";

export default function ArtistExplorer(props: { params: Promise<{ artistId: string }> }) {
  const params = use(props.params);
  // graph
  const [artistData, setArtistData] = useState<{ [key: string]: Artist }>({});
  const [selectedArtistId, setSelectedArtistId] = useState<string>(params.artistId);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const graphDivRef = useRef<HTMLDivElement>(null);
  // side bar
  const [sideBarScreen, setSideBarScreen] = useState<"artist" | "queue">("artist");
  // music player
  const musicPlayerRef = useRef<MusicPlayerRef>(null);
  const [playerTrackDetails, setPlayerTrackDetails] = useState<PlayerState>();
  // mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isSideBarOpen, setSideBarOpen] = useState(false);

  // update mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Only add artist data that isnt already in
  const addArtists = (artists: Artist[]) => {
    const newData = { ...artistData };
    artists.forEach((newArtist) => !artistData[newArtist.id] && (newData[newArtist.id] = newArtist));
    setArtistData(newData);
  };

  // Responsive graph
  useEffect(() => {
    const handleResize = () => {
      if (!graphDivRef.current) return;
      setDimensions({ width: graphDivRef.current.clientWidth, height: graphDivRef.current.clientHeight });
    };
    handleResize();
    graphDivRef.current?.addEventListener("resize", handleResize);
    return () => {
      graphDivRef.current?.removeEventListener("resize", handleResize);
    };
  }, [graphDivRef]);

  // On new artist selected
  useEffect(() => {
    const fetchData = async () => {
      const topTracksResp = await fetch(`/api/artist/top-tracks?id=${selectedArtistId}`);
      const topTracks: Track[] = await topTracksResp.json();
      setTrackList(topTracks);
    };
    console.log(`querying ${selectedArtistId}`);
    if (selectedArtistId) {
      setTrackList([]);
      setSideBarScreen("artist");
      // setSideBarOpen(true);
      fetchData();
    }
  }, [selectedArtistId]);

  const playSong = (track: Track, index: number) => {
    if (!musicPlayerRef.current) return;
    musicPlayerRef.current.playTrack(track);
    musicPlayerRef.current.clearQueue();
    musicPlayerRef.current.addToQueue(trackList.slice(index + 1, trackList.length - 1));
  };

  const playSongFromQueue = (track: Track, index: number) => {
    if (!musicPlayerRef.current || !playerTrackDetails) return;
    musicPlayerRef.current.playTrack(track);
    musicPlayerRef.current.clearQueue();
    musicPlayerRef.current.addToQueue(playerTrackDetails.queue.slice(index + 1, playerTrackDetails.queue.length - 1));
  };

  const selectedArtist = artistData[selectedArtistId];
  console.log(selectedArtist);
  return (
    <main className={styles["page"]}>
      <div className={styles["main-section"]}>
        <div ref={graphDivRef} className={styles["artist-explorer"]}>
          <ArtistNodeGraph
            selectedArtist={selectedArtist}
            setSelectedArtist={setSelectedArtistId}
            addArtistData={addArtists}
            width={dimensions.width}
            height={dimensions.height}
            seedId={params.artistId}
          />
        </div>
        {isMobile && (
          <div className={styles["mobile-top-title"]}>
            <button onClick={() => setSideBarOpen(true)}>
              <div className={styles["artist-title"]}>{selectedArtist?.name}</div>
              <FaChevronRight className={styles["forward-button"]} />
            </button>
          </div>
        )}
        <div className={`${styles["side-bar"]} ${isSideBarOpen ? styles["focus"] : ""}`}>
          {isMobile && (
            <IconButton className={styles["back-button"]} icon={FaChevronLeft} onClick={() => setSideBarOpen(false)} />
          )}
          {sideBarScreen == "artist" ? (
            <ArtistScreen artist={selectedArtist} trackList={trackList} playSong={playSong} />
          ) : (
            <QueueScreen
              queue={playerTrackDetails?.queue ?? []}
              currentTrack={playerTrackDetails?.currentTrack}
              playSong={playSongFromQueue}
            />
          )}
        </div>
      </div>
      <MusicPlayer
        ref={musicPlayerRef}
        trackList={trackList}
        setPlayerTrackDetails={setPlayerTrackDetails}
        queueOpen={sideBarScreen == "queue"}
        setQueueOpen={(value) => {
          setSideBarScreen(value ? "queue" : "artist");
          setSideBarOpen(true);
        }}
      />
    </main>
  );
}
interface ArtistScreen {
  artist: Artist;
  trackList: Track[];
  playSong: (track: Track, index: number) => void;
}

const ArtistScreen = ({ artist, trackList, playSong }: ArtistScreen) => {
  if (!artist) return <Loading style={{ top: "50%" }} />;
  return (
    <>
      <Image className={styles["artist-image"]} src={artist.imageURL} alt={artist.name} width={640} height={640} />
      <div className={styles["artist-title"]}>
        <a href={artist.link}>{artist.name}</a>
      </div>
      <div className={styles["tracks"]}>
        {trackList.length > 0 ? (
          trackList.map((track, index) => (
            <TrackItem key={track.id} onClick={() => playSong(track, index)} track={track} />
          ))
        ) : (
          <Loading style={{ marginTop: "2rem" }} />
        )}
      </div>
    </>
  );
};

interface QueueScreen {
  currentTrack: Track | undefined;
  queue: Track[];
  playSong: (track: Track, index: number) => void;
}

const QueueScreen = ({ currentTrack, queue, playSong }: QueueScreen) => {
  return (
    <div className={styles["queue-screen"]}>
      <h1>Queue</h1>
      <h2>Now playing:</h2>
      {currentTrack && <TrackItem key={currentTrack.id} track={currentTrack} />}
      <h2>Next up:</h2>
      <div className={styles["queue"]}>
        {queue.map((track, index) => (
          <TrackItem key={track.id} onClick={() => playSong(track, index)} track={track} />
        ))}
      </div>
    </div>
  );
};
