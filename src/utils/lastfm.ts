const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY;

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

        if (data?.album?.tracks?.track) {
            const tracks = data.album.tracks.track.map((track: { name: string; "@attr"?: { rank: number } }, index: number) => ({
                title: track.name,
                position: track["@attr"]?.rank || index + 1, // Ensure track numbers are assigned
            }));

            // Split into Side A and Side B
            const halfway = Math.ceil(tracks.length / 2);
            return {
                sideA: tracks.slice(0, halfway),
                sideB: tracks.slice(halfway),
            };
        }

        return { sideA: [], sideB: [] };
    } catch (error) {
        console.error("Error fetching tracklist:", error);
        return { sideA: [], sideB: [] };
    }
};
