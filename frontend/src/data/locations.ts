export const LOCATION_DATA = {
  "North India": {
    regions: [
      "Delhi",
      "Uttar Pradesh",
      "Punjab",
      "Haryana",
      "Rajasthan",
      "Madhya Pradesh",
      "Himachal Pradesh",
      "Uttarakhand",
      "Jammu & Kashmir",
      "Chandigarh",
    ],

    cities: {
      Delhi: ["New Delhi", "Dwarka", "Rohini"],

      "Uttar Pradesh": [
        "Lucknow",
        "Noida",
        "Ghaziabad",
        "Kanpur",
        "Varanasi",
        "Agra",
      ],

      Punjab: [
        "Amritsar",
        "Ludhiana",
        "Jalandhar",
        "Patiala",
      ],

      Haryana: [
        "Gurugram",
        "Faridabad",
        "Panipat",
        "Hisar",
      ],

      Rajasthan: [
        "Jaipur",
        "Jodhpur",
        "Kota",
        "Udaipur",
      ],

      "Madhya Pradesh": [
        "Bhopal",
        "Indore",
        "Gwalior",
        "Jabalpur",
      ],

      "Himachal Pradesh": [
        "Shimla",
        "Mandi",
        "Solan",
      ],

      Uttarakhand: [
        "Dehradun",
        "Haridwar",
        "Haldwani",
      ],

      "Jammu & Kashmir": [
        "Srinagar",
        "Jammu",
      ],

      Chandigarh: [
        "Chandigarh",
      ],
    },
  },

  "South India": {
    regions: [
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Andhra Pradesh",
      "Telangana",
      "Goa",
      "Puducherry",
    ],

    cities: {
      Karnataka: [
        "Bangalore",
        "Mangalore",
        "Mysore",
        "Hubli",
        "Belgaum",
        "Udupi",
        "Puttur",
        "Shimoga",
      ],

      Kerala: [
        "Kochi",
        "Trivandrum",
        "Kozhikode",
        "Kannur",
      ],

      "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Salem",
      ],

      "Andhra Pradesh": [
        "Visakhapatnam",
        "Vijayawada",
        "Guntur",
        "Tirupati",
      ],

      Telangana: [
        "Hyderabad",
        "Warangal",
        "Karimnagar",
      ],

      Goa: [
        "Panaji",
        "Margao",
        "Vasco",
      ],

      Puducherry: [
        "Puducherry",
      ],
    },
  },

  International: {
    regions: [
      "Nepal",
      "Dubai",
      "Canada",
      "Australia",
      "United Kingdom",
      "United States",
      "Ireland",
      "Germany",
      "New Zealand",
    ],

    cities: {
      Nepal: [
        "Kathmandu",
        "Pokhara",
        "Lalitpur",
      ],

      Dubai: [
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
      ],

      Canada: [
        "Toronto",
        "Vancouver",
        "Calgary",
        "Ottawa",
      ],

      Australia: [
        "Sydney",
        "Melbourne",
        "Perth",
        "Brisbane",
      ],

      "United Kingdom": [
        "London",
        "Manchester",
        "Birmingham",
      ],

      "United States": [
        "New York",
        "Chicago",
        "Boston",
        "Dallas",
      ],

      Ireland: [
        "Dublin",
        "Cork",
      ],

      Germany: [
        "Berlin",
        "Munich",
      ],

      "New Zealand": [
        "Auckland",
        "Wellington",
      ],
    },
  },
};

export const DIVISIONS = Object.keys(LOCATION_DATA);

export const getRegions = (division: string) =>
  LOCATION_DATA[division as keyof typeof LOCATION_DATA]?.regions || [];

export const getCities = (
  division: string,
  region: string
) =>
  LOCATION_DATA[
    division as keyof typeof LOCATION_DATA
  ]?.cities[
    region as keyof (typeof LOCATION_DATA)[keyof typeof LOCATION_DATA]["cities"]
  ] || [];
