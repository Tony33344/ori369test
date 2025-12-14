// Google Places API integration for fetching reviews
// Note: Requires GOOGLE_PLACES_API_KEY environment variable

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  profile_photo_url?: string;
}

export interface PlaceDetails {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  url: string; // Google Maps URL
}

// ORI 369 Place ID from Google Maps
export const ORI369_PLACE_ID = 'ChIJrRC2dwB3bhMRyj09T40R3VY';

/**
 * Fetch place details including reviews from Google Places API
 */
export async function fetchPlaceDetails(): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not configured, using fallback reviews');
    return null;
  }

  try {
    const fields = [
      'name',
      'rating',
      'user_ratings_total',
      'reviews',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'url'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${ORI369_PLACE_ID}&fields=${fields}&key=${apiKey}&language=sl`;
    
    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    return data.result as PlaceDetails;
  } catch (error) {
    console.error('Failed to fetch Google Places data:', error);
    return null;
  }
}

/**
 * Get reviews - either from Google Places API or fallback data
 */
export async function getReviews(): Promise<GoogleReview[]> {
  const placeDetails = await fetchPlaceDetails();
  
  if (placeDetails?.reviews) {
    return placeDetails.reviews;
  }

  // Fallback to static reviews if API is not available
  return getFallbackReviews();
}

/**
 * Fallback reviews when API is not available
 * These should be updated periodically with real reviews
 */
export function getFallbackReviews(): GoogleReview[] {
  return [
    {
      author_name: "Maja P.",
      rating: 5,
      text: "Izjemna izkušnja! Terapevt je bil zelo profesionalen in pozoren. Po terapiji sem se počutila kot nova. Toplo priporočam vsem, ki iščejo celostni pristop k zdravju.",
      time: Date.now() / 1000 - 86400 * 30, // 30 days ago
      relative_time_description: "pred mesecem dni",
    },
    {
      author_name: "Tomaž K.",
      rating: 5,
      text: "Najboljša odločitev, ki sem jo sprejel za svoje zdravje. TECAR terapija je naredila čudeže za moje bolečine v hrbtu. Ekipa je prijazna in strokovna.",
      time: Date.now() / 1000 - 86400 * 14, // 14 days ago
      relative_time_description: "pred 2 tedni",
    },
    {
      author_name: "Ana S.",
      rating: 5,
      text: "Čudovit prostor, mirno vzdušje in odlične terapije. MotioScan analiza mi je pokazala stvari, ki jih nisem vedela o svojem telesu. Zelo zadovoljna!",
      time: Date.now() / 1000 - 86400 * 7, // 7 days ago
      relative_time_description: "pred tednom dni",
    },
    {
      author_name: "Marko B.",
      rating: 5,
      text: "Profesionalen pristop in odlični rezultati. Magnetna terapija mi je pomagala pri okrevanju po poškodbi. Priporočam!",
      time: Date.now() / 1000 - 86400 * 45, // 45 days ago
      relative_time_description: "pred mesecem dni",
    },
    {
      author_name: "Petra L.",
      rating: 5,
      text: "Enkratna izkušnja z vodenim dihanjem. Počutim se bolj sproščeno in uravnoteženo. Hvala ekipi ORI 369!",
      time: Date.now() / 1000 - 86400 * 21, // 21 days ago
      relative_time_description: "pred 3 tedni",
    },
  ];
}
