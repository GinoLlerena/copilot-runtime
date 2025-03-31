import axios from "axios";

const UNSPLASH_ACCESS_KEY = "NEDUSh7rJvS-e-TphaTHr5ddoGsVqUghXyMkk5jOiic"; // Replace with your real API key
const UNSPLASH_BASE_URL = "https://api.unsplash.com";

/**
 * Fetches a list of people photos from Unsplash with names and descriptions.
 * @param perPage - Number of photos to fetch (default: 10).
 * @returns A list of people photos with name and description.
 */
export async function fetchPeoplePhotos(perPage: number = 50) {
    try {
        const response = await axios.get(`${UNSPLASH_BASE_URL}/search/photos`, {
            params: {
                query: "person", // Search for people photos
                per_page: perPage,
                client_id: UNSPLASH_ACCESS_KEY, // API key
            },
        });

        const data = response.data.results.map((photo: any) => ({
            id: photo.id,
            name: photo.user.name, // Photographer's name
            description: photo.description || photo.alt_description || "No description available",
            imageUrl: photo.urls.small,
            photographer: photo.user.name,
            profileUrl: photo.user.links.html, // Link to photographer's profile
        }))

        if (data && data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            return data[randomIndex].imageUrl;
        }

    } catch (error) {
        console.error("Error fetching Unsplash people photos:", error);
        return '';
    }
}
