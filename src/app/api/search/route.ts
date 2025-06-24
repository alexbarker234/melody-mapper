import { searchArtists } from "@/lib/spotify";
import { SpotifySearchResponse } from "@/types/spotifyTypes";
import { Artist, ErrorResponse } from "@/types/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    if (!query) return NextResponse.json({ error: "no query supplied" }, { status: 400 });

    const artists: Artist[] = [];

    const spotifyResponse = await searchArtists(query);
    if (spotifyResponse.status >= 400) {
      console.log(spotifyResponse);
      const response: ErrorResponse = { error: "request error" };
      return NextResponse.json(response, { status: spotifyResponse.status });
    }

    const json: SpotifySearchResponse = await spotifyResponse.json();

    json.artists.items.forEach((relatedArist) => {
      const artist: Artist = {
        id: relatedArist.id,
        name: relatedArist.name,
        imageURL: relatedArist.images.length > 0 ? relatedArist.images[0].url : "",
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
