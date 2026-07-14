// ---------------------------------------------------------------------------
// Mirrors the backend's utils/regions.js exactly. This is the single source
// of truth for divisions/regions/cities on the frontend — pages should
// import from here instead of hand-copying region/city lists (that drift is
// exactly how "South Karnataka" ended up missing from several forms).
// ---------------------------------------------------------------------------

export const DIVISIONS = ["North India", "South India", "International"] as const;
export type Division = (typeof DIVISIONS)[number];

export const REGIONS_BY_DIVISION: Record<Division, string[]> = {
  "North India": ["Delhi NCR", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan"],

  "South India": [
    "Coastal Karnataka",
    "North Karnataka",
    "South Karnataka",
    "Tamil Nadu",
    "Kerala",
    "Telangana",
  ],

  International: ["Nepal", "Dubai"],
};

export const CITIES_BY_REGION: Record<string, string[]> = {
  "Delhi NCR": ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  Haryana: ["Panipat", "Karnal", "Hisar", "Rohtak"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],

  "South Karnataka": [
    "Bengaluru North",
    "Bengaluru South",
    "Bengaluru HSR Layout",
    "Mysuru",
    "Hassan",
    "Tumakuru",
    "Shivamogga",
    "Davanagere",
    "Chikkamagaluru",
  ],
  "Coastal Karnataka": ["Mangaluru", "Udupi", "Karwar"],
  "North Karnataka": ["Hubballi", "Belagavi", "Kalaburagi", "Vijayapura"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kottayam"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],

  Nepal: ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar"],
  Dubai: ["Dubai", "Sharjah", "Abu Dhabi"],
};

// Flattened list of every valid region, regardless of division.
export const ALL_REGIONS = Object.values(REGIONS_BY_DIVISION).flat();

export const isValidRegion = (region: string) => ALL_REGIONS.includes(region);

// Given a region (e.g. "South Karnataka"), returns the division it belongs
// to (e.g. "South India"), or null if unrecognized.
export const getDivisionForRegion = (region?: string | null): Division | null => {
  if (!region) return null;
  for (const [division, regions] of Object.entries(REGIONS_BY_DIVISION) as [Division, string[]][]) {
    if (regions.includes(region)) {
      return division;
    }
  }
  return null;
};

// Given a region, returns the cities that belong to it (empty array if the
// region is unrecognized or has no cities configured yet).
export const getCitiesForRegion = (region?: string | null): string[] =>
  (region && CITIES_BY_REGION[region]) || [];

export const isValidCityForRegion = (city: string, region: string) =>
  getCitiesForRegion(region).includes(city);