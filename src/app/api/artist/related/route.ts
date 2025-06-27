import { getSimilarArtists } from "@/lib/lastfm";
import { searchArtists } from "@/lib/spotify";
import { Artist, ErrorResponse } from "@/types/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const artistName = searchParams.get("artistName");
    if (!artistName) return NextResponse.json({ error: "No artist name supplied" }, { status: 400 });

    const artists: Artist[] = [];

    const similarArtists = await getSimilarArtists(artistName);
    const spotifyArtists = await Promise.all(
      similarArtists.similarartists.artist.map(async (relatedArtist) => {
        const spotifyResponse = await searchArtists(relatedArtist.name);
        const spotifyJson = await spotifyResponse.json();
        const spotifyArtist = spotifyJson.artists.items[0];

        if (!spotifyArtist) {
          console.warn(`No matching Spotify artist found for: ${relatedArtist.name}`);
          return null;
        }

        return {
          lastfmName: relatedArtist.name,
          spotifyArtist: spotifyArtist
        };
      })
    );

    similarArtists.similarartists.artist.forEach((relatedArtist) => {
      const matchingSpotifyData = spotifyArtists.find((data) => data?.lastfmName === relatedArtist.name);
      const artist: Artist = {
        id: matchingSpotifyData?.spotifyArtist.id || relatedArtist.url,
        name: relatedArtist.name,
        imageURL: matchingSpotifyData?.spotifyArtist.images[0]?.url ?? "",
        popularity: matchingSpotifyData?.spotifyArtist.popularity ?? 0,
        link: relatedArtist.url
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
