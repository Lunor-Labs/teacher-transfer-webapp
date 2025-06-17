export const zonalEducationData = {
  "Western": {
    "Colombo": ["Colombo", "Homagama", "Piliyandala", "Sri Jayawardenepura"],
    "Gampaha": ["Gampaha", "Kelaniya", "Minuwangoda", "Negombo"],
    "Kalutara": ["Horana", "Kalutara", "Matugama"]
  },
  "Central": {
    "Kandy": ["Denuwara", "Gampola", "Kandy", "Katugastota", "Teldeniya", "Waththegama"],
    "Matale": ["Galewela", "Matale", "Naula", "Wilgamuwa"],
    "Nuwara Eliya": ["Hanguranketha", "Hatton", "Kotmale", "Nuwara Eliya", "Walapane"]
  },
  "Southern": {
    "Galle": ["Ambalangoda", "Elpitiya", "Galle", "Udugama"],
    "Hambantota": ["Hambantota", "Tangalle", "Walasmulla"],
    "Matara": ["Akuressa", "Matara", "Morawaka", "Mulatiyana (Hakmana)"]
  },
  "Northern": {
    "Jaffna": ["Islands", "Jaffna", "Thenmarachchi", "Vadamarachchi", "Valikamam"],
    "Kilinochchi": ["Kilinochchi"],
    "Mannar": ["Madhu", "Mannar"],
    "Mullaitivu": ["Mullaitivu", "Thunukkai"],
    "Vavuniya": ["Vavuniya", "Vavuniya North"]
  },
  "Eastern": {
    "Ampara": ["Akkaraipattu", "Ampara", "Dehiattakandiya", "Kalmunai", "Mahaoya", "Sammanthurai", "Thirukkovil"],
    "Batticaloa": ["Batticaloa", "Batticaloa Central", "Batticaloa West", "Kalkudah", "Paddirippu"],
    "Trincomalee": ["Kantalai", "Kinniya", "Mutur", "Trincomalee", "Trincomalee North"]
  },
  "North Western": {
    "Kurunegala": ["Giriulla", "Ibbagamuwa", "Kuliyapitiya", "Kurunegala", "Maho", "Nikaweratiya"],
    "Puttalam": ["Chilaw", "Puttalam"]
  },
  "North Central": {
    "Anuradhapura": ["Anuradhapura", "Galenbindunuwewa", "Kebithigollewa", "Kekirawa", "Tambuttegama"],
    "Polonnaruwa": ["Dimbulagala", "Hingurakgoda", "Polonnaruwa"]
  },
  "Uva": {
    "Badulla": ["Badulla", "Bandarawela", "Viyaluwa", "Mahiyanganaya", "Passara", "Welimada"],
    "Monaragala": ["Bibile", "Monaragala", "Wellawaya"]
  },
  "Sabaragamuwa": {
    "Kegalle": ["Dehiowita", "Kegalle", "Mawanella"],
    "Ratnapura": ["Balangoda", "Embilipitiya", "Nivitigala", "Ratnapura"]
  }
};

export const getProvinces = (): string[] => {
  return Object.keys(zonalEducationData);
};

export const getDistrictsByProvince = (province: string): string[] => {
  return province ? Object.keys(zonalEducationData[province as keyof typeof zonalEducationData] || {}) : [];
};

export const getZonesByDistrict = (province: string, district: string): string[] => {
  if (!province || !district) return [];
  const provinceData = zonalEducationData[province as keyof typeof zonalEducationData];
  return provinceData ? (provinceData[district as keyof typeof provinceData] || []) : [];
};