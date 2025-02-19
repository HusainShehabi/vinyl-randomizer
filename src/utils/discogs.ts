const DISCOGS_API_URL = "https://api.discogs.com";
const API_KEY = process.env.NEXT_PUBLIC_DISCOGS_TOKEN;

/**
 * Returns the current Discogs username:
 * - First tries to get the username from localStorage (client-side)
 * - Falls back to the NEXT_PUBLIC_DISCOGS_USER environment variable
 */
export function getDiscogsUsername(): string {
  if (typeof window !== "undefined") {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      return storedUsername;
    }
  }
  return process.env.NEXT_PUBLIC_DISCOGS_USER || "";
}

if (!getDiscogsUsername() || !API_KEY) {
  throw new Error(
    "Discogs username or API key is missing. Check your local storage or .env file."
  );
}

// Fetch a random record from the Discogs collection
export const getRandomRecordFromCollection = async () => {
  const username = getDiscogsUsername();
  try {
    const url = `${DISCOGS_API_URL}/users/${username}/collection/folders/0/releases?per_page=100&token=${API_KEY}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.releases || data.releases.length === 0) {
      return null;
    }

    return data.releases[
      Math.floor(Math.random() * data.releases.length)
    ].basic_information;
  } catch (error) {
    console.error("Error fetching random record:", error);
    return null;
  }
};

// Fetch all records from the Discogs collection
export const getAllRecords = async () => {
  const username = getDiscogsUsername();
  try {
    const url = `${DISCOGS_API_URL}/users/${username}/collection/folders/0/releases?per_page=100&token=${API_KEY}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch all records: ${response.statusText}`);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.releases.map((release: any) => release.basic_information);
  } catch (error) {
    console.error("Error fetching all records:", error);
    return [];
  }
};
