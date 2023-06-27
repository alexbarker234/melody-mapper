import { getAccessToken, getRelatedArtists } from "@/lib/spotify";
import { NextResponse } from "next/server";

interface Image {
    height: number | null;
    width: number | null;
    url: string;
}

interface Artist {
    id: string;
    name: string;
    popularity: number;
    images: Image[];
}
interface RelatedArtistsResponse {
    artists: Artist[];
}
export async function GET(req: Request) {
    try {
        const {access_token} = (await getAccessToken())

        const seed = "2RVvqRBon9NgaGXKfywDSs";
        
        const queue = [seed]
        const already_queued: {[key: string]: boolean} = {}
        const edges: ArtistEdge[] = []
        const nodes: ArtistNode[] = []
        console.log("test")
    
        const limit = 20;
        var cur = 0;
        while (queue.length > 0 && cur < limit) {
            cur++;
            const artistID = queue.shift()
            if (!artistID) break;
            const resp = await getRelatedArtists(artistID, access_token);
            console.log(`${artistID}: ${resp.status}`)
            if (resp.status != 200) {
                console.log("ERROR!!!!!")
                console.log({artistID, access_token})
                console.log(resp)
                break;
            }
            const json: RelatedArtistsResponse = await resp.json();
    
            json.artists.forEach((relatedArist) => {
                if (!already_queued[relatedArist.id]) {
                    console.log(relatedArist.id, relatedArist.name, relatedArist.images[0].url, relatedArist.popularity)
                    nodes.push({id: relatedArist.id, name: relatedArist.name, imageUrl: relatedArist.images[0].url, popularity: relatedArist.popularity})
                    edges.push({artistID1: artistID, artistID2: relatedArist.id})
                    queue.push(relatedArist.id)
                    already_queued[relatedArist.id] = true;
                }
            }); 
        }
       
        return NextResponse.json({nodes, edges});
    }
    catch (e) {
        console.log(e)
        console.log('failure')
        return NextResponse.json({status: 'error'});
    }
}
