interface ArtistNode {
    id: string;
    name: string;
    popularity: number;
    imageUrl: string;
}
interface ArtistEdge {
    artistID1: string;
    artistID2: string;
}
interface RelatedArtistResponse {
    nodes: ArtistNode[],
    edges: ArtistEdge[]
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
}
interface SpotifyRelatedArtists {
    artists: SpotifyArtist[];
}