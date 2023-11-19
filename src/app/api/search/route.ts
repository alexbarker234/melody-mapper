import { searchArtists } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");
        if (!query) return NextResponse.json({ error: "no query supplied" }, { status: 400 });

        const artists: Artist[] = [];

        const resp = await searchArtists(query);

        if (resp.status >= 400) {
            console.log("ERROR!!!!!");
            console.log(query);
            console.log(resp);
            return NextResponse.json({ error: "error" }, { status: resp.status });
        }

        const json: SpotifySearchResponse = await resp.json();

        json.artists.items.forEach((relatedArist) => {
            const artist: Artist = {
                id: relatedArist.id,
                name: relatedArist.name,
                imageURL: relatedArist.images.length > 0 ? relatedArist.images[0].url: "",
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
