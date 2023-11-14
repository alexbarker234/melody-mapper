import { getRelatedArtists } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get("id");
        if (!artistId) return  NextResponse.json({ error: "no id supplied" }, { status: 400 });;

        const artists: ArtistNode[] = [];

        const resp = await getRelatedArtists(artistId);

        if (resp.status != 200) {
            console.log("ERROR!!!!!");
            console.log({ artistId });
            console.log(resp);
            return NextResponse.json({ error: "error" }, { status: resp.status });
        }

        const json: SpotifyRelatedArtists = await resp.json();

        json.artists.forEach((relatedArist) => {
            artists.push({id: relatedArist.id, name: relatedArist.name, imageUrl: relatedArist.images[0].url, popularity: relatedArist.popularity});
        });

        return NextResponse.json(artists);
    } catch (e) {
        console.log(e);
        console.log("failure");
        return NextResponse.json({ status: "error" });
    }
}
