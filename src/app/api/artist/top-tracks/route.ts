import { getArtistTopTracks } from "@/lib/spotify";
import { SpotifyTrackResponse } from "@/types/spotifyTypes";
import { ErrorResponse, Track } from "@/types/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("id");
    if (!artistId) return NextResponse.json({ error: "no id supplied" }, { status: 400 });

    const spotifyResponse = await getArtistTopTracks(artistId);
    if (spotifyResponse.status >= 400) {
      console.log(spotifyResponse);
      const response: ErrorResponse = { error: "request error" };
      return NextResponse.json(response, { status: spotifyResponse.status });
    }
    const spotifyTracks: SpotifyTrackResponse = await spotifyResponse.json();

    const response: Track[] = spotifyTracks.tracks.map((spotifyTrack) => {
      const track: Track = {
        id: spotifyTrack.id,
        name: spotifyTrack.name,
        link: spotifyTrack.external_urls.spotify,
        imageURL: spotifyTrack.album.images.length > 0 ? spotifyTrack.album.images[0].url : "",
        previewURL: spotifyTrack.preview_url || "",
        album: {
          name: spotifyTrack.album.name
        },
        artist: {
          name: spotifyTrack.artists.length > 0 ? spotifyTrack.artists[0].name : ""
        }
      };
      return track;
    });
    return NextResponse.json(response);
  } catch (e) {
    console.log(e);
    const response: ErrorResponse = { error: "internal error" };
    return NextResponse.json(response, { status: 500 });
  }
}
