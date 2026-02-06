import { FSSAILicense, Product, FakeReport } from '@/types/product';

export const fssaiLicenses: FSSAILicense[] = [
  {
    licenseNumber: "10020021000123",
    companyName: "Organic Foods India Pvt Ltd",
    address: "Plot 45, Industrial Area, Pune, Maharashtra",
    validUntil: "2026-12-31",
    status: "active"
  },
  {
    licenseNumber: "10020021000456",
    companyName: "Fresh Harvest Foods",
    address: "Block C, Food Park, Hyderabad, Telangana",
    validUntil: "2025-06-30",
    status: "active"
  },
  {
    licenseNumber: "10020021000789",
    companyName: "Nature's Best Products",
    address: "Unit 12, MIDC, Mumbai, Maharashtra",
    validUntil: "2024-03-15",
    status: "expired"
  },
  {
    licenseNumber: "10020021001122",
    companyName: "Green Valley Organics",
    address: "Survey 89, Agri Zone, Bangalore, Karnataka",
    validUntil: "2027-09-20",
    status: "active"
  },
  {
    licenseNumber: "10020021001455",
    companyName: "Pure Earth Foods",
    address: "Plot 78, SEZ, Chennai, Tamil Nadu",
    validUntil: "2023-01-01",
    status: "revoked"
  }
];

export const blacklistedBrands: string[] = [
  "FakeOrganic Foods",
  "Counterfeit Naturals",
  "Fraud Foods Inc",
  "Bogus Brands Co"
];

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Organic Basmati Rice",
    manufacturer: "Organic Foods India Pvt Ltd",
    licenseNumber: "10020021000123",
    batchNumber: "BATCH2024A001",
    licenseDate: "2024-01-15",
    trustScore: 95,
    status: "genuine",
    isAdminVerified: true,
    verificationSource: "admin",
    verifiedAt: "2024-01-15",
    reportCount: 0,
    createdAt: "2024-01-10"
  },
  {
    id: "prod-002",
    name: "Premium Wheat Flour",
    manufacturer: "Fresh Harvest Foods",
    licenseNumber: "10020021000456",
    batchNumber: "WHT2024B045",
    licenseDate: "2024-02-20",
    trustScore: 88,
    status: "genuine",
    isAdminVerified: true,
    verificationSource: "admin",
    verifiedAt: "2024-02-20",
    reportCount: 1,
    createdAt: "2024-02-15"
  },
  {
    id: "prod-003",
    name: "Pure Mustard Oil",
    manufacturer: "Green Valley Organics",
    licenseNumber: "10020021001122",
    batchNumber: "OIL2024G456",
    licenseDate: "2024-03-01",
    trustScore: 92,
    status: "genuine",
    isAdminVerified: true,
    verificationSource: "admin",
    verifiedAt: "2024-03-01",
    reportCount: 0,
    createdAt: "2024-02-28"
  },
  {
    id: "prod-004",
    name: "Unknown Brand Cooking Oil",
    manufacturer: "Unknown Manufacturer",
    licenseNumber: "FAKE123456789",
    batchNumber: "XX2024001",
    licenseDate: "2023-06-15",
    trustScore: 15,
    status: "fake",
    isAdminVerified: true,
    verificationSource: "admin",
    verifiedAt: "2024-03-10",
    reportCount: 25,
    createdAt: "2024-03-05"
  },
  {
    id: "prod-005",
    name: "Suspicious Spice Mix",
    manufacturer: "Nature's Best Products",
    licenseNumber: "10020021000789",
    batchNumber: "SPX2024A456",
    licenseDate: "2023-08-15",
    trustScore: 45,
    status: "suspicious",
    isAdminVerified: false,
    verificationSource: "system",
    reportCount: 8,
    createdAt: "2024-03-12"
  }
];

export const mockReports: FakeReport[] = [
  {
    id: "report-001",
    productId: "prod-004",
    reportedBy: "user123",
    reason: "Product label appears to be tampered",
    evidence: "Misaligned printing, spelling errors on label",
    status: "confirmed",
    createdAt: "2024-03-06",
    reviewedAt: "2024-03-10",
    reviewedBy: "admin"
  },
  {
    id: "report-002",
    productId: "prod-005",
    reportedBy: "consumer456",
    reason: "FSSAI number does not match product details",
    evidence: "License appears expired, packaging looks different from original",
    status: "pending",
    createdAt: "2024-03-15"
  }
];

export function validateFSSAILicense(licenseNumber: string): FSSAILicense | null {
  return fssaiLicenses.find(l => l.licenseNumber === licenseNumber) || null;
}

export function isBlacklisted(brandName: string): boolean {
  return blacklistedBrands.some(b => 
    brandName.toLowerCase().includes(b.toLowerCase())
  );
}
