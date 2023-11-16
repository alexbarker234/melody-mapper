"use client";
import { useState } from "react";
import SearchBox from "@/components/searchBox";
import styles from "./artistSearch.module.scss";
import Loading from "./loading";

export default function ArtistSearch() {
    const [artistList, setArtistList] = useState<Artist[]>([]);
    const [searchState, setState] = useState<"ok" | "searching" | "error">("ok");

    const search = async (searchText: string) => {
        if (searchState == 'searching') return;
        setState("searching");

        const response = await fetch(`/api/search?query=${searchText}`);
        if (!response.ok) {
            setState("error");
            return;
        }

        const data = await response.json();

        setArtistList(data);
        setState("ok");
    };

    return (
        <>
            <SearchBox runSearch={search} />
            {searchState === "error" ? <div className={styles["error"]}>!</div> : <ArtistList items={artistList} isLoading={searchState === "searching"}></ArtistList>}
        </>
    );
}

function ArtistList({ items, isLoading }: { items: Artist[]; isLoading: boolean }) {
    if (isLoading)
        return (
            <div className={styles["items-container"]}>
                <Loading style={{margin: 'auto'}}/>
            </div>
        );

    return (
        <div className={styles["items-container"]}>
            {items.length > 0 ? (
                items.map((artist, index) => {
                    return (
                        <div key={Math.random()} className={styles["item-box"]} style={{ animationDelay: `${index * 0.05}s` }}>
                            <a href={`/explore/${artist.id}`}>
                                <img src={artist.imageURL} alt="artist" />
                            </a>
                            <div>{artist.name}</div>
                        </div>
                    );
                })
            ) : (
                <div className={styles["placeholder"]}>Search for artists!</div>
            )}
        </div>
    );
}