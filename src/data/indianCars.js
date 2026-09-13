// src/data/indianCars.js
// Database of popular Indian cars with brand, model, type, fuel options, and emoji icon.
// Used for autocomplete suggestions in the Add Vehicle form.

export const INDIAN_CARS = [
  // Maruti Suzuki
  { brand: 'Maruti Suzuki', model: 'Swift',          type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Baleno',         type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Alto K10',       type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'WagonR',         type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Celerio',        type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Ignis',          type: 'Hatchback',  icon: '🚗', fuels: ['Petrol'] },
  { brand: 'Maruti Suzuki', model: 'Dzire',          type: 'Sedan',      icon: '🚙', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Ciaz',           type: 'Sedan',      icon: '🚙', fuels: ['Petrol'] },
  { brand: 'Maruti Suzuki', model: 'Ertiga',         type: 'MPV',        icon: '🚐', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'XL6',            type: 'MPV',        icon: '🚐', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Brezza',         type: 'SUV',        icon: '🚘', fuels: ['Petrol'] },
  { brand: 'Maruti Suzuki', model: 'Grand Vitara',   type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Hybrid'] },
  { brand: 'Maruti Suzuki', model: 'Fronx',          type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'CNG'] },
  { brand: 'Maruti Suzuki', model: 'Invicto',        type: 'MPV',        icon: '🚐', fuels: ['Hybrid'] },

  // Hyundai
  { brand: 'Hyundai', model: 'Creta',             type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Hyundai', model: 'Venue',             type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel', 'CNG'] },
  { brand: 'Hyundai', model: 'i20',               type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Hyundai', model: 'Grand i10 Nios',    type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Hyundai', model: 'Aura',              type: 'Sedan',      icon: '🚙', fuels: ['Petrol', 'CNG'] },
  { brand: 'Hyundai', model: 'Verna',             type: 'Sedan',      icon: '🚙', fuels: ['Petrol'] },
  { brand: 'Hyundai', model: 'Alcazar',           type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Hyundai', model: 'Tucson',            type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Hyundai', model: 'Ioniq 5',           type: 'EV',         icon: '⚡', fuels: ['Electric'] },
  { brand: 'Hyundai', model: 'Exter',             type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'CNG'] },

  // Tata
  { brand: 'Tata', model: 'Nexon',             type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel', 'Electric'] },
  { brand: 'Tata', model: 'Punch',             type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'CNG', 'Electric'] },
  { brand: 'Tata', model: 'Tiago',             type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'CNG', 'Electric'] },
  { brand: 'Tata', model: 'Tigor',             type: 'Sedan',      icon: '🚙', fuels: ['Petrol', 'CNG', 'Electric'] },
  { brand: 'Tata', model: 'Altroz',            type: 'Hatchback',  icon: '🚗', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Tata', model: 'Harrier',           type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Tata', model: 'Safari',            type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Tata', model: 'Curvv',             type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel', 'Electric'] },
  { brand: 'Tata', model: 'Nexon EV',          type: 'EV',         icon: '⚡', fuels: ['Electric'] },

  // Honda
  { brand: 'Honda', model: 'Amaze',      type: 'Sedan',      icon: '🚙', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Honda', model: 'City',       type: 'Sedan',      icon: '🚙', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Honda', model: 'Elevate',    type: 'SUV',        icon: '🚘', fuels: ['Petrol'] },
  { brand: 'Honda', model: 'Jazz',       type: 'Hatchback',  icon: '🚗', fuels: ['Petrol'] },
  { brand: 'Honda', model: 'WR-V',       type: 'SUV',        icon: '🚘', fuels: ['Petrol', 'Diesel'] },

  // Mahindra
  { brand: 'Mahindra', model: 'Scorpio-N',     type: 'SUV',  icon: '🛻', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Mahindra', model: 'Scorpio Classic',type: 'SUV', icon: '🛻', fuels: ['Diesel'] },
  { brand: 'Mahindra', model: 'XUV700',         type: 'SUV', icon: '🛻', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Mahindra', model: 'XUV300',         type: 'SUV', icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Mahindra', model: 'XUV400',         type: 'EV',  icon: '⚡', fuels: ['Electric'] },
  { brand: 'Mahindra', model: 'Thar',           type: 'SUV', icon: '🛻', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Mahindra', model: 'Bolero',         type: 'SUV', icon: '🛻', fuels: ['Diesel'] },
  { brand: 'Mahindra', model: 'BE 6',           type: 'EV',  icon: '⚡', fuels: ['Electric'] },
  { brand: 'Mahindra', model: 'XEV 9e',         type: 'EV',  icon: '⚡', fuels: ['Electric'] },

  // Kia
  { brand: 'Kia', model: 'Seltos',     type: 'SUV',  icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Kia', model: 'Sonet',      type: 'SUV',  icon: '🚘', fuels: ['Petrol', 'Diesel', 'CNG'] },
  { brand: 'Kia', model: 'Carens',     type: 'MPV',  icon: '🚐', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Kia', model: 'EV6',        type: 'EV',   icon: '⚡', fuels: ['Electric'] },

  // Toyota
  { brand: 'Toyota', model: 'Innova Crysta',   type: 'MPV',  icon: '🚐', fuels: ['Diesel'] },
  { brand: 'Toyota', model: 'Innova Hycross',  type: 'MPV',  icon: '🚐', fuels: ['Petrol', 'Hybrid'] },
  { brand: 'Toyota', model: 'Fortuner',        type: 'SUV',  icon: '🛻', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Toyota', model: 'Hyryder',         type: 'SUV',  icon: '🚘', fuels: ['Petrol', 'Hybrid'] },
  { brand: 'Toyota', model: 'Glanza',          type: 'Hatchback', icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Toyota', model: 'Camry',           type: 'Sedan', icon: '🚙', fuels: ['Hybrid'] },
  { brand: 'Toyota', model: 'Rumion',          type: 'MPV',   icon: '🚐', fuels: ['Petrol', 'CNG'] },

  // MG
  { brand: 'MG', model: 'Hector',        type: 'SUV', icon: '🚘', fuels: ['Petrol', 'Diesel', 'CNG'] },
  { brand: 'MG', model: 'Hector Plus',   type: 'SUV', icon: '🚘', fuels: ['Petrol', 'Diesel'] },
  { brand: 'MG', model: 'Astor',         type: 'SUV', icon: '🚘', fuels: ['Petrol'] },
  { brand: 'MG', model: 'ZS EV',         type: 'EV',  icon: '⚡', fuels: ['Electric'] },
  { brand: 'MG', model: 'Comet EV',      type: 'EV',  icon: '⚡', fuels: ['Electric'] },
  { brand: 'MG', model: 'Windsor EV',    type: 'EV',  icon: '⚡', fuels: ['Electric'] },
  { brand: 'MG', model: 'Gloster',       type: 'SUV', icon: '🛻', fuels: ['Diesel'] },

  // Renault
  { brand: 'Renault', model: 'Kwid',    type: 'Hatchback', icon: '🚗', fuels: ['Petrol', 'CNG'] },
  { brand: 'Renault', model: 'Triber',  type: 'MPV',       icon: '🚐', fuels: ['Petrol'] },
  { brand: 'Renault', model: 'Kiger',   type: 'SUV',       icon: '🚘', fuels: ['Petrol'] },

  // Volkswagen
  { brand: 'Volkswagen', model: 'Polo',    type: 'Hatchback', icon: '🚗', fuels: ['Petrol'] },
  { brand: 'Volkswagen', model: 'Virtus',  type: 'Sedan',     icon: '🚙', fuels: ['Petrol'] },
  { brand: 'Volkswagen', model: 'Taigun',  type: 'SUV',       icon: '🚘', fuels: ['Petrol'] },

  // Skoda
  { brand: 'Skoda', model: 'Slavia',    type: 'Sedan', icon: '🚙', fuels: ['Petrol'] },
  { brand: 'Skoda', model: 'Kushaq',    type: 'SUV',   icon: '🚘', fuels: ['Petrol'] },
  { brand: 'Skoda', model: 'Octavia',   type: 'Sedan', icon: '🚙', fuels: ['Petrol'] },
  { brand: 'Skoda', model: 'Kodiaq',    type: 'SUV',   icon: '🛻', fuels: ['Petrol'] },

  // Jeep
  { brand: 'Jeep', model: 'Compass',      type: 'SUV', icon: '🛻', fuels: ['Petrol', 'Diesel'] },
  { brand: 'Jeep', model: 'Meridian',     type: 'SUV', icon: '🛻', fuels: ['Diesel'] },
  { brand: 'Jeep', model: 'Wrangler',     type: 'SUV', icon: '🛻', fuels: ['Petrol'] },

  // Nissan
  { brand: 'Nissan', model: 'Magnite',   type: 'SUV',       icon: '🚘', fuels: ['Petrol'] },

  // Citroen
  { brand: 'Citroen', model: 'C3',       type: 'Hatchback', icon: '🚗', fuels: ['Petrol'] },
  { brand: 'Citroen', model: 'C3 Aircross', type: 'SUV',    icon: '🚘', fuels: ['Petrol'] },
];

// Returns unique brand names
export const INDIAN_BRANDS = [...new Set(INDIAN_CARS.map(c => c.brand))].sort();

// Fuzzy search: returns matching cars for a query string
export function searchCars(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return INDIAN_CARS.filter(
    car =>
      car.brand.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q) ||
      `${car.brand} ${car.model}`.toLowerCase().includes(q)
  ).slice(0, 8);
}
