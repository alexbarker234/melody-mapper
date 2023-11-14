import { getArtist } from "@/lib/spotify";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const artistId = searchParams.get("id");
        if (!artistId) return  NextResponse.json({ error: "no id supplied" }, { status: 400 });;

        const resp = await getArtist(artistId);
        if (resp.status != 200) {
            console.log("ERROR!!!!!");
            console.log({ artistId });
            console.log(resp);
            return NextResponse.json({ error: "error" }, { status: resp.status });
        }
        const artist: SpotifyArtist = await resp.json();

        return NextResponse.json({id: artist.id, name: artist.name, imageUrl: artist.images[0].url, popularity: artist.popularity});
    } catch (e) {
        console.log(e);
        console.log("failure");
        return NextResponse.json({ status: "error" });
    }
}
