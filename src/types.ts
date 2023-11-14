interface Artist {
    id: string;
    name: string;
    popularity: number;
    imageURL: string;
    link: string;
}

interface Track {
    id: string;
    name: string;
    link: string;
    imageURL: string;
    previewURL: string;
    album: {
        name: string;
    }
    artist: {
        name: string;
    }
}

// SPOTIFY

interface SpotifyImage {
    height: number | null;
    width: number | null;
    url: string;
}

interface SpotifyArtist {
    id: string;
    name: string;
    popularity: number;
    images: SpotifyImage[];
    uri: string;
    external_urls: {
        spotify: string;
    };
}
interface SpotifyRelatedArtists {
    artists: SpotifyArtist[];
}
interface SpotifyTrack {
    album: {
        album_type: string;
        total_tracks: number;
        available_markets: string[];
        external_urls: {
            spotify: string;
        };
        href: string;
        id: string;
        images: SpotifyImage[];
        name: string;
        release_date: string;
        release_date_precision: string;
        restrictions: {
            reason: string;
        };
        type: string;
        uri: string;
        artists: {
            external_urls: {
                spotify: string;
            };
            href: string;
            id: string;
            name: string;
            type: string;
            uri: string;
        }[];
    };
    artists: {
        external_urls: {
            spotify: string;
        };
        followers: {
            href: string;
            total: number;
        };
        genres: string[];
        href: string;
        id: string;
        images: SpotifyImage[];
        name: string;
        popularity: number;
        type: string;
        uri: string;
    }[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
        isrc: string;
        ean: string;
        upc: string;
    };
    external_urls: {
        spotify: string;
    };
    href: string;
    id: string;
    is_playable: boolean;
    linked_from: {};
    restrictions: {
        reason: string;
    };
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
    is_local: boolean;
}

interface SpotifyTrackResponse {
    tracks: SpotifyTrack[];
}