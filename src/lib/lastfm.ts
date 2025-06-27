import { LastFmErrorResponse, LastFmSimilarArtistsResponse } from "@/types/lastfmTypes";

const api_key = process.env.LASTFM_API_KEY;

/**
 * Get similar artists from Last.fm's artist.getSimilar endpoint
 * @param artistName - The name of the artist to find similar artists for
 * @param limit - Number of similar artists to return (default: 20, max: 100)
 * @returns Promise with similar artists data
 */
export const getSimilarArtists = async (
  artistName: string,
  limit: number = 20
): Promise<LastFmSimilarArtistsResponse> => {
  if (!api_key) {
    throw new Error("LASTFM_API_KEY environment variable is not set");
  }

  if (!artistName.trim()) {
    throw new Error("Artist name is required");
  }

  // Ensure limit is within valid range
  const validLimit = Math.min(Math.max(limit, 1), 100);

  const params = new URLSearchParams({
    method: "artist.getSimilar",
    artist: artistName,
    limit: validLimit.toString(),
    api_key: api_key,
    format: "json"
  });

  const url = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      const errorResponse = data as LastFmErrorResponse;
      throw new Error(`Last.fm API error: ${errorResponse.message} (${errorResponse.error})`);
    }

    return data as LastFmSimilarArtistsResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch similar artists from Last.fm");
  }
};
