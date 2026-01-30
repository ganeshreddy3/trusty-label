import { FSSAILicense, SeedCertification, Product, FakeReport } from '@/types/product';

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

export const seedCertifications: SeedCertification[] = [
  {
    certificationNumber: "SEED/2024/KA/001234",
    seedType: "Paddy",
    variety: "Sona Masuri",
    producer: "Karnataka State Seeds Corporation",
    validUntil: "2026-04-30",
    status: "active"
  },
  {
    certificationNumber: "SEED/2024/MH/005678",
    seedType: "Wheat",
    variety: "HD-2967",
    producer: "Maharashtra Seeds Ltd",
    validUntil: "2025-12-31",
    status: "active"
  },
  {
    certificationNumber: "SEED/2023/AP/009012",
    seedType: "Cotton",
    variety: "Bt Cotton Hybrid",
    producer: "Andhra Seeds Company",
    validUntil: "2024-08-15",
    status: "expired"
  },
  {
    certificationNumber: "SEED/2024/PB/003456",
    seedType: "Maize",
    variety: "PMH-1",
    producer: "Punjab Agri Seeds",
    validUntil: "2027-02-28",
    status: "active"
  }
];

export const blacklistedBrands: string[] = [
  "FakeOrganic Foods",
  "QuickGrow Seeds",
  "Counterfeit Naturals",
  "Fraud Foods Inc"
];

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Organic Basmati Rice",
    manufacturer: "Organic Foods India Pvt Ltd",
    category: "food",
    licenseNumber: "10020021000123",
    batchNumber: "BATCH2024A001",
    expiryDate: "2025-12-31",
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
    category: "food",
    licenseNumber: "10020021000456",
    batchNumber: "WHT2024B045",
    expiryDate: "2025-06-30",
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
    name: "Sona Masuri Paddy Seeds",
    manufacturer: "Karnataka State Seeds Corporation",
    category: "seed",
    licenseNumber: "",
    batchNumber: "SEED2024K789",
    expiryDate: "2025-04-30",
    certificationNumber: "SEED/2024/KA/001234",
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
    category: "food",
    licenseNumber: "FAKE123456789",
    batchNumber: "XX2024001",
    expiryDate: "2025-01-01",
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
    name: "Hybrid Cotton Seeds",
    manufacturer: "Andhra Seeds Company",
    category: "seed",
    licenseNumber: "",
    batchNumber: "COT2024A456",
    expiryDate: "2024-08-15",
    certificationNumber: "SEED/2023/AP/009012",
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
    reportedBy: "farmer456",
    reason: "Seeds did not germinate properly",
    evidence: "Low germination rate of 30%",
    status: "pending",
    createdAt: "2024-03-15"
  }
];

export function validateFSSAILicense(licenseNumber: string): FSSAILicense | null {
  return fssaiLicenses.find(l => l.licenseNumber === licenseNumber) || null;
}

export function validateSeedCertification(certNumber: string): SeedCertification | null {
  return seedCertifications.find(c => c.certificationNumber === certNumber) || null;
}

export function isBlacklisted(brandName: string): boolean {
  return blacklistedBrands.some(b => 
    brandName.toLowerCase().includes(b.toLowerCase())
  );
}
