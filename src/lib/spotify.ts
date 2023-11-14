import querystring from 'querystring';
 
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;
 
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
 
export const getAccessToken = async () => {
    const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: querystring.stringify({
            grant_type: "refresh_token",
            refresh_token,
        }),
        //cache: 'no-store'
        next: {
            revalidate: 60 * 45
        }
    });
    
    return response.json();
};

const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`;
 
export const getTopTracks = async () => {
    const { access_token } = await getAccessToken();

    return fetch(TOP_TRACKS_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

const getArtistEndpoint = (artistId: string) => `https://api.spotify.com/v1/artists/${artistId}`;

export const getArtist = async (artistId: string, accessToken: string | undefined = undefined) => {
    if (!accessToken) {
        const resp = await getAccessToken();
        accessToken = resp.access_token
    }
    console.log(getArtistEndpoint(artistId))
    return fetch(getArtistEndpoint(artistId), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        next: {
            revalidate: 60 * 60 * 24
        }
    });
};

const getRelatedArtistsEndpoint = (artistId: string) => `https://api.spotify.com/v1/artists/${artistId}/related-artists`;

export const getRelatedArtists = async (artistId: string, accessToken: string | undefined = undefined) => {
    if (!accessToken) {
        const resp = await getAccessToken();
        accessToken = resp.access_token
    }
    console.log(getRelatedArtistsEndpoint(artistId))
    return fetch(getRelatedArtistsEndpoint(artistId), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
};