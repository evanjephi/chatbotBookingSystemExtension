/**
 * Sample data for Firebase Firestore initialization
 * This file contains sample PSW profiles and client data for testing
 */

export const SAMPLE_PSW_PROFILES = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 123-4567",
    location: {
      latitude: 43.6532,
      longitude: -79.3832,
      postalCode: "M5H 2N2",
      address: "King St W, Toronto"
    },
    certifications: [
      "CPR Certification",
      "First Aid",
      "Dementia Care",
      "Palliative Care"
    ],
    ratings: 4.9,
    reviewCount: 52,
    availableTimeSlots: [
      { date: "2024-01-15", startTime: "08:00", endTime: "17:00" },
      { date: "2024-01-16", startTime: "09:00", endTime: "17:00" },
      { date: "2024-01-17", startTime: "08:00", endTime: "14:00" }
    ],
    serviceTypes: [
      "General Support",
      "Companion Care",
      "Personal Hygiene",
      "Medication Management"
    ]
  },
  {
    name: "Michael Chen",
    email: "m.chen@example.com",
    phone: "(555) 234-5678",
    location: {
      latitude: 43.6629,
      longitude: -79.3957,
      postalCode: "M5V 3A9",
      address: "Bay St, Toronto"
    },
    certifications: [
      "CPR Certification",
      "First Aid",
      "Mobility Assistance"
    ],
    ratings: 4.7,
    reviewCount: 38,
    availableTimeSlots: [
      { date: "2024-01-15", startTime: "10:00", endTime: "18:00" },
      { date: "2024-01-16", startTime: "10:00", endTime: "18:00" },
      { date: "2024-01-17", startTime: "13:00", endTime: "21:00" }
    ],
    serviceTypes: [
      "General Support",
      "Mobility Assistance",
      "Companion Care",
      "Household Tasks"
    ]
  },
  {
    name: "Patricia Rodriguez",
    email: "p.rodriguez@example.com",
    phone: "(555) 345-6789",
    location: {
      latitude: 43.6690,
      longitude: -79.4000,
      postalCode: "M5W 1A1",
      address: "Toronto Downtown"
    },
    certifications: [
      "CPR Certification",
      "First Aid",
      "Dementia Care",
      "Alzheimer's Specialist"
    ],
    ratings: 4.8,
    reviewCount: 45,
    availableTimeSlots: [
      { date: "2024-01-15", startTime: "07:00", endTime: "16:00" },
      { date: "2024-01-16", startTime: "07:00", endTime: "16:00" },
      { date: "2024-01-18", startTime: "08:00", endTime: "17:00" }
    ],
    serviceTypes: [
      "Companion Care",
      "Personal Hygiene",
      "Specialized Care",
      "Dementia Support"
    ]
  },
  {
    name: "James Wilson",
    email: "j.wilson@example.com",
    phone: "(555) 456-7890",
    location: {
      latitude: 43.6426,
      longitude: -79.4081,
      postalCode: "M5R 1J1",
      address: "Bloor St, Toronto"
    },
    certifications: [
      "CPR Certification",
      "First Aid",
      "Rehabilitation Support"
    ],
    ratings: 4.6,
    reviewCount: 32,
    availableTimeSlots: [
      { date: "2024-01-15", startTime: "09:00", endTime: "17:00" },
      { date: "2024-01-17", startTime: "09:00", endTime: "17:00" },
      { date: "2024-01-18", startTime: "10:00", endTime: "18:00" }
    ],
    serviceTypes: [
      "General Support",
      "Rehabilitation Support",
      "Exercise Assistance",
      "Companion Care"
    ]
  },
  {
    name: "Angela Murphy",
    email: "a.murphy@example.com",
    phone: "(555) 567-8901",
    location: {
      latitude: 43.6553,
      longitude: -79.3957,
      postalCode: "M5V 2K2",
      address: "Downtown Toronto"
    },
    certifications: [
      "CPR Certification",
      "First Aid",
      "Personal Hygiene Specialist",
      "Nutrition Support"
    ],
    ratings: 4.9,
    reviewCount: 58,
    availableTimeSlots: [
      { date: "2024-01-15", startTime: "06:00", endTime: "15:00" },
      { date: "2024-01-16", startTime: "06:00", endTime: "15:00" },
      { date: "2024-01-17", startTime: "07:00", endTime: "16:00" }
    ],
    serviceTypes: [
      "Personal Hygiene",
      "Medication Management",
      "Nutrition Support",
      "General Support"
    ]
  }
];

/**
 * Add sample data to Firestore
 * Usage in backend initialization:
 * 
 * import { SAMPLE_PSW_PROFILES } from './sampleData';
 * import firebaseService from './services/firebaseService';
 * 
 * async function initializeSampleData() {
 *   for (const psw of SAMPLE_PSW_PROFILES) {
 *     await firebaseService.db.collection('psws').add({
 *       ...psw,
 *       createdAt: new Date(),
 *       updatedAt: new Date()
 *     });
 *   }
 * }
 */

export const SAMPLE_CLIENT_DATA = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  phone: "(555) 999-0000",
  location: {
    latitude: 43.6532,
    longitude: -79.3832,
    postalCode: "M5H 2N2",
    address: "Toronto, ON"
  },
  preferences: {
    preferredRadius: 15,
    preferredTimeOfDay: "morning",
    serviceTypes: ["General Support", "Companion Care"]
  }
};

export default {
  SAMPLE_PSW_PROFILES,
  SAMPLE_CLIENT_DATA
};
