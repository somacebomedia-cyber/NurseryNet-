import fs from 'fs';
import path from 'path';

/**
 * This script fetches preschool data from the Google Places API.
 * 
 * Prerequisites:
 * 1. Get a Google Maps API Key: https://developers.google.com/maps/documentation/places/web-service/get-api-key
 * 2. Enable the "Places API (New)" in your Google Cloud Console.
 * 3. Set your API key in your environment variables:
 *    export GOOGLE_MAPS_API_KEY="your_api_key_here"
 * 
 * Usage:
 * npx tsx scripts/fetch-google-places.ts
 */

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow']; // Add more cities as needed
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/data/preschools.json');

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
}

async function fetchPlacesForCity(city: string): Promise<any[]> {
  console.log(`Fetching preschools for ${city}...`);
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const requestBody = {
    textQuery: `preschool in ${city}`,
    maxResultCount: 20, // Adjust as needed (max is usually 20 per page for text search)
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY || '',
        // Specify the fields we want to retrieve to save bandwidth and costs
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.location',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const places: GooglePlace[] = data.places || [];
    
    // Transform Google Places data into our app's schema
    return places.map((place) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown Preschool',
      location: place.formattedAddress || city,
      city: city, // Categorize by city for easy querying
      phone: place.nationalPhoneNumber || '',
      website: place.websiteUri || '',
      description: `A preschool located in ${city}.`,
      rating: place.rating || null,
      reviewCount: place.userRatingCount || 0,
      coordinates: place.location ? {
        lat: place.location.latitude,
        lng: place.location.longitude
      } : null,
      images: [], // We'd need a separate API call to fetch actual photos
      features: [],
      status: 'unclaimed'
    }));
  } catch (error) {
    console.error(`Error fetching data for ${city}:`, error);
    return [];
  }
}

async function main() {
  if (!API_KEY) {
    console.warn('⚠️ GOOGLE_MAPS_API_KEY is not set. Generating mock data instead.');
    generateMockData();
    return;
  }

  let allSchools: any[] = [];

  for (const city of CITIES) {
    const schools = await fetchPlacesForCity(city);
    allSchools = [...allSchools, ...schools];
    
    // Be nice to the API, wait a second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSchools, null, 2));
  console.log(`✅ Successfully saved ${allSchools.length} preschools to ${OUTPUT_FILE}`);
}

function generateMockData() {
  const mockSchools = [];
  let idCounter = 1;

  for (const city of CITIES) {
    for (let i = 1; i <= 25; i++) {
      mockSchools.push({
        id: `mock-${idCounter}`,
        name: `${city} Early Learning Center ${i}`,
        location: `123 ${city} St, ${city}, UK`,
        city: city,
        phone: `+44 20 7123 ${1000 + idCounter}`,
        website: `https://example.com/school${idCounter}`,
        description: `A wonderful preschool located in the heart of ${city}. We provide a nurturing environment for children to learn and grow.`,
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0 and 5.0
        reviewCount: Math.floor(Math.random() * 50) + 5,
        status: 'unclaimed'
      });
      idCounter++;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mockSchools, null, 2));
  console.log(`✅ Generated ${mockSchools.length} MOCK preschools and saved to ${OUTPUT_FILE}`);
  console.log(`To fetch real data, set your GOOGLE_MAPS_API_KEY environment variable and run this script again.`);
}

main();
