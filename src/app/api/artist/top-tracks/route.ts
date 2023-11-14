import { getArtist, getArtistTopTracks } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get("id");
        if (!artistId) return NextResponse.json({ error: "no id supplied" }, { status: 400 });

        const resp = await getArtistTopTracks(artistId);
        if (resp.status != 200) {
            console.log("ERROR!!!!!");
            console.log({ artistId });
            console.log(resp);
            return NextResponse.json({ error: "error" }, { status: resp.status });
        }
        const spotifyTracks: SpotifyTrackResponse = await resp.json();

        const response: Track[] = spotifyTracks.tracks.map((spotifyTrack) => {
            const track: Track = {
                id: spotifyTrack.id,
                name: spotifyTrack.name,
                link: spotifyTrack.external_urls.spotify,
                imageURL: spotifyTrack.album.images.length > 0 ? spotifyTrack.album.images[0].url : "",
                previewURL: spotifyTrack.preview_url || "",
                album: {
                    name: spotifyTrack.album.name,
                },
                artist: {
                    name: spotifyTrack.artists.length > 0 ? spotifyTrack.artists[0].name : "",
                },
            };
            return track;
        });
        return NextResponse.json(response);
    } catch (e) {
        console.log(e);
        console.log("failure");
        return NextResponse.json({ status: "error" });
    }
}
