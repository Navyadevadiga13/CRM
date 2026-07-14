// ---------------------------------------------------------------------------
// Mirrors backend/utils/regions.js exactly. This is the ONLY place the
// zone/region/city taxonomy should be defined on the frontend — both
// CreateUserPage and EditUserPage import from here instead of keeping their
// own local copies, so they can never silently drift out of sync with each
// other or with the backend's validation (isValidRegion / isValidCityForRegion
// in userController.js).
//
// If the backend list ever changes, update ONLY this file.
// ---------------------------------------------------------------------------

export const DIVISIONS = ["North India", "South India", "International"] as const;

// Zone -> the granular regions that fall under it. Co-admins are scoped to
// a whole zone; regional heads/partners/city heads pick a granular region
// within a zone.
export const ZONES: Record<string, string[]> = {
  "North India": ["Delhi NCR", "Uttar Pradesh", "Punjab", "Haryana", "Rajasthan"],
  "South India": ["Coastal Karnataka", "North Karnataka", "Tamil Nadu", "Kerala", "Telangana"],
  International: ["Nepal", "Dubai"],
};

export const CITIES_BY_REGION: Record<string, string[]> = {
  "Delhi NCR": ["Delhi", "Noida", "Gurugram", "Faridabad", "Ghaziabad"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  Haryana: ["Panipat", "Karnal", "Hisar", "Rohtak"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],

  "Coastal Karnataka": ["Mangaluru", "Udupi", "Karwar"],
  "North Karnataka": ["Hubballi", "Belagavi", "Kalaburagi", "Vijayapura"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kottayam"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],

  Nepal: ["Kathmandu", "Pokhara", "Lalitpur", "Biratnagar"],
  Dubai: ["Dubai", "Sharjah", "Abu Dhabi"],
};

// Flattened list of every valid region, regardless of division.
export const ALL_REGIONS = Object.values(ZONES).flat();

export const getCitiesForRegion = (region: string): string[] =>
  CITIES_BY_REGION[region] || [];