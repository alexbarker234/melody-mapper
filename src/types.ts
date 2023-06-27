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