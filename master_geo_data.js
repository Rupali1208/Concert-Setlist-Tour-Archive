/**
 * Concert Archive - Master Geographic Data System
 * Real geographic dataset for Countries & Cities worldwide.
 */

const MASTER_COUNTRIES = [
    { CountryCode: "IN", CountryName: "India" },
    { CountryCode: "US", CountryName: "United States" },
    { CountryCode: "GB", CountryName: "United Kingdom" },
    { CountryCode: "CA", CountryName: "Canada" },
    { CountryCode: "AU", CountryName: "Australia" },
    { CountryCode: "DE", CountryName: "Germany" },
    { CountryCode: "FR", CountryName: "France" },
    { CountryCode: "JP", CountryName: "Japan" },
    { CountryCode: "KR", CountryName: "South Korea" },
    { CountryCode: "BR", CountryName: "Brazil" },
    { CountryCode: "SG", CountryName: "Singapore" },
    { CountryCode: "MX", CountryName: "Mexico" },
    { CountryCode: "NL", CountryName: "Netherlands" },
    { CountryCode: "IT", CountryName: "Italy" },
    { CountryCode: "IE", CountryName: "Ireland" },
    { CountryCode: "ES", CountryName: "Spain" },
    { CountryCode: "NZ", CountryName: "New Zealand" },
    { CountryCode: "SE", CountryName: "Sweden" },
    { CountryCode: "CH", CountryName: "Switzerland" },
    { CountryCode: "AE", CountryName: "United Arab Emirates" }
];

const MASTER_CITIES = [
    // ─── INDIA (IN) ─────────────────────────────────────────────────────────────
    { CityID: 101, CityName: "Mumbai", CountryCode: "IN", CountryName: "India", StateProvince: "Maharashtra" },
    { CityID: 102, CityName: "Delhi", CountryCode: "IN", CountryName: "India", StateProvince: "Delhi NCR" },
    { CityID: 103, CityName: "Bengaluru", CountryCode: "IN", CountryName: "India", StateProvince: "Karnataka" },
    { CityID: 104, CityName: "Chennai", CountryCode: "IN", CountryName: "India", StateProvince: "Tamil Nadu" },
    { CityID: 105, CityName: "Kolkata", CountryCode: "IN", CountryName: "India", StateProvince: "West Bengal" },
    { CityID: 106, CityName: "Hyderabad", CountryCode: "IN", CountryName: "India", StateProvince: "Telangana" },
    { CityID: 107, CityName: "Pune", CountryCode: "IN", CountryName: "India", StateProvince: "Maharashtra" },
    { CityID: 108, CityName: "Ahmedabad", CountryCode: "IN", CountryName: "India", StateProvince: "Gujarat" },
    { CityID: 109, CityName: "Jaipur", CountryCode: "IN", CountryName: "India", StateProvince: "Rajasthan" },
    { CityID: 110, CityName: "Chandigarh", CountryCode: "IN", CountryName: "India", StateProvince: "Punjab/Haryana" },
    { CityID: 111, CityName: "Kochi", CountryCode: "IN", CountryName: "India", StateProvince: "Kerala" },
    { CityID: 112, CityName: "Goa", CountryCode: "IN", CountryName: "India", StateProvince: "Goa" },
    { CityID: 113, CityName: "Surat", CountryCode: "IN", CountryName: "India", StateProvince: "Gujarat" },
    { CityID: 114, CityName: "Lucknow", CountryCode: "IN", CountryName: "India", StateProvince: "Uttar Pradesh" },
    { CityID: 115, CityName: "Indore", CountryCode: "IN", CountryName: "India", StateProvince: "Madhya Pradesh" },
    { CityID: 116, CityName: "Bhopal", CountryCode: "IN", CountryName: "India", StateProvince: "Madhya Pradesh" },
    { CityID: 117, CityName: "Nagpur", CountryCode: "IN", CountryName: "India", StateProvince: "Maharashtra" },
    { CityID: 118, CityName: "Visakhapatnam", CountryCode: "IN", CountryName: "India", StateProvince: "Andhra Pradesh" },
    { CityID: 119, CityName: "Patna", CountryCode: "IN", CountryName: "India", StateProvince: "Bihar" },
    { CityID: 120, CityName: "Bhubaneswar", CountryCode: "IN", CountryName: "India", StateProvince: "Odisha" },
    { CityID: 121, CityName: "Coimbatore", CountryCode: "IN", CountryName: "India", StateProvince: "Tamil Nadu" },
    { CityID: 122, CityName: "Vadodara", CountryCode: "IN", CountryName: "India", StateProvince: "Gujarat" },
    { CityID: 123, CityName: "Agra", CountryCode: "IN", CountryName: "India", StateProvince: "Uttar Pradesh" },
    { CityID: 124, CityName: "Varanasi", CountryCode: "IN", CountryName: "India", StateProvince: "Uttar Pradesh" },
    { CityID: 125, CityName: "Guwahati", CountryCode: "IN", CountryName: "India", StateProvince: "Assam" },
    { CityID: 126, CityName: "Mysuru", CountryCode: "IN", CountryName: "India", StateProvince: "Karnataka" },
    { CityID: 127, CityName: "Amritsar", CountryCode: "IN", CountryName: "India", StateProvince: "Punjab" },
    { CityID: 128, CityName: "Dehradun", CountryCode: "IN", CountryName: "India", StateProvince: "Uttarakhand" },
    { CityID: 129, CityName: "Shimla", CountryCode: "IN", CountryName: "India", StateProvince: "Himachal Pradesh" },
    { CityID: 130, CityName: "Ranchi", CountryCode: "IN", CountryName: "India", StateProvince: "Jharkhand" },
    { CityID: 131, CityName: "Ludhiana", CountryCode: "IN", CountryName: "India", StateProvince: "Punjab" },
    { CityID: 132, CityName: "Nashik", CountryCode: "IN", CountryName: "India", StateProvince: "Maharashtra" },
    { CityID: 133, CityName: "Rajkot", CountryCode: "IN", CountryName: "India", StateProvince: "Gujarat" },
    { CityID: 134, CityName: "Madurai", CountryCode: "IN", CountryName: "India", StateProvince: "Tamil Nadu" },
    { CityID: 135, CityName: "Kozhikode", CountryCode: "IN", CountryName: "India", StateProvince: "Kerala" },
    { CityID: 136, CityName: "Thiruvananthapuram", CountryCode: "IN", CountryName: "India", StateProvince: "Kerala" },
    { CityID: 137, CityName: "Srinagar", CountryCode: "IN", CountryName: "India", StateProvince: "Jammu & Kashmir" },
    { CityID: 138, CityName: "Jodhpur", CountryCode: "IN", CountryName: "India", StateProvince: "Rajasthan" },
    { CityID: 139, CityName: "Udaipur", CountryCode: "IN", CountryName: "India", StateProvince: "Rajasthan" },
    { CityID: 140, CityName: "Mangaluru", CountryCode: "IN", CountryName: "India", StateProvince: "Karnataka" },
    { CityID: 141, CityName: "Vijayawada", CountryCode: "IN", CountryName: "India", StateProvince: "Andhra Pradesh" },
    { CityID: 142, CityName: "Pondicherry", CountryCode: "IN", CountryName: "India", StateProvince: "Puducherry" },

    // ─── UNITED STATES (US) ──────────────────────────────────────────────────
    { CityID: 201, CityName: "New York", CountryCode: "US", CountryName: "United States", StateProvince: "New York" },
    { CityID: 202, CityName: "Los Angeles", CountryCode: "US", CountryName: "United States", StateProvince: "California" },
    { CityID: 203, CityName: "Chicago", CountryCode: "US", CountryName: "United States", StateProvince: "Illinois" },
    { CityID: 204, CityName: "Houston", CountryCode: "US", CountryName: "United States", StateProvince: "Texas" },
    { CityID: 205, CityName: "Phoenix", CountryCode: "US", CountryName: "United States", StateProvince: "Arizona" },
    { CityID: 206, CityName: "Philadelphia", CountryCode: "US", CountryName: "United States", StateProvince: "Pennsylvania" },
    { CityID: 207, CityName: "San Antonio", CountryCode: "US", CountryName: "United States", StateProvince: "Texas" },
    { CityID: 208, CityName: "San Diego", CountryCode: "US", CountryName: "United States", StateProvince: "California" },
    { CityID: 209, CityName: "Dallas", CountryCode: "US", CountryName: "United States", StateProvince: "Texas" },
    { CityID: 210, CityName: "Austin", CountryCode: "US", CountryName: "United States", StateProvince: "Texas" },
    { CityID: 211, CityName: "San Francisco", CountryCode: "US", CountryName: "United States", StateProvince: "California" },
    { CityID: 212, CityName: "Seattle", CountryCode: "US", CountryName: "United States", StateProvince: "Washington" },
    { CityID: 213, CityName: "Denver", CountryCode: "US", CountryName: "United States", StateProvince: "Colorado" },
    { CityID: 214, CityName: "Miami", CountryCode: "US", CountryName: "United States", StateProvince: "Florida" },
    { CityID: 215, CityName: "Nashville", CountryCode: "US", CountryName: "United States", StateProvince: "Tennessee" },
    { CityID: 216, CityName: "Atlanta", CountryCode: "US", CountryName: "United States", StateProvince: "Georgia" },
    { CityID: 217, CityName: "Boston", CountryCode: "US", CountryName: "United States", StateProvince: "Massachusetts" },
    { CityID: 218, CityName: "Las Vegas", CountryCode: "US", CountryName: "United States", StateProvince: "Nevada" },
    { CityID: 219, CityName: "Orlando", CountryCode: "US", CountryName: "United States", StateProvince: "Florida" },
    { CityID: 220, CityName: "Washington D.C.", CountryCode: "US", CountryName: "United States", StateProvince: "District of Columbia" },

    // ─── UNITED KINGDOM (GB) ─────────────────────────────────────────────────
    { CityID: 301, CityName: "London", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },
    { CityID: 302, CityName: "Manchester", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },
    { CityID: 303, CityName: "Birmingham", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },
    { CityID: 304, CityName: "Glasgow", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "Scotland" },
    { CityID: 305, CityName: "Edinburgh", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "Scotland" },
    { CityID: 306, CityName: "Liverpool", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },
    { CityID: 307, CityName: "Bristol", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },
    { CityID: 308, CityName: "Leeds", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },
    { CityID: 309, CityName: "Belfast", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "Northern Ireland" },
    { CityID: 310, CityName: "Newcastle", CountryCode: "GB", CountryName: "United Kingdom", StateProvince: "England" },

    // ─── CANADA (CA) ────────────────────────────────────────────────────────
    { CityID: 401, CityName: "Toronto", CountryCode: "CA", CountryName: "Canada", StateProvince: "Ontario" },
    { CityID: 402, CityName: "Vancouver", CountryCode: "CA", CountryName: "Canada", StateProvince: "British Columbia" },
    { CityID: 403, CityName: "Montreal", CountryCode: "CA", CountryName: "Canada", StateProvince: "Quebec" },
    { CityID: 404, CityName: "Calgary", CountryCode: "CA", CountryName: "Canada", StateProvince: "Alberta" },
    { CityID: 405, CityName: "Edmonton", CountryCode: "CA", CountryName: "Canada", StateProvince: "Alberta" },
    { CityID: 406, CityName: "Ottawa", CountryCode: "CA", CountryName: "Canada", StateProvince: "Ontario" },
    { CityID: 407, CityName: "Quebec City", CountryCode: "CA", CountryName: "Canada", StateProvince: "Quebec" },
    { CityID: 408, CityName: "Winnipeg", CountryCode: "CA", CountryName: "Canada", StateProvince: "Manitoba" },

    // ─── AUSTRALIA (AU) ──────────────────────────────────────────────────────
    { CityID: 501, CityName: "Sydney", CountryCode: "AU", CountryName: "Australia", StateProvince: "New South Wales" },
    { CityID: 502, CityName: "Melbourne", CountryCode: "AU", CountryName: "Australia", StateProvince: "Victoria" },
    { CityID: 503, CityName: "Brisbane", CountryCode: "AU", CountryName: "Australia", StateProvince: "Queensland" },
    { CityID: 504, CityName: "Perth", CountryCode: "AU", CountryName: "Australia", StateProvince: "Western Australia" },
    { CityID: 505, CityName: "Adelaide", CountryCode: "AU", CountryName: "Australia", StateProvince: "South Australia" },
    { CityID: 506, CityName: "Gold Coast", CountryCode: "AU", CountryName: "Australia", StateProvince: "Queensland" },
    { CityID: 507, CityName: "Canberra", CountryCode: "AU", CountryName: "Australia", StateProvince: "Australian Capital Territory" },
    { CityID: 508, CityName: "Hobart", CountryCode: "AU", CountryName: "Australia", StateProvince: "Tasmania" },

    // ─── GERMANY (DE) ────────────────────────────────────────────────────────
    { CityID: 601, CityName: "Berlin", CountryCode: "DE", CountryName: "Germany", StateProvince: "Berlin" },
    { CityID: 602, CityName: "Munich", CountryCode: "DE", CountryName: "Germany", StateProvince: "Bavaria" },
    { CityID: 603, CityName: "Frankfurt", CountryCode: "DE", CountryName: "Germany", StateProvince: "Hesse" },
    { CityID: 604, CityName: "Hamburg", CountryCode: "DE", CountryName: "Germany", StateProvince: "Hamburg" },
    { CityID: 605, CityName: "Cologne", CountryCode: "DE", CountryName: "Germany", StateProvince: "North Rhine-Westphalia" },
    { CityID: 606, CityName: "Stuttgart", CountryCode: "DE", CountryName: "Germany", StateProvince: "Baden-Württemberg" },
    { CityID: 607, CityName: "Düsseldorf", CountryCode: "DE", CountryName: "Germany", StateProvince: "North Rhine-Westphalia" },
    { CityID: 608, CityName: "Gelsenkirchen", CountryCode: "DE", CountryName: "Germany", StateProvince: "North Rhine-Westphalia" },

    // ─── FRANCE (FR) ─────────────────────────────────────────────────────────
    { CityID: 701, CityName: "Paris", CountryCode: "FR", CountryName: "France", StateProvince: "Île-de-France" },
    { CityID: 702, CityName: "Marseille", CountryCode: "FR", CountryName: "France", StateProvince: "Provence-Alpes-Côte d'Azur" },
    { CityID: 703, CityName: "Lyon", CountryCode: "FR", CountryName: "France", StateProvince: "Auvergne-Rhône-Alpes" },
    { CityID: 704, CityName: "Toulouse", CountryCode: "FR", CountryName: "France", StateProvince: "Occitanie" },
    { CityID: 705, CityName: "Nice", CountryCode: "FR", CountryName: "France", StateProvince: "Provence-Alpes-Côte d'Azur" },

    // ─── JAPAN (JP) ──────────────────────────────────────────────────────────
    { CityID: 801, CityName: "Tokyo", CountryCode: "JP", CountryName: "Japan", StateProvince: "Kanto" },
    { CityID: 802, CityName: "Yokohama", CountryCode: "JP", CountryName: "Japan", StateProvince: "Kanagawa" },
    { CityID: 803, CityName: "Osaka", CountryCode: "JP", CountryName: "Japan", StateProvince: "Kansai" },
    { CityID: 804, CityName: "Nagoya", CountryCode: "JP", CountryName: "Japan", StateProvince: "Aichi" },
    { CityID: 805, CityName: "Sapporo", CountryCode: "JP", CountryName: "Japan", StateProvince: "Hokkaido" },
    { CityID: 806, CityName: "Fukuoka", CountryCode: "JP", CountryName: "Japan", StateProvince: "Kyushu" },
    { CityID: 807, CityName: "Kyoto", CountryCode: "JP", CountryName: "Japan", StateProvince: "Kansai" },

    // ─── SOUTH KOREA (KR) ─────────────────────────────────────────────────────
    { CityID: 901, CityName: "Seoul", CountryCode: "KR", CountryName: "South Korea", StateProvince: "Gyeonggi" },
    { CityID: 902, CityName: "Busan", CountryCode: "KR", CountryName: "South Korea", StateProvince: "Yeongnam" },
    { CityID: 903, CityName: "Incheon", CountryCode: "KR", CountryName: "South Korea", StateProvince: "Gyeonggi" },
    { CityID: 904, CityName: "Daegu", CountryCode: "KR", CountryName: "South Korea", StateProvince: "Yeongnam" },
    { CityID: 905, CityName: "Daejeon", CountryCode: "KR", CountryName: "South Korea", StateProvince: "Hoseo" },

    // ─── SINGAPORE (SG) ──────────────────────────────────────────────────────
    { CityID: 1001, CityName: "Singapore", CountryCode: "SG", CountryName: "Singapore", StateProvince: "Central Region" },

    // ─── MEXICO (MX) ─────────────────────────────────────────────────────────
    { CityID: 1101, CityName: "Mexico City", CountryCode: "MX", CountryName: "Mexico", StateProvince: "CDMX" },
    { CityID: 1102, CityName: "Guadalajara", CountryCode: "MX", CountryName: "Mexico", StateProvince: "Jalisco" },
    { CityID: 1103, CityName: "Monterrey", CountryCode: "MX", CountryName: "Mexico", StateProvince: "Nuevo León" },

    // ─── NETHERLANDS (NL) ────────────────────────────────────────────────────
    { CityID: 1201, CityName: "Amsterdam", CountryCode: "NL", CountryName: "Netherlands", StateProvince: "North Holland" },
    { CityID: 1202, CityName: "Rotterdam", CountryCode: "NL", CountryName: "Netherlands", StateProvince: "South Holland" },

    // ─── ITALY (IT) ──────────────────────────────────────────────────────────
    { CityID: 1301, CityName: "Rome", CountryCode: "IT", CountryName: "Italy", StateProvince: "Lazio" },
    { CityID: 1302, CityName: "Milan", CountryCode: "IT", CountryName: "Italy", StateProvince: "Lombardy" },

    // ─── IRELAND (IE) ────────────────────────────────────────────────────────
    { CityID: 1401, CityName: "Dublin", CountryCode: "IE", CountryName: "Ireland", StateProvince: "Leinster" },

    // ─── SLOVAKIA (SK) ───────────────────────────────────────────────────────
    { CityID: 1501, CityName: "Bratislava", CountryCode: "SK", CountryName: "Slovakia", StateProvince: "Bratislava Region" }
];

function normalizeCountryCode(countryInput) {
    if (!countryInput || countryInput === 'all') return 'all';
    const clean = String(countryInput).trim().toUpperCase();

    const codeMap = {
        'INDIA': 'IN', 'IN': 'IN',
        'UNITED STATES': 'US', 'USA': 'US', 'US': 'US',
        'UNITED KINGDOM': 'GB', 'UK': 'GB', 'GB': 'GB', 'GREAT BRITAIN': 'GB',
        'CANADA': 'CA', 'CA': 'CA',
        'AUSTRALIA': 'AU', 'AU': 'AU',
        'GERMANY': 'DE', 'DE': 'DE',
        'FRANCE': 'FR', 'FR': 'FR',
        'JAPAN': 'JP', 'JP': 'JP',
        'SOUTH KOREA': 'KR', 'KR': 'KR', 'KOREA': 'KR',
        'BRAZIL': 'BR', 'BR': 'BR',
        'SINGAPORE': 'SG', 'SG': 'SG',
        'MEXICO': 'MX', 'MX': 'MX',
        'NETHERLANDS': 'NL', 'NL': 'NL',
        'ITALY': 'IT', 'IT': 'IT',
        'IRELAND': 'IE', 'IE': 'IE',
        'SPAIN': 'ES', 'ES': 'ES',
        'SLOVAKIA': 'SK', 'SK': 'SK'
    };

    return codeMap[clean] || clean;
}

function getCountriesMaster() {
    return MASTER_COUNTRIES;
}

function getCitiesMaster(countryCodeOrName = 'IN', searchQuery = '') {
    const code = normalizeCountryCode(countryCodeOrName);
    const q = String(searchQuery || '').trim().toLowerCase();

    let filtered = MASTER_CITIES;
    if (code !== 'all') {
        filtered = filtered.filter(c => c.CountryCode === code || c.CountryName.toLowerCase() === code.toLowerCase());
    }

    if (q) {
        filtered = filtered.filter(c => 
            c.CityName.toLowerCase().includes(q) || 
            (c.StateProvince && c.StateProvince.toLowerCase().includes(q))
        );
    }

    return filtered.sort((a, b) => a.CityName.localeCompare(b.CityName));
}

function getCityById(cityId) {
    const id = parseInt(cityId);
    return MASTER_CITIES.find(c => c.CityID === id);
}

module.exports = {
    MASTER_COUNTRIES,
    MASTER_CITIES,
    normalizeCountryCode,
    getCountriesMaster,
    getCitiesMaster,
    getCityById
};
