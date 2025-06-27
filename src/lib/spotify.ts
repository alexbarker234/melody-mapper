import { SpotifyTrackResponse } from "@/types/spotifyTypes";
import querystring from "querystring";
import { getManySpotifyPreviewURLs } from "./spotifyPreviewService";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: querystring.stringify({
      grant_type: "client_credentials"
    }),
    next: {
      revalidate: 60 * 45
    }
  });

  const data = await response.json();

  return data;
};

export const getArtist = async (artistId: string, accessToken?: string) =>
  getFromSpotify(`https://api.spotify.com/v1/artists/${artistId}`, { accessToken });

export const getArtistTopTracks = async (artistId: string, accessToken?: string): Promise<SpotifyTrackResponse> => {
  const topTracks = await getFromSpotify(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=AU`, {
    accessToken
  });
  const topTracksJson: SpotifyTrackResponse = await topTracks.json();

  const startTime = performance.now();
  const previewURLs = await getManySpotifyPreviewURLs(topTracksJson.tracks.map((track) => track.external_urls.spotify));
  const endTime = performance.now();
  console.log(`Time taken to get preview URLs: ${endTime - startTime} milliseconds`);

  const tracksWithPreviewURLs = topTracksJson.tracks.map((track, index) => ({
    ...track,
    preview_url: previewURLs[index]
  }));

  return {
    ...topTracksJson,
    tracks: tracksWithPreviewURLs
  };
};

export const getRelatedArtists = async (artistId: string, accessToken?: string) =>
  getFromSpotify(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, { accessToken });

export const searchArtists = async (query: string, accessToken?: string) =>
  getFromSpotify(`https://api.spotify.com/v1/search?q=${query}&type=artist`, { accessToken });

const getFromSpotify = async (endpoint: string, options?: { revalidate?: number; accessToken?: string }) => {
  if (!options) options = {};
  if (!options.revalidate) options.revalidate = 60 * 60 * 24;
  if (!options.accessToken) {
    const resp = await getAccessToken();
    options.accessToken = resp.access_token;
  }
  return fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${options.accessToken}`
    },
    next: { revalidate: options.revalidate }
  });
};
