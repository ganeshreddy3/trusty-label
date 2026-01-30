import { 
  ExtractedDetails, 
  VerificationResult, 
  VerificationCheck,
  ProductStatus 
} from '@/types/product';
import { 
  validateFSSAILicense, 
  validateSeedCertification, 
  isBlacklisted 
} from '@/data/mockDatabase';

export function simulateOCR(imageFile: File): Promise<ExtractedDetails> {
  // Simulating OCR extraction with mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Random mock data to simulate OCR results
      const mockResults: ExtractedDetails[] = [
        {
          licenseNumber: "10020021000123",
          manufacturer: "Organic Foods India Pvt Ltd",
          batchNumber: "BATCH2024A001",
          expiryDate: "2025-12-31",
          productName: "Organic Basmati Rice",
          ingredients: ["100% Organic Basmati Rice"],
          netWeight: "5 kg",
          mrp: "₹450"
        },
        {
          licenseNumber: "10020021000456",
          manufacturer: "Fresh Harvest Foods",
          batchNumber: "WHT2024B045",
          expiryDate: "2025-06-30",
          productName: "Premium Wheat Flour",
          ingredients: ["Whole Wheat", "Fortified with Iron and Folic Acid"],
          netWeight: "10 kg",
          mrp: "₹380"
        },
        {
          certificationNumber: "SEED/2024/KA/001234",
          manufacturer: "Karnataka State Seeds Corporation",
          batchNumber: "SEED2024K789",
          expiryDate: "2025-04-30",
          productName: "Sona Masuri Paddy Seeds"
        },
        {
          licenseNumber: "INVALID12345",
          manufacturer: "Unknown Company",
          batchNumber: "FAKE001",
          expiryDate: "2023-01-01",
          productName: "Suspicious Product"
        }
      ];
      
      const randomIndex = Math.floor(Math.random() * mockResults.length);
      resolve(mockResults[randomIndex]);
    }, 2000); // Simulate 2 second processing time
  });
}

export function verifyProduct(details: ExtractedDetails): VerificationResult {
  const checks: VerificationCheck[] = [];
  let totalScore = 0;
  let maxScore = 0;
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check FSSAI License (for food products)
  if (details.licenseNumber) {
    maxScore += 30;
    const license = validateFSSAILicense(details.licenseNumber);
    
    if (license) {
      if (license.status === 'active') {
        totalScore += 30;
        checks.push({
          name: "FSSAI License",
          passed: true,
          message: `Valid license from ${license.companyName}`,
          severity: "info"
        });
      } else if (license.status === 'expired') {
        totalScore += 10;
        checks.push({
          name: "FSSAI License",
          passed: false,
          message: `License expired on ${license.validUntil}`,
          severity: "warning"
        });
        warnings.push("FSSAI license has expired. Product may not meet current safety standards.");
      } else {
        checks.push({
          name: "FSSAI License",
          passed: false,
          message: "License has been revoked",
          severity: "error"
        });
        warnings.push("CRITICAL: This manufacturer's license has been revoked!");
      }
    } else {
      checks.push({
        name: "FSSAI License",
        passed: false,
        message: "License number not found in database",
        severity: "error"
      });
      warnings.push("Could not verify FSSAI license. This product may be counterfeit.");
    }
  }

  // Check Seed Certification (for seeds)
  if (details.certificationNumber) {
    maxScore += 30;
    const cert = validateSeedCertification(details.certificationNumber);
    
    if (cert) {
      if (cert.status === 'active') {
        totalScore += 30;
        checks.push({
          name: "Seed Certification",
          passed: true,
          message: `Valid certification for ${cert.seedType} - ${cert.variety}`,
          severity: "info"
        });
      } else if (cert.status === 'expired') {
        totalScore += 10;
        checks.push({
          name: "Seed Certification",
          passed: false,
          message: `Certification expired on ${cert.validUntil}`,
          severity: "warning"
        });
        warnings.push("Seed certification has expired. Germination rates may be affected.");
      } else {
        checks.push({
          name: "Seed Certification",
          passed: false,
          message: "Certification has been revoked",
          severity: "error"
        });
        warnings.push("CRITICAL: This seed certification has been revoked!");
      }
    } else {
      checks.push({
        name: "Seed Certification",
        passed: false,
        message: "Certification number not found in database",
        severity: "error"
      });
      warnings.push("Could not verify seed certification. Seeds may be of poor quality.");
    }
  }

  // Check Manufacturer
  if (details.manufacturer) {
    maxScore += 20;
    if (isBlacklisted(details.manufacturer)) {
      checks.push({
        name: "Manufacturer Check",
        passed: false,
        message: "Manufacturer is on the blacklist",
        severity: "error"
      });
      warnings.push("WARNING: This manufacturer has been blacklisted for selling fake products!");
    } else {
      totalScore += 20;
      checks.push({
        name: "Manufacturer Check",
        passed: true,
        message: "Manufacturer is not blacklisted",
        severity: "info"
      });
    }
  }

  // Check Batch Number Format
  if (details.batchNumber) {
    maxScore += 15;
    const batchPattern = /^[A-Z]{2,4}\d{4}[A-Z]?\d{2,4}$/;
    if (batchPattern.test(details.batchNumber)) {
      totalScore += 15;
      checks.push({
        name: "Batch Number",
        passed: true,
        message: "Valid batch number format",
        severity: "info"
      });
    } else {
      totalScore += 5;
      checks.push({
        name: "Batch Number",
        passed: false,
        message: "Batch number format is unusual",
        severity: "warning"
      });
    }
  }

  // Check Expiry Date
  if (details.expiryDate) {
    maxScore += 20;
    const expiry = new Date(details.expiryDate);
    const today = new Date();
    
    if (expiry > today) {
      const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      totalScore += 20;
      checks.push({
        name: "Expiry Date",
        passed: true,
        message: `Product expires in ${daysUntilExpiry} days`,
        severity: "info"
      });
      
      if (daysUntilExpiry < 30) {
        recommendations.push("Product is nearing expiry. Consider purchasing fresher stock.");
      }
    } else {
      checks.push({
        name: "Expiry Date",
        passed: false,
        message: "Product has expired",
        severity: "error"
      });
      warnings.push("EXPIRED: Do not consume or use this product!");
    }
  }

  // Check for missing critical details
  if (!details.licenseNumber && !details.certificationNumber) {
    maxScore += 15;
    checks.push({
      name: "Certification Missing",
      passed: false,
      message: "No license or certification number found",
      severity: "error"
    });
    warnings.push("No verifiable certification found. Product authenticity cannot be confirmed.");
  }

  // Calculate final trust score
  const trustScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Determine status
  let status: ProductStatus;
  if (trustScore >= 80) {
    status = 'genuine';
    recommendations.push("This product appears to be genuine based on our verification checks.");
  } else if (trustScore >= 50) {
    status = 'suspicious';
    recommendations.push("Exercise caution. Some verification checks did not pass.");
  } else {
    status = 'fake';
    recommendations.push("HIGH RISK: This product failed multiple verification checks. Do not purchase.");
  }

  // Add general recommendations
  if (status !== 'fake') {
    recommendations.push("Always purchase from authorized retailers.");
    recommendations.push("Report any suspicious products to help protect other consumers.");
  }

  return {
    isValid: status === 'genuine',
    trustScore,
    status,
    checks,
    recommendations,
    warnings
  };
}
