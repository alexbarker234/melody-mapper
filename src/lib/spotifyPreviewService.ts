/**
 * Get the Spotify preview URLs from a given URL
 * Spotify has deprecated their preview URLs, so we need to scrape the page for the URLs
 * @param url - The URL to get the Spotify preview URLs from
 * @returns An array of Spotify preview URLs
 */
export async function getSpotifyPreviewURLs(url: string): Promise<string[]> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const scdnLinks = new Set<string>();

    const previewUrlRegex = /https:\/\/p\.scdn\.co\/mp3-preview\/[a-f0-9]+/g;
    const matches = html.match(previewUrlRegex);
    if (matches) {
      matches.forEach((match) => scdnLinks.add(match));
    }

    return Array.from(scdnLinks);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch preview URLs: ${errorMessage}`);
  }
}

export async function getManySpotifyPreviewURLs(urls: string[]): Promise<string[]> {
  const results = await Promise.all(urls.map((url) => getSpotifyPreviewURLs(url)));
  return results.flat();
}
