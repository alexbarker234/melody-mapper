import { getRelatedArtists } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get("id");
        if (!artistId) return NextResponse.json({ error: "no id supplied" }, { status: 400 });

        const artists: Artist[] = [];

        const resp = await getRelatedArtists(artistId);

        if (resp.status >= 400) {
            console.log("ERROR!!!!!");
            console.log({ artistId });
            console.log(resp);
            return NextResponse.json({ error: "error" }, { status: resp.status });
        }

        const json: SpotifyArtistsResponse = await resp.json();

        json.artists.forEach((relatedArist) => {
            const artist: Artist = {
                id: relatedArist.id,
                name: relatedArist.name,
                imageURL: relatedArist.images[0].url,
                popularity: relatedArist.popularity,
                link: relatedArist.external_urls.spotify,
            };
            artists.push(artist);
        });

        return NextResponse.json(artists);
    } catch (e) {
        console.log(e);
        console.log("failure");
        return NextResponse.json({ status: "error" });
    }
}
