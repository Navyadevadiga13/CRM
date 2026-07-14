// ---------------------------------------------------------------------------
export const DIVISIONS = ["North India", "South India", "International"];
export const REGIONS_BY_DIVISION = {
  "North India": [
    "Delhi NCR",
    "Uttar Pradesh",
    "Punjab",
    "Haryana",
    "Rajasthan",
  ],

  "South India": [
    "Coastal Karnataka",
    "North Karnataka",
    "South Karnataka",
    "Tamil Nadu",
    "Kerala",
    "Telangana",
  ],

  International: [
    "Nepal",
    "Dubai",
  ],
};

export const CITIES_BY_REGION = {
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
// Flattened list of every valid region, regardless of division — used
// wherever we just need to know "is this a recognized region".
export const ALL_REGIONS = Object.values(REGIONS_BY_DIVISION).flat();

export const isValidRegion = (region) => ALL_REGIONS.includes(region);

// Given a region (e.g. "Uttar Pradesh"), returns the division it belongs
// to (e.g. "North India"), or null if unrecognized.
export const getDivisionForRegion = (region) => {
  for (const [division, regions] of Object.entries(REGIONS_BY_DIVISION)) {
    if (regions.includes(region)) {
      return division;
    }
  }
  return null;
};

// Given a region, returns the cities that belong to it (empty array if the
// region is unrecognized or has no cities configured yet).
export const getCitiesForRegion = (region) => CITIES_BY_REGION[region] || [];
export const isValidCityForRegion = (city, region) =>
  getCitiesForRegion(region).includes(city);