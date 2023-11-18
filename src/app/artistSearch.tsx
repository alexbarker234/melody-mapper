"use client";
import { useState } from "react";
import SearchBox from "@/components/searchBox";
import styles from "./artistSearch.module.scss";
import Loading from "./loading";
import Image from "next/image";

export default function ArtistSearch() {
    const [artistList, setArtistList] = useState<Artist[]>([]);
    const [searchState, setState] = useState<"ok" | "searching" | "error">("ok");

    const search = async (searchText: string) => {
        if (searchState == "searching") return;
        setState("searching");

        // bug where token is fetched from cache first time
        let attempts = 0;
        let response: Response | undefined;
        while (attempts < 2) {
            response = await fetch(`/api/search?query=${searchText}`);
            attempts++;
            if (response.ok) break;
        }
        if (!response?.ok) {
            setState("error");
            return;
        }

        const data: Artist[] = await response.json();

        setArtistList(data);
        setState("ok");
    };

    return (
        <>
            <SearchBox runSearch={search} />
            {searchState === "error" ? (
                <div className={styles["error"]}>!</div>
            ) : (
                <ArtistList items={artistList} isLoading={searchState === "searching"}></ArtistList>
            )}
        </>
    );
}

function ArtistList({ items, isLoading }: { items: Artist[]; isLoading: boolean }) {
    if (isLoading)
        return (
            <div className={styles["items-container"]}>
                <Loading style={{ margin: "auto" }} />
            </div>
        );

    return (
        <div className={styles["items-container"]}>
            {items.length > 0 ? (
                items.map((artist, index) => {
                    return (
                        <div key={Math.random()} className={styles["item-box"]} style={{ animationDelay: `${index * 0.05}s` }}>
                            <a href={`/explore/${artist.id}`}>
                                <Image src={artist.imageURL} alt="artist" width={640} height={640}/>
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
