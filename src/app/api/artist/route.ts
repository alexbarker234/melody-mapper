import { getArtist } from "@/lib/spotify";
import { SpotifyArtist } from "@/types/spotifyTypes";
import { Artist, ErrorResponse } from "@/types/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("id");
    if (!artistId) return NextResponse.json({ error: "no id supplied" }, { status: 400 });

    const spotifyResponse = await getArtist(artistId);
    if (spotifyResponse.status >= 400) {
      console.log(spotifyResponse);
      const response: ErrorResponse = { error: "request error" };
      return NextResponse.json(response, { status: spotifyResponse.status });
    }

    const artist: SpotifyArtist = await spotifyResponse.json();

    const response: Artist = {
      id: artist.id,
      name: artist.name,
      imageURL: artist.images[0].url,
      popularity: artist.popularity,
      link: artist.external_urls.spotify
    };
    return NextResponse.json(response);
  } catch (e) {
    console.log(e);
    const response: ErrorResponse = { error: "internal error" };
    return NextResponse.json(response, { status: 500 });
  }
}
