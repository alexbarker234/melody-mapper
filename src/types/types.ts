export interface Artist {
    id: string;
    name: string;
    popularity: number;
    imageURL: string;
    link: string;
}

export interface Track {
    id: string;
    name: string;
    link: string;
    imageURL: string;
    previewURL: string;
    album: {
        name: string;
    };
    artist: {
        name: string;
    };
}

export interface ErrorResponse {
    error: string;
}
