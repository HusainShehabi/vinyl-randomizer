const DISCOGS_API_URL = "https://api.discogs.com";
const USERNAME = process.env.NEXT_PUBLIC_DISCOGS_USER; // Environment variable
const API_KEY = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;

export const getRandomRecordFromCollection = async () => {
    if (!USERNAME || !API_KEY) {
        throw new Error("Discogs username or API key is missing. Check your .env file.");
    }

    const url = `${DISCOGS_API_URL}/users/${USERNAME}/collection/folders/0/releases?per_page=100&token=${API_KEY}`;

    const response = await fetch(url, { cache: "no-store" }); // Avoid caching issues
    if (!response.ok) {
        throw new Error(`Failed to fetch collection: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.releases || data.releases.length === 0) {
        return null;
    }

    return data.releases[Math.floor(Math.random() * data.releases.length)].basic_information;
};
