"use client";
import { ReactEventHandler, useEffect, useRef, useState } from "react";
import { ArtistNodeGraph } from "./graph";
import styles from "./page.module.scss";
import Player from "./player";

export default function ArtistExplorer({ params }: { params: { artistId: string } }) {
    // graph
    const [artistData, setArtistData] = useState<{ [key: string]: Artist }>({});
    const [selectedArtistId, setSelectedArtist] = useState<string>(params.artistId);
    const [trackList, setTrackList] = useState<Track[]>([]);
    const [dimensions, setDimensions] = useState<{width: number, height: number}>({width:0,height:0})
    const graphDivRef = useRef<HTMLDivElement>(null); 
    // music player
    const [queue, setQueue] = useState<Track[]>([]);
    const [previouslyPlayed, setPreviouslyPlayed] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track>();
    const [isPlaying, setIsPlaying] = useState(false);

    // Only add artist data that isnt already in
    const addArtists = (artists: Artist[]) => {
        const newData = { ...artistData };
        artists.forEach((newArtist) => !artistData[newArtist.id] && (newData[newArtist.id] = newArtist));
        setArtistData(newData);
    };

    useEffect(() => {
        const handleResize = () => {
            if (!graphDivRef.current) return
            setDimensions({width: graphDivRef.current.clientWidth, height:  graphDivRef.current.clientHeight})
        };
        handleResize()
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            const topTracksResp = await fetch(`/api/artist/top-tracks?id=${selectedArtistId}`);
            const topTracks: Track[] = await topTracksResp.json();
            setTrackList(topTracks);
        };

        if (selectedArtistId) {
            setTrackList([]);
            fetchData();
        }
    }, [selectedArtistId]);

    const addTracksToQueue = (tracks: Track[]) => {
        setQueue((prevQueue) => [...prevQueue, ...tracks]);
    };
    const nextTrack = () => {
        const newQueue = [...queue]
        newQueue.shift();
        setQueue(newQueue)
        setCurrentTrack(queue[0])
        setIsPlaying(true)
    }
    const playTrack = (track: Track, index: number)  => {
        setCurrentTrack(track)
        setIsPlaying(true)
        setQueue(trackList.slice(index + 1, trackList.length - 1))
    }
    const prevTrack = () => {

    }

    const selectedArtist = artistData[selectedArtistId];

    return (
        <main className={styles["page"]}>
            <div className={styles["main-section"]}>
                <div ref={graphDivRef} className={styles["artist-explorer"]}>
                    <ArtistNodeGraph setSelectedArtist={setSelectedArtist} addArtistData={addArtists} width={dimensions.width} height={dimensions.height} seedId={params.artistId}/>
                </div>
                <div className={styles["side-bar"]}>
                    {selectedArtist && (
                        <>
                            <img className={styles["artist-image"]} src={selectedArtist.imageURL} />
                            <div className={styles["artist-title"]}>
                                <a href={selectedArtist.link}>{selectedArtist.name}</a>
                            </div>
                            <div className={styles["tracks"]}>
                                {trackList.length > 0 ? (
                                    trackList.map((track, index) => (
                                        <div key={track.id} className={styles["track-item"]} onDoubleClick={() => playTrack(track, index)}>
                                            <img className={styles["track-image"]} src={track.imageURL} alt={track.name} />
                                            <div className={styles["track-details"]}>
                                                {track.name}                  
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>Loading...</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Player currentTrack={currentTrack} setIsPlaying={setIsPlaying} isPlaying={isPlaying} nextTrack={nextTrack} prevTrack={prevTrack} />
        </main>
    );
}
