import { getTopTracks } from "@/lib/spotify";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const response = await getTopTracks();
    const { items } = await response.json();
   
    const tracks = items.slice(0, 10).map((track: any) => ({
      artist: track.artists.map((_artist: any) => _artist.name).join(', '),
      songUrl: track.external_urls.spotify,
      title: track.name,
    }));
   
    return NextResponse.json(tracks);
}
