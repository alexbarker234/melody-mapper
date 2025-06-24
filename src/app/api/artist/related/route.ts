import { getRelatedArtists } from "@/lib/spotify";
import { SpotifyArtistsResponse } from "@/types/spotifyTypes";
import { Artist, ErrorResponse } from "@/types/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("id");
    if (!artistId) return NextResponse.json({ error: "no id supplied" }, { status: 400 });

    const artists: Artist[] = [];

    const spotifyResponse = await getRelatedArtists(artistId);

    if (spotifyResponse.status >= 400) {
      console.log(spotifyResponse);
      const response: ErrorResponse = { error: "request error" };
      return NextResponse.json(response, { status: spotifyResponse.status });
    }

    const json: SpotifyArtistsResponse = await spotifyResponse.json();

    json.artists.forEach((relatedArist) => {
      const artist: Artist = {
        id: relatedArist.id,
        name: relatedArist.name,
        imageURL: relatedArist.images[0].url,
        popularity: relatedArist.popularity,
        link: relatedArist.external_urls.spotify
      };
      artists.push(artist);
    });

    return NextResponse.json(artists);
  } catch (e) {
    console.log(e);
    const response: ErrorResponse = { error: "internal error" };
    return NextResponse.json(response, { status: 500 });
  }
}
