// Type definition for a single scan result
export type ScanHistoryItem = {
  id: string;
  herbName: string;
  purityScore: number;
  isAdulterated: boolean;
  scannedAt: string;
};

// Type definition for the reference herb data
export type ReferenceHerb = {
  herbName: string;
  sensorOneValue: number; // e.g., representing pH
  sensorTwoValue: number; // e.g., representing moisture
  sensorThreeValue: number; // e.g., representing spectral data
};

// --- MOCK DATA ---

// Simulates the table of "perfect" sensor readings from DynamoDB
export const referenceHerbs: ReferenceHerb[] = [
  { herbName: "Ashwagandha", sensorOneValue: 6.5, sensorTwoValue: 12.1, sensorThreeValue: 850 },
  { herbName: "Brahmi", sensorOneValue: 7.2, sensorTwoValue: 14.5, sensorThreeValue: 910 },
  { herbName: "Tulsi", sensorOneValue: 6.8, sensorTwoValue: 11.8, sensorThreeValue: 885 },
  { herbName: "Turmeric", sensorOneValue: 6.1, sensorTwoValue: 13.3, sensorThreeValue: 790 },
];

// Simulates the table of past scans from DynamoDB
export const scanHistory: ScanHistoryItem[] = [
    { id: "scan_1f2g3h", herbName: "Ashwagandha", purityScore: 98.2, isAdulterated: false, scannedAt: "2024-08-15 10:30 AM" },
    { id: "scan_4j5k6l", herbName: "Brahmi", purityScore: 91.5, isAdulterated: false, scannedAt: "2024-08-15 09:15 AM" },
    { id: "scan_7m8n9p", herbName: "Turmeric", purityScore: 85.0, isAdulterated: true, scannedAt: "2024-08-14 04:45 PM" },
    { id: "scan_1q2w3e", herbName: "Tulsi", purityScore: 95.8, isAdulterated: false, scannedAt: "2024-08-14 02:00 PM" },
    { id: "scan_4r5t6y", herbName: "Ashwagandha", purityScore: 97.5, isAdulterated: false, scannedAt: "2024-08-13 11:10 AM" },
    { id: "scan_7u8i9o", herbName: "Unknown", purityScore: 40.3, isAdulterated: true, scannedAt: "2024-08-12 06:20 PM" },
];
