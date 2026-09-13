// src/data/mockData.js
// All static mock data for CarCare prototype

export const MOCK_USER = {
  id: 'u1',
  name: 'Tanvir Singh',
  email: 'tanvir.singh@gmail.com',
  phone: '+91 98765 43210',
  city: 'Chandigarh',
  initials: 'TS',
};

export const MOCK_VEHICLES = [
  {
    id: 'v1',
    brand: 'Hyundai',
    model: 'Creta',
    registration: 'PB 65 AB 1234',
    year: 2023,
    fuelType: 'Petrol',
    odometer: '18,450 km',
    insurance: 'Valid till 14 Mar 2027',
    lastService: '15 Aug 2026',
    nextService: '18 Sep 2026',
    serviceDaysLeft: 11,
  },
  {
    id: 'v2',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    registration: 'PB 10 CD 5678',
    year: 2021,
    fuelType: 'Petrol',
    odometer: '34,200 km',
    insurance: 'Valid till 22 Jul 2027',
    lastService: '2 Jun 2026',
    nextService: '2 Dec 2026',
    serviceDaysLeft: 87,
  },
];

export const SERVICE_CENTERS = [
  { id: 'sc1', name: 'CarCare Chandigarh', address: 'Phase 7, Industrial Area, Chandigarh', pincode: '160002' },
  { id: 'sc2', name: 'CarCare Rajpura', address: 'NH-44, Rajpura, Punjab', pincode: '140401' },
  { id: 'sc3', name: 'CarCare Patiala', address: 'Lehal, GT Road, Patiala', pincode: '147001' },
  { id: 'sc4', name: 'CarCare Ambala', address: 'Jagadhri Road, Ambala, Haryana', pincode: '133001' },
  { id: 'sc5', name: 'CarCare Zirakpur', address: 'Patiala Road, Zirakpur, Punjab', pincode: '140603' },
];

// Pool of technician identities used for on-demand emergency assignment
export const MECHANIC_POOL = [
  { name: 'Ravi Singh',      role: 'CarCare Roadside Technician', initials: 'RS', phone: '+91 97542 11890' },
  { name: 'Sanjay Kumar',    role: 'CarCare Roadside Technician', initials: 'SK', phone: '+91 98765 22110' },
  { name: 'Manpreet Singh',  role: 'CarCare Roadside Technician', initials: 'MS', phone: '+91 99888 33221' },
  { name: 'Arjun Mehta',     role: 'CarCare Roadside Technician', initials: 'AM', phone: '+91 96543 88012' },
];

// Returns the default service center. We only operate 4 centers, so there's
// no real "nearest" to compute — this always resolves to the first one.
export function getNearestServiceCenter() {
  return SERVICE_CENTERS[0];
}

// Assigns a mechanic from one of the 4 service centers, with a plausible
// (but made-up) distance and ETA — no pincode-based geo math.
export function assignMechanic() {
  const center = SERVICE_CENTERS[Math.floor(Math.random() * SERVICE_CENTERS.length)];
  const mechanic = MECHANIC_POOL[Math.floor(Math.random() * MECHANIC_POOL.length)];
  const distanceKm = Math.round((1.2 + Math.random() * 4.5) * 10) / 10;
  const eta = Math.max(6, Math.round(distanceKm * 3 + Math.random() * 6));
  return {
    ...mechanic,
    distance: `${distanceKm} km away`,
    eta,
    centerName: center.name,
  };
}

export const SERVICE_TYPES = [
  { id: 's1', name: 'General Service',   price: '₹2,500 – ₹3,500', duration: '4–6 hrs' },
  { id: 's2', name: 'Oil Change',        price: '₹1,600 – ₹2,000', duration: '1–2 hrs' },
  { id: 's3', name: 'Brake Inspection',  price: '₹800 – ₹1,500',   duration: '1–2 hrs' },
  { id: 's4', name: 'AC Service',        price: '₹2,000 – ₹3,000', duration: '3–5 hrs' },
  { id: 's5', name: 'Wheel Alignment',   price: '₹500 – ₹800',     duration: '1 hr' },
  { id: 's6', name: 'Engine Inspection', price: '₹1,000 – ₹1,800', duration: '2–3 hrs' },
];

export const MOCK_SERVICE_HISTORY = [
  {
    id: 'h1',
    date: '15 Aug 2026',
    vehicle: 'Hyundai Creta',
    registration: 'PB 65 AB 1234',
    service: 'General Service',
    location: 'CarCare Chandigarh',
    amount: '₹3,200',
    status: 'Completed',
    mechanic: 'Gurpreet Singh',
    parts: 'Engine oil, Oil filter, Air filter',
    notes: 'Vehicle in good condition. Minor brake pad wear observed — monitor for next 3,000 km.',
  },
  {
    id: 'h2',
    date: '10 May 2026',
    vehicle: 'Hyundai Creta',
    registration: 'PB 65 AB 1234',
    service: 'Oil Change',
    location: 'CarCare Rajpura',
    amount: '₹1,800',
    status: 'Completed',
    mechanic: 'Harjinder Kaur',
    parts: 'Engine oil (5W-30 Synthetic), Oil filter',
    notes: 'Routine oil change completed. Next due at 20,000 km.',
  },
  {
    id: 'h3',
    date: '8 Feb 2026',
    vehicle: 'Maruti Suzuki Swift',
    registration: 'PB 10 CD 5678',
    service: 'AC Service',
    location: 'CarCare Patiala',
    amount: '₹2,400',
    status: 'Completed',
    mechanic: 'Amandeep Sharma',
    parts: 'AC gas refill, Cabin air filter',
    notes: 'AC cooling restored to optimal. Cabin filter was heavily clogged.',
  },
  {
    id: 'h4',
    date: '15 Nov 2025',
    vehicle: 'Maruti Suzuki Swift',
    registration: 'PB 10 CD 5678',
    service: 'Brake Inspection',
    location: 'CarCare Chandigarh',
    amount: '₹1,100',
    status: 'Completed',
    mechanic: 'Gurpreet Singh',
    parts: 'Rear brake pads',
    notes: 'Rear brake pads replaced. Front pads at 60% — good for another 8,000 km.',
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'reminder',
    title: 'Service Reminder',
    body: 'Your Hyundai Creta is due for service in 11 days.',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'ping',
    title: 'Ping Request Nearby',
    body: 'A driver 1.4 km away needs help with a flat tyre. Reward: +50 Credits.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'ping_accepted',
    title: 'Ping Accepted',
    body: 'Rahul Mehta has accepted your roadside assistance request. ETA: 6 min.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n4',
    type: 'service',
    title: 'Service Completed',
    body: 'Your Hyundai Creta service has been completed at CarCare Rajpura.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'credit',
    title: 'Credits Earned',
    body: 'You earned 50 credits for helping a driver with a flat tyre.',
    time: '5 days ago',
    read: true,
  },
  {
    id: 'n6',
    type: 'reminder',
    title: 'Insurance Renewal',
    body: 'Your Maruti Swift insurance expires in 47 days. Renew soon.',
    time: '1 week ago',
    read: true,
  },
];

export const MOCK_CREDIT_TRANSACTIONS = [
  { id: 'ct1', description: 'Helped a driver with a flat tyre', amount: +50,  date: '2 Sep 2026', type: 'earn' },
  { id: 'ct2', description: 'Service discount redemption',      amount: -100, date: '28 Aug 2026', type: 'spend' },
  { id: 'ct3', description: 'Battery jump-start assistance',    amount: +40,  date: '21 Aug 2026', type: 'earn' },
  { id: 'ct4', description: 'Fuel assistance to a driver',      amount: +40,  date: '10 Aug 2026', type: 'earn' },
  { id: 'ct5', description: 'Pickup fee waiver',                amount: -200, date: '2 Aug 2026',  type: 'spend' },
];

export const INITIAL_CREDITS = 240;

export const MOCK_MECHANIC = {
  name: 'Ravi Singh',
  role: 'CarCare Roadside Technician',
  distance: '3.8 km away',
  eta: 24,
  phone: '+91 97542 11890',
  initials: 'RS',
};

export const MOCK_HELPER = {
  name: 'Rahul Mehta',
  distance: '1.2 km away',
  eta: 6,
  initials: 'RM',
};

// Pool of possible community helpers for CommunityPing's random-fallback assignment
export const MOCK_HELPERS = [
  { name: 'Rahul Mehta',    distance: '1.2 km away', eta: 6,  initials: 'RM' },
  { name: 'Simran Kaur',    distance: '0.8 km away', eta: 4,  initials: 'SK' },
  { name: 'Deepak Verma',   distance: '2.1 km away', eta: 9,  initials: 'DV' },
  { name: 'Priya Nair',     distance: '1.6 km away', eta: 7,  initials: 'PN' },
];

// Pool of plausible names/vehicles for the *simulated* incoming ping requests
// shown to a helper (real requesters use their own actual name & vehicle instead).
export const MOCK_REQUESTER_NAMES = [
  'Karan Bedi', 'Neha Sharma', 'Vikram Chawla', 'Anjali Gupta', 'Rohit Malhotra', 'Simrat Bhatia',
];

export const MOCK_REQUESTER_VEHICLES = [
  'Hyundai Creta', 'Maruti Suzuki Swift', 'Tata Nexon', 'Honda City',
  'Kia Seltos', 'Mahindra XUV300', 'Toyota Glanza', 'Renault Kwid',
];

export const MOCK_UPCOMING = {
  vehicle: 'Hyundai Creta',
  service: 'General Service',
  date: '18 Sep 2026',
  center: 'CarCare Chandigarh',
  time: '10:30 AM',
};

export const MOCK_PICKUP_STATUS = {
  driver: 'Aman Kumar',
  driverPhone: '+91 98143 77650',
  scheduledTime: 'Today, 10:30 AM',
  initials: 'AK',
};

export const EMERGENCY_TYPES = [
  { id: 'flat_tyre',   label: 'Flat Tyre',        icon: 'circle' },
  { id: 'battery',     label: 'Battery',           icon: 'battery-low' },
  { id: 'engine',      label: 'Engine Problem',    icon: 'settings' },
  { id: 'fuel',        label: 'Out of Fuel',       icon: 'fuel' },
  { id: 'accident',    label: 'Accident',          icon: 'alert-triangle' },
  { id: 'other',       label: 'Other',             icon: 'help-circle' },
];

export const EARN_RATES = [
  { action: 'Help with Flat Tyre',    credits: 50 },
  { action: 'Battery Assistance',     credits: 40 },
  { action: 'Fuel Assistance',        credits: 40 },
  { action: 'Other Roadside Help',    credits: 30 },
];

export const REDEEM_OPTIONS = [
  { id: 'r1', label: '₹100 Service Discount', cost: 100 },
  { id: 'r2', label: 'Free Vehicle Inspection', cost: 150 },
  { id: 'r3', label: 'Pickup Fee Waiver', cost: 200 },
];

// Generates dates for the next ~4 weeks for booking calendar
export function getBookingDates() {
  const dates = [];
  const now = new Date();
  for (let i = 1; i <= 28; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const day = d.getDate();
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const weekday = d.toLocaleString('en-IN', { weekday: 'short' });
    const isSunday = d.getDay() === 0;
    dates.push({ label: `${day}`, sublabel: weekday, value: `${day} ${month}`, disabled: isSunday });
  }
  return dates;
}

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '1:00 PM',
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];
