export interface LastFmArtist {
  name: string;
  url: string;
  image: Array<{
    size: string;
    "#text": string;
  }>;
  match: string;
}

export interface LastFmSimilarArtistsResponse {
  similarartists: {
    artist: LastFmArtist[];
    "@attr": {
      artist: string;
    };
  };
}

export interface LastFmErrorResponse {
  error: number;
  message: string;
}
