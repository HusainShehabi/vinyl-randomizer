const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

type LastFmTrack = {
  name?: string;
  "@attr"?: { rank?: string | number };
};

type TracklistResult = {
  sideA: { title: string; position: string }[];
  sideB: { title: string; position: string }[];
};

export const getTracklistFromLastFM = async (artist: string, album: string) => {
  if (!API_KEY) {
    throw new Error("Last.fm API key is missing. Check your .env file.");
  }

  try {
    const url = `${LASTFM_API_URL}?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(
      artist
    )}&album=${encodeURIComponent(album)}&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch tracklist: ${response.statusText}`);
    }

    const data = await response.json();
    const rawTracks = data?.album?.tracks?.track;

    if (!rawTracks) {
      return { sideA: [], sideB: [] };
    }

    const trackArray: LastFmTrack[] = Array.isArray(rawTracks) ? rawTracks : [rawTracks];
    const tracks = trackArray
      .map((track, index) => ({
        title: track?.name?.trim() || `Track ${index + 1}`,
        position: String(track?.["@attr"]?.rank ?? index + 1),
      }))
      .filter((track) => track.title.length > 0);

    const halfway = Math.ceil(tracks.length / 2);
    const result: TracklistResult = {
      sideA: tracks.slice(0, halfway),
      sideB: tracks.slice(halfway),
    };

    return result;
  } catch (error) {
    console.error("Error fetching tracklist:", error);
    return { sideA: [], sideB: [] };
  }
};
